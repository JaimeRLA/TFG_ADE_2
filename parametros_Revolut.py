# --- parametros.py (VERSIÓN REVOLUT - NEOBANCA DIGITAL) ---

# --- CONFIGURACIÓN DEMOGRÁFICA (Gen Z & Millennials) ---
# Usuarios nativos digitales, alta movilidad y nula barrera tecnológica.
EDAD_MEDIA = 20 
EDAD_DESVIACION = 8
EDAD_MINIMA = 18
EDAD_MAXIMA = 50
DISTRIBUCION_SEXO = ["H", "M"]
PROBABILIDADES_SEXO = [0.5, 0.5] 
FACTOR_H = 1.1  # Ligera mayor tendencia al trading/riesgo
FACTOR_M = 1.0

# --- FONDO DE GARANTÍA DE DEPÓSITOS (FGD) ---
# La mayoría están cubiertos, pero hay desconfianza por ser "entidad digital".
UMBRAL_FGD = 100000  
REDUCCION_PANICO_FGD = 0.60 # Menor que en Santander; el usuario digital teme el "bloqueo de App"

# --- FIDELIDAD (COSTES DE CAMBIO CERO) ---
# Fidelidad bajísima. Se puede cambiar de banco en 30 segundos.
RANGO_FIDELIDAD = (0.05, 0.15) 

# --- LÓGICA DE SALDOS (€) ---
# Saldos atomizados: mucha gente con poco dinero.
SALDO_RETAIL_RANGO = (100, 5000) 
SALDO_EMPRESA_RANGO = (10000, 100000) # Pymes y Freelancers digitales
DISTRIBUCION_TIPOS = ["Retail", "VIP", "Empresa"]
PROBABILIDADES_TIPOS = [0.92, 0.06, 0.02] 

# --- UMBRALES DE COMPORTAMIENTO ---
# Pánico "TikTok": reacción instantánea y emocional.
K_RUIDO_CLIENTE = 18     # Sensibilidad extrema (mayor que SVB)
x0_CLIENTE = 0.30        # Tolerancia muy baja a fallos en la App o rumores

# --- PESOS DE LA DECISIÓN (Suman 1.0) ---
PESO_NOTICIA = 0.15    # Ignoran la prensa tradicional
PESO_SOCIAL = 0.80     # EL PESO TOTAL: Twitter, Reddit, Discord y grupos de amigos
PESO_LIQUIDEZ = 0.05   # El usuario medio no sabe qué es un ratio de solvencia

# --- TAMAÑO DEL MERCADO ---
POBLACION_OBJETIVO = 1000000 

# --- ESTRUCTURA DE LA RED SOCIAL (GRAFO) ---
# Red hiper-conectada y viral.
RED_ENLACES_NUEVOS = 8      
RED_PROB_TRIANGULO = 0.70   # Comunidades digitales muy cerradas

# --- MULTIPLICADORES DE SALDO ---
MULTIPLICADOR_EMPRESA = (5.0, 15.0)
MULTIPLICADOR_VIP = (2.0, 6.0)
MULTIPLICADOR_RETAIL = (0.1, 2.0)

# --- BALANCE Y LIQUIDEZ ---
TOTAL_DEPOSITOS = 15000000000   # ~15 Mil Millones (crecimiento rápido)
LIQUIDEZ_INICIAL = 0.12          # Suelen ser muy líquidos pero con activos volátiles