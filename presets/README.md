# Presets de Configuración

Este directorio contiene las configuraciones de parámetros para diferentes tipos de bancos y escenarios.

## Estructura de un Preset

Cada archivo JSON contiene una configuración completa con las siguientes secciones:

### Información Básica
- `name`: Nombre descriptivo del preset
- `description`: Descripción breve del escenario

### demographics
Parámetros demográficos de la población de clientes:
- `edad_media`, `edad_desviacion`, `edad_minima`, `edad_maxima`: Distribución de edad
- `distribucion_sexo`, `probabilidades_sexo`: Distribución por género
- `factor_h`, `factor_m`: Factores de comportamiento por género

### deposit_guarantee
Fondo de Garantía de Depósitos:
- `umbral_fgd`: Límite de protección (€)
- `reduccion_panico_fgd`: Factor de reducción de pánico para clientes protegidos (0-1)

### loyalty
Costes de cambio y fidelidad:
- `rango_fidelidad`: [mínimo, máximo] de fidelidad (0-1)

### balances
Distribución de saldos y tipos de cliente:
- `saldo_retail_rango`, `saldo_empresa_rango`: Rangos de saldo en €
- `distribucion_tipos`: ["Retail", "VIP", "Empresa"]
- `probabilidades_tipos`: Probabilidades para cada tipo (deben sumar 1.0)

### behavior
Umbrales de comportamiento (curva logística):
- `k_ruido_cliente`: Sensibilidad al pánico de clientes
- `x0_cliente`: Umbral de activación para clientes
- `k_ruido_no_cliente`: Sensibilidad de no-clientes
- `x0_no_cliente`: Umbral para no-clientes

### decision_weights
Pesos en la decisión de retirar fondos (deben sumar 1.0):
- `peso_noticia`: Influencia de los medios
- `peso_social`: Efecto rebaño (vecinos en la red)
- `peso_liquidez`: Salud financiera real del banco

### market
Tamaño del mercado:
- `poblacion_objetivo`: Número de personas representadas

### network
Estructura de la red social:
- `red_enlaces_nuevos`: Conexiones que crea cada nuevo nodo
- `red_prob_triangulo`: Probabilidad de cerrar triángulos (clusterización)

### bank_structure
Estructura financiera del banco:
- `total_depositos`: Depósitos totales en €
- `liquidez_inicial`: Coeficiente de reserva (0-1)

## Presets Incluidos

1. **default.json** - Banco genérico equilibrado
2. **santander.json** - Banco comercial masivo, alta fidelidad
3. **lazard.json** - Banco de inversión institucional
4. **svb.json** - Silicon Valley Bank (startups/VC)
5. **revolut.json** - Neobanca digital (Gen Z/Millennials)
6. **caja_rural.json** - Banco de proximidad rural

## Crear un Preset Personalizado

Puedes crear nuevos presets de dos formas:

1. **Desde la interfaz web**: Ve a "Gestionar Parámetros" y usa el formulario
2. **Manualmente**: Copia un preset existente, modifícalo y guárdalo con un nuevo nombre

## Notas Importantes

- Los pesos de decisión (`peso_noticia`, `peso_social`, `peso_liquidez`) deben sumar 1.0
- Las probabilidades de tipos de cliente también deben sumar 1.0
- Los valores de liquidez y reducción de pánico van de 0 a 1
- Los nombres de archivo deben usar snake_case (ej: `mi_banco.json`)
