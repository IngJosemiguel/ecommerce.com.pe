# E-commerce Backend API

Backend completo para sistema de e-commerce con Node.js, Express y MySQL.

## 🚀 Características

- **Autenticación JWT** - Sistema completo de registro y login
- **Gestión de Productos** - CRUD completo con categorías
- **Carrito de Compras** - Funcionalidad completa de carrito
- **Sistema de Órdenes** - Gestión completa de pedidos
- **Pagos con Stripe** - Integración completa de pagos
- **Panel de Administración** - Dashboard y gestión de usuarios
- **Lista de Deseos** - Wishlist para usuarios
- **Seguridad** - Rate limiting, validación, sanitización

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v8.0 o superior)
- Cuenta de Stripe (para pagos)

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar base de datos MySQL:**
   - Crear una base de datos llamada `ecommerce_db`
   - Actualizar credenciales en `.env`

3. **Configurar variables de entorno:**
   - Copiar `.env.example` a `.env`
   - Actualizar todas las variables necesarias

4. **Configurar Stripe:**
   - Crear cuenta en [Stripe](https://stripe.com)
   - Obtener claves API del dashboard
   - Actualizar `STRIPE_SECRET_KEY` y `STRIPE_PUBLISHABLE_KEY` en `.env`

## 🗄️ Configuración de Base de Datos

El servidor creará automáticamente las tablas necesarias al iniciar:

- `users` - Usuarios del sistema
- `categories` - Categorías de productos
- `products` - Productos del catálogo
- `orders` - Órdenes de compra
- `order_items` - Items de las órdenes
- `cart_items` - Items del carrito
- `wishlist_items` - Items de la lista de deseos
- `payment_transactions` - Transacciones de pago

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Testing
```bash
npm test
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/profile` - Actualizar perfil
- `PUT /api/auth/change-password` - Cambiar contraseña

### Productos
- `GET /api/products` - Listar productos (con filtros)
- `GET /api/products/:id` - Obtener producto específico
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `DELETE /api/products/:id` - Eliminar producto (Admin)
- `GET /api/products/categories` - Listar categorías

### Carrito
- `GET /api/users/cart` - Obtener carrito
- `POST /api/users/cart/add` - Agregar al carrito
- `PUT /api/users/cart/:itemId` - Actualizar cantidad
- `DELETE /api/users/cart/:itemId` - Eliminar del carrito
- `DELETE /api/users/cart` - Vaciar carrito

### Lista de Deseos
- `GET /api/users/wishlist` - Obtener wishlist
- `POST /api/users/wishlist/add` - Agregar a wishlist
- `DELETE /api/users/wishlist/:itemId` - Eliminar de wishlist
- `POST /api/users/wishlist/:itemId/move-to-cart` - Mover al carrito

### Órdenes
- `GET /api/orders` - Listar órdenes del usuario
- `GET /api/orders/:id` - Obtener orden específica
- `PUT /api/orders/:id/status` - Actualizar estado (Admin)

### Pagos
- `POST /api/payments/create-intent` - Crear intención de pago
- `POST /api/payments/confirm` - Confirmar pago
- `POST /api/payments/webhook` - Webhook de Stripe

### Administración
- `GET /api/admin/dashboard` - Estadísticas del dashboard
- `GET /api/admin/users` - Gestión de usuarios
- `PUT /api/admin/users/:id/status` - Activar/desactivar usuario
- `PUT /api/admin/users/:id/role` - Cambiar rol de usuario
- `GET /api/admin/products/low-stock` - Productos con stock bajo
- `GET /api/admin/orders/recent` - Órdenes recientes
- `GET /api/admin/analytics/sales` - Analíticas de ventas

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Incluye el token en el header:

```
Authorization: Bearer <tu_jwt_token>
```

## 👥 Roles de Usuario

- **customer** - Usuario normal (compras, carrito, órdenes)
- **admin** - Administrador (acceso completo)

## 🛡️ Seguridad

- Rate limiting (100 requests por 15 minutos)
- Validación de entrada con express-validator
- Sanitización de datos
- Protección CORS
- Headers de seguridad con helmet
- Encriptación de contraseñas con bcrypt

## 💳 Integración de Pagos

La API está integrada con Stripe para procesamiento de pagos:

1. **Crear Payment Intent** - El frontend solicita una intención de pago
2. **Procesar Pago** - Stripe procesa el pago del lado del cliente
3. **Confirmar Pago** - El backend confirma y actualiza la orden
4. **Webhooks** - Stripe notifica cambios de estado

## 📊 Datos de Prueba

Al iniciar, se crean automáticamente:

- Usuario administrador:
  - Email: `admin@ecommerce.com`
  - Contraseña: `admin123`

- Categorías de ejemplo:
  - Electrónicos
  - Ropa
  - Hogar
  - Deportes

## 🐛 Debugging

Para habilitar logs detallados:

```bash
DEBUG=* npm run dev
```

## 📝 Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|----------|
| `DB_HOST` | Host de MySQL | ✅ |
| `DB_PORT` | Puerto de MySQL | ✅ |
| `DB_USER` | Usuario de MySQL | ✅ |
| `DB_PASSWORD` | Contraseña de MySQL | ✅ |
| `DB_NAME` | Nombre de la base de datos | ✅ |
| `JWT_SECRET` | Secreto para JWT | ✅ |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe | ✅ |
| `STRIPE_PUBLISHABLE_KEY` | Clave pública de Stripe | ✅ |
| `PORT` | Puerto del servidor | ❌ (default: 5000) |
| `NODE_ENV` | Entorno de ejecución | ❌ (default: development) |

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica las variables de entorno
3. Consulta los logs del servidor
4. Abre un issue en GitHub

---

**¡Listo para usar! 🎉**

Este backend proporciona una base sólida para cualquier aplicación de e-commerce con todas las funcionalidades esenciales implementadas y listas para producción.