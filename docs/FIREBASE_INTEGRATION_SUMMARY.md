# Firebase Integration Summary 🔥

Resumen ejecutivo de la integración de Firebase en Siglo Game.

---

## ✅ Implementación Completada

### Archivos Creados

1. **`src/config/firebase.ts`**
   - Inicialización de Firebase
   - Configuración de Firestore y Auth
   - Credenciales del proyecto

2. **`src/hooks/useAuth.ts`**
   - Hook de autenticación
   - Sign in anónimo
   - Estado del usuario

3. **`src/hooks/useFirestore.ts`**
   - `useDocument` - Escuchar un documento
   - `useCollection` - Escuchar una colección
   - Sincronización en tiempo real

4. **`src/contexts/AuthContext.tsx`**
   - Contexto de autenticación global
   - Provider para toda la app

5. **`src/services/gameService.ts`**
   - `createGame` - Crear sala
   - `joinGame` - Unirse a sala
   - `startGame` - Iniciar partida
   - `drawTile` - Pedir ficha
   - `toggleWildcard` - Activar/desactivar comodín
   - `standPlayer` - Quedarse
   - `nextTurn` - Pasar turno
   - `resetGameWithBets` - Reiniciar con nuevas apuestas

6. **`firestore.rules`**
   - Reglas de seguridad
   - Validaciones de autenticación
   - Permisos basados en roles

7. **`firebase.json`**
   - Configuración de Firestore
   - Configuración de Hosting
   - Configuración de Emulators

8. **`firestore.indexes.json`**
   - Índices compuestos
   - Optimizaciones de queries

---

## 📋 Próximos Pasos para Ti

### 1. Habilitar Firestore en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/project/siglo-game)
2. Click en "Firestore Database" en el menú lateral
3. Click "Create database"
4. Selecciona modo: **"Start in test mode"** (temporal, luego subiremos las reglas)
5. Ubicación: **us-central1** (o la más cercana)
6. Click "Enable"

### 2. Habilitar Authentication

1. En Firebase Console → "Authentication"
2. Click "Get started"
3. Click en la pestaña "Sign-in method"
4. Habilita **"Anonymous"**
5. Click "Save"

### 3. Desplegar Reglas de Seguridad

Desde tu terminal:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto
firebase init

# Selecciona:
# - Firestore
# - Hosting
# Proyecto: siglo-game
# Firestore rules: firestore.rules
# Firestore indexes: firestore.indexes.json
# Public directory: dist
# Single-page app: Yes

# Desplegar reglas
firebase deploy --only firestore:rules
```

### 4. Integrar en los Componentes

Ahora necesitamos reemplazar los datos mock con Firebase. Te mostraré cómo:

#### En `App.tsx`:

```typescript
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
```

#### En `Lobby.tsx`:

```typescript
import { useAuthContext } from '../../contexts/AuthContext';
import { useDocument } from '../../hooks/useFirestore';
import { createGame, joinGame, setPlayerReady, startGame } from '../../services/gameService';

export const Lobby = () => {
  const { user } = useAuthContext();
  const [roomCode, setRoomCode] = useState('');

  // Escuchar cambios del juego
  const { data: game, loading } = useDocument<Game>('games', roomCode);

  const handleCreateGame = async () => {
    const newRoomCode = generateRoomCode();
    await createGame(newRoomCode, user!.uid, 100);
    await joinGame(newRoomCode, user!.uid, playerName, playerCoins);
    setRoomCode(newRoomCode);
  };

  const handleJoinGame = async (code: string) => {
    await joinGame(code, user!.uid, playerName, playerCoins);
    setRoomCode(code);
  };

  const handleReady = async () => {
    await setPlayerReady(roomCode, user!.uid, true);
  };

  const handleStart = async () => {
    await startGame(roomCode);
    navigate('/game');
  };

  // Renderizar con game?.players en lugar de mock data
};
```

#### En `GameTable.tsx`:

```typescript
import { useAuthContext } from '../../contexts/AuthContext';
import { useDocument } from '../../hooks/useFirestore';
import { drawTile, toggleWildcard, standPlayer, nextTurn } from '../../services/gameService';

