# 🔌 Configuración con Extensión MySQL de Trae AI

## 📋 Pasos Simples con la Extensión

### Paso 1: Abrir la Extensión MySQL
1. En Trae AI, busca la extensión **MySQL** en el panel lateral
2. Haz clic para abrirla

### Paso 2: Crear Nueva Conexión
Configura la conexión con estos datos:
```
Host: localhost
Puerto: 3306
Usuario: root
Contraseña: [tu contraseña de MySQL]
Base de datos: (déjalo vacío por ahora)
```

### Paso 3: Conectar
1. Haz clic en **"Conectar"** o **"Test Connection"**
2. Si la conexión es exitosa, verás el servidor MySQL

### Paso 4: Ejecutar el Script de Configuración
1. En la extensión MySQL, busca la opción **"Nueva Consulta"** o **"Query"**
2. Copia y pega TODO el contenido del archivo `backend/setup-database.sql`
3. Haz clic en **"Ejecutar"** o **"Run"**

### Paso 5: Verificar la Configuración
Después de ejecutar el script, deberías ver:
- ✅ Base de datos `ecommerce_db` creada
- ✅ 8 tablas creadas
- ✅ Datos insertados correctamente

## 📄 Contenido del Script (setup-database.sql)

**El script incluye:**
```sql
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- Crear todas las tablas:
- users (usuarios)
- categories (categorías)
- products (productos)
- orders (órdenes)
- order_items (items de órdenes)
- cart_items (carrito)
- wishlist_items (lista de deseos)
- payment_transactions (pagos)

-- Insertar datos de ejemplo:
- Usuario administrador
- 8 categorías
- 15+ productos
```

## ⚙️ Configurar el Backend

### Actualizar archivo .env
Después de ejecutar el script, actualiza tu archivo `.env`:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_CONTRASEÑA_MYSQL
DB_NAME=ecommerce_db

# JWT (genera una clave segura)
JWT_SECRET=mi_clave_jwt_super_secreta_2024

# Stripe (opcional, para pagos)
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui

# Email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_app

# Frontend
FRONTEND_URL=http://localhost:3000

# Servidor
PORT=5000
NODE_ENV=development
```

## 🚀 Iniciar el Backend

```bash
cd backend
npm run dev
```

**Deberías ver:**
```
✅ Conexión exitosa a MySQL
✅ Tablas inicializadas correctamente
🚀 Servidor ejecutándose en puerto 5000
```

## 📊 Datos Incluidos

### Usuario Administrador
- **Email:** `admin@ecommerce.com`
- **Contraseña:** `admin123`

### Categorías Creadas
1. Electrónicos
2. Ropa
3. Hogar
4. Deportes
5. Libros
6. Belleza
7. Juguetes
8. Automóvil

### Productos de Ejemplo
- iPhone 15 Pro - $999.99
- MacBook Air M2 - $1199.99
- Samsung Galaxy S24 - $899.99
- Nike Air Max 270 - $149.99
- Camiseta Básica - $29.99
- Y muchos más...

## 🔍 Verificar que Todo Funciona

### Probar la API
```bash
# Obtener todos los productos
curl http://localhost:5000/api/products

# Login como administrador
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ecommerce.com","password":"admin123"}'
```

### En la Extensión MySQL
Puedes ejecutar estas consultas para verificar:

```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Ver todas las categorías
SELECT * FROM categories;

-- Ver todos los productos
SELECT * FROM products;

-- Contar registros
SELECT 
  (SELECT COUNT(*) FROM users) as usuarios,
  (SELECT COUNT(*) FROM categories) as categorias,
  (SELECT COUNT(*) FROM products) as productos;
```

## 🆘 Solución de Problemas

### Error: "No se puede conectar"
- Verifica que MySQL esté ejecutándose
- Confirma usuario y contraseña
- Asegúrate que el puerto 3306 esté disponible

### Error: "Access denied"
- Verifica las credenciales de MySQL
- Asegúrate que el usuario `root` tenga permisos

### Error en el Script
- Ejecuta el script línea por línea si hay errores
- Verifica que no existan bases de datos con el mismo nombre

## ✅ Checklist Final

- [ ] Extensión MySQL conectada
- [ ] Script `setup-database.sql` ejecutado
- [ ] Base de datos `ecommerce_db` creada
- [ ] 8 tablas creadas
- [ ] Datos insertados
- [ ] Archivo `.env` actualizado
- [ ] Backend iniciado con `npm run dev`
- [ ] API respondiendo en http://localhost:5000

---

**¡Con estos pasos tendrás tu e-commerce completamente configurado usando solo la extensión MySQL de Trae AI! 🎉**