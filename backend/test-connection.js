const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración simplificada para prueba
const testConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecommerce_db'
};

async function testDatabaseConnection() {
  console.log('🔍 Probando conexión a MySQL...');
  console.log('📋 Configuración:');
  console.log(`   Host: ${testConfig.host}`);
  console.log(`   Puerto: ${testConfig.port}`);
  console.log(`   Usuario: ${testConfig.user}`);
  console.log(`   Base de datos: ${testConfig.database}`);
  console.log(`   Contraseña: ${testConfig.password ? '[CONFIGURADA]' : '[VACÍA]'}`);
  console.log('');

  try {
    // Probar conexión sin base de datos específica
    console.log('🔄 Paso 1: Conectando al servidor MySQL...');
    const connectionWithoutDB = await mysql.createConnection({
      host: testConfig.host,
      port: testConfig.port,
      user: testConfig.user,
      password: testConfig.password
    });
    
    console.log('✅ Conexión al servidor MySQL exitosa');
    
    // Verificar si la base de datos existe
    console.log('🔄 Paso 2: Verificando base de datos...');
    const [databases] = await connectionWithoutDB.execute('SHOW DATABASES');
    const dbExists = databases.some(db => Object.values(db)[0] === testConfig.database);
    
    if (dbExists) {
      console.log(`✅ Base de datos '${testConfig.database}' encontrada`);
      
      // Probar conexión con la base de datos específica
      console.log('🔄 Paso 3: Conectando a la base de datos específica...');
      const connectionWithDB = await mysql.createConnection(testConfig);
      
      // Verificar tablas
      console.log('🔄 Paso 4: Verificando tablas...');
      const [tables] = await connectionWithDB.execute('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log(`✅ Se encontraron ${tables.length} tablas:`);
        tables.forEach(table => {
          console.log(`   - ${Object.values(table)[0]}`);
        });
        
        // Verificar datos de ejemplo
        console.log('🔄 Paso 5: Verificando datos...');
        const [users] = await connectionWithDB.execute('SELECT COUNT(*) as count FROM users');
        const [products] = await connectionWithDB.execute('SELECT COUNT(*) as count FROM products');
        const [categories] = await connectionWithDB.execute('SELECT COUNT(*) as count FROM categories');
        
        console.log('📊 Datos encontrados:');
        console.log(`   - Usuarios: ${users[0].count}`);
        console.log(`   - Productos: ${products[0].count}`);
        console.log(`   - Categorías: ${categories[0].count}`);
        
      } else {
        console.log('⚠️  La base de datos existe pero no tiene tablas');
        console.log('💡 Ejecuta el script setup-database.sql para crear las tablas');
      }
      
      await connectionWithDB.end();
      
    } else {
      console.log(`❌ Base de datos '${testConfig.database}' no encontrada`);
      console.log('📋 Bases de datos disponibles:');
      databases.forEach(db => {
        console.log(`   - ${Object.values(db)[0]}`);
      });
      console.log('💡 Ejecuta el script setup-database.sql para crear la base de datos');
    }
    
    await connectionWithoutDB.end();
    
    console.log('');
    console.log('🎉 Diagnóstico completado');
    
  } catch (error) {
    console.log('');
    console.error('❌ Error durante la prueba:', error.message);
    console.log('');
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Posibles soluciones:');
      console.log('   1. MySQL no está ejecutándose');
      console.log('   2. Verifica que el puerto 3306 esté disponible');
      console.log('   3. Confirma la configuración del host');
      console.log('');
      console.log('🔧 Para Windows, intenta:');
      console.log('   - Abrir Servicios (services.msc)');
      console.log('   - Buscar "MySQL" y iniciarlo');
      console.log('   - O usar: net start mysql');
      
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Error de autenticación:');
      console.log('   1. Verifica el usuario y contraseña en .env');
      console.log('   2. Confirma que el usuario tenga permisos');
      console.log('   3. Intenta conectar con un cliente MySQL primero');
      
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Base de datos no encontrada:');
      console.log('   1. La base de datos no existe');
      console.log('   2. Ejecuta el script setup-database.sql');
      console.log('   3. O créala manualmente');
      
    } else {
      console.log('💡 Error desconocido:');
      console.log('   1. Verifica la configuración en .env');
      console.log('   2. Confirma que MySQL esté instalado');
      console.log('   3. Revisa los logs de MySQL');
    }
  }
}

// Ejecutar la prueba
testDatabaseConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});