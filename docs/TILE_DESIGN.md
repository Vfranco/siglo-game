# Diseño de Fichas - Siglo! 🎯

Documentación del sistema visual de las fichas del juego.

---

## 🎨 Concepto de Diseño

Las fichas ahora tienen el aspecto auténtico de las fichas tradicionales del juego Siglo:

✅ **Forma circular** - Fichas redondas como las originales
✅ **Color madera clara** - Tono amadeirado cálido (#e8d4a8 → #c9a877)
✅ **Borde rojo distintivo** - Border rojo #c41e3a de 5px
✅ **Textura realista** - Gradiente radial con highlights y sombras
✅ **Anillo interior** - Círculo decorativo interno para más detalle

---

## 🎯 Tamaños de Fichas

### 1. Fichas Principales (PlayerHand)

**Desktop:**
- Tamaño: 90px × 90px
- Border: 5px solid #c41e3a
- Font size: 2.2rem

**Mobile:**
- Tamaño: 70px × 70px
- Font size: 1.8rem

### 2. Mini-Fichas (PlayersList & DeckDisplay)

**Todas las pantallas:**
- Tamaño: 35px × 35px
- Border: 3px solid #c41e3a
- Font size: 0.85rem

---

## 🎨 Paleta de Colores

### Ficha Normal (Madera Clara)

```css
background: radial-gradient(
  circle at 30% 30%,
  #e8d4a8 0%,    /* Highlight claro */
  #d4b896 50%,   /* Tono medio */
  #c9a877 100%   /* Tono oscuro */
);
```

**Color del número:** `#2d1810` (marrón oscuro)
**Border:** `#c41e3a` (rojo Siglo)

### Ficha Comodín (Dorada)

```css
background: radial-gradient(
  circle at 30% 30%,
  #fff4cc 0%,    /* Dorado muy claro */
  #ffe88a 50%,   /* Dorado medio */
  #ffd700 100%   /* Dorado intenso */
);
```

**Color del número:** `#8a2be2` (púrpura)
**Border:** `#c41e3a` (mismo rojo)
**Glow:** Sombra dorada adicional

---

## 🔨 Estructura CSS

### Ficha Principal

```css
.tile {
  width: 90px;
  height: 90px;
  background: radial-gradient(circle at 30% 30%, #e8d4a8 0%, #d4b896 50%, #c9a877 100%);
  border-radius: 50%;
  border: 5px solid #c41e3a;

  /* Sombras realistas */
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.4),           /* Sombra externa */
    inset 0 2px 8px rgba(255, 255, 255, 0.3), /* Highlight superior */
    inset 0 -2px 8px rgba(0, 0, 0, 0.2);     /* Sombra inferior */
}

/* Anillo decorativo interior */
.tile::before {
  content: '';
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  border: 2px solid rgba(196, 30, 58, 0.3);
}
```

### Número en la Ficha

```css
.tile-value {
  font-size: 2.2rem;
  font-weight: 900;
  color: #2d1810;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  z-index: 1;
}
```

### Ficha Comodín

```css
.wildcard-tile {
  background: radial-gradient(circle at 30% 30%, #fff4cc 0%, #ffe88a 50%, #ffd700 100%);
  border: 5px solid #c41e3a;

  /* Glow dorado adicional */
  box-shadow:
    0 6px 20px rgba(255, 215, 0, 0.5),
    inset 0 2px 8px rgba(255, 255, 255, 0.4),
    inset 0 -2px 8px rgba(0, 0, 0, 0.2),
    0 0 20px rgba(255, 215, 0, 0.3);
}

.wildcard-tile::before {
  border-color: rgba(138, 43, 226, 0.4); /* Anillo púrpura */
}

.wildcard-tile .tile-value {
  color: #8a2be2;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}
```

### Badge de Estrella (Comodín Activo)

```css
.tile-badge {
  position: absolute;
  top: 0.1rem;
  right: 0.1rem;
  color: #8a2be2;
  font-size: 1.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  z-index: 2;
}
```

---

## ✨ Efectos Visuales

### Hover (Desktop)

```css
.tile:hover {
  transform: translateY(-5px) scale(1.05);
}
```

**Efecto:** La ficha se eleva 5px y aumenta 5% su tamaño

### Animación de Entrada

Heredada de Framer Motion:
- Scale: 0 → 1
- RotateY: 180deg → 0deg
- Delay escalonado por índice

---

## 🎨 Ejemplos Visuales

### Ficha Normal

```
    ╭─────────╮
   ╱           ╲
  │   ┌─────┐   │  ← Anillo interior (rojo claro)
  │   │     │   │
  │   │ 42  │   │  ← Número (marrón oscuro)
  │   │     │   │
  │   └─────┘   │
   ╲           ╱
    ╰─────────╯
     ↑
     Border rojo #c41e3a (5px)
```

**Fondo:** Gradiente radial madera (#e8d4a8 → #c9a877)

### Ficha Comodín

```
    ╭─────────╮
   ╱  ★        ╲  ← Badge estrella (top-right)
  │   ┌─────┐   │  ← Anillo interior (púrpura)
  │   │     │   │
  │   │ 17  │   │  ← Número púrpura
  │   │     │   │
  │   └─────┘   │
   ╲           ╱
    ╰─────────╯
     ↑
     Border rojo + Glow dorado
```

**Fondo:** Gradiente radial dorado (#fff4cc → #ffd700)

### Mini-Ficha

```
  ╭───╮
 │ 42 │  ← 35×35px, border 3px
  ╰───╯
```

Mismo estilo pero más pequeña para lista de jugadores y deck.

---

## 📊 Comparación: Antes vs Ahora

### Antes (Rectangular)

```
┌──────────┐
│          │
│    42    │  ← 80×110px, rectangular
│          │
└──────────┘
```

- Color: Blanco/gris (#ffffff → #f0f0f0)
- Forma: Rectangular con border-radius
- Sin textura
- Aspecto: Genérico de carta

### Ahora (Circular)

```
    ╭─────╮
   ╱   42  ╲   ← 90×90px, circular
  │         │
   ╲       ╱
    ╰─────╯
```

- Color: Madera clara (#e8d4a8 → #c9a877)
- Forma: Circular perfecta
- Textura: Gradiente radial + sombras realistas
- Aspecto: Ficha auténtica de Siglo!

---

## 🎯 Detalles Técnicos

### Gradiente Radial

```css
radial-gradient(circle at 30% 30%, ...)
```

**Explicación:** El highlight está desplazado 30% desde arriba-izquierda, simulando luz natural desde esa dirección.

### Sombras en Capas

```css
box-shadow:
  0 6px 20px rgba(0, 0, 0, 0.4),           /* Sombra proyectada */
  inset 0 2px 8px rgba(255, 255, 255, 0.3), /* Luz superior */
  inset 0 -2px 8px rgba(0, 0, 0, 0.2);     /* Sombra inferior */
```

**Resultado:** Efecto 3D con profundidad y volumen.

### Anillo Interior

```css
.tile::before {
  content: '';
  width: 70%;
  height: 70%;
  border: 2px solid rgba(196, 30, 58, 0.3);
}
```

**Propósito:** Añadir detalle visual decorativo, similar a las fichas reales.

---

## 🎨 Variaciones de Color (Futuro)

Potenciales colores adicionales para otros modos:

### Ficha VIP

```css
background: radial-gradient(
  circle at 30% 30%,
  #2a2a2a 0%,    /* Negro carbón */
  #1a1a1a 100%
);
color: #ffd700;  /* Número dorado */
```

### Ficha Especial

```css
background: radial-gradient(
  circle at 30% 30%,
  #e6f3ff 0%,    /* Azul claro */
  #b3d9ff 100%
);
color: #0066cc;  /* Número azul */
```

---

## 📱 Responsive Design

### Desktop (> 768px)

- Fichas: 90×90px
- Mini-fichas: 35×35px
- Font principal: 2.2rem
- Font mini: 0.85rem

### Mobile (< 768px)

- Fichas: 70×70px
- Mini-fichas: 35×35px (sin cambio)
- Font principal: 1.8rem
- Font mini: 0.85rem

**Razón:** Las mini-fichas mantienen el tamaño porque ya son muy pequeñas.

---

## 🚀 Testing Visual

### Cómo Verificar

1. **Iniciar dev server:**
   ```bash
   npm run dev
   ```

2. **Navegar al juego:**
   - WelcomeScreen → CoinsSelection → Lobby → GameTable

3. **Verificar fichas principales:**
   - ✅ Circulares
   - ✅ Color madera clara
   - ✅ Border rojo de 5px
   - ✅ Anillo interior visible
   - ✅ Sombras realistas

4. **Verificar ficha comodín:**
   - ✅ Color dorado
   - ✅ Número púrpura
   - ✅ Estrella badge visible
   - ✅ Glow dorado

5. **Verificar mini-fichas:**
   - ✅ En PlayersList (otros jugadores)
   - ✅ En DeckDisplay (últimas extraídas)
   - ✅ Mismo estilo pero más pequeñas

6. **Verificar hover (desktop):**
   - ✅ Ficha se eleva
   - ✅ Aumenta de tamaño

---

## 🎨 Archivos Modificados

1. **[PlayerHand.css](src/components/GameTable/components/PlayerHand.css)**
   - Fichas principales rediseñadas
   - Tamaños ajustados (90×90px)
   - Gradientes radiales
   - Sombras en capas
   - Anillo interior

2. **[PlayersList.css](src/components/GameTable/components/PlayersList.css)**
   - Mini-fichas actualizadas (35×35px)
   - Mismo estilo circular
   - Border rojo 3px

3. **[DeckDisplay.css](src/components/GameTable/components/DeckDisplay.css)**
   - Mini-fichas en deck display
   - Consistencia visual

---

## 📈 Build Status

✅ **Build exitoso:** 697ms
✅ **CSS:** 26.67 KB (5.21 KB gzipped)
✅ **Sin errores TypeScript**
✅ **Diseño responsive**

---

## 💡 Próximas Mejoras

### Animaciones Adicionales

```css
/* Ficha ganadora - Animación celebración */
@keyframes winner-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); }
}

/* Ficha nueva - Entrada con rotación */
@keyframes tile-flip-in {
  from {
    transform: rotateY(180deg) scale(0);
    opacity: 0;
  }
  to {
    transform: rotateY(0deg) scale(1);
    opacity: 1;
  }
}
```

### Efectos de Sonido

- Click al seleccionar ficha
- Whoosh al pedir nueva ficha
- Ding al activar comodín

### Micro-interacciones

- Shake cuando no puedes pedir más fichas
- Glow pulsante cuando es tu turno
- Confetti cuando sacas SIGLO

---

## 📝 Resumen

✅ **Fichas circulares** estilo auténtico Siglo
✅ **Color madera clara** con gradiente radial realista
✅ **Border rojo** distintivo (#c41e3a)
✅ **Anillo interior** decorativo
✅ **Sombras 3D** con profundidad
✅ **Comodín dorado** con efecto especial
✅ **Mini-fichas** consistentes en toda la UI
✅ **Responsive** para desktop y mobile
✅ **Hover effects** suaves y naturales

---

**Estado:** ✅ Implementado completamente
**Build:** ✅ Sin errores
**Responsive:** ✅ Desktop + Mobile
**Última actualización:** 2025-12-13
