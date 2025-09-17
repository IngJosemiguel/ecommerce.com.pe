# 🗄️ Configuración Automática de MySQL

## 📋 Opciones de Configuración

### Opción 1: Configuración Automática (Recomendada)

**Paso 1: Actualizar credenciales**
Edita el archivo `backend/configure-database.js` línea 8:
```javascript
password: 'TU_CONTRASEÑA_MYSQL', // Cambia esto por tu contraseña
```

**Paso 2: Ejecutar configuración automática**
```bash
cd backend
npm run setup-db
```

¡Eso es todo! El script creará automáticamente:
- ✅ Base de datos `ecommerce_db`
- ✅ Todas las tablas necesarias
- ✅ Usuario administrador
- ✅ Datos de ejemplo

### Opción 2: Usando la Extensión MySQL de Trae AI

**Paso 1: Conectar a MySQL**
1. Abre la extensión MySQL en Trae AI
2. Crea nueva conexión:
   - Host: `localhost`
   - Puerto: `3306`
   - Usuario: `root`
   - Contraseña: [tu contraseña]

**Paso 2: Ejecutar script**
1. Abre el archivo `backend/setup-database.sql`
2. Copia todo el contenido
3. Pégalo en la extensión MySQL
4. Ejecuta el script

### Opción 3: MySQL Workbench o Cliente Manual

**Paso 1: Abrir tu cliente MySQL favorito**
- MySQL Workbench
- phpMyAdmin
- HeidiSQL
- Cualquier otro cliente

**Paso 2: Ejecutar script**
1. Conecta a tu servidor MySQL
2. Abre el archivo `backend/setup-database.sql`
3. Ejecuta todo el script

## ⚙️ Configuración del Backend

**Actualizar archivo .env:**
```env
# Actualiza estas líneas:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=ecommerce_db

# También configura tu JWT secret:
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui

# Y tus claves de Stripe:
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica
```

## 🚀 Iniciar el Backend

```bash
cd backend
npm run dev
```

Deberías ver:
```
✅ Conexión exitosa a MySQL
✅ Tablas inicializadas correctamente
🚀 Servidor ejecutándose en puerto 5000
```

## 📊 Datos Incluidos

**Usuario Administrador:**
- Email: `admin@ecommerce.com`
- Contraseña: `admin123`

**Categorías:**
- Electrónicos
- Ropa
- Hogar
- Deportes
- Libros
- Belleza
- Juguetes
- Automóvil

**Productos de Ejemplo:**
- iPhone 15 Pro ($999.99)
- MacBook Air M2 ($1199.99)
- Samsung Galaxy S24 ($899.99)
- Nike Air Max 270 ($149.99)
- Y más...

## 🔍 Verificación

**Probar la API:**
```bash
# Obtener productos
curl http://localhost:5000/api/products

# Login de administrador
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}'
```

## 🆘 Solución de Problemas

### Error: "mysql no se reconoce como comando"
- MySQL no está en el PATH del sistema
- Usa la extensión MySQL de Trae AI
- O usa MySQL Workbench

### Error: "Access denied"
- Verifica usuario y contraseña
- Asegúrate que MySQL esté ejecutándose
- Confirma que el puerto 3306 esté disponible

### Error: "Connection refused"
- MySQL no está ejecutándose
- Inicia el servicio MySQL:
  ```bash
  # Windows (como administrador)
  net start mysql
  ```

### Error: "Database already exists"
- La base de datos ya existe
- Puedes eliminarla y recrearla:
  ```sql
  DROP DATABASE IF EXISTS ecommerce_db;
  ```

## 📞 Contacto

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica las credenciales en `.env`
3. Confirma que MySQL esté ejecutándose
4. Usa la configuración automática: `npm run setup-db`

---

**¡Una vez configurado, tendrás un backend completamente funcional! 🎉**