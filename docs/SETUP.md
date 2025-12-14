# Setup del Proyecto Siglo!

## Estructura del Proyecto

```
siglo-game-react/
├── src/
│   ├── components/       # Componentes React UI
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Firebase services
│   ├── utils/           # Funciones helper
│   ├── contexts/        # React contexts
│   ├── types/           # TypeScript types & interfaces
│   ├── assets/          # Imágenes, SVG, etc.
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globales
├── public/              # Assets públicos
├── .env.example         # Variables de entorno ejemplo
└── vite.config.ts       # Configuración de Vite
```

## Instalación

```bash
# Instalar dependencias
npm install

# Si tienes problemas de permisos con npm:
npm install --cache /tmp/.npm-cache
```

## Comandos Disponibles

```bash
# Desarrollo (corre en puerto 4173)
npm run dev

# Build de producción
npm run build

# Preview del build (puerto 4173)
npm run preview

# Lint
npm run lint
```

## Variables de Entorno

1. Copiar el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Completar las variables de Firebase (cuando configuremos Firebase más adelante):
```
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

## Próximos Pasos

1. ✅ Setup inicial completado
2. ⏳ Diseño de componentes base (Lobby, Table, Deck, PlayerPanel)
3. ⏳ Configuración de Firebase
4. ⏳ Implementación de lógica del juego
5. ⏳ Cloud Functions para operaciones críticas

## Tecnologías

- **React 18** con TypeScript
- **Vite 6** para build y dev server
- **ESLint** para linting
- Firebase (próximamente)

## Notas de Desarrollo

- Puerto de desarrollo: `4173`
- TypeScript strict mode activado
- ESLint configurado con reglas para React hooks
- Hot Module Replacement (HMR) habilitado
