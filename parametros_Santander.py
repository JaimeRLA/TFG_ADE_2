# --- parametros.py (VERSIÓN BANCO SANTANDER ACTUAL) ---

# --- CONFIGURACIÓN DEMOGRÁFICA (Población General Diversificada) ---
# Refleja la pirámide poblacional real de un banco comercial masivo.
EDAD_MEDIA = 52 
EDAD_DESVIACION = 18
EDAD_MINIMA = 18
EDAD_MAXIMA = 95
DISTRIBUCION_SEXO = ["H", "M"]
PROBABILIDADES_SEXO = [0.49, 0.51] 
FACTOR_H = 1.05  # Diferencia de agresividad financiera mucho más atenuada
FACTOR_M = 1.0

# --- FONDO DE GARANTÍA DE DEPÓSITOS (FGD) ---
# Clave: La gran mayoría de clientes retail están cubiertos por los 100k€.
UMBRAL_FGD = 100000  
REDUCCION_PANICO_FGD = 0.9  # El FGD es extremadamente efectivo en banca retail

# --- FIDELIDAD (COSTES DE CAMBIO) ---
# Alta fidelidad por hipotecas, nóminas y seguros (fricción de salida).
RANGO_FIDELIDAD = (0.7, 0.9) 

# --- LÓGICA DE SALDOS (€) ---
SALDO_RETAIL_RANGO = (2000, 45000)
SALDO_EMPRESA_RANGO = (150000, 2000000) 
DISTRIBUCION_TIPOS = ["Retail", "VIP", "Empresa"]
PROBABILIDADES_TIPOS = [0.85, 0.12, 0.03] 

# --- UMBRALES DE COMPORTAMIENTO ---
# Clientes mucho más estables y menos reactivos a rumores digitales.
K_RUIDO_CLIENTE = 6      # Curva de pánico mucho más plana
x0_CLIENTE = 0.65        # Umbral de tolerancia muy alto (necesitan mucho estrés para huir)

# Parámetros no cliente (opinión pública general)
K_RUIDO_NO_CLIENTE = 8 
x0_NO_CLIENTE = 0.55 

# --- PESOS DE LA DECISIÓN (Suman 1.0) ---
PESO_NOTICIA = 0.5    # Se fían más de comunicados oficiales / prensa salmón
PESO_SOCIAL = 0.2     # Menor efecto rebaño que en el ecosistema tech
PESO_LIQUIDEZ = 0.3   # Miran la solvencia real/histórica de la marca

# --- TAMAÑO DEL MERCADO ---
# Santander tiene ~160 millones de clientes globales, pero para el modelo:
POBLACION_OBJETIVO = 100000000 

# --- ESTRUCTURA DE LA RED SOCIAL (GRAFO) ---
# Red mucho más dispersa y menos "conspiranoica" que la de Silicon Valley.
RED_ENLACES_NUEVOS = 3      
RED_PROB_TRIANGULO = 0.15   # Baja clusterización (los clientes no se conocen entre sí)

# --- MULTIPLICADORES DE SALDO ---
MULTIPLICADOR_EMPRESA = (3.0, 6.0)
MULTIPLICADOR_VIP = (1.5, 2.5)
MULTIPLICADOR_RETAIL = (0.2, 1.1)

# --- BALANCE Y LIQUIDEZ ---
# Datos aproximados de un G-SIB (Global Systemically Important Bank)
TOTAL_DEPOSITOS = 1000000000000  # ~1 Billón de euros
LIQUIDEZ_INICIAL = 0.20          # Ratio de cobertura de liquidez (LCR) muy superior al 7% de SVB