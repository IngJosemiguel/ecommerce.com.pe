const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando proceso de construcción y despliegue...');

try {
  // Cambiar al directorio del frontend
  const frontendDir = path.join(__dirname, 'frontend');
  console.log('📦 Construyendo el frontend...');
  
  // Ejecutar npm run build en el frontend
  execSync('npm run build', { 
    cwd: frontendDir, 
    stdio: 'inherit' 
  });
  
  console.log('✅ Frontend construido exitosamente');
  
  // Verificar que la carpeta dist existe
  const distDir = path.join(frontendDir, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('La carpeta dist no fue creada');
  }
  
  console.log('📁 Archivos estáticos listos en:', distDir);
  
  // Cambiar al directorio del backend
  const backendDir = path.join(__dirname, 'backend');
  console.log('🔧 Iniciando servidor backend...');
  
  // Ejecutar el servidor backend
  execSync('npm start', { 
    cwd: backendDir, 
    stdio: 'inherit' 
  });
  
} catch (error) {
  console.error('❌ Error durante el proceso:', error.message);
  process.exit(1);
}