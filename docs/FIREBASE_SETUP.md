# Firebase Setup - Siglo Game 🔥

Guía completa para configurar y desplegar Siglo! con Firebase.

---

## ✅ Estado Actual

**Firebase configurado:**
- ✅ SDK instalado y configurado
- ✅ Firestore Database inicializado
- ✅ Authentication (Anonymous) listo
- ✅ Reglas de seguridad creadas
- ✅ Servicios de juego implementados
- ✅ Hooks de React para sincronización

---

## 📋 Estructura de la Base de Datos

### Colección: `games`

Cada documento representa una partida de Siglo.

```typescript
{
  id: string;                    // ID del documento (igual a roomCode)
  roomCode: string;              // Código de la sala (6 caracteres)
  hostId: string;                // UID del host
  players: Player[];             // Array de jugadores
  deck: number[];                // Fichas restantes (1-90)
  drawnTiles: number[];          // Fichas extraídas (visible para todos)
  wildcard: {
    value: number;               // Valor del comodín (1-30)
    revealed: boolean;           // Si está revelado
  };
  pot: number;                   // Pozo acumulado
  currentTurnIndex: number;      // Índice del turno actual
  roundState: RoundState;        // 'lobby' | 'in_round' | 'resolving' | 'finished'
  baseBet: number;               // Apuesta base
  createdAt: Timestamp;          // Timestamp de creación
  updatedAt: Timestamp;          // Timestamp de última actualización
}
```

### Tipo: `Player`

```typescript
{
  id: string;                    // UID del jugador
  name: string;                  // Nombre del jugador
  coins: number;                 // Coins disponibles
  hand: number[];                // Fichas en la mano
  status: PlayerStatus;          // 'waiting' | 'playing' | 'stood' | 'busted' | 'winner'
  bet: number;                   // Apuesta actual
  wildcardActive: boolean;       // Si está usando el comodín
  isReady?: boolean;             // Solo en lobby
}
```

---

## 🔐 Autenticación

### Anonymous Auth

El juego usa autenticación anónima para simplificar el inicio:

```typescript
import { useAuthContext } from './contexts/AuthContext';

const { user, signIn, isAuthenticated } = useAuthContext();

// Auto sign-in al cargar la app
useEffect(() => {
  if (!isAuthenticated) {
    signIn();
  }
}, [isAuthenticated, signIn]);
```

**UID del usuario:** `auth.currentUser.uid` se usa como `playerId`

---

## 🎮 Servicios Implementados

### 1. Crear Sala

```typescript
import { createGame } from './services/gameService';

const roomCode = generateRoomCode(); // ABC123
await createGame(roomCode, userId, baseBet);
```

### 2. Unirse a Sala

```typescript
import { joinGame } from './services/gameService';

await joinGame(roomCode, userId, playerName, coins);
```

### 3. Iniciar Partida

```typescript
import { startGame } from './services/gameService';

await startGame(roomCode);
```

### 4. Pedir Ficha

```typescript
import { drawTile } from './services/gameService';

const drawnTile = await drawTile(roomCode, playerId);
```

### 5. Toggle Comodín

```typescript
import { toggleWildcard } from './services/gameService';

await toggleWildcard(roomCode, playerId);
```

### 6. Quedarse (Stand)

```typescript
import { standPlayer } from './services/gameService';

await standPlayer(roomCode, playerId);
```

### 7. Siguiente Turno

```typescript
import { nextTurn } from './services/gameService';

await nextTurn(roomCode);
```

### 8. Reset con Nuevas Apuestas

```typescript
import { resetGameWithBets } from './services/gameService';

await resetGameWithBets(roomCode, newBaseBet);
```

---

## 🔄 Sincronización en Tiempo Real

### Hook: `useDocument`

Escucha cambios en un documento específico:

```typescript
import { useDocument } from './hooks/useFirestore';

const { data: game, loading, error } = useDocument<Game>('games', roomCode);

// game se actualiza automáticamente cuando cambia en Firestore
```

