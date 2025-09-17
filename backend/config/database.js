const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
require('dotenv').config();

// Database configuration
const dbPath = path.join(__dirname, '..', 'database.sqlite');

// Create database connection
let db = null;

const getDatabase = async () => {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    // Enable foreign keys
    await db.exec('PRAGMA foreign_keys = ON;');
  }
  return db;
};

// Test connection function
const testConnection = async () => {
  try {
    const database = await getDatabase();
    console.log('✅ Conexión a SQLite exitosa');
    return true;
  } catch (error) {
    console.error('❌ Error de conexión a SQLite:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeTables = async () => {
  try {
    const database = await getDatabase();
    
    // Users table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        role TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'admin')),
        is_active INTEGER DEFAULT 1,
        email_verified INTEGER DEFAULT 0,
        avatar_url TEXT,
        date_of_birth TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);

    // Categories table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
    `);

    // Products table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        compare_price REAL,
        cost_price REAL,
        sku TEXT UNIQUE,
        barcode TEXT,
        stock_quantity INTEGER DEFAULT 0,
        min_stock_level INTEGER DEFAULT 5,
        weight REAL,
        dimensions TEXT,
        category_id INTEGER,
        brand TEXT,
        tags TEXT, -- JSON as TEXT
        images TEXT, -- JSON as TEXT
        is_active INTEGER DEFAULT 1,
        is_featured INTEGER DEFAULT 0,
        seo_title TEXT,
        seo_description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
      CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
    `);

    // Orders table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_number TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
        payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
        payment_method TEXT,
        payment_id TEXT,
        subtotal REAL NOT NULL,
        tax_amount REAL DEFAULT 0,
        shipping_amount REAL DEFAULT 0,
        discount_amount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        shipping_address TEXT, -- JSON as TEXT
        billing_address TEXT, -- JSON as TEXT
        notes TEXT,
        tracking_number TEXT,
        shipped_at DATETIME,
        delivered_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
      CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
    `);

    // Order items table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        total_price REAL NOT NULL,
        product_name TEXT NOT NULL,
        product_sku TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);
    `);

    // Cart items table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
    `);

    // Wishlist items table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE(user_id, product_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_wishlist_items_user ON wishlist_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_wishlist_items_product ON wishlist_items(product_id);
    `);

    // Payment transactions table
    await database.exec(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        transaction_id TEXT UNIQUE NOT NULL,
        payment_method TEXT NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'EUR',
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
        gateway_response TEXT, -- JSON as TEXT
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
      
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_order ON payment_transactions(order_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction ON payment_transactions(transaction_id);
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
    `);

    console.log('✅ Tablas inicializadas correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar tablas:', error.message);
    return false;
  }
};

// Insert sample data
const insertSampleData = async () => {
  try {
    const database = await getDatabase();
    
    // Check if data already exists
    const userCount = await database.get('SELECT COUNT(*) as count FROM users');
    if (userCount.count > 0) {
      console.log('✅ Datos de ejemplo ya existen');
      return true;
    }

    // Insert admin user
    const bcrypt = require('bcryptjs');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    
    await database.run(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['admin@ecommerce.com', hashedAdminPassword, 'Admin', 'User', 'admin', 1, 1]);

    // Insert demo client user
    const hashedClientPassword = await bcrypt.hash('cliente123', 10);
    
    await database.run(`
      INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ['cliente@email.com', hashedClientPassword, 'Cliente', 'Demo', 'customer', 1, 1]);

    // Insert categories
    const categories = [
      ['Electrónicos', 'Dispositivos y gadgets tecnológicos'],
      ['Ropa', 'Moda y vestimenta para todos'],
      ['Hogar', 'Artículos para el hogar y decoración'],
      ['Deportes', 'Equipamiento y ropa deportiva'],
      ['Libros', 'Literatura y material educativo'],
      ['Belleza', 'Productos de cuidado personal'],
      ['Juguetes', 'Entretenimiento para niños'],
      ['Automóvil', 'Accesorios y repuestos para vehículos']
    ];

    for (const [name, description] of categories) {
      await database.run(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
    }

    // Insert sample products
    const products = [
      ['iPhone 15 Pro', 'Último modelo de iPhone con chip A17 Pro', 999.99, 1, 'IPHONE15PRO', 50],
      ['MacBook Air M2', 'Laptop ultradelgada con chip M2', 1199.99, 1, 'MACBOOK-AIR-M2', 25],
      ['Samsung Galaxy S24', 'Smartphone Android premium', 899.99, 1, 'GALAXY-S24', 40],
      ['Nike Air Max 270', 'Zapatillas deportivas cómodas', 149.99, 4, 'NIKE-AM270', 100],
      ['Camiseta Básica', 'Camiseta de algodón 100%', 29.99, 2, 'CAMISETA-BASIC', 200],
      ['Sofá Moderno', 'Sofá de 3 plazas estilo moderno', 799.99, 3, 'SOFA-MOD-3P', 15],
      ['Libro: El Quijote', 'Clásico de la literatura española', 19.99, 5, 'LIBRO-QUIJOTE', 50],
      ['Crema Facial', 'Crema hidratante para todo tipo de piel', 39.99, 6, 'CREMA-FACIAL', 75],
      ['Pelota de Fútbol', 'Pelota oficial FIFA', 49.99, 4, 'PELOTA-FIFA', 80],
      ['Muñeca Barbie', 'Muñeca clásica Barbie', 24.99, 7, 'BARBIE-CLASSIC', 60]
    ];

    for (const [name, description, price, categoryId, sku, stock] of products) {
      await database.run(`
        INSERT INTO products (name, description, price, category_id, sku, stock_quantity, is_active, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, 1, 0)
      `, [name, description, price, categoryId, sku, stock]);
    }

    console.log('✅ Datos de ejemplo insertados correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al insertar datos de ejemplo:', error.message);
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  await testConnection();
  await initializeTables();
  await insertSampleData();
};

initializeDatabase().catch(console.error);

module.exports = { getDatabase, testConnection, initializeTables, insertSampleData, initializeDatabase };