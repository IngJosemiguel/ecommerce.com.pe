-- Script de configuración de base de datos para E-commerce
-- Ejecutar este script en MySQL después de crear la base de datos

-- Crear base de datos (ejecutar como administrador)
CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

-- Crear usuario específico para la aplicación (opcional pero recomendado)
-- CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
-- GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20),
    date_of_birth DATE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_active (is_active)
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_active (is_active)
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    compare_price DECIMAL(10, 2),
    cost_price DECIMAL(10, 2),
    stock_quantity INT DEFAULT 0,
    min_stock_level INT DEFAULT 5,
    weight DECIMAL(8, 2),
    dimensions VARCHAR(100),
    brand VARCHAR(100),
    model VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    material VARCHAR(100),
    images JSON,
    category_id INT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_sku (sku),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_featured (is_featured),
    INDEX idx_price (price),
    INDEX idx_stock (stock_quantity),
    FULLTEXT idx_search (name, description, brand, model)
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_intent_id VARCHAR(255),
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    shipping_address JSON,
    billing_address JSON,
    notes TEXT,
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_order_number (order_number),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
);

-- Tabla de items de órdenes
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    product_snapshot JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
);

-- Tabla de lista de deseos
CREATE TABLE IF NOT EXISTS wishlist_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id),
    INDEX idx_product (product_id)
);

-- Tabla de transacciones de pago
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_payment_id VARCHAR(255),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'succeeded', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    failure_reason TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_payment_intent (payment_intent_id),
    INDEX idx_status (status)
);

-- Insertar usuario administrador por defecto
INSERT IGNORE INTO users (first_name, last_name, email, password, role) VALUES 
('Admin', 'User', 'admin@ecommerce.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO8G', 'admin');
-- Contraseña: admin123

-- Insertar categorías por defecto
INSERT IGNORE INTO categories (name, description) VALUES 
('Electrónicos', 'Dispositivos electrónicos y gadgets'),
('Ropa', 'Ropa y accesorios de moda'),
('Hogar', 'Artículos para el hogar y decoración'),
('Deportes', 'Equipamiento deportivo y fitness'),
('Libros', 'Libros y material educativo'),
('Belleza', 'Productos de belleza y cuidado personal'),
('Juguetes', 'Juguetes y juegos para niños'),
('Automóvil', 'Accesorios y repuestos para automóviles');

-- Insertar productos de ejemplo
INSERT IGNORE INTO products (name, description, short_description, sku, price, compare_price, stock_quantity, brand, category_id, is_active, is_featured, images) VALUES 
('iPhone 15 Pro', 'El iPhone más avanzado con chip A17 Pro y cámara de 48MP', 'iPhone 15 Pro con tecnología de vanguardia', 'IPH15PRO001', 999.99, 1099.99, 50, 'Apple', 1, true, true, '["https://via.placeholder.com/400x400/007bff/ffffff?text=iPhone+15+Pro"]'),
('MacBook Air M2', 'Laptop ultradelgada con chip M2 y pantalla Liquid Retina', 'MacBook Air con rendimiento excepcional', 'MBA-M2-001', 1199.99, 1299.99, 25, 'Apple', 1, true, true, '["https://via.placeholder.com/400x400/28a745/ffffff?text=MacBook+Air"]'),
('Samsung Galaxy S24', 'Smartphone Android con cámara de 200MP y pantalla Dynamic AMOLED', 'Galaxy S24 con IA integrada', 'SGS24-001', 899.99, 999.99, 40, 'Samsung', 1, true, false, '["https://via.placeholder.com/400x400/6f42c1/ffffff?text=Galaxy+S24"]'),
('Nike Air Max 270', 'Zapatillas deportivas con tecnología Air Max', 'Comodidad y estilo en cada paso', 'NAM270-001', 149.99, 179.99, 100, 'Nike', 4, true, true, '["https://via.placeholder.com/400x400/fd7e14/ffffff?text=Air+Max+270"]'),
('Camiseta Básica', 'Camiseta de algodón 100% en varios colores', 'Camiseta cómoda para uso diario', 'CB-001', 19.99, 24.99, 200, 'BasicWear', 2, true, false, '["https://via.placeholder.com/400x400/20c997/ffffff?text=Camiseta"]'),
('Sofá Moderno 3 Plazas', 'Sofá cómodo y elegante para sala de estar', 'Sofá de diseño contemporáneo', 'SM3P-001', 799.99, 899.99, 15, 'HomeStyle', 3, true, true, '["https://via.placeholder.com/400x400/e83e8c/ffffff?text=Sofá+Moderno"]'),
('Bicicleta de Montaña', 'Bicicleta todo terreno con 21 velocidades', 'Perfecta para aventuras al aire libre', 'BM21V-001', 449.99, 499.99, 30, 'MountainBike', 4, true, false, '["https://via.placeholder.com/400x400/17a2b8/ffffff?text=Bicicleta"]'),
('Auriculares Bluetooth', 'Auriculares inalámbricos con cancelación de ruido', 'Sonido premium sin cables', 'ABT-001', 199.99, 249.99, 75, 'SoundTech', 1, true, true, '["https://via.placeholder.com/400x400/ffc107/ffffff?text=Auriculares"]');

COMMIT;

-- Mostrar resumen de la configuración
SELECT 'Base de datos configurada exitosamente' AS status;
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_categories FROM categories;
SELECT COUNT(*) AS total_products FROM products;

SELECT 
    'Configuración completada. Credenciales de administrador:' AS info,
    'Email: admin@ecommerce.com' AS admin_email,
    'Contraseña: admin123' AS admin_password;