### Hook: `useCollection`

Escucha cambios en una colección:

```typescript
import { useCollection } from './hooks/useFirestore';
import { where } from 'firebase/firestore';

const { data: games, loading, error } = useCollection<Game>(
  'games',
  where('roundState', '==', 'lobby')
);
```

---

## 🛡️ Reglas de Seguridad

Las reglas están definidas en `firestore.rules`:

### Principales Restricciones

1. **Lectura:** Solo usuarios autenticados
2. **Creación:** Solo si eres el host y `roundState === 'lobby'`
3. **Actualización:** Solo si estás en la partida
4. **Eliminación:** No permitida directamente

### Ejemplo de Validación

```javascript
// Crear juego
allow create: if isAuthenticated() &&
                 request.resource.data.hostId == request.auth.uid &&
                 request.resource.data.roundState == 'lobby' &&
                 request.resource.data.baseBet >= 100;

// Actualizar
allow update: if isAuthenticated() &&
                 isInGame(resource.data);
```

---

## 🚀 Despliegue

### 1. Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login en Firebase

```bash
firebase login
```

### 3. Inicializar Firebase

```bash
firebase init
```

Selecciona:
- ✅ Firestore
- ✅ Hosting

### 4. Desplegar Reglas de Firestore

```bash
firebase deploy --only firestore:rules
```

### 5. Build de Producción

```bash
npm run build
```

### 6. Desplegar a Firebase Hosting

```bash
firebase deploy --only hosting
```

### 7. Desplegar Todo

```bash
npm run build && firebase deploy
```

---

## 🧪 Testing Local con Emulators

### 1. Iniciar Emulators

```bash
firebase emulators:start
```

Esto iniciará:
- Firestore Emulator: `localhost:8080`
- Emulator UI: `localhost:4000`

### 2. Conectar a Emulators (Desarrollo)

Actualiza `src/config/firebase.ts`:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';

// Solo en desarrollo
if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

---

## 📊 Estructura de Archivos Firebase

```
siglo-game-react/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Configuración de Firebase
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticación
│   ├── hooks/
│   │   ├── useAuth.ts           # Hook de autenticación
│   │   └── useFirestore.ts      # Hooks de Firestore
│   └── services/
│       └── gameService.ts       # Servicios del juego
├── firestore.rules               # Reglas de seguridad
├── firestore.indexes.json        # Índices de Firestore
└── firebase.json                 # Configuración de Firebase
```

---

## 🎯 Flujo Completo del Juego

### 1. WelcomeScreen

```typescript
// Usuario ingresa nombre
// Se guarda en localStorage
localStorage.setItem('playerName', name);

// Auto sign-in anónimo
const user = await signIn();
// userId = user.uid
```

### 2. CoinsSelection

```typescript
// Usuario selecciona coins
localStorage.setItem('playerCoins', coins);
```

### 3. Lobby

```typescript
// Opción A: Crear sala
const roomCode = generateRoomCode();
await createGame(roomCode, userId, baseBet);
await joinGame(roomCode, userId, playerName, coins);

// Opción B: Unirse a sala existente
await joinGame(roomCode, userId, playerName, coins);

// Marcar como listo
await setPlayerReady(roomCode, userId, true);

// Host inicia partida
await startGame(roomCode);
```

### 4. GameTable

```typescript
// Escuchar cambios del juego
const { data: game } = useDocument<Game>('games', roomCode);

// Pedir ficha (mi turno)
await drawTile(roomCode, myPlayerId);

// Toggle comodín
await toggleWildcard(roomCode, myPlayerId);

// Quedarse
await standPlayer(roomCode, myPlayerId);

// Pasar turno
await nextTurn(roomCode);

// Si todos se pasan → re-apuesta
if (checkAllBusted(game.players)) {
  await resetGameWithBets(roomCode, newBaseBet);
}
```

