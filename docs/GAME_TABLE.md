# Vista del Juego - GameTable 🎮

Documentación completa de la vista principal del juego Siglo!

---

## 🎯 Componente Principal: GameTable

**Ruta:** `/game`
**Archivo:** [src/components/GameTable/GameTable.tsx](src/components/GameTable/GameTable.tsx)

### Características Implementadas

✅ **Mesa verde estilo casino** con efecto felt texture
✅ **Sistema de turnos** con indicador visual
✅ **Mecánica de fichas** (deck 1-90)
✅ **Comodín** con toggle activo/inactivo
✅ **Pot (pozo)** con animación de brillo
✅ **Mano del jugador** con animaciones de cartas
✅ **Controles de juego** intuitivos
✅ **Estados del jugador** (playing, busted, winner, stood)
✅ **Lista de jugadores** en tiempo real

---

## 🧩 Subcomponentes

### 1. GameBoard
**Archivo:** [components/GameBoard.tsx](src/components/GameTable/components/GameBoard.tsx)

Mesa verde con:
- Fondo degradado verde oscuro/claro
- Textura felt (patrón diagonal sutil)
- Shadow inset para profundidad
- Border radius para esquinas redondeadas

---

### 2. PotDisplay
**Archivo:** [components/PotDisplay.tsx](src/components/GameTable/components/PotDisplay.tsx)

Muestra el pozo acumulado:
- Icono de monedas 💰
- Valor en coins con formato de miles
- Animación de pulse-glow dorado
- Borde dorado brillante

---

### 3. WildcardDisplay
**Archivo:** [components/WildcardDisplay.tsx](src/components/GameTable/components/WildcardDisplay.tsx)

Tarjeta del comodín:
- Card visual estilo poker (púrpura)
- Animación de flip cuando se revela
- Badge "ACTIVO" cuando está en uso
- Glow effect dorado cuando activo
- Valor visible/oculto según estado

---

### 4. DeckDisplay
**Archivo:** [components/DeckDisplay.tsx](src/components/GameTable/components/DeckDisplay.tsx)

Información del mazo:
- Icono de bolsa 🎒
- Contador de fichas restantes
- Últimas 3 fichas extraídas (visibles para todos)
- Mini-tiles con valores

---

### 5. PlayerHand
**Archivo:** [components/PlayerHand.tsx](src/components/GameTable/components/PlayerHand.tsx)

Mano del jugador actual:
- Fichas con animación de entrada (scale + flip)
- Ficha del comodín con estrella ★ cuando activo
- Cálculo visual: `15 + 22 + 17★ = 54`
- Total con colores según estado:
  - Verde: Safe (< 90)
  - Naranja: Close (90-98)
  - Dorado con glow: SIGLO! (99-100)
  - Rojo: Busted (> 100)

---

### 6. GameControls
**Archivo:** [components/GameControls.tsx](src/components/GameTable/components/GameControls.tsx)

Controles interactivos:

**Cuando es tu turno:**
1. **Pedir Fichas:**
   - Selector +/- (1-5 fichas)
   - Botón verde "Pedir N Fichas"

2. **Toggle Comodín:**
   - Botón púrpura cuando inactivo
   - Dorado con borde cuando activo
   - Texto: "Activar Comodín" / "★ Comodín Activo"

3. **Quedarse:**
   - Botón naranja "✓ Quedarse"
   - Finaliza tu participación en la ronda

**Estados especiales:**
- ⏳ "Esperando tu turno..." (animación spin)
- 💥 "¡Te pasaste de 100!" (busted)
- 🏆 "¡SIGLO!" (winner)
- ✋ "Te quedaste" (stood)

---

### 7. PlayersList
**Archivo:** [components/PlayersList.tsx](src/components/GameTable/components/PlayersList.tsx)

Grid de jugadores:
- Cards con nombre + avatar inicial
- Badge "TÚ" para el jugador actual
- Indicador de turno con pulse animation
- Mini-tiles de la mano:
  - Visible para el jugador actual
  - "?" para los demás jugadores
- Icono de status:
  - 🎮 Playing
  - 💥 Busted
  - 🏆 Winner
  - ✋ Stood
- Total visible solo para ti

---

## 🎲 Lógica del Juego Implementada

### Inicialización
```typescript
// Deck: 1-90
const deck = shuffle([1, 2, 3, ..., 90]);

// Comodín aleatorio (1-30)
const wildcard = random(1, 30);

// Pot = jugadores × apuesta base
const pot = players.length * baseBet;
```

### Mecánicas

1. **Pedir Fichas:**
   - Se extraen N fichas del deck
   - Se agregan a la mano del jugador
   - Se muestran en `drawnTiles` (visible para todos)
   - Se verifica automáticamente:
     - Total = 99 o 100 → ¡SIGLO!
     - Total > 100 → Busteado

2. **Toggle Comodín:**
   - Suma/resta el valor del comodín al total
   - Se verifica automáticamente el nuevo total
   - Visual: ficha dorada con estrella

3. **Quedarse:**
   - El jugador mantiene su mano actual
   - Cambia status a "stood"
   - Pasa el turno al siguiente jugador

