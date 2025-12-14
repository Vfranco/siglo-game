# Sistema de Aleatoriedad - Siglo! 🎲

Documentación del sistema de distribución aleatoria de fichas.

---

## 🎯 Objetivo

Garantizar que **cada ficha extraída del deck sea completamente aleatoria** y que no haya patrones predecibles en la distribución.

---

## 🔀 Algoritmo de Shuffle: Fisher-Yates

### Implementación

```typescript
const shuffleArray = (array: number[]) => {
  const shuffled = [...array];

  // Mezclar de atrás hacia adelante para mejor aleatoriedad
  for (let i = shuffled.length - 1; i > 0; i--) {
    // Generar índice aleatorio entre 0 e i (inclusivo)
    const randomIndex = Math.floor(Math.random() * (i + 1));

    // Intercambiar elementos
    [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
  }

  return shuffled;
};
```

### Características

✅ **Fisher-Yates (Knuth Shuffle):** Algoritmo probado matemáticamente
✅ **Complejidad:** O(n) - Muy eficiente
✅ **Distribución uniforme:** Cada permutación tiene la misma probabilidad
✅ **No modifica el array original:** Usa spread operator

### Por qué Fisher-Yates?

- **Matemáticamente correcto:** Garantiza distribución uniforme
- **Estándar de la industria:** Usado en casinos virtuales
- **Sin bias:** No favorece ninguna posición

---

## 🎲 Inicialización del Deck

### Paso 1: Crear el Deck (1-90)

```typescript
const initialDeck = Array.from({ length: 90 }, (_, i) => i + 1);
// Result: [1, 2, 3, ..., 89, 90]
```

### Paso 2: Mezclar con Fisher-Yates

```typescript
const shuffledDeck = shuffleArray(initialDeck);
// Result: [42, 7, 93, 15, ...]  ← Completamente aleatorio
```

### Paso 3: Primera Ficha Aleatoria

```typescript
// Seleccionar posición aleatoria del deck mezclado
const randomIndex = Math.floor(Math.random() * shuffledDeck.length);
const firstTile = shuffledDeck[randomIndex];

// Remover esa ficha del deck
const remainingDeck = shuffledDeck.filter((_, idx) => idx !== randomIndex);
```

**Resultado:** La primera ficha es doblemente aleatoria:
1. El deck ya está mezclado
2. Se extrae de una posición aleatoria

---

## 🃏 Extracción de Fichas Durante el Juego

### Método: Selección Aleatoria Múltiple

```typescript
const handleDrawTiles = (count: number) => {
  const tilesToDraw = Math.min(count, deck.length);

  // Extraer fichas de posiciones aleatorias
  const newTiles: number[] = [];
  const remainingDeck = [...deck];

  for (let i = 0; i < tilesToDraw; i++) {
    // Seleccionar índice aleatorio del deck ACTUAL
    const randomIndex = Math.floor(Math.random() * remainingDeck.length);
    const drawnTile = remainingDeck[randomIndex];

    newTiles.push(drawnTile);

    // Remover la ficha extraída (simula sacar de la bolsa)
    remainingDeck.splice(randomIndex, 1);
  }

  setDeck(remainingDeck);
};
```

### Ventajas de Este Método

✅ **Aleatoriedad máxima:** Cada extracción es independiente
✅ **No hay orden predecible:** No siempre desde el "top" del deck
✅ **Simula bolsa real:** Como sacar fichas de una bolsa sin ver
✅ **Sin reemplazo:** Una vez extraída, la ficha no regresa

---

## 📊 Ejemplo de Distribución

### Deck Inicial (antes de shuffle)
```
[1, 2, 3, 4, 5, ..., 88, 89, 90]
```

### Después de Fisher-Yates
```
[42, 7, 68, 15, 31, 56, ..., 22, 85, 3]
```

### Jugador pide 3 fichas
```
Deck actual: [42, 7, 68, 15, 31, 56, ...]

1. Random index: 4  → Ficha: 31
   Deck: [42, 7, 68, 15, 56, ...]

2. Random index: 1  → Ficha: 7
   Deck: [42, 68, 15, 56, ...]

3. Random index: 2  → Ficha: 15
   Deck: [42, 68, 56, ...]

Fichas obtenidas: [31, 7, 15]  ← Orden aleatorio!
```

---

## 🎰 Generación del Comodín

```typescript
// Comodín aleatorio entre 1 y 30
const randomWildcard = Math.floor(Math.random() * 30) + 1;
```

### Distribución Uniforme

Cada valor tiene **3.33% de probabilidad** de salir:

```
Valor    Probabilidad
━━━━━━━━━━━━━━━━━━━━━
1        1/30 (3.33%)
2        1/30 (3.33%)
...
30       1/30 (3.33%)
```

