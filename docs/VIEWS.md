# Vistas del Juego Siglo!

Este documento describe las tres vistas principales creadas para el prototipo.

## 🎯 Flujo de Navegación

```
WelcomeScreen (/)
    ↓
CoinsSelection (/coins-selection)
    ↓
Lobby (/lobby)
```

## 📱 Vista 1: WelcomeScreen

**Ruta:** `/`

**Descripción:** Pantalla de bienvenida donde el jugador ingresa su nombre.

**Características:**
- Logo "SIGLO!" con efecto dorado y sombra brillante
- Subtítulo descriptivo del juego
- Input para nombre del jugador (máx 20 caracteres)
- Validación: botón deshabilitado si el nombre está vacío
- Animaciones de entrada (fade-in)
- Fondo verde estilo mesa de juego

**Flujo:**
1. Usuario ingresa su nombre
2. Click en "Continuar"
3. Nombre se guarda en localStorage
4. Navegación automática a `/coins-selection`

**Archivos:**
- [src/components/WelcomeScreen/WelcomeScreen.tsx](src/components/WelcomeScreen/WelcomeScreen.tsx)
- [src/components/WelcomeScreen/WelcomeScreen.css](src/components/WelcomeScreen/WelcomeScreen.css)

---

## 💰 Vista 2: CoinsSelection

**Ruta:** `/coins-selection`

**Descripción:** Pantalla de selección de coins iniciales.

**Características:**
- Saludo personalizado con el nombre del jugador
- 4 opciones de coins: 1000, 2000, 3000, 4000
- Cards animadas con hover effects
- Card seleccionada con borde dorado y glow effect
- Botones: "Atrás" y "Continuar al Lobby"
- Info tooltip sobre el uso de coins
- Grid responsivo (2 columnas en móvil, 4 en desktop)

**Flujo:**
1. Usuario selecciona cantidad de coins
2. Click en "Continuar al Lobby"
3. Coins se guardan en localStorage
4. Navegación automática a `/lobby`

**Protección:**
- Redirige a `/` si no hay nombre guardado

**Archivos:**
- [src/components/CoinsSelection/CoinsSelection.tsx](src/components/CoinsSelection/CoinsSelection.tsx)
- [src/components/CoinsSelection/CoinsSelection.css](src/components/CoinsSelection/CoinsSelection.css)

---

## 🎮 Vista 3: Lobby

**Ruta:** `/lobby`

**Descripción:** Sala de espera antes de iniciar la partida.

**Características:**
- Header con título y info del juego (Apuesta Base, Jugadores)
- Lista de jugadores en la sala con:
  - Avatar circular con inicial del nombre
  - Nombre del jugador
  - Badge "Tú" para el jugador actual
  - Cantidad de coins
  - Estado: "✓ Listo" o "Esperando..."
- Botón "Marcar como Listo" (toggle)
- Botón "Iniciar Partida" (aparece cuando todos están listos)
- Botón "Salir del Lobby"
- Panel de reglas del juego
- Jugadores mock para demostración

**Estados:**
- Player card con borde dorado para jugador actual
- Player card con fondo verde cuando está listo
- Botón "Iniciar Partida" con animación de pulso
- Botón deshabilitado si no todos están listos

**Protección:**
- Redirige a `/` si no hay nombre guardado

**Archivos:**
- [src/components/Lobby/Lobby.tsx](src/components/Lobby/Lobby.tsx)
- [src/components/Lobby/Lobby.css](src/components/Lobby/Lobby.css)

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Fondo:** Gradiente verde oscuro (#1a5f3f → #0d3d28) - estilo mesa de casino
- **Primario:** Dorado (#ffd700) - para títulos y highlights
- **Secundario:** Verde claro (#b8d4c6) - para subtítulos y texto
- **Accent:** Blanco con opacidad - para cards y botones

### Animaciones
- **fadeInDown:** Títulos y headers
- **fadeInUp:** Contenido y botones
- **pulse:** Botón de iniciar partida
- **hover effects:** Scale y translateY en cards y botones

### Responsive
- Mobile-first design
- Breakpoint: 768px
- Grid adaptable (2-4 columnas)
- Font-sizes ajustables

---

## 🔄 Datos Temporales

Actualmente usa **localStorage** para:
- `playerName`: Nombre del jugador
- `playerCoins`: Cantidad de coins seleccionada

**Mock data en Lobby:**
- Jugador actual + 2 jugadores simulados
- Esto se reemplazará con Firebase en la siguiente fase

---

## 🚀 Cómo Probar

```bash
# Iniciar servidor de desarrollo
npm run dev

# Abrir navegador en http://localhost:4173

# Flujo de prueba:
1. Ingresar nombre → "Continuar"
2. Seleccionar coins (ej: 2000) → "Continuar al Lobby"
3. En Lobby → "Marcar como Listo"
4. Ver botón "Iniciar Partida" aparecer
```

---

## 📝 Mejoras Sugeridas (UX)

✅ **Implementadas:**
- Validación de inputs
- Protección de rutas
- Animaciones suaves
- Feedback visual en hover
- Estados disabled claros
- Responsive design

⏳ **Próximas:**
- Transiciones entre rutas
- Loading states
- Sonidos de UI (opcional)
- Teclado shortcuts (Enter para continuar)
- Máximo de jugadores en lobby
- Timer de inactividad

---

## 🎯 Próximos Pasos

1. ✅ Vistas base creadas
2. ⏳ Integración con Firebase
3. ⏳ Vista de juego (mesa verde, fichas, comodín)
4. ⏳ Lógica de turnos y apuestas
5. ⏳ Cloud Functions para operaciones críticas
