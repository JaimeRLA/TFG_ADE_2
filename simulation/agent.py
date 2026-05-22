from mesa import Agent
import numpy as np


class ClienteCaixa(Agent):
    def __init__(self, unique_id, model, saldo, tipo):
        super().__init__(unique_id, model)
        self.unique_id = unique_id
        
        # Get parameters from model's preset or use defaults
        if hasattr(model, 'preset_params') and model.preset_params:
            demographics = model.preset_params.get("demographics", {})
            deposit_guarantee = model.preset_params.get("deposit_guarantee", {})
            loyalty = model.preset_params.get("loyalty", {})
            behavior = model.preset_params.get("behavior", {})
            decision_weights = model.preset_params.get("decision_weights", {})
            
            # Store parameters
            self.edad_media = demographics.get("edad_media", 50)
            self.edad_desviacion = demographics.get("edad_desviacion", 18)
            self.edad_maxima = demographics.get("edad_maxima", 90)
            self.distribucion_sexo = demographics.get("distribucion_sexo", ["H", "M"])
            self.probabilidades_sexo = demographics.get("probabilidades_sexo", [0.5, 0.5])
            self.factor_h = demographics.get("factor_h", 1.1)
            self.factor_m = demographics.get("factor_m", 1.0)
            
            self.umbral_fgd = deposit_guarantee.get("umbral_fgd", 100000)
            self.reduccion_panico_fgd = deposit_guarantee.get("reduccion_panico_fgd", 0.5)
            
            self.rango_fidelidad = loyalty.get("rango_fidelidad", [0.1, 0.9])
            
            self.k_ruido_cliente = behavior.get("k_ruido_cliente", 10)
            self.x0_cliente = behavior.get("x0_cliente", 0.4)
            self.k_ruido_no_cliente = behavior.get("k_ruido_no_cliente", 12)
            self.x0_no_cliente = behavior.get("x0_no_cliente", 0.45)
            
            self.peso_noticia = decision_weights.get("peso_noticia", 0.4)
            self.peso_social = decision_weights.get("peso_social", 0.5)
            self.peso_liquidez = decision_weights.get("peso_liquidez", 0.1)
        else:
            # Default values
            self.edad_media = 50
            self.edad_desviacion = 18
            self.edad_maxima = 90
            self.distribucion_sexo = ["H", "M"]
            self.probabilidades_sexo = [0.5, 0.5]
            self.factor_h = 1.1
            self.factor_m = 1.0
            self.umbral_fgd = 100000
            self.reduccion_panico_fgd = 0.5
            self.rango_fidelidad = [0.1, 0.9]
            self.k_ruido_cliente = 10
            self.x0_cliente = 0.4
            self.k_ruido_no_cliente = 12
            self.x0_no_cliente = 0.45
            self.peso_noticia = 0.4
            self.peso_social = 0.5
            self.peso_liquidez = 0.1
        
        # --- LÓGICA DE CLÚSTER ---
        self.saldo_inicial = saldo  
        self.saldo = saldo          
        self.saldo_por_persona = self.saldo_inicial / self.model.representacion_por_nodo
        self.porcentaje_retirado = 0.0  # Solo clientes: fracción real de dinero retirado (0-1)
        self.nivel_escandalo = 0.0       # Solo No-Clientes: nivel de agitación/rumor (0-1)
        self.tipo = tipo
        
        # Parámetros de comportamiento
        self.edad = int(np.clip(self.random.gauss(self.edad_media, self.edad_desviacion), 18, 90))
        self.digitalizacion = 1.0 - (self.edad / self.edad_maxima)
        factor_generacional = (self.edad / self.edad_maxima) * 0.5
        self.aversion = np.clip(self.random.uniform(0.2, 0.8) + factor_generacional, 0, 1)
        self.sexo = self.random.choices(self.distribucion_sexo, self.probabilidades_sexo)[0]
        self.fidelidad = self.random.uniform(self.rango_fidelidad[0], self.rango_fidelidad[1])
        self.protegido_fgd = self.saldo_por_persona <= self.umbral_fgd
        self.alcance_noticia = False


    def step(self):
        # 0. VECINOS (necesario tanto para difusión como para contagio social)
        vecinos_ids = list(self.model.G.neighbors(self.pos))
        vecinos_agentes = [self.model.grid.get_cell_list_contents([v])[0] for v in vecinos_ids]

        # 1. DIFUSIÓN (Común)
        if not self.alcance_noticia:
            factor_tipo = 1.3 if self.tipo == 'Empresa' else (1.15 if self.tipo == 'VIP' else 1.0)
            factor_sexo = self.factor_m if self.sexo == 'M' else self.factor_h
            proporcion_vecinos_informados = (
                sum(1 for v in vecinos_agentes if v.alcance_noticia) / len(vecinos_agentes)
                if vecinos_agentes else 0.0
            )
            tasa_alcance = np.clip(
                self.model.noticia_difusion * self.digitalizacion * factor_tipo * factor_sexo
                + proporcion_vecinos_informados * self.peso_social * 0.5,
                0.0, 1.0
            )
            if self.random.random() < tasa_alcance:
                self.alcance_noticia = True

        if not self.alcance_noticia:
            return

        # 2. CONTAGIO SOCIAL (Los vecinos miran cuánto pánico hay alrededor)
        # Clientes emiten señal de retirada real; No-Clientes emiten su nivel de escándalo
        if vecinos_agentes:
            panico_vecinos = sum(
                v.nivel_escandalo if v.tipo == "No-Cliente" else v.porcentaje_retirado
                for v in vecinos_agentes
            ) / len(vecinos_agentes)
        else:
            panico_vecinos = 0

        # 3. LÓGICA PARA NO-CLIENTES (Vector de propagación puro)
        if self.tipo == "No-Cliente":
            impacto_noticia = self.model.noticia_score * self.model.noticia_validez if self.alcance_noticia else 0

            # El No-Cliente NO mira la liquidez del banco (no tiene cuenta)
            factor_sexo_nc = self.factor_m if self.sexo == "M" else self.factor_h
            score_opinion = (
                impacto_noticia * self.peso_noticia + panico_vecinos * self.peso_social
            ) * (1 + self.aversion) * factor_sexo_nc
            score_opinion = np.clip(score_opinion, 0, 1)

            # nivel_escandalo: agitación social del No-Cliente (no hay dinero de por medio)
            self.nivel_escandalo = 1 / (1 + np.exp(-self.k_ruido_no_cliente * (score_opinion - self.x0_no_cliente)))
            return

        # 4. LÓGICA PARA CLIENTES 
        impacto_noticia = self.model.noticia_score * self.model.noticia_validez if self.alcance_noticia else 0
        miedo_banco = 1.0 - (self.model.liquidez_banco / self.model.liquidez_banco_inicial)
        factor_proteccion = self.reduccion_panico_fgd if self.protegido_fgd else 1.2 # El no protegido se asusta un 20% más
        factor_sexo = self.factor_m if self.sexo == "M" else self.factor_h
        
        score_final = (
            impacto_noticia * self.peso_noticia + 
            panico_vecinos * self.peso_social + 
            miedo_banco * self.peso_liquidez
        ) * (1 + self.aversion) * factor_proteccion * factor_sexo
        
        score_final = score_final * (1 - (1*self.fidelidad)) # Reduce hasta un 30% el pánico si es muy fiel
        score_final = np.clip(score_final, 0, 1)
        meta_fuga = 1 / (1 + np.exp(-self.k_ruido_cliente * (score_final - self.x0_cliente)))
        
        if meta_fuga > self.porcentaje_retirado:
            self.ejecutar_retirada_progresiva(meta_fuga)

    def ejecutar_retirada_progresiva(self, meta_fuga):
        # Calculamos cuánto dinero extra representa ese incremento de pánico
        diferencia_fuga = meta_fuga - self.porcentaje_retirado
        monto_a_retirar = diferencia_fuga * self.saldo_inicial
        
        if self.model.liquidez_banco > 0:
            # El banco paga lo que puede
            monto_real = min(monto_a_retirar, self.model.liquidez_banco)
            self.model.liquidez_banco -= monto_real

            # Actualizamos el estado interno del agente
            self.saldo -= monto_real
            self.porcentaje_retirado += (monto_real / self.saldo_inicial)
            
 