---

## 🔥 Operaciones Atómicas (Transacciones)

Todas las operaciones críticas usan `runTransaction` para evitar race conditions:

```typescript
await runTransaction(db, async (transaction) => {
  const gameDoc = await transaction.get(gameRef);
  const gameData = gameDoc.data() as Game;

  // Modificar datos
  const updatedData = { ...gameData, /* cambios */ };

  // Actualizar atomicamente
  transaction.update(gameRef, updatedData);
});
```

**Garantiza:**
- ✅ No hay condiciones de carrera
- ✅ Lecturas y escrituras consistentes
- ✅ Retry automático en caso de conflicto

---

## 📈 Optimizaciones

### 1. Índices Compuestos

Definidos en `firestore.indexes.json`:

```json
{
  "fields": [
    { "fieldPath": "roundState", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "DESCENDING" }
  ]
}
```

### 2. Listeners Selectivos

Solo escuchar los datos necesarios:

```typescript
// ❌ MAL: Escuchar toda la colección
const { data: allGames } = useCollection('games');

// ✅ BIEN: Solo lobbies disponibles
const { data: lobbies } = useCollection(
  'games',
  where('roundState', '==', 'lobby'),
  limit(10)
);
```

### 3. Cleanup de Listeners

Los hooks automáticamente limpian los listeners:

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(docRef, callback);
  return () => unsubscribe(); // Cleanup automático
}, [docRef]);
```

---

## 🐛 Debugging

### Ver datos en consola

```typescript
const { data: game, loading, error } = useDocument<Game>('games', roomCode);

useEffect(() => {
  console.log('Game data:', game);
  console.log('Loading:', loading);
  console.log('Error:', error);
}, [game, loading, error]);
```

### Firebase Console

- Firestore Database: Ver documentos en tiempo real
- Authentication: Ver usuarios anónimos
- Usage: Monitorear lecturas/escrituras

### Emulator UI

- `http://localhost:4000`
- Ver Firestore, Auth, y otras emulaciones

---

## 💰 Costos Estimados

### Plan Spark (Gratuito)

- **Lecturas:** 50,000/día
- **Escrituras:** 20,000/día
- **Eliminaciones:** 20,000/día
- **Storage:** 1 GB

### Estimación para 100 Partidas/Día

Asumiendo 4 jugadores por partida, 50 turnos promedio:

- **Escrituras:** ~200 por partida × 100 = 20,000/día ✅
- **Lecturas:** ~800 por partida × 100 = 80,000/día ⚠️ (excede gratis)

**Recomendación:** Implementar Cloud Functions para reducir lecturas del cliente.

---

## 📝 Próximos Pasos

### 1. Cloud Functions

Implementar lógica del servidor:

```typescript
// functions/src/index.ts
export const onDrawTile = functions.https.onCall(async (data, context) => {
  // Validar autenticación
  // Validar turno
  // Extraer ficha
  // Actualizar Firestore
  // Retornar resultado
});
```

### 2. Notificaciones

- Push notifications cuando es tu turno
- Notificación cuando alguien gana

### 3. Analytics

- Trackear partidas completadas
- Tiempo promedio de partida
- Fichas más extraídas

### 4. Leaderboard

- Colección `users` con stats
- Ranking por coins ganadas
- SIGLOs totales

---

## 🔗 Links Útiles

- [Firebase Console](https://console.firebase.google.com/project/siglo-game)
- [Firestore Docs](https://firebase.google.com/docs/firestore)
- [Authentication Docs](https://firebase.google.com/docs/auth)
- [Hosting Docs](https://firebase.google.com/docs/hosting)
- [Cloud Functions Docs](https://firebase.google.com/docs/functions)

---

**Estado:** ✅ Firebase configurado y listo para usar
**Proyecto:** siglo-game
**Región:** us-central1 (default)
**Plan:** Spark (gratuito)
