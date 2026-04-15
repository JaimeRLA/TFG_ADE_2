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

1. **Configura los parámetros** en el panel lateral izquierdo:
   - Gravedad de la noticia, credibilidad, difusión inicial
   - Número de nodos, % no-clientes
   - Depósitos totales, coeficiente de caja
   - Número de simulaciones y turnos máximos

2. **Pulsa "Lanzar Simulación"** — verás la red social actualizarse turno a turno

3. **Al finalizar**, se genera automáticamente el **Informe Agregado de Riesgo** con:
   - KPIs de quiebra, fugados, alcance poblacional
   - Gráficos de fuga por generación, perfil y género
   - Dinámica temporal y salud financiera
   - Caja de interpretación automática

---

## Estructura del proyecto

```
TFG_ADE_BankRun_Sim/
├── backend/
│   └── main.py          ← API FastAPI + WebSocket
├── simulation/
│   ├── model.py         ← Modelo de simulación (Mesa)
│   └── agent.py         ← Comportamiento de los agentes
├── frontend/
│   └── src/app/         ← Aplicación Angular
│       ├── components/  ← Sidebar, grafo, métricas, informe
│       └── services/    ← Conexión WebSocket
├── parametros.py        ← Parámetros demográficos y de comportamiento
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
