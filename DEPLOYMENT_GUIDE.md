# 🚀 Guía de Despliegue - Siglo! Game

## ✅ Paso 1: Build Completado
El proyecto se ha compilado exitosamente en la carpeta `dist/`.

## 📋 Paso 2: Configurar Firebase (IMPORTANTE)

Antes de desplegar, necesitas habilitar la autenticación en Firebase Console:

1. Ve a: https://console.firebase.google.com/project/siglo-game/authentication
2. Haz clic en "Get Started" o "Comenzar"
3. En la pestaña "Sign-in method", habilita:
   - ✅ **Anonymous** (Anónimo) - Esto es CRÍTICO para que funcione el juego

## 🔒 Paso 3: Actualizar Reglas de Firestore para Producción (Opcional)

Las reglas actuales están simplificadas para desarrollo. Para producción, considera actualizarlas:

```bash
# Ver las reglas actuales
cat firestore.rules
```

## 🚀 Paso 4: Desplegar a Firebase Hosting

Una vez habilitada la autenticación anónima:

```bash
# Iniciar sesión en Firebase (si no lo has hecho)
firebase login

# Desplegar el proyecto
firebase deploy
```

O si solo quieres desplegar el hosting:

```bash
firebase deploy --only hosting
```

## 🌐 Paso 5: Acceder a tu Juego

Una vez desplegado, Firebase te dará una URL como:
- https://siglo-game.web.app
- https://siglo-game.firebaseapp.com

## 🧪 Prueba Local del Build de Producción (Opcional)

Si quieres probar el build localmente antes de desplegar:

```bash
npm run preview
```

Esto abrirá el build en http://localhost:4173

## ⚠️ Troubleshooting

### Si obtienes errores de autenticación después de desplegar:
1. Verifica que habilitaste Anonymous Auth en Firebase Console
2. Asegúrate de que las reglas de Firestore permitan lectura/escritura a usuarios autenticados

### Si las rutas no funcionan (404):
Ya está configurado en `firebase.json` con rewrites, debería funcionar correctamente.

## 📊 Monitoreo Post-Despliegue

Después de desplegar, puedes monitorear:
- **Hosting**: https://console.firebase.google.com/project/siglo-game/hosting
- **Firestore**: https://console.firebase.google.com/project/siglo-game/firestore
- **Authentication**: https://console.firebase.google.com/project/siglo-game/authentication
- **Analytics** (si lo activas): https://console.firebase.google.com/project/siglo-game/analytics

## 🎮 ¡Listo para Jugar!

Una vez desplegado, comparte la URL con tus amigos y ¡a jugar Siglo!
