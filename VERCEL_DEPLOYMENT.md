# Despliegue en Vercel - Guía Completa

## 📋 Requisitos Previos

1. Cuenta en [Vercel](https://vercel.com)
2. Cuenta en [Stripe](https://stripe.com) (para pagos)
3. Repositorio en GitHub/GitLab/Bitbucket

## 🚀 Pasos para el Despliegue

### 1. Preparar el Repositorio

```bash
# Subir el código a tu repositorio
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### 2. Configurar Variables de Entorno en Vercel

En el dashboard de Vercel, ve a tu proyecto > Settings > Environment Variables y agrega:

#### Variables del Backend:
```
NODE_ENV=production
JWT_SECRET=tu-clave-jwt-super-secreta
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
FRONTEND_URL=https://tu-app.vercel.app
ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=tu-password-admin-seguro
```

#### Variables del Frontend (si es necesario):
```
VITE_API_URL=https://tu-app.vercel.app/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publica_stripe
```

### 3. Configurar Webhooks de Stripe

1. Ve a tu dashboard de Stripe
2. Navega a Developers > Webhooks
3. Crea un nuevo webhook con la URL: `https://tu-app.vercel.app/api/webhooks/stripe`
4. Selecciona los eventos necesarios:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`

### 4. Desplegar en Vercel

#### Opción A: Desde el Dashboard de Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Importa tu repositorio
4. Vercel detectará automáticamente la configuración
5. Haz clic en "Deploy"

#### Opción B: Usando Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Desplegar
vercel --prod
```

## 🔧 Configuración de la Base de Datos

Para producción, considera migrar de SQLite a una base de datos más robusta:

### Opción 1: PlanetScale (MySQL)
```bash
# Instalar PlanetScale CLI
npm install -g @planetscale/cli

# Conectar a PlanetScale
pscale auth login
pscale database create ecommerce-db
```

### Opción 2: Supabase (PostgreSQL)
1. Crea una cuenta en [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Obtén la URL de conexión
4. Actualiza las variables de entorno

## 📱 Configuración del Frontend

Asegúrate de que tu frontend esté configurado para usar las URLs de producción:

```javascript
// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

## 🔒 Seguridad

### Variables de Entorno Críticas:
- `JWT_SECRET`: Usa una clave de al menos 32 caracteres
- `STRIPE_SECRET_KEY`: Usa las claves de producción de Stripe
- `ADMIN_PASSWORD`: Usa una contraseña fuerte

### CORS Configuration:
El backend debe permitir requests desde tu dominio de Vercel:

```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
};
```

## 🐛 Solución de Problemas

### Error: "Function Timeout"
- Aumenta el timeout en `vercel.json`:
```json
{
  "functions": {
    "backend/server.js": {
      "maxDuration": 30
    }
  }
}
```

### Error: "Module not found"
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente para verificar

### Error de CORS
- Verifica que `FRONTEND_URL` esté configurado correctamente
- Asegúrate de que el frontend use la URL correcta del API

## 📊 Monitoreo

### Logs de Vercel:
```bash
# Ver logs en tiempo real
vercel logs tu-app.vercel.app
```

### Analytics:
- Habilita Vercel Analytics en el dashboard
- Configura alertas para errores 500

## 🔄 Actualizaciones

Para actualizar la aplicación:

```bash
git add .
git commit -m "Actualización de la aplicación"
git push origin main
```

Vercel desplegará automáticamente los cambios.

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en el dashboard de Vercel
2. Verifica las variables de entorno
3. Consulta la [documentación de Vercel](https://vercel.com/docs)

---

¡Tu aplicación de ecommerce estará lista para producción en Vercel! 🎉