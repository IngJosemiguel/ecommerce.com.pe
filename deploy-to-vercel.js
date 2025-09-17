#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando despliegue en Vercel...');

// Verificar que existe vercel.json
if (!fs.existsSync('vercel.json')) {
  console.error('❌ No se encontró vercel.json. Asegúrate de estar en el directorio raíz del proyecto.');
  process.exit(1);
}

// Verificar que existe .env.example
if (!fs.existsSync('.env.example')) {
  console.error('❌ No se encontró .env.example. Este archivo es necesario como referencia.');
  process.exit(1);
}

try {
  console.log('📦 Instalando dependencias del frontend...');
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  
  console.log('📦 Instalando dependencias del backend...');
  execSync('cd backend && npm install', { stdio: 'inherit' });
  
  console.log('🔨 Construyendo el frontend...');
  execSync('cd frontend && npm run build', { stdio: 'inherit' });
  
  console.log('✅ Proyecto preparado para Vercel!');
  console.log('');
  console.log('📋 Próximos pasos:');
  console.log('1. Sube tu código a GitHub/GitLab/Bitbucket');
  console.log('2. Ve a https://vercel.com y crea un nuevo proyecto');
  console.log('3. Conecta tu repositorio');
  console.log('4. Configura las variables de entorno (ver .env.example)');
  console.log('5. ¡Despliega!');
  console.log('');
  console.log('📖 Para más detalles, consulta VERCEL_DEPLOYMENT.md');
  
} catch (error) {
  console.error('❌ Error durante la preparación:', error.message);
  process.exit(1);
}