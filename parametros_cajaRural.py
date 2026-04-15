# --- parametros.py (VERSIÓN CAJA RURAL / BANCO DE PROXIMIDAD) ---

# --- CONFIGURACIÓN DEMOGRÁFICA (Población Rural y Envejecida) ---
# Clientes de avanzada edad, baja digitalización y ahorradores.
EDAD_MEDIA = 68 
EDAD_DESVIACION = 12
EDAD_MINIMA = 35
EDAD_MAXIMA = 100
DISTRIBUCION_SEXO = ["H", "M"]
PROBABILIDADES_SEXO = [0.45, 0.55] 
FACTOR_H = 1.02  # Comportamiento muy conservador en ambos sexos
FACTOR_M = 1.0

# --- FONDO DE GARANTÍA DE DEPÓSITOS (FGD) ---
# Confianza absoluta en el sistema: "El Estado no dejará caer a la Caja".
UMBRAL_FGD = 100000  
REDUCCION_PANICO_FGD = 0.95 # Efecto sedante máximo del seguro de depósitos

# --- FIDELIDAD (EL BANCO DE TODA LA VIDA) ---
# Costes de cambio altísimos: relación personal con el director de oficina.
RANGO_FIDELIDAD = (0.4, 0.8) 

# --- LÓGICA DE SALDOS (€) ---
# Ahorros de toda una vida, pero sin grandes fortunas corporativas.
SALDO_RETAIL_RANGO = (5000, 60000) 
SALDO_EMPRESA_RANGO = (50000, 500000) # Cooperativas agrarias y comercios locales
DISTRIBUCION_TIPOS = ["Retail", "VIP", "Empresa"]
PROBABILIDADES_TIPOS = [0.95, 0.04, 0.01] 

# --- TAMAÑO DEL MERCADO ---
POBLACION_OBJETIVO = 50000 # Un ecosistema local pequeño

# --- ESTRUCTURA DE LA RED SOCIAL (GRAFO) ---
# Red de "pueblo": pocos conocidos, pero vínculos muy fuertes.
RED_ENLACES_NUEVOS = 1      
RED_PROB_TRIANGULO = 0.10   

# --- MULTIPLICADORES DE SALDO ---
MULTIPLICADOR_EMPRESA = (2.0, 5.0)
MULTIPLICADOR_VIP = (1.5, 2.5)
MULTIPLICADOR_RETAIL = (0.5, 1.2)

# --- BALANCE Y LIQUIDEZ ---
TOTAL_DEPOSITOS = 2500000000   # 2.5 Mil Millones (pequeña escala)
LIQUIDEZ_INICIAL = 0.25         # Suelen ser entidades muy conservadoras y líquidas