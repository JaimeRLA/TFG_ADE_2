# --- parametros.py (VERSIÓN LAZARD EQUILIBRADA - 1M NODOS) ---

# --- CONFIGURACIÓN DEMOGRÁFICA ---
EDAD_MEDIA = 50 
EDAD_DESVIACION = 10
EDAD_MINIMA = 25
EDAD_MAXIMA = 90
DISTRIBUCION_SEXO = ["H", "M"]
PROBABILIDADES_SEXO = [0.75, 0.25] 
FACTOR_H = 1.15  
FACTOR_M = 1.0

# --- FONDO DE GARANTÍA DE DEPÓSITOS (FGD) ---
UMBRAL_FGD = 100000  
REDUCCION_PANICO_FGD = 0.05 

# --- FIDELIDAD (EFICIENCIA FINANCIERA) ---
RANGO_FIDELIDAD = (0.4, 0.8) # Subimos un poco para simular contratos de permanencia institucional

# --- LÓGICA DE SALDOS (€) ---
# Ajustamos para que la suma de 1M de agentes no desborde el balance total
SALDO_RETAIL_RANGO = (50000, 150000) 
SALDO_EMPRESA_RANGO = (1000000, 5000000) # Saldo base que luego se multiplica
DISTRIBUCION_TIPOS = ["Retail", "VIP", "Empresa"]

# REVISIÓN CRÍTICA: Bajamos la probabilidad de "Empresa" para 1M de nodos.
# No hay 500.000 empresas gigantes en el mundo que sean clientes de un solo banco.
PROBABILIDADES_TIPOS = [0.40, 0.40, 0.20] 

# --- UMBRALES DE COMPORTAMIENTO ---
K_RUIDO_CLIENTE = 10     # Bajamos de 14 a 10 para evitar el colapso instantáneo
x0_CLIENTE = 0.50        # Subimos de 0.35 a 0.50 (Tolerancia institucional profesional)

# --- PESOS DE LA DECISIÓN ---
PESO_NOTICIA = 0.60    
PESO_SOCIAL = 0.05     
PESO_LIQUIDEZ = 0.35   

# --- TAMAÑO DEL MERCADO ---
POBLACION_OBJETIVO = 1000000 

# --- ESTRUCTURA DE LA RED SOCIAL ---
RED_ENLACES_NUEVOS = 3      # Reducimos densidad (con 1M de nodos, 6 enlaces es muy pesado)
RED_PROB_TRIANGULO = 0.20   

# --- MULTIPLICADORES DE SALDO ---
# Estos multiplicadores actúan sobre el SALDO_EMPRESA_RANGO
MULTIPLICADOR_EMPRESA = (10.0, 50.0) # Las empresas tendrán entre 10M y 250M
MULTIPLICADOR_VIP = (2.0, 5.0)
MULTIPLICADOR_RETAIL = (0.5, 1.5)

# --- BALANCE Y LIQUIDEZ ---
TOTAL_DEPOSITOS = 450000000000 
LIQUIDEZ_INICIAL = 0.18 # Aumentamos la reserva para dar "juego" a la simulación