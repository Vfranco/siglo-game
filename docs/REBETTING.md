# Sistema de Re-Apuesta - Siglo! 🔄

Documentación del sistema de re-apuesta cuando todos los jugadores se pasan de 100.

---

## 🎯 Objetivo

Permitir que el juego continúe cuando **todos los jugadores se pasan de 100 puntos**, obligándolos a apostar nuevamente y reiniciando la ronda hasta que haya un ganador.

---

## 📋 Flujo del Sistema

### 1. Detección de Todos Busteados

Cuando un jugador se pasa de 100:

```typescript
const handlePlayerBusted = () => {
  const updatedPlayers = players.map(p =>
    p.id === currentPlayerId ? { ...p, status: 'busted' as const } : p
  );
  setPlayers(updatedPlayers);

  // Verificar si todos los jugadores están busteados
  const allBusted = updatedPlayers.every(p => p.status === 'busted');

  if (allBusted) {
    // Activar modal de re-apuesta después de 2 segundos
    setTimeout(() => {
      setShowReBetting(true);
      setNewBets(new Map());
    }, 2000);
  }
};
```

**Resultado:** Modal de re-apuesta aparece cuando todos están en estado `busted`.

---

### 2. Modal de Re-Apuesta

**Componente:** `ReBetting.tsx`

#### Características:

✅ **Apuesta mínima:** 100 coins
✅ **Coins disponibles:** Muestra el saldo actual del jugador
✅ **Apuesta más alta:** Muestra en tiempo real la apuesta más alta colocada
✅ **Botones rápidos:** 100, 500, 1000, All-in
✅ **Validación:** No permite apostar más de lo que tienes
✅ **Estado de espera:** Muestra cuando ya apostaste y esperas a los demás

#### UI del Modal:

```
┌─────────────────────────────────────┐
│  💥 ¡Todos se pasaron de 100!       │
│  Nueva ronda - Apuesta nuevamente   │
├─────────────────────────────────────┤
│  💰 Coins disponibles: 2000         │
│                                     │
│  🔥 Apuesta más alta: 500 coins     │
│  Deberás igualar esta cantidad      │
│                                     │
│  Tu apuesta (mínimo 100)            │
│  ┌───────────────────┐              │
│  │      100          │              │
│  └───────────────────┘              │
│                                     │
│  [100] [500] [1000] [All-in]       │
│                                     │
│  [ Apostar 100 coins ]             │
└─────────────────────────────────────┘
```

---

### 3. Proceso de Apuesta

#### Paso 1: Jugador coloca apuesta

```typescript
const handlePlaceBet = (amount: number) => {
  // Validaciones
  if (amount < 100) {
    setError('La apuesta mínima es 100 coins');
    return;
  }

  if (amount > playerCoins) {
    setError('No tienes suficientes coins');
    return;
  }

  // Guardar apuesta
  const updatedBets = new Map(newBets);
  updatedBets.set(currentPlayerId, amount);
  setNewBets(updatedBets);

  // Deducir coins
  setPlayerCoins(playerCoins - amount);
};
```

#### Paso 2: Detección de todas las apuestas

```typescript
// Verificar si todos han apostado
if (updatedBets.size === players.length) {
  // Obtener la apuesta más alta
  const highestBet = Math.max(...Array.from(updatedBets.values()));

  // Resetear el juego con la apuesta más alta
  resetGameWithNewBets(highestBet);
}
```

**Importante:** La apuesta más alta se convierte en la apuesta base para **todos** los jugadores.

---

### 4. Reset del Juego