4. **Sistema de Turnos:**
   - Rotación circular por índice
   - Indicador visual en el jugador activo
   - Solo jugadores "playing" pueden jugar

### Condiciones de Victoria

```typescript
if (total === 99 || total === 100) {
  status = 'winner';
  playerCoins += pot;
  // ¡SIGLO!
}

if (total > 100) {
  status = 'busted';
  // Eliminado de la ronda
}
```

---

## 🎨 Diseño Visual

### Paleta de Colores
- **Mesa:** Verde oscuro (#0a2f1f → #061a12)
- **Felt:** Verde casino (#1a5f3f → #0d3d28)
- **Pot/Dorado:** #ffd700
- **Comodín:** Púrpura (#8a2be2 → #9370db)
- **Fichas:** Blanco (#ffffff → #f0f0f0)
- **Busted:** Rojo (#f44336)
- **Winner:** Dorado (#ffd700)
- **Safe:** Verde (#4caf50)
- **Close:** Naranja (#ff9800)

### Animaciones

1. **Fichas:**
   - Entrada: scale 0→1 + rotateY 180→0
   - Delay escalonado (index × 0.1s)
   - Spring animation (stiffness: 200)

2. **Pot:**
   - Pulse-glow continuo (2s infinite)
   - Shadow expansion: 20px → 40px

3. **Turnos:**
   - Pulse indicator (1s infinite)
   - Border glow dorado

4. **SIGLO:**
   - Text shadow pulsante
   - Celebrate animation (scale 1→1.1→1)

---

## 📱 Responsive Design

### Desktop (> 1024px)
- Grid de 3 columnas en header
- Fichas: 80×110px
- Total: 3rem

### Tablet (768px - 1024px)
- Grid de 1 columna en header
- Fichas: 60×85px

### Mobile (< 768px)
- Layout vertical
- Fichas: 60×85px
- Total: 2.5rem
- Controles apilados

---

## 🔄 Flujo del Juego

```
1. Lobby → "Iniciar Partida"
   ↓
2. Navigate to /game
   ↓
3. GameTable monta:
   - Genera deck (1-90)
   - Genera comodín
   - Reparte 1 ficha a cada jugador
   - Calcula pot
   ↓
4. Turno del jugador:
   - Puede pedir fichas (1-5)
   - Puede toggle comodín
   - Puede quedarse
   ↓
5. Verificación automática:
   - 99/100 → SIGLO!
   - > 100 → Busted
   ↓
6. Siguiente turno
   ↓
7. Ronda termina cuando:
   - Hay un ganador (SIGLO!)
   - Todos busteados o se quedaron
```

---

## 📊 Estado del Juego

```typescript
interface GameState {
  // Deck
  deck: number[];           // Fichas restantes
  drawnTiles: number[];     // Fichas extraídas (visibles)

  // Comodín
  wildcard: {
    value: number;          // 1-30
    revealed: boolean;      // Siempre true en prototipo
  };

  // Dinero
  pot: number;              // Pozo acumulado
  baseBet: number;          // Apuesta base (100)

  // Jugadores
  players: Player[];
  currentTurnIndex: number; // Quién juega

  // Jugador actual
  myHand: number[];         // Mi mano
  wildcardActive: boolean;  // Comodín activo?
}
```

---

## 🚀 Testing

### Build Status
✅ Build exitoso: 666ms
✅ Bundle: 310.90 KB (101.84 KB gzipped)
✅ CSS: 22.14 KB (4.44 KB gzipped)
✅ 0 errores de TypeScript

### Cómo Probar

```bash
npm run dev
```

**Flujo completo:**
1. Ingresa nombre → "Victor"
2. Selecciona coins → 2000
3. En Lobby → "Marcar como Listo"
4. "Iniciar Partida"
5. **¡Estás en el juego!**

**Acciones disponibles:**
- Click en "+/-" para cambiar cantidad
- Click "Pedir N Fichas"
- Click "Activar Comodín"
- Click "Quedarse"
- Observa las animaciones y estados

---

## 💡 Próximos Pasos (Firebase)

Cuando conectes con Firebase, reemplaza:

```typescript
// MOCK → FIREBASE
const mockPlayers = [...];
// →
const players = useFirestoreCollection('games/{gameId}/players');

// MOCK → CLOUD FUNCTION
const handleDrawTiles = (count) => { ... };
// →
const handleDrawTiles = async (count) => {
  await callFunction('drawTiles', { gameId, playerId, count });
};
```

---

## 🎯 Características Destacadas

✨ **Animaciones fluidas** con Framer Motion
✨ **Cálculo automático** de totales
✨ **Verificación instantánea** de SIGLO/Busted
✨ **Feedback visual claro** para cada acción
✨ **Sistema de turnos** con indicadores
✨ **Responsive** en todos los dispositivos
✨ **Tema casino** auténtico

---

**Estado:** ✅ Completamente funcional (con datos mock)
**Listo para:** Integración con Firebase
**Versión:** 0.0.1
**Última actualización:** 2025-12-13
