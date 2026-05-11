import networkx as nx
from mesa import Model
from mesa.time import RandomActivation
from mesa.space import NetworkGrid
from .agent import ClienteCaixa
import numpy as np

class BancoModel(Model):
    def __init__(self, n, total_depositos, encaje, news_score, news_validez, news_difusion, p_no_clientes=0.2, preset_params=None):
        super().__init__()
        
        # Load parameters from preset or use defaults
        if preset_params:
            balances = preset_params.get("balances", {})
            market = preset_params.get("market", {})
            network = preset_params.get("network", {})
            
            # Store preset for agent creation
            self.preset_params = preset_params
            
            # Extract configuration
            self.poblacion_objetivo = market.get("poblacion_objetivo", 3000000)
            red_enlaces = network.get("red_enlaces_nuevos", 3)
            red_prob_tri = network.get("red_prob_triangulo", 0.5)
            
            self.distribucion_tipos = balances.get("distribucion_tipos", ["Retail", "VIP", "Empresa"])
            self.probabilidades_tipos = balances.get("probabilidades_tipos", [0.75, 0.20, 0.05])

            self.saldo_retail_rango = tuple(balances.get("saldo_retail_rango", [1000, 15000]))
            self.saldo_vip_rango = tuple(balances.get("saldo_vip_rango", [20000, 100000]))
            self.saldo_empresa_rango = tuple(balances.get("saldo_empresa_rango", [50000, 200000]))
        else:
            # Default values
            self.preset_params = None
            self.poblacion_objetivo = 3000000
            red_enlaces = 3
            red_prob_tri = 0.5
            self.distribucion_tipos = ["Retail", "VIP", "Empresa"]
            self.probabilidades_tipos = [0.75, 0.20, 0.05]
            self.saldo_retail_rango = (1000, 15000)
            self.saldo_vip_rango = (20000, 100000)
            self.saldo_empresa_rango = (50000, 200000)
        
        # --- LÓGICA FINANCIERA: SOLVENCIA VS LIQUIDEZ ---
        self.depositos_totales = total_depositos
        self.coeficiente_reserva = encaje
        self.liquidez_banco = total_depositos * self.coeficiente_reserva
        self.liquidez_banco_inicial = self.liquidez_banco  # snapshot en euros del día 0
        self.prestamos_activos = total_depositos - self.liquidez_banco
        
        # --- PARÁMETROS DE LA CRISIS ---
        self.noticia_score = news_score
        self.noticia_validez = news_validez
        self.noticia_difusion = news_difusion

        # --- RED SOCIAL (SMALL WORLD) ---
        self.G = nx.powerlaw_cluster_graph(n, red_enlaces, red_prob_tri)
        self.grid = NetworkGrid(self.G)
        self.schedule = RandomActivation(self)
        self.representacion_por_nodo = self.poblacion_objetivo / n
        
        # --- PRIMER PASE: generar saldos brutos proporcionales ---
        nodos_info = []
        for i, node in enumerate(self.G.nodes()):
            es_cliente = self.random.random() > p_no_clientes
            if es_cliente:
                tipo = self.random.choices(
                    self.distribucion_tipos,
                    self.probabilidades_tipos
                )[0]
                if tipo == 'Empresa':
                    saldo_bruto = self.random.uniform(self.saldo_empresa_rango[0], self.saldo_empresa_rango[1])
                elif tipo == 'VIP':
                    saldo_bruto = self.random.uniform(self.saldo_vip_rango[0], self.saldo_vip_rango[1])
                else:
                    saldo_bruto = self.random.uniform(self.saldo_retail_rango[0], self.saldo_retail_rango[1])
            else:
                tipo = "No-Cliente"
                saldo_bruto = 0
            nodos_info.append((i, node, tipo, saldo_bruto))

        # --- NORMALIZACIÓN: escalar para que la suma coincida exactamente con total_depositos ---
        suma_bruta = sum(s for _, _, t, s in nodos_info if t != "No-Cliente")
        factor_escala = total_depositos / suma_bruta if suma_bruta > 0 else 1.0

        # --- SEGUNDO PASE: crear agentes con saldos escalados ---
        for i, node, tipo, saldo_bruto in nodos_info:
            saldo = saldo_bruto * factor_escala if tipo != "No-Cliente" else 0
            a = ClienteCaixa(i, self, saldo, tipo)
            self.schedule.add(a)
            self.grid.place_agent(a, node)

    def step(self):
        self.schedule.step()
        
        # Seguridad financiera: la liquidez no puede ser negativa
        if self.liquidez_banco < 0:
            self.liquidez_banco = 0
            
        # Actualizamos depósitos totales basado en lo que realmente queda en el banco
        self.depositos_totales = sum(a.saldo for a in self.schedule.agents if a.tipo != "No-Cliente")