export const GameTable = () => {
  const { user } = useAuthContext();
  const roomCode = /* obtener de localStorage o parámetro */;

  // Escuchar cambios del juego en tiempo real
  const { data: game, loading, error } = useDocument<Game>('games', roomCode);

  const handleDrawTile = async () => {
    await drawTile(roomCode, user!.uid);
    // La UI se actualiza automáticamente cuando Firestore cambia
  };

  const handleToggleWildcard = async () => {
    await toggleWildcard(roomCode, user!.uid);
  };

  const handleStand = async () => {
    await standPlayer(roomCode, user!.uid);
    await nextTurn(roomCode);
  };

  // Detectar si todos están busteados
  useEffect(() => {
    if (game && checkAllBusted(game.players || [])) {
      setShowReBetting(true);
    }
  }, [game]);

  const handlePlaceBet = async (amount: number) => {
    // Guardar apuesta en Firestore
    // Cuando todos apuesten, llamar resetGameWithBets
  };

  // Renderizar con datos de Firebase
  return (
    <>
      {game && (
        <>
          <PotDisplay pot={game.pot} />
          <WildcardDisplay {...game.wildcard} />
          <DeckDisplay remainingTiles={game.deck.length} drawnTiles={game.drawnTiles} />
          <PlayersList players={game.players || []} ... />
        </>
      )}
    </>
  );
};
```

---

## 🧪 Testing Local

### Opción 1: Usar Emulators (Recomendado)

```bash
# Iniciar emulators
firebase emulators:start

# En otra terminal
npm run dev
```

Beneficios:
- No gastas quota de Firebase
- Datos no persisten (se reinician al cerrar)
- Perfecto para desarrollo

### Opción 2: Usar Firebase Real

```bash
npm run dev
```

Los datos se guardan en Firestore real.

---

## 🎯 Checklist de Integración

- [ ] Habilitar Firestore en Firebase Console
- [ ] Habilitar Anonymous Auth
- [ ] Desplegar reglas de seguridad (`firebase deploy --only firestore:rules`)
- [ ] Envolver App con `AuthProvider`
- [ ] Actualizar `WelcomeScreen` para auto sign-in
- [ ] Actualizar `Lobby` para crear/unirse a salas
- [ ] Actualizar `GameTable` para usar `useDocument` y servicios
- [ ] Implementar sistema de room codes
- [ ] Manejar navegación con room code (router params o localStorage)
- [ ] Testing completo del flujo

---

## 💡 Consejos

1. **Usar Emulators primero:** Desarrolla con emulators para no gastar quota.

2. **Console.log es tu amigo:**
   ```typescript
   const { data: game } = useDocument('games', roomCode);
   console.log('Game data:', game);
   ```

3. **Manejar loading states:**
   ```typescript
   if (loading) return <LoadingSpinner />;
   if (error) return <ErrorMessage error={error} />;
   if (!game) return <GameNotFound />;
   ```

4. **Room Code:** Puedes usar:
   - URL param: `/game/:roomCode`
   - localStorage: `localStorage.getItem('currentRoomCode')`
   - Estado global (Context)

5. **Navegación:**
   ```typescript
   // Al crear/unirse a sala
   localStorage.setItem('currentRoomCode', roomCode);
   navigate('/lobby');

   // En Lobby/GameTable
   const roomCode = localStorage.getItem('currentRoomCode');
   ```

---

## 🚨 Importante

### Seguridad

Las reglas actuales son para desarrollo. En producción:

1. Cambiar Firestore a modo **"Production"**
2. Las reglas en `firestore.rules` ya tienen validaciones
3. Desplegar: `firebase deploy --only firestore:rules`

### Performance

- Cada `useDocument`/`useCollection` = 1 listener activo
- Se desuscribe automáticamente al desmontar componente
- Usa listeners solo donde necesites datos en tiempo real

### Costos

Plan Spark (gratis):
- 50k lecturas/día
- 20k escrituras/día
- Suficiente para desarrollo y MVP

---

## 📞 Necesitas Ayuda?

Si tienes dudas en cualquier paso, avísame y te ayudo con:

1. Integrar un componente específico
2. Debugging de Firebase
3. Optimizar queries
4. Implementar features adicionales

---

**Resumen:** Firebase está 100% configurado y listo. Solo falta habilitar los servicios en la consola y actualizar los componentes para usar los hooks y servicios en lugar de datos mock.