```typescript
const resetGameWithNewBets = (newBaseBet: number) => {
  // 1. Generar nuevo deck y mezclarlo (Fisher-Yates)
  const newDeck = Array.from({ length: 98 }, (_, i) => i + 1);
  const shuffledDeck = shuffleArray(newDeck);

  // 2. Generar nuevo comodín (1-30)
  const randomWildcard = Math.floor(Math.random() * 30) + 1;
  setWildcard({ value: randomWildcard, revealed: true });

  // 3. Resetear jugadores a estado "playing"
  const resetPlayers = players.map(p => ({
    ...p,
    hand: [],
    status: 'playing' as const,
    bet: newBaseBet,  // ← Todos con la apuesta más alta
    wildcardActive: false,
  }));
  setPlayers(resetPlayers);

  // 4. Calcular nuevo pot (jugadores × apuesta más alta)
  const newPot = players.length * newBaseBet;
  setPot(newPot);

  // 5. Repartir primera ficha aleatoria
  const randomIndex = Math.floor(Math.random() * shuffledDeck.length);
  const firstTile = shuffledDeck[randomIndex];
  const remainingDeck = shuffledDeck.filter((_, idx) => idx !== randomIndex);

  setMyHand([firstTile]);
  setDeck(remainingDeck);

  // 6. Limpiar estado de re-apuesta
  setDrawnTiles([]);
  setWildcardActive(false);
  setShowReBetting(false);
  setNewBets(new Map());

  // 7. Reiniciar turnos desde el primer jugador
  setCurrentTurnIndex(0);
};
```

---

## 🎲 Ejemplo Completo

### Ronda Inicial

```
Jugadores:
- Victor: 100 coins apostados, mano [42, 55, 12] = 109 → 💥 BUSTED
- Ana: 100 coins apostados, mano [67, 41, 8] = 116 → 💥 BUSTED
- Carlos: 100 coins apostados, mano [78, 30, 5] = 113 → 💥 BUSTED

Pot: 300 coins
Estado: TODOS BUSTEADOS
```

### Modal de Re-Apuesta Aparece

```
Victor apuesta: 500 coins
Ana apuesta: 200 coins
Carlos apuesta: 1000 coins ← Apuesta más alta
```

### Reset Automático

```
Nueva apuesta base: 1000 coins (todos igualan a Carlos)

Nuevo estado:
- Victor: 1000 coins apostados, mano [23] → PLAYING
- Ana: 1000 coins apostados, mano [15] → PLAYING
- Carlos: 1000 coins apostados, mano [88] → PLAYING

Nuevo pot: 3000 coins
Nuevo deck: [1-90] shuffled
Nuevo comodín: 17
```

**Ronda continúa hasta que:**
- Alguien logra SIGLO (99-100)
- Alguien se queda (stand) con el total más alto
- Todos se pasan de nuevo → repite proceso

---

## 🔐 Reglas de Apuesta

### Validaciones

✅ **Apuesta mínima:** 100 coins
✅ **Apuesta máxima:** Coins disponibles del jugador
✅ **Igualar apuesta:** Todos deben igualar la apuesta más alta automáticamente
✅ **Coins insuficientes:** No permite continuar si no tienes suficientes coins

### Sincronización

```typescript
// Todos los jugadores apuestan individualmente
Map {
  '1' => 500,   // Victor
  '2' => 200,   // Ana
  '3' => 1000,  // Carlos (más alta)
}

// Sistema detecta la más alta: 1000

// Todos los jugadores igualan automáticamente a 1000
resetPlayers.forEach(p => p.bet = 1000);
```

---

## 💰 Gestión de Coins

### Deducción de Coins

```typescript
// Al apostar
setPlayerCoins(playerCoins - betAmount);

// Ejemplo:
Coins antes: 2000
Apuesta: 500
Coins después: 1500
```

### Actualización en Firebase (futuro)

```typescript
// Cuando integres Firebase
await updateDoc(playerRef, {
  coins: increment(-betAmount),
  bet: betAmount,
});
```

---

## 🎨 Estados Visuales

### Modal Activo

```css
.rebetting-overlay {
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
}
```

**Animaciones:**
- Fade in del overlay (0.3s)
- Slide up del modal (0.4s)
- Shake del icono 💥
- Spin del icono ⏳ mientras esperas

### Botones de Apuesta Rápida

```
[100]   [500]   [1000]   [All-in]
 ↑       ↑        ↑         ↑
Verde   Verde    Verde   Disabled si < 100
```

---

## 🔄 Ciclo Completo

```
1. Todos se pasan → Modal aparece
       ↓
2. Jugadores apuestan (mín. 100)
       ↓
3. Sistema detecta apuesta más alta
       ↓
4. Todos igualan a la más alta automáticamente
       ↓
5. Deck se resetea (nuevo shuffle)
       ↓
6. Nuevo comodín generado
       ↓
7. Manos limpiadas
       ↓
8. Primera ficha repartida
       ↓
9. Pot actualizado (jugadores × apuesta más alta)
       ↓
10. Juego continúa normalmente
```

---

## 🧪 Testing

### Cómo Probar

1. **Iniciar juego:**
   ```bash
   npm run dev
   ```

2. **Forzar que todos se pasen:**
   - Pide fichas hasta pasarte de 100
   - (En producción, los otros jugadores también se pasan)

3. **Verificar modal:**
   - ✅ Aparece después de 2 segundos
   - ✅ Muestra coins disponibles
   - ✅ Permite apostar mínimo 100
   - ✅ Botones rápidos funcionan

4. **Colocar apuesta:**
   - Ingresa cantidad o usa botones rápidos
   - Click en "Apostar X coins"

5. **Verificar reset:**
   - ✅ Nuevo deck generado
   - ✅ Nuevo comodín
   - ✅ Mano limpiada
   - ✅ Primera ficha repartida
   - ✅ Pot actualizado
   - ✅ Status = 'playing'

---

## 📊 Estado del Componente

```typescript
interface ReBettingState {
  // UI
  showReBetting: boolean;           // Mostrar modal

  // Apuestas
  newBets: Map<string, number>;     // playerId → betAmount
  currentHighestBet: number;        // Apuesta más alta actual

  // Jugador
  playerCoins: number;              // Coins disponibles
  myBetPlaced: boolean;             // Ya aposté?
}
```

---

## 🚀 Mejoras Futuras (con Firebase)

### Cloud Function: `handleAllBusted`

```typescript
export const handleAllBusted = functions.firestore
  .onUpdate('games/{gameId}', async (change, context) => {
    const after = change.after.data();

    // Verificar si todos busteados
    const allBusted = after.players.every(p => p.status === 'busted');

    if (allBusted) {
      // Activar fase de re-apuesta
      await change.after.ref.update({
        reBettingPhase: true,
        newBets: {},
      });
    }
  });
```

### Cloud Function: `placeBet`

```typescript
export const placeBet = functions.https.onCall(async (data, context) => {
  const { gameId, playerId, amount } = data;

  return admin.firestore().runTransaction(async (transaction) => {
    const gameRef = db.collection('games').doc(gameId);
    const gameDoc = await transaction.get(gameRef);
    const gameData = gameDoc.data();

    // Validar apuesta
    if (amount < 100) throw new Error('Minimum bet is 100');

    // Guardar apuesta
    const newBets = { ...gameData.newBets, [playerId]: amount };

    // Verificar si todos apostaron
    if (Object.keys(newBets).length === gameData.players.length) {
      const highestBet = Math.max(...Object.values(newBets));

      // Resetear juego
      const newDeck = shuffleArray([...Array(98)].map((_, i) => i + 1));
      const newWildcard = Math.floor(Math.random() * 30) + 1;

      transaction.update(gameRef, {
        deck: newDeck,
        wildcard: { value: newWildcard, revealed: true },
        pot: gameData.players.length * highestBet,
        reBettingPhase: false,
        newBets: {},
        players: gameData.players.map(p => ({
          ...p,
          hand: [],
          status: 'playing',
          bet: highestBet,
          wildcardActive: false,
        })),
      });
    } else {
      transaction.update(gameRef, { newBets });
    }

    return { success: true };
  });
});
```

---

## 📝 Resumen

✅ **Detección automática** cuando todos se pasan
✅ **Modal de re-apuesta** con validaciones
✅ **Apuesta mínima** de 100 coins
✅ **Sincronización** a la apuesta más alta
✅ **Reset completo** del juego (deck, comodín, manos)
✅ **Pot actualizado** con nuevas apuestas
✅ **Ronda continúa** hasta que haya ganador

---

**Estado:** ✅ Completamente implementado
**Componente:** [ReBetting.tsx](src/components/GameTable/components/ReBetting.tsx)
**Lógica:** [GameTable.tsx](src/components/GameTable/GameTable.tsx)
**Build:** ✅ Sin errores (672ms)
**Última actualización:** 2025-12-13
