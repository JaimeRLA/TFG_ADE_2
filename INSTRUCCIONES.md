# Stress Test Lab — Instrucciones de Ejecución

## Requisitos previos

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Angular CLI | 17+ | se instala en el paso 3 |

---

## Instalación inicial (solo la primera vez)

### 1. Clonar o copiar el proyecto
Asegúrate de tener la carpeta `TFG_ADE_BankRun_Sim` en tu máquina.

### 2. Instalar dependencias Python (backend + simulación)
Abre una terminal en la **raíz del proyecto** (`TFG_ADE_BankRun_Sim/`):

```bash
pip install -r requirements.txt
pip install fastapi "uvicorn[standard]" websockets
```

### 3. Instalar Angular CLI (si no está instalado)
```bash
npm install -g @angular/cli
```

### 4. Instalar dependencias del frontend
```bash
cd frontend
npm install
cd ..
```

---

## Ejecución (cada vez que quieras usar el programa)

Necesitas **dos terminales abiertas simultáneamente**:

### Terminal 1 — Backend (Python / FastAPI)
Desde la **raíz del proyecto**:

```bash
uvicorn backend.main:app --reload
```

Verás algo como:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Terminal 2 — Frontend (Angular)
Desde la carpeta `frontend/`:

```bash
cd frontend
ng serve
```

Verás algo como:
```
Application bundle generation complete.
Local:   http://localhost:4200/
```

### 3. Abrir el navegador
Ve a: **http://localhost:4200**

---

## Uso de la aplicación

### 1. Gestión de Parámetros (Nuevo)

**Sistema de Presets**: Ahora puedes crear, editar y guardar diferentes configuraciones de parámetros sin modificar el código.

#### Presets Predefinidos

La aplicación incluye 6 configuraciones predefinidas:

- **Default**: Banco genérico equilibrado
- **Santander**: Banco comercial masivo con alta fidelidad
- **Lazard**: Banco de inversión institucional
- **Silicon Valley Bank**: Banco especializado en startups
- **Revolut**: Neobanca digital para nativos digitales
- **Caja Rural**: Banco de proximidad rural

#### Crear un Nuevo Preset

1. Haz clic en "Gestionar Parámetros" en el sidebar
2. Pulsa el botón "Nuevo Preset"
3. Completa los parámetros organizados en pestañas:
   - **Demografía**: Edad, género, factores de comportamiento
   - **Estructura Bancaria**: Depósitos totales, liquidez, FGD
   - **Comportamiento**: Umbrales de pánico, fidelidad
   - **Saldos**: Rangos por tipo de cliente
   - **Pesos de Decisión**: Influencia de noticias, redes sociales, liquidez
   - **Mercado y Red**: Población objetivo, estructura de red social
   - **Multiplicadores**: Factores de saldo por tipo de cliente
4. Guarda el preset con un nombre descriptivo

#### Seleccionar un Preset para Simulación

1. En el sidebar principal, despliega el selector "Preset de Parámetros"
2. Selecciona la configuración deseada (ej: "Silicon Valley Bank")
3. Configura los parámetros de la crisis (gravedad, credibilidad, difusión)
4. Lanza la simulación

### 2. Configurar Parámetros de Crisis

En el panel lateral izquierdo:
   - Selecciona el preset de parámetros bancarios
   - Gravedad de la noticia, credibilidad, difusión inicial
   - Número de nodos, % no-clientes
   - Número de simulaciones y turnos máximos

### 3. Ejecutar Simulación

**Pulsa "Lanzar Simulación"** — verás la red social actualizarse turno a turno

### 4. Analizar Resultados

**Al finalizar**, se genera automáticamente el **Informe Agregado de Riesgo** con:
   - KPIs de quiebra, fugados, alcance poblacional
   - Gráficos de fuga por generación, perfil y género
   - Dinámica temporal y salud financiera
   - Caja de interpretación automática

---

## Estructura del proyecto

```
TFG_ADE_BankRun_Sim/
├── backend/
│   ├── main.py          ← API FastAPI + WebSocket + Endpoints de Presets
│   └── requirements.txt
├── simulation/
│   ├── model.py         ← Modelo de simulación (Mesa) con soporte para presets
│   └── agent.py         ← Comportamiento de los agentes
├── frontend/
│   └── src/app/         ← Aplicación Angular
│       ├── components/
│       │   ├── preset-manager/  ← Gestión de configuraciones
│       │   ├── sidebar/         ← Panel de control
│       │   ├── dashboard/       ← Vista principal
│       │   └── ...
│       ├── services/
│       │   ├── preset.service.ts    ← API de presets
│       │   └── simulation.service.ts ← WebSocket
│       └── models/
│           └── simulation.models.ts ← Interfaces TypeScript
├── presets/             ← Configuraciones de parámetros (JSON)
│   ├── default.json
│   ├── santander.json
│   ├── lazard.json
│   ├── svb.json
│   ├── revolut.json
│   └── caja_rural.json
├── parametros*.py       ← Archivos legacy (mantener para referencia)
└── requirements.txt     ← Dependencias Python
```

---

## Solución de problemas

| Problema | Solución |
|---|---|
| `"Conectando..."` y no arranca | Verifica que el backend esté corriendo en el Terminal 1 |
| Error `mesa.time.RandomActivation` | Ejecuta `pip install "mesa<3.0"` |
| Error al compilar `pandas` | Ejecuta `pip install -r requirements.txt --only-binary=:all:` |
| Puerto 8000 ocupado | Cambia el puerto: `uvicorn backend.main:app --port 8001` y actualiza la URL en `simulation.service.ts` |
| Puerto 4200 ocupado | Usa `ng serve --port 4201` |
