# Siglo! — Prototipo HTML/JS (React + Vite + Firebase)

Este archivo contiene el prompt completo del juego **Siglo!** y las instrucciones técnicas para implementar el prototipo usando **React + Vite** en el frontend y **Firebase** (Auth + Firestore + Cloud Functions) en el backend.

**Descripción rápida**
- **Nombre:** Siglo!
- **Tipo:** Juego de mesa / betting, turn-based, multijugador por sesión (N jugadores)
- **Objetivo:** Lograr exactamente 99 o 100 puntos ("Siglo!")
- **Bolsa:** Fichas numeradas del `1` al `98` (sin 99/100 en la bolsa)
- **Comodín:** Un número oculto generado al inicio de la ronda, disponible para toggle por jugador

**Reglas / Flujo de juego**
- **Lobby:** Cada jugador ingresa un nombre y elige entrar con su billetera (o recibir `1000` coins como saldo inicial). Se fija una **apuesta base común** por ronda.
- **Inicio de ronda:** Se reparte una ficha a cada jugador; se descuenta la apuesta del jugador al `pot` común; se genera un `comodín` (valor aleatorio) oculto y se revela en la UI.
- **Turnos:** En su turno, un jugador puede:
  - **Pedir N fichas** sucesivas de la bolsa (las fichas extraídas no regresan y son visibles para todos).
  - **Toggle comodín** para incluir o excluir su valor del total (puede hacerlo en cualquier momento).
  - **Quedarse** (stand): marcar su mano y pasar el turno.
- **Condiciones:**
  - Si la suma total de un jugador (mano ± comodín si activo) es `99` o `100`, se declara **Siglo!** y gana el `pot` inmediatamente.
  - Si la suma supera `100`, el jugador queda `busteado` y pierde la apuesta (sale de la ronda hasta la siguiente).
  - Si nadie logra Siglo, al finalizar la ronda gana quien tenga la mayor suma ≤ `100` (si todos se pasan, gana el mayor aunque todos superen 100, según reglas acordadas).

**Elementos visibles en la interfaz**
- Mesa verde (fondo principal)
- Bolsa animada y contador de fichas restantes
- Fichas extraídas visibles para todos
- Comodín (valor y estado: oculto/revelado)
- Panel de jugadores con: nombre, coins, mano (fichas), suma con/ sin comodín, estado (en turno / busteado / quedado / ganador)
- Pot (pozo) acumulado
- Controles: `Pedir N`, `Quedarse`, `Toggle Comodín`

**Stack recomendado para el prototipo**
- **Frontend:** React (Vite) — rápido para prototipos, HMR, build optimizada.
- **Realtime / Persistencia:** Firebase Firestore + Firebase Auth (Anonymous) para sesiones y sincronización.
- **Lógica crítica / Atomicidad:** Firebase Cloud Functions (Node) o transacciones Firestore para operaciones que deben ser atómicas: extraer fichas, cobrar apuestas, resolver la ronda.

**Modelo de datos (sugerido) — `games/{gameId}`**
- `players`: array de objetos { `id`, `name`, `coins`, `hand`: [numbers], `status`, `bet` }
- `deck`: array de números restantes (inicialmente `1..98`)
- `drawn`: array de números extraídos (visibles)
- `wildcard`: { `value`: number, `revealed`: boolean }
- `pot`: number
- `currentTurnIndex`: number
- `roundState`: string enum: `lobby | in_round | resolving | finished`
- `createdAt`, `updatedAt`

**Operaciones críticas (recomendado implementar como Cloud Functions / transacciones)**
- `createGame` — inicializa `deck` con `1..98`, genera `wildcard` aleatorio y crea el documento de juego.
- `joinGame` — añade jugador a `players` y opcionalmente inicializa `coins`.
- `startRound` — reparte 1 ficha a cada jugador y descuenta la apuesta base al `pot` (en transacción).
- `drawTiles(gameId, playerId, n)` — extrae `n` fichas de `deck` en una transacción, actualiza `drawn` y la `hand` del jugador.
- `toggleWildcard(gameId, playerId)` — alterna el uso del comodín en el cálculo (registrar en el estado del jugador si estás guardando ese flag).
- `standOrResolve` / `resolveRound` — marca jugadores que han quedado, avanza turnos y resuelve el ganador repartiendo el `pot`.

**Seguridad y validación**
- Usar **Firestore Security Rules** para evitar writes directos que rompan el estado.
- Implementar Cloud Functions para validar y autorizar movimientos que modifican el `deck`, `pot` o determinen ganadores (evitar confianzas en cliente).

**Comandos y scaffold (Vite + React)**
1. Crear proyecto con Vite:
```bash
npm create vite@latest siglo-proto -- --template react
cd siglo-proto
npm install
```

2. Desarrollo en `4173` (puedes fijar puerto):
```bash
npm run dev -- --port 4173
```

3. Build y preview en `4173`:
```bash
npm run build
npm run preview -- --port 4173
```

4. Scripts sugeridos en `package.json`:
```json
"scripts": {
  "dev": "vite --port 4173",
  "build": "vite build",
  "preview": "vite preview --port 4173"
}
```

**Variables de entorno (para Vite + Firebase)**
- Guardar en `.env` (NO subir a VCS):
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

En React acceder con `import.meta.env.VITE_FIREBASE_API_KEY`.

**Opciones para desarrollo rápido sin Cloud Functions**
- Para prototipo local puedes simular la extracción de fichas y la lógica en el cliente, usando transacciones locales o locks simples, pero esto no protege contra trampas si pruebas con varios clientes reales.
- Recomendación: implementar funciones críticas luego como Cloud Functions y durante el prototipo usar un modo `--mock-server` o un archivo `firebase-mock.js`.

**Notas sobre la bolsa `1..98`**
- Dado que la bolsa no contiene `99` ni `100`, el `comodín` es casi siempre necesario para lograr `Siglo!` (99/100). Esto hace que el comodín sea una pieza central de estrategia y de balance.
- Asegúrate de que el `comodín` se genere dentro del rango permitido y que su uso quede claro en la UI.

**Próximos pasos (TODOs)**
- `Scaffold React + Vite` — crear estructura inicial de componentes.
- `Configurar Firebase` — preparar proyecto, Auth (anonymous) y Firestore.
- `Diseñar modelo de datos` en Firestore y reglas básicas.
- `Implementar Lobby` y UI de `Table` con controles básicos.
- `Implementar funciones críticas` en Cloud Functions: `drawTiles`, `startRound`, `resolveRound`.
- `Pruebas locales` y ajuste de reglas.

Si quieres que empiece ahora con el **scaffold** de React + Vite (sin Firebase aún), dime y generaré la estructura inicial y los componentes base (`Lobby`, `Table`, `Deck`, `PlayerPanel`) listos para integrar Firebase.

---
Creado para el proyecto en `siglo-game-react`.
