# appDinamicaIN

Herramienta de encuestas en vivo para eventos de OAJNU. Un moderador configura la encuesta desde un panel protegido, controla la revelación gradual de resultados y monitorea un dashboard en tiempo real. Los participantes responden y pueden ver una pantalla pública de resultados.

Construida con **Vite + React 18 + Firebase (Firestore + Auth)**.

## Puesta en marcha

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear un proyecto en [Firebase](https://console.firebase.google.com/):
   - Habilitar **Firestore** y **Authentication → Email/Password**.
   - Crear un usuario moderador (Authentication → Users → Add user).

3. Copiar `.env.example` a `.env.local` y completar con los valores de tu app web de Firebase:

   ```bash
   cp .env.example .env.local
   ```

4. Publicar las reglas de seguridad de `firestore.rules` (Firebase Console → Firestore → Rules, o `firebase deploy --only firestore:rules`).

5. Levantar el entorno de desarrollo:

   ```bash
   npm run dev
   ```

## Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Previsualiza el build |

## Rutas

| Ruta | Vista |
|---|---|
| `#/` | Portada (participante) |
| `#/encuesta` | Encuesta |
| `#/gracias` | Agradecimiento |
| `#/resultados` | Resultados públicos |
| `#/admin` | Login moderador |
| `#/admin/panel` | Configuración (requiere auth) |
| `#/admin/dashboard` | Dashboard de resultados (requiere auth) |

Se usa enrutamiento por hash para compatibilidad con GitHub Pages.

## Modelo de datos (Firestore)

```
surveys/{surveyId}              ← definición (meta, settings, questions)
  sessions/{sessionId}          ← una corrida del evento (published, label…)
    responses/{responseId}      ← una respuesta de participante
    control/state               ← estado de control (revelar preguntas, botón resultados)
```

El MVP usa `surveyId = "main"` y `sessionId = "main"` (una encuesta activa por proyecto).

## Despliegue en GitHub Pages

```bash
npm run build
# subir el contenido de dist/ a la rama gh-pages
```

`vite.config.js` usa `base: './'` para que las rutas de assets funcionen bajo un subpath.
