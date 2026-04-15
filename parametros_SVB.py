# parametros.py (VERSIÓN SILICON VALLEY BANK)

# --- CONFIGURACIÓN DEMOGRÁFICA (Ecosistema Startup) ---
EDAD_MEDIA = 35 
EDAD_DESVIACION = 10
EDAD_MINIMA = 22
EDAD_MAXIMA = 65
DISTRIBUCION_SEXO = ["H", "M"]
PROBABILIDADES_SEXO = [0.6, 0.4] 
FACTOR_H = 1.1
FACTOR_M = 1.0

# --- FONDO DE GARANTÍA DE DEPÓSITOS (FGD) ---
UMBRAL_FGD = 100000  # Se mantiene, pero casi nadie estará protegido
REDUCCION_PANICO_FGD = 0.5  

# --- FIDELIDAD (COSTES DE CAMBIO) ---
# Dinero mercenario: lealtad nula al banco, lealtad total a sus inversores
RANGO_FIDELIDAD = (0.1, 0.2) 

# --- LÓGICA DE SALDOS (€) ---
SALDO_RETAIL_RANGO = (1000, 15000)
SALDO_EMPRESA_RANGO = (500000, 15000000) # Saldos masivos que anulan el efecto del FGD
DISTRIBUCION_TIPOS = ["Retail", "VIP", "Empresa"]
PROBABILIDADES_TIPOS = [0.05, 0.10, 0.85] # 85% de concentración en empresas/VC

# --- UMBRALES DE COMPORTAMIENTO ---
# Parámetros cliente (Pánico rápido y sensible)
K_RUIDO_CLIENTE = 15 
x0_CLIENTE = 0.25 

# Parámetros no cliente
K_RUIDO_NO_CLIENTE = 12 
x0_NO_CLIENTE = 0.45 

# --- PESOS DE LA DECISIÓN (Suman 1.0) ---
PESO_NOTICIA = 0.2   
PESO_SOCIAL = 0.7    # Efecto rebaño masivo (WhatsApp, Slack, Twitter)
PESO_LIQUIDEZ = 0.1  

# --- TAMAÑO DEL MERCADO ---
POBLACION_OBJETIVO = 37000

# --- ESTRUCTURA DE LA RED SOCIAL (GRAFO) ---
RED_ENLACES_NUEVOS = 4      # Red más densa
RED_PROB_TRIANGULO = 0.85   # Ecosistema cerrado (alta clusterización)

# --- MULTIPLICADORES DE SALDO (Respecto a la media del nodo) ---
MULTIPLICADOR_EMPRESA = (5.0, 12.0)
MULTIPLICADOR_VIP = (1.5, 3.0)
MULTIPLICADOR_RETAIL = (0.5, 1.2)

TOTAL_DEPOSITOS = 200000000000  # Ej: 200 Mil Millones
LIQUIDEZ_INICIAL = 0.07