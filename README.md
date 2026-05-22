# Stress Test Lab - Simulador de Pánico Bancario

Sistema avanzado de simulación basado en agentes para analizar el riesgo de corridas bancarias en diferentes tipos de instituciones financieras.

## 🎯 Características Principales

- **Sistema de Presets Configurable**: Gestiona múltiples configuraciones de parámetros sin modificar código
- **6 Escenarios Predefinidos**: Desde bancos tradicionales hasta neobancos digitales
- **Simulación Multi-Agente**: Basada en Mesa framework con redes sociales complejas
- **Visualización en Tiempo Real**: Interfaz Angular con gráficos dinámicos
- **Informes Automáticos**: Análisis agregado de riesgo con KPIs y métricas

## 🏦 Presets Incluidos

1. **Default** - Banco genérico equilibrado
2. **Santander** - Banco comercial masivo con alta fidelidad de clientes
3. **Lazard** - Banco de inversión institucional
4. **Silicon Valley Bank** - Especializado en startups y venture capital
5. **Revolut** - Neobanca digital para Gen Z/Millennials
6. **Caja Rural** - Banco de proximidad con población envejecida

## 🚀 Inicio Rápido

### Requisitos
- Python 3.10+
- Node.js 18+
- Angular CLI 17+

### Instalación

```bash
# 1. Instalar dependencias Python
pip install -r requirements.txt

# 2. Instalar Angular CLI (si no está instalado)
npm install -g @angular/cli

# 3. Instalar dependencias del frontend
cd frontend
npm install
cd ..
```

### Ejecución

**Terminal 1 - Backend:**
```bash
uvicorn backend.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
ng serve
```

Abre **http://localhost:4200** en tu navegador.

## 📋 Uso

### 1. Gestión de Presets

- **Ver presets**: Despliega el selector en el sidebar
- **Crear nuevo**: Click en "Gestionar Parámetros" → "Nuevo Preset"
- **Editar**: Selecciona un preset de la lista y modifica sus valores
- **Eliminar**: Click en el icono de papelera junto al preset

### 2. Ejecutar Simulación

1. Selecciona un preset de parámetros (ej: "Silicon Valley Bank")
2. Ajusta los parámetros de la crisis:
   - Gravedad de la noticia (0-1)
   - Credibilidad del medio (0-1)
   - Difusión inicial (0-100%)
3. Configura el modelo:
   - Número de agentes (nodos en la red)
   - Porcentaje de no-clientes
   - Turnos máximos y simulaciones
4. Click en "Lanzar Simulación"

### 3. Analizar Resultados

El informe final incluye:
- Probabilidad de quiebra
- Porcentaje de fugados
- Dinámica temporal de liquidez
- Distribución de fuga por edad, género y tipo de cliente

## 🏗️ Arquitectura

```
├── backend/            # API FastAPI + WebSocket
│   └── main.py         # Endpoints REST y WebSocket
├── simulation/         # Motor de simulación Mesa
│   ├── model.py        # Modelo del banco
│   └── agent.py        # Comportamiento de agentes
├── frontend/           # Aplicación Angular
│   └── src/app/
│       ├── components/ # UI (dashboard, sidebar, preset-manager)
│       ├── services/   # Comunicación con backend
│       └── models/     # Interfaces TypeScript
├── presets/            # Configuraciones JSON
│   ├── default.json
│   ├── santander.json
│   └── ...
└── requirements.txt
```

## 🔧 Personalización de Presets

Cada preset es un archivo JSON con las siguientes secciones:

- **demographics**: Distribución de edad, género y factores culturales
- **bank_structure**: Depósitos totales, liquidez, FGD
- **behavior**: Umbrales de pánico y fidelidad
- **balances**: Distribución de saldos por tipo de cliente
- **decision_weights**: Influencia de noticias, redes sociales y liquidez
- **network**: Estructura de la red social (enlaces, clusterización)
- **market**: Población objetivo representada
- **multipliers**: Factores de saldo por segmento

Ver [presets/README.md](presets/README.md) para detalles completos.

## 📊 Modelo de Simulación

### Agentes

- **Clientes**: Representan clusters de ahorradores con decisiones basadas en:
  - Impacto de noticias
  - Contagio social (vecinos en la red)
  - Liquidez real del banco
  
- **No-Clientes**: Nodos de opinión pública que amplifican rumores

### Dinámica

1. **Difusión**: La noticia se propaga por la red según digitalización
2. **Contagio Social**: Los agentes observan el pánico de sus vecinos
3. **Decisión**: Función sigmoide determina el porcentaje de fuga
4. **Ejecución**: Retiros limitados por liquidez disponible

### Red Social

- Grafo Powerlaw Cluster (Holme-Kim)
- Propiedades de "mundo pequeño"
- Clustering configurable por preset

## 🛠️ Tecnologías

- **Backend**: FastAPI, Mesa, NetworkX, NumPy, Pandas
- **Frontend**: Angular 17+, Material Design, Plotly.js
- **Comunicación**: WebSocket para streaming en tiempo real

## 📝 Licencia

Proyecto académico - TFG ADE 2025