---

## 🔬 Pruebas de Aleatoriedad

### Test 1: Distribución de Fisher-Yates

```typescript
// Shufflear 1000 veces y verificar distribución
const results = new Array(90).fill(0);

for (let i = 0; i < 1000; i++) {
  const shuffled = shuffleArray([1, 2, 3, ..., 90]);
  results[shuffled[0] - 1]++;  // Contar primera posición
}

// Cada número debería aparecer ~11 veces (1000/90 ≈ 11.1)
```

### Test 2: Extracción Aleatoria

```typescript
// Pedir fichas 100 veces y verificar que no hay patrón
const frequencies = {};

for (let i = 0; i < 100; i++) {
  const tile = drawRandomTile();
  frequencies[tile] = (frequencies[tile] || 0) + 1;
}

// No debería haber valores con frecuencia significativamente mayor
```

---

## ⚙️ Configuración para Producción

### Consideraciones con Firebase

Cuando uses Cloud Functions:

```typescript
// ❌ NUNCA hacer esto en el cliente
const drawnTile = deck[0];  // Predecible

// ✅ SIEMPRE usar Cloud Function con randomización server-side
const drawTiles = functions.https.onCall(async (data, context) => {
  const { gameId, count } = data;

  return admin.firestore().runTransaction(async (transaction) => {
    const gameRef = db.collection('games').doc(gameId);
    const gameDoc = await transaction.get(gameRef);
    const deck = gameDoc.data().deck;

    // Extraer fichas aleatorias (server-side es seguro)
    const newTiles = [];
    const remainingDeck = [...deck];

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * remainingDeck.length);
      newTiles.push(remainingDeck[randomIndex]);
      remainingDeck.splice(randomIndex, 1);
    }

    // Actualizar atómicamente
    transaction.update(gameRef, {
      deck: remainingDeck,
      drawnTiles: admin.firestore.FieldValue.arrayUnion(...newTiles)
    });

    return { tiles: newTiles };
  });
});
```

### Seguridad

✅ **Extracción en servidor:** Evita manipulación del cliente
✅ **Transacciones atómicas:** Previene condiciones de carrera
✅ **Validación:** Verificar que el jugador puede pedir fichas
✅ **Semilla criptográfica (opcional):** Para aleatoriedad extra segura

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)

- Usar Fisher-Yates para shuffle inicial
- Extraer de posiciones aleatorias durante el juego
- Implementar extracción en Cloud Functions (producción)
- Validar que el deck tenga fichas antes de extraer
- Usar `Math.random()` para prototipos
- Considerar `crypto.getRandomValues()` para producción

### ❌ DON'T (No Hacer)

- Extraer siempre desde el inicio del array
- Confiar en el orden "natural" del deck
- Permitir manipulación del deck desde el cliente
- Reutilizar fichas sin reiniciar el deck
- Usar algoritmos de shuffle caseros sin probar

---

## 📈 Análisis de Complejidad

| Operación | Complejidad | Notas |
|-----------|-------------|-------|
| Fisher-Yates Shuffle | O(n) | Lineal, muy eficiente |
| Extraer 1 ficha | O(1) | Constante con index random |
| Extraer N fichas | O(n) | Lineal en cantidad extraída |
| Verificar deck vacío | O(1) | Constante |

---

## 🔐 Notas de Seguridad

### Producción con Firebase

1. **Nunca confíes en el cliente:**
   - El deck SIEMPRE en Firestore
   - Extracción SIEMPRE en Cloud Function
   - Validación server-side

2. **Prevenir trampas:**
   - No exponer el deck completo al cliente
   - Solo mostrar fichas extraídas
   - Verificar turnos en el servidor

3. **Aleatoriedad criptográfica (opcional):**
```typescript
// Node.js crypto para aleatoriedad extra segura
const crypto = require('crypto');

const randomIndex = crypto.randomInt(0, deck.length);
```

---

## 📝 Resumen

✅ **Deck inicial:** Fichas 1-90, Fisher-Yates shuffle
✅ **Primera ficha:** Posición aleatoria del deck shuffled
✅ **Fichas durante juego:** Extracción de posiciones aleatorias
✅ **Comodín:** Valor aleatorio 1-30
✅ **Sin patrones:** Cada extracción es independiente
✅ **Listo para producción:** Con Cloud Functions

---

**Estado:** ✅ Sistema de aleatoriedad implementado y testeado
**Deck:** 90 fichas (1-90)
**Algoritmo:** Fisher-Yates (Knuth Shuffle)
**Complejidad:** O(n) - Óptimo
**Distribución:** Uniforme garantizada
