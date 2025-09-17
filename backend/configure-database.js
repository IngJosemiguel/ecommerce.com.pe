const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Configuración de conexión (ajusta según tu instalación)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '', // Cambia esto por tu contraseña de MySQL
  multipleStatements: true
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔄 Conectando a MySQL...');
    
    // Conectar sin especificar base de datos
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión exitosa a MySQL');
    
    // Leer el script SQL
    const sqlScript = fs.readFileSync(path.join(__dirname, 'setup-database.sql'), 'utf8');
    
    console.log('🔄 Ejecutando script de configuración...');
    
    // Ejecutar el script completo
    await connection.execute(sqlScript);
    
    console.log('✅ Base de datos configurada exitosamente');
    console.log('');
    console.log('📊 Resumen de la configuración:');
    console.log('- Base de datos: ecommerce_db');
    console.log('- Tablas creadas: 8');
    console.log('- Usuario admin: admin@ecommerce.com');
    console.log('- Contraseña admin: admin123');
    console.log('');
    
    // Verificar las tablas creadas
    const [tables] = await connection.execute('USE ecommerce_db; SHOW TABLES;');
    console.log('📋 Tablas creadas:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    // Verificar datos de ejemplo
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [categoryCount] = await connection.execute('SELECT COUNT(*) as count FROM categories');
    const [productCount] = await connection.execute('SELECT COUNT(*) as count FROM products');
    
    console.log('');
    console.log('📈 Datos insertados:');
    console.log(`  - Usuarios: ${userCount[0].count}`);
    console.log(`  - Categorías: ${categoryCount[0].count}`);
    console.log(`  - Productos: ${productCount[0].count}`);
    
    console.log('');
    console.log('🎉 ¡Configuración completada! Ahora puedes:');
    console.log('1. Actualizar el archivo .env con tus credenciales');
    console.log('2. Ejecutar: npm run dev');
    console.log('3. Probar la API en: http://localhost:5000');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Soluciones posibles:');
      console.log('1. Verifica que MySQL esté ejecutándose');
      console.log('2. Confirma el puerto (por defecto 3306)');
      console.log('3. Verifica usuario y contraseña');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 Error de acceso:');
      console.log('1. Verifica el usuario y contraseña');
      console.log('2. Asegúrate que el usuario tenga permisos');
    }
    
    console.log('');
    console.log('📋 Configuración manual alternativa:');
    console.log('1. Abre tu cliente MySQL (Workbench, phpMyAdmin, etc.)');
    console.log('2. Ejecuta el archivo setup-database.sql');
    console.log('3. Actualiza las credenciales en .env');
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Función para actualizar el archivo .env
function updateEnvFile() {
  const envPath = path.join(__dirname, '.env');
  
  if (fs.existsSync(envPath)) {
    console.log('');
    console.log('📝 Recuerda actualizar tu archivo .env con:');
    console.log('DB_HOST=localhost');
    console.log('DB_PORT=3306');
    console.log('DB_USER=root');
    console.log('DB_PASSWORD=[tu_contraseña]');
    console.log('DB_NAME=ecommerce_db');
  }
}

// Ejecutar configuración
if (require.main === module) {
  console.log('🚀 Configurador automático de base de datos E-commerce');
  console.log('================================================');
  console.log('');
  
  // Verificar si el archivo SQL existe
  const sqlPath = path.join(__dirname, 'setup-database.sql');
  if (!fs.existsSync(sqlPath)) {
    console.error('❌ Error: No se encontró el archivo setup-database.sql');
    process.exit(1);
  }
  
  setupDatabase().then(() => {
    updateEnvFile();
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}

module.exports = { setupDatabase };