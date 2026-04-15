# parametros.py

# --- CONFIGURACIÓN DEMOGRÁFICA ---
EDAD_MEDIA = 50
EDAD_DESVIACION = 18
EDAD_MINIMA = 18
EDAD_MAXIMA = 90
DISTRIBUCION_SEXO = ["H", "M"]
PROBABILIDADES_SEXO = [0.5, 0.5]
FACTOR_H=1.1
FACTOR_M=1

# --- FONDO DE GARANTÍA DE DEPÓSITOS (FGD) ---
UMBRAL_FGD = 100000  # Límite de protección en España (€)
REDUCCION_PANICO_FGD = 0.5  # Los protegidos tienen la mitad de miedo

# --- FIDELIDAD (COSTES DE CAMBIO) ---
# Representa años de antigüedad o vinculación (hipoteca, nómina)
RANGO_FIDELIDAD = (0.1, 0.9) # 0.1: nuevo cliente, 0.9: cliente muy fiel

# --- LÓGICA DE SALDOS (€) ---
SALDO_RETAIL_RANGO = (1000, 15000)
SALDO_EMPRESA_RANGO = (50000, 200000)
DISTRIBUCION_TIPOS = ["Retail", "VIP", "Empresa"]
PROBABILIDADES_TIPOS = [0.75, 0.20, 0.05]

# --- UMBRALES DE COMPORTAMIENTO ---
# Parámetros cliente
K_RUIDO_CLIENTE = 10 
x0_CLIENTE = 0.4

# Parámetros no cliente
K_RUIDO_NO_CLIENTE = 12 
x0_NO_CLIENTE = 0.45 

# --- PESOS DE LA DECISIÓN (Suman 1.0) ---
PESO_NOTICIA = 0.4   # Impacto de los medios
PESO_SOCIAL = 0.5    # Lo que hacen sus vecinos (efecto rebaño)
PESO_LIQUIDEZ = 0.1  # Salud financiera real del banco

# --- TAMAÑO DEL MERCADO ---
POBLACION_OBJETIVO = 3000000

# --- ESTRUCTURA DE LA RED SOCIAL (GRAFO) ---
RED_ENLACES_NUEVOS = 3      # Cuántas conexiones crea cada nuevo nodo (3 es estándar)
RED_PROB_TRIANGULO = 0.5    # Probabilidad de cerrar triángulos (0.5 = alta clusterización/burbuja)

# --- MULTIPLICADORES DE SALDO (Respecto a la media del nodo) ---
# Usaremos esto en lugar de los rangos absolutos para que respete tu 'total_depositos'
MULTIPLICADOR_EMPRESA = (4.0, 8.0)
MULTIPLICADOR_VIP = (1.5, 3.0)
MULTIPLICADOR_RETAIL = (0.5, 1.2)

TOTAL_DEPOSITOS = 200000000000  # Ej: 200 Mil Millones
LIQUIDEZ_INICIAL = 0.07