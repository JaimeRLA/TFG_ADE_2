"""
FastAPI backend – Bank Run Simulator
Exposes a WebSocket endpoint that streams simulation step data to the Angular frontend.
"""

import json
import asyncio
import numpy as np
import networkx as nx
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from simulation.model import BancoModel

app = FastAPI(title="Bank Run Simulator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _color_cliente(agente) -> str:
    if not agente.alcance_noticia:
        return "rgb(34,139,34)"
    fuga = agente.porcentaje_retirado
    if fuga < 0.05:
        return "rgb(255,165,0)"
    s = min((fuga - 0.05) / 0.20, 1.0)
    return f"rgb(255,{int(165*(1-s))},0)"


def _color_no_cliente(agente) -> str:
    if not agente.alcance_noticia:
        return "rgb(100,100,100)"
    i = float(np.nan_to_num(agente.porcentaje_retirado))
    return f"rgb({int(100*(1-i))},{int(150+105*i)},255)"


@app.websocket("/ws/simulate")
async def simulate(ws: WebSocket):
    await ws.accept()
    try:
        raw = await ws.receive_text()
        cfg = json.loads(raw)

        n_agentes            = int(cfg.get("n_agentes", 200))
        dep_input            = float(cfg.get("dep_input", 10_000_000))
        encaje               = float(cfg.get("encaje", 0.10))
        score                = float(cfg.get("score", 0.8))
        validez              = float(cfg.get("validez", 0.9))
        difusion             = float(cfg.get("difusion", 0.4))
        p_externos           = float(cfg.get("p_externos", 0.2))
        max_turnos           = int(cfg.get("max_turnos", 150))
        n_simulaciones       = int(cfg.get("n_simulaciones", 5))
        velocidad            = float(cfg.get("velocidad", 0.05))

        historico_series = []
        todos_los_datos_agentes = []

        for sim_iter in range(n_simulaciones):
            model = BancoModel(
                n_agentes, dep_input, encaje,
                score, validez, difusion,
                p_no_clientes=p_externos
            )
            pos = nx.spring_layout(model.G, seed=42)

            # Build edges once per simulation
            edges = []
            for u, v in model.G.edges():
                x0, y0 = pos[u]
                x1, y1 = pos[v]
                edges.append({"x0": float(x0), "y0": float(y0),
                               "x1": float(x1), "y1": float(y1)})

            await ws.send_text(json.dumps({
                "type": "sim_init",
                "sim": sim_iter,
                "total_sims": n_simulaciones,
                "edges": edges,
            }))

            stats_data = {"paso": [], "liquidez": [], "huidas": [], "informadas": []}
            n_no_clientes = sum(1 for a in model.schedule.agents if a.tipo == "No-Cliente")

            for t in range(max_turnos):
                model.step()
                agentes = model.schedule.agents
                liq = model.liquidez_banco
                fuga_total   = sum(a.porcentaje_retirado for a in agentes if a.tipo != "No-Cliente")
                personas_huidas = fuga_total * model.representacion_por_nodo
                nodos_inf    = sum(1 for a in agentes if a.alcance_noticia)
                personas_inf = nodos_inf * model.representacion_por_nodo
                intensidad_rumor = (
                    sum(a.porcentaje_retirado for a in agentes if a.tipo == "No-Cliente") / n_no_clientes
                ) if n_no_clientes > 0 else 0.0

                stats_data["paso"].append(t)
                stats_data["liquidez"].append(float(liq))
                stats_data["huidas"].append(float(personas_huidas))
                stats_data["informadas"].append(float(personas_inf))

                nodes = []
                for a in agentes:
                    x, y = pos[a.unique_id]
                    is_nc = a.tipo == "No-Cliente"
                    nodes.append({
                        "id":     a.unique_id,
                        "x":      float(x),
                        "y":      float(y),
                        "color":  _color_no_cliente(a) if is_nc else _color_cliente(a),
                        "size":   11 if is_nc else (15 if a.porcentaje_retirado > 0.1 else 13),
                        "symbol": "diamond" if is_nc else "circle",
                        "tipo":   a.tipo,
                        "alcance": a.alcance_noticia,
                        "fuga":   float(a.porcentaje_retirado),
                        "saldo":  float(a.saldo) if not is_nc else 0.0,
                        "rep":    int(model.representacion_por_nodo),
                    })

                await ws.send_text(json.dumps({
                    "type":  "step",
                    "sim":   sim_iter,
                    "turn":  t,
                    "nodes": nodes,
                    "metrics": {
                        "personas_huidas":  float(personas_huidas),
                        "personas_inf":     float(personas_inf),
                        "poblacion_total":  float(model.poblacion_objetivo),
                        "intensidad_rumor": float(intensidad_rumor),
                        "liquidez":         float(liq),
                    },
                    "stats": stats_data,
                }))

                if velocidad > 0:
                    await asyncio.sleep(velocidad)
                else:
                    await asyncio.sleep(0)  # yield to event loop

                if liq <= 0:
                    break

            # Capture agent data for final report
            for a in model.schedule.agents:
                if a.tipo != "No-Cliente":
                    if a.edad < 35:
                        cat_edad = "Jóvenes (<35)"
                    elif a.edad < 60:
                        cat_edad = "Adultos (35-60)"
                    else:
                        cat_edad = "Séniors (>60)"
                    todos_los_datos_agentes.append({
                        "Simulacion":    sim_iter,
                        "Rango Edad":    cat_edad,
                        "Tipo":          a.tipo,
                        "Fuga %":        float(a.porcentaje_retirado * 100),
                        "Sexo":          a.sexo,
                        "Protegido FGD": "Sí" if a.protegido_fgd else "No",
                    })

            historico_series.append(stats_data)

            await ws.send_text(json.dumps({
                "type":   "sim_done",
                "sim":    sim_iter,
                "series": stats_data,
            }))

        # ---- Aggregated report ----
        import pandas as pd

        max_t = max(len(s["paso"]) for s in historico_series)
        turnos_quiebra = [len(s["paso"]) for s in historico_series if s["liquidez"][-1] <= 0]
        prob_quiebra   = (len(turnos_quiebra) / n_simulaciones) * 100
        turno_medio_colapso = float(np.mean(turnos_quiebra)) if turnos_quiebra else 0.0

        def _avg(key, pad_val=0):
            matrix = []
            for s in historico_series:
                vals = s[key]
                pad  = [vals[-1] if pad_val is None else pad_val] * (max_t - len(vals))
                matrix.append(vals + pad)
            return np.mean(matrix, axis=0).tolist()

        avg_huidas = _avg("huidas", None)
        avg_inf    = _avg("informadas", None)
        avg_liq    = _avg("liquidez", 0)

        df = pd.DataFrame(todos_los_datos_agentes)
        resumen_edad  = df.groupby("Rango Edad")["Fuga %"].mean().reset_index().to_dict(orient="records")
        resumen_tipo  = df.groupby("Tipo")["Fuga %"].mean().reset_index().to_dict(orient="records")
        resumen_sexo  = df.groupby("Sexo")["Fuga %"].mean().to_dict()
        avg_fgd       = float(df[df["Protegido FGD"] == "Sí"]["Fuga %"].mean()) if len(df) > 0 else 0.0

        # Best/worst segment
        if resumen_tipo:
            worst_tipo = max(resumen_tipo, key=lambda x: x["Fuga %"])["Tipo"]
        else:
            worst_tipo = "N/A"

        await ws.send_text(json.dumps({
            "type": "report",
            "data": {
                "avg_huidas_final":      avg_huidas[-1] if avg_huidas else 0,
                "avg_inf_final":         avg_inf[-1] if avg_inf else 0,
                "poblacion_total":       float(model.poblacion_objetivo),
                "prob_quiebra":          prob_quiebra,
                "turno_medio_colapso":   turno_medio_colapso,
                "supervivencia_media":   (np.mean([len(s["paso"]) for s in historico_series]) / max_turnos) * 100,
                "avg_huidas":            avg_huidas,
                "avg_inf":               avg_inf,
                "avg_liq":               avg_liq,
                "resumen_edad":          resumen_edad,
                "resumen_tipo":          resumen_tipo,
                "resumen_sexo":          resumen_sexo,
                "avg_fgd":               avg_fgd,
                "worst_tipo":            worst_tipo,
                "turnos_quiebra":        turnos_quiebra,
                "n_simulaciones":        n_simulaciones,
                "max_turnos":            max_turnos,
            }
        }))

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await ws.send_text(json.dumps({"type": "error", "message": str(e)}))
        except Exception:
            pass
