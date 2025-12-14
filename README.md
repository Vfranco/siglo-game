# Siglo! Game 🎮

Un juego de apuestas multijugador en tiempo real desarrollado con React, TypeScript, Vite y Firebase.

## 🎯 Descripción

Siglo! es un emocionante juego de mesa digital donde los jugadores compiten para alcanzar exactamente 99 o 100 puntos sin pasarse. Incluye sistema de apuestas, comodines, y partidas multijugador en tiempo real.

## ✨ Características

- 🎲 Sistema de fichas aleatorias (1-90) con algoritmo Fisher-Yates
- 🎰 Mecánica de comodín (1-30)
- 💰 Sistema de apuestas con pot acumulado
- 🔄 Re-apuesta automática cuando todos los jugadores se pasan
- 👥 Multijugador en tiempo real con Firebase
- 🎨 UI moderna con animaciones fluidas (Framer Motion)
- 📱 Diseño responsive (Desktop y Mobile)
- 🔥 Sincronización en tiempo real con Firestore

## 🚀 Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Backend:** Firebase
  - Firestore Database
  - Authentication (Anonymous)
  - Hosting
- **Styling:** CSS3 con animaciones
- **Animations:** Framer Motion
- **Routing:** React Router DOM

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd siglo-game-react

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 🔥 Configuración de Firebase

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Firestore Database
4. Habilita Authentication (Anonymous)

### 2. Configurar Credenciales

Las credenciales ya están configuradas en `src/config/firebase.ts`. Si necesitas cambiarlas:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  // ... resto de la configuración
};
```

### 3. Desplegar Reglas de Seguridad

```bash
# Inicializar Firebase (si no lo hiciste)
firebase init

# Desplegar reglas de Firestore
firebase deploy --only firestore:rules
```

## 🎮 Cómo Jugar

1. **Ingresa tu nombre** en la pantalla de bienvenida
2. **Selecciona tus coins** (1000, 2000, 3000, 4000)
3. **Crea o únete** a una sala de juego
4. **Espera** a que todos los jugadores estén listos
5. **Pide fichas** en tu turno para acercarte a 99-100 puntos
6. **Activa el comodín** cuando lo necesites
7. **Quédate** cuando creas que tienes buen puntaje
8. **¡Gana el pot!** si logras SIGLO (99-100 puntos)

## 📚 Documentación

Toda la documentación técnica está en la carpeta [`docs/`](./docs/):

### Configuración y Setup
- [**GAME_SPEC.md**](./docs/GAME_SPEC.md) - Especificación completa del juego
- [**SETUP.md**](./docs/SETUP.md) - Guía de configuración inicial
- [**FIREBASE_SETUP.md**](./docs/FIREBASE_SETUP.md) - Guía completa de Firebase
- [**FIREBASE_INTEGRATION_SUMMARY.md**](./docs/FIREBASE_INTEGRATION_SUMMARY.md) - Resumen de integración

### Documentación Técnica
- [**GAME_TABLE.md**](./docs/GAME_TABLE.md) - Vista del juego y componentes
- [**RANDOMIZATION.md**](./docs/RANDOMIZATION.md) - Sistema de aleatoriedad (Fisher-Yates)
- [**REBETTING.md**](./docs/REBETTING.md) - Sistema de re-apuestas
- [**TILE_DESIGN.md**](./docs/TILE_DESIGN.md) - Diseño de las fichas

### UX y Vistas
- [**VIEWS.md**](./docs/VIEWS.md) - Documentación de vistas
- [**UX_IMPROVEMENTS.md**](./docs/UX_IMPROVEMENTS.md) - Mejoras de UX implementadas

## 🧪 Testing Local con Emulators

```bash
# Iniciar Firebase Emulators
firebase emulators:start

# En otra terminal, ejecutar la app
npm run dev
```

Esto iniciará:
- Firestore Emulator: `localhost:8080`
- Hosting Emulator: `localhost:5173`
- Emulator UI: `localhost:4000`

## 🚀 Despliegue

### Firebase Hosting

```bash
# Build de producción
npm run build

# Desplegar a Firebase
firebase deploy --only hosting

# O desplegar todo (reglas + hosting)
firebase deploy
```

Tu app estará disponible en: `https://siglo-game.web.app`

## 📁 Estructura del Proyecto

```
siglo-game-react/
├── src/
│   ├── components/         # Componentes de React
│   │   ├── WelcomeScreen/
│   │   ├── CoinsSelection/
│   │   ├── Lobby/
│   │   └── GameTable/
│   ├── config/             # Configuración de Firebase
│   ├── contexts/           # React Contexts (Auth)
│   ├── hooks/              # Custom Hooks (useAuth, useFirestore)
│   ├── services/           # Servicios de Firebase
│   ├── types/              # TypeScript Types
│   └── utils/              # Utilidades
├── docs/                   # Documentación técnica
├── firestore.rules         # Reglas de seguridad de Firestore
├── firestore.indexes.json  # Índices de Firestore
└── firebase.json           # Configuración de Firebase
```

## 🎨 Características de UI

- **Fichas circulares** con diseño de madera clara y borde rojo
- **Animaciones fluidas** de entrada de fichas
- **Mesa verde estilo casino** con textura
- **Efectos de hover** y transiciones suaves
- **Indicadores de turno** con pulse animation
- **Estados visuales** (playing, busted, winner, stood)

## 🔐 Seguridad

- Autenticación anónima de Firebase
- Reglas de seguridad de Firestore implementadas
- Transacciones atómicas para operaciones críticas
- Validación de permisos basada en roles

## 📊 Costos Estimados (Plan Spark - Gratuito)

- **Lecturas:** 50,000/día
- **Escrituras:** 20,000/día
- **Storage:** 1 GB

Suficiente para desarrollo y MVP con tráfico moderado.

## 🛠️ Scripts Disponibles

```bash
npm run dev        # Desarrollo con Vite (puerto 4173)
npm run build      # Build de producción
npm run preview    # Preview del build (puerto 4173)
npm run lint       # Lint con ESLint
```

## 🔥 Firebase CLI Commands

```bash
firebase login              # Login en Firebase
firebase init              # Inicializar proyecto
firebase deploy            # Desplegar todo
firebase deploy --only firestore:rules    # Solo reglas
firebase deploy --only hosting            # Solo hosting
firebase emulators:start   # Iniciar emulators
```

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y está en desarrollo.

## 👤 Autor

**Victor Franco**

## 🙏 Agradecimientos

- React Team por React 18
- Firebase Team por la excelente plataforma
- Framer Motion por las animaciones fluidas
- Vite por la increíble velocidad de desarrollo

---

## 🎯 Estado Actual

✅ **Completado:**
- Setup inicial de React + TypeScript + Vite
- Tres vistas principales (Welcome, Coins, Lobby)
- Vista de juego completa (GameTable)
- Sistema de fichas aleatorias (Fisher-Yates)
- Mecánica de comodín
- Sistema de apuestas y pot
- Re-apuesta cuando todos se pasan
- Diseño de fichas circulares estilo Siglo
- Integración completa de Firebase
- Reglas de seguridad desplegadas
- Configuración de Emulators

🚧 **En Desarrollo:**
- Integración de componentes con Firebase
- Sistema de salas multijugador
- Sincronización en tiempo real
- Testing completo

📋 **Próximos Pasos:**
- Implementar hooks de Firebase en componentes
- Sistema de room codes
- Notificaciones de turno
- Leaderboard
- Cloud Functions para lógica crítica

---

**Versión:** 0.1.0
**Última actualización:** 2025-12-13
**Estado:** 🚧 En desarrollo activo
