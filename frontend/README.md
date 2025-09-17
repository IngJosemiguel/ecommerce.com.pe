# E-Commerce Admin Panel

Un panel de administración moderno y completo para e-commerce construido con React, Vite y Tailwind CSS.

## 🚀 Características

- **Dashboard Interactivo**: Métricas en tiempo real, gráficos de ventas y widgets informativos
- **Gestión de Productos**: CRUD completo con filtros avanzados y estadísticas
- **Sistema de Pedidos**: Seguimiento de estados, filtros y exportación
- **Administración de Clientes**: Análisis detallado y gestión de perfiles
- **Panel de Analytics**: Visualizaciones avanzadas con Recharts
- **Configuración Completa**: Múltiples secciones de configuración del sistema
- **Diseño Responsive**: Optimizado para desktop y móvil
- **Animaciones Fluidas**: Implementadas con Framer Motion

## 🛠️ Tecnologías

- **React 18** - Biblioteca de interfaz de usuario
- **Vite** - Herramienta de desarrollo rápida
- **Tailwind CSS** - Framework de CSS utilitario
- **Framer Motion** - Biblioteca de animaciones
- **Recharts** - Biblioteca de gráficos para React
- **React Router** - Enrutamiento del lado del cliente
- **Lucide React** - Iconos modernos
- **React Hot Toast** - Notificaciones elegantes

## 📦 Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd ecommerce/frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Inicia el servidor de desarrollo:
```bash
npm run dev
```

4. Abre tu navegador en `http://localhost:3000`

## 🏗️ Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción
- `npm run lint` - Ejecuta el linter de código

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx      # Barra superior con navegación
│   ├── Layout.jsx      # Layout principal de la aplicación
│   └── Sidebar.jsx     # Barra lateral de navegación
├── pages/              # Páginas de la aplicación
│   ├── Analytics.jsx   # Panel de analíticas
│   ├── Customers.jsx   # Gestión de clientes
│   ├── Dashboard.jsx   # Panel principal
│   ├── Orders.jsx      # Gestión de pedidos
│   ├── Products.jsx    # Gestión de productos
│   └── Settings.jsx    # Configuraciones
├── App.jsx             # Componente principal
├── main.jsx           # Punto de entrada
└── index.css          # Estilos globales
```

## 🎨 Características de Diseño

- **Paleta de Colores**: Esquema de colores profesional con azul como color primario
- **Tipografía**: Fuentes del sistema optimizadas para legibilidad
- **Espaciado**: Sistema de espaciado consistente basado en Tailwind
- **Componentes**: Componentes reutilizables con estados hover y focus
- **Responsive**: Diseño adaptativo para todas las pantallas

## 📊 Funcionalidades del Dashboard

### Dashboard Principal
- Métricas de ventas, pedidos, clientes y productos
- Gráficos de tendencias de ventas
- Lista de pedidos recientes
- Productos más vendidos

### Gestión de Productos
- Crear, editar y eliminar productos
- Filtros por categoría y estado
- Búsqueda en tiempo real
- Gestión de inventario

### Sistema de Pedidos
- Visualización de todos los pedidos
- Filtros por estado y fecha
- Detalles completos de pedidos
- Exportación de datos

### Análisis de Clientes
- Perfiles detallados de clientes
- Historial de compras
- Métricas de engagement
- Segmentación de clientes

### Panel de Analytics
- Gráficos de ingresos y tendencias
- Análisis de fuentes de tráfico
- Rendimiento por categorías
- Embudo de conversión

## 🔧 Configuración

El panel incluye múltiples secciones de configuración:

- **Perfil**: Información personal y cambio de contraseña
- **Notificaciones**: Preferencias de notificaciones
- **Seguridad**: Autenticación de dos factores y configuraciones de sesión
- **Pagos**: Configuración de métodos de pago y monedas
- **Tienda**: Información general de la tienda

## 🚀 Despliegue

Para construir la aplicación para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/` y estarán listos para ser desplegados en cualquier servidor web estático.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.