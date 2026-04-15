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
            multipliers = preset_params.get("multipliers", {})
            
            # Store preset for agent creation
            self.preset_params = preset_params
            
            # Extract configuration
            self.poblacion_objetivo = market.get("poblacion_objetivo", 3000000)
            red_enlaces = network.get("red_enlaces_nuevos", 3)
            red_prob_tri = network.get("red_prob_triangulo", 0.5)
            
            self.distribucion_tipos = balances.get("distribucion_tipos", ["Retail", "VIP", "Empresa"])
            self.probabilidades_tipos = balances.get("probabilidades_tipos", [0.75, 0.20, 0.05])
            
            self.multiplicador_empresa = tuple(multipliers.get("multiplicador_empresa", [4.0, 8.0]))
            self.multiplicador_vip = tuple(multipliers.get("multiplicador_vip", [1.5, 3.0]))
            self.multiplicador_retail = tuple(multipliers.get("multiplicador_retail", [0.5, 1.2]))
        else:
            # Default values
            self.preset_params = None
            self.poblacion_objetivo = 3000000
            red_enlaces = 3
            red_prob_tri = 0.5
            self.distribucion_tipos = ["Retail", "VIP", "Empresa"]
            self.probabilidades_tipos = [0.75, 0.20, 0.05]
            self.multiplicador_empresa = (4.0, 8.0)
            self.multiplicador_vip = (1.5, 3.0)
            self.multiplicador_retail = (0.5, 1.2)
        
        # --- LÓGICA FINANCIERA: SOLVENCIA VS LIQUIDEZ ---
        self.depositos_totales = total_depositos # Patrimonio total del banco
        self.coeficiente_reserva = encaje
        
        # El banco comienza con una liquidez basada en el encaje
        self.liquidez_banco = total_depositos * self.coeficiente_reserva
        self.liquidez_inicial = self.liquidez_banco
        # El dinero prestado (inmovilizado)
        self.prestamos_activos = total_depositos - self.liquidez_banco
        
        # --- PARÁMETROS DE LA CRISIS ---
        self.noticia_score = news_score
        self.noticia_validez = news_validez
        self.noticia_difusion = news_difusion

        # --- RED SOCIAL (SMALL WORLD) ---
        self.G = nx.powerlaw_cluster_graph(n, red_enlaces, red_prob_tri)
        self.grid = NetworkGrid(self.G)
        self.schedule = RandomActivation(self)

        self.grid = NetworkGrid(self.G)
        self.schedule = RandomActivation(self)

        self.representacion_por_nodo = self.poblacion_objetivo / n

        # --- CREACIÓN DE AGENTES (CLÚSTERES) ---
        n_clientes_estimados = n * (1 - p_no_clientes)
        
        for i, node in enumerate(self.G.nodes()):
            es_cliente = self.random.random() > p_no_clientes
            
            if es_cliente:
                tipo = self.random.choices(
                    self.distribucion_tipos,
                    self.probabilidades_tipos
                )[0]
                
                # Cada nodo representa un fragmento del total de depósitos
                saldo_promedio_nodo = self.depositos_totales / n_clientes_estimados
                
                if tipo == 'Empresa':
                    # Las empresas gestionan clústeres de capital mucho más grandes
                    saldo = self.random.uniform(
                        saldo_promedio_nodo * self.multiplicador_empresa[0],
                        saldo_promedio_nodo * self.multiplicador_empresa[1]
                    )
                elif tipo == 'VIP':
                    saldo = self.random.uniform(
                        saldo_promedio_nodo * self.multiplicador_vip[0],
                        saldo_promedio_nodo * self.multiplicador_vip[1]
                    )
                else:
                    saldo = self.random.uniform(
                        saldo_promedio_nodo * self.multiplicador_retail[0],
                        saldo_promedio_nodo * self.multiplicador_retail[1]
                    )
            else:
                tipo = "No-Cliente"
                saldo = 0
        
            # El agente ahora recibe el "saldo" como el patrimonio inicial del clúster
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