# 🚀 Despliegue Automático con GitHub Actions + Vercel

## 📋 Configuración de Secretos en GitHub

Para que el despliegue automático funcione, necesitas configurar estos secretos en tu repositorio de GitHub:

### 1. Ve a tu repositorio en GitHub
- Settings → Secrets and variables → Actions → New repository secret

### 2. Agrega estos secretos:

#### `VERCEL_TOKEN`
```bash
# Obtén tu token en: https://vercel.com/account/tokens
# Crea un nuevo token con scope "Full Account"
```

#### `ORG_ID`
```bash
# Ejecuta en tu terminal:
npx vercel link
# Luego busca en .vercel/project.json el "orgId"
```

#### `PROJECT_ID`
```bash
# En el mismo archivo .vercel/project.json busca "projectId"
```

## 🔧 Configuración Paso a Paso

### 1. Obtener Vercel Token
```bash
# 1. Ve a https://vercel.com/account/tokens
# 2. Crea un nuevo token
# 3. Cópialo y guárdalo como secreto VERCEL_TOKEN
```

### 2. Vincular Proyecto con Vercel
```bash
# En tu terminal local:
npx vercel link

# Responde las preguntas:
# ? Set up "~/ecommerce"? [Y/n] y
# ? Which scope should contain your project? [tu-usuario]
# ? Link to existing project? [y/N] n
# ? What's your project's name? ecommerce
# ? In which directory is your code located? ./
```

### 3. Obtener IDs del Proyecto
```bash
# Después de vercel link, revisa:
cat .vercel/project.json

# Ejemplo de salida:
# {
#   "orgId": "team_xxxxxxxxxxxxx",
#   "projectId": "prj_xxxxxxxxxxxxx"
# }
```

### 4. Configurar Secretos en GitHub
```
VERCEL_TOKEN=tu_token_de_vercel
ORG_ID=team_xxxxxxxxxxxxx
PROJECT_ID=prj_xxxxxxxxxxxxx
```

## 🚀 Flujo de Trabajo

### Despliegue Automático
- **Push a `main`**: Despliega a producción
- **Pull Request**: Crea preview deployment
- **Merge PR**: Actualiza producción

### Comandos Manuales
```bash
# Despliegue manual a producción
npx vercel --prod

# Preview deployment
npx vercel

# Ver logs del proyecto
npx vercel logs
```

## 📁 Estructura del Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  deploy:
    - Checkout código
    - Setup Node.js 18
    - Install dependencias (frontend + backend)
    - Build frontend
    - Deploy a Vercel
    - Comentar en PR (si aplica)
```

## 🔍 Troubleshooting

### Error: "Invalid token"
- Verifica que el `VERCEL_TOKEN` sea correcto
- Asegúrate de que el token tenga permisos "Full Account"

### Error: "Project not found"
- Verifica `ORG_ID` y `PROJECT_ID`
- Ejecuta `npx vercel link` nuevamente

### Error: "Build failed"
- Revisa los logs en GitHub Actions
- Verifica que las dependencias estén correctas
- Asegúrate de que `npm run build` funcione localmente

## 🎯 Ventajas de este Setup

✅ **Despliegue automático** en cada push
✅ **Preview deployments** para PRs
✅ **Rollback fácil** desde Vercel dashboard
✅ **Logs detallados** en GitHub Actions
✅ **Notificaciones** automáticas en PRs
✅ **Zero downtime** deployments

## 📱 URLs de Ejemplo

```
Producción: https://tu-proyecto.vercel.app
Preview: https://tu-proyecto-git-branch.vercel.app
Dashboard: https://vercel.com/dashboard
```

¡Listo! Ahora cada vez que hagas push a `main`, tu aplicación se desplegará automáticamente. 🚀