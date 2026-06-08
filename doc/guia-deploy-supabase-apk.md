# Guia de Deploy: Supabase + Render + APK (EAS Build)

## Arquitectura Final

```
[Android APK] ──HTTPS──> [Render (Node.js)] ──TCP──> [Supabase (PostgreSQL)]
```

| Componente | Servicio | Plan | Costo |
|------------|----------|------|-------|
| Base de Datos | Supabase | Free | $0 |
| Backend API | Render | Free | $0 |
| Build APK | EAS Build | Free | $0 |

---

## 1. Crear proyecto en Supabase

1. Crear cuenta en https://supabase.com
2. **New project** → `saludapp-db`, guardar password
3. Ir a **Project Settings → Database → Connection string**
4. Copiar URI: `postgresql://postgres:<pass>@db.<id>.supabase.co:5432/postgres`

## 2. Migrar esquema a Supabase

En el **SQL Editor** de Supabase, pegar todo `backend/src/database/schema.sql` y ejecutar.

## 3. Desplegar backend en Render

1. Subir a GitHub, luego en https://render.com crear **Web Service**
2. Conectar repo, configurar:

| Campo | Valor |
|-------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Plan | Free |

3. Variables de entorno:

```
NODE_ENV=production
PORT=3000
DB_HOST=db.<id>.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<password_supabase>
JWT_SECRET=<clave_segura_aleatoria>
JWT_EXPIRES_IN=7d
FRONTEND_URL=*
```

4. Deploy, esperar URL tipo `https://saludapp-backend.onrender.com`

## 4. Construir APK con EAS Build (sin Android Studio)

1. Crear `frontend/app.json`:
```json
{
  "expo": {
    "name": "SaludApp",
    "slug": "saludapp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "plugins": ["expo-secure-store","expo-notifications","expo-print","expo-local-authentication"],
    "android": { "package": "com.tudominio.saludapp" }
  }
}
```

2. Crear `frontend/eas.json`:
```json
{
  "build": {
    "production": {
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_API_URL": "https://saludapp-backend.onrender.com/api" }
    }
  }
}
```

3. Ejecutar:
```bash
cd frontend
npm install -g eas-cli
eas login
eas build --platform android --profile production --local
```

4. Instalar el `.apk` resultante en cualquier Android.

## Notas

- Render Free se duerme a los 15 min → usar UptimeRobot para ping cada 10 min
- Cada cambio en frontend requiere reconstruir el APK
- iOS requiere cuenta Apple Developer ($99/año)
