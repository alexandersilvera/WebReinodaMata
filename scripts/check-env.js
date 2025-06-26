#!/usr/bin/env node

/**
 * Script para validar variables de entorno críticas
 */

const required = [
  'PUBLIC_FIREBASE_API_KEY',
  'PUBLIC_FIREBASE_PROJECT_ID', 
  'PUBLIC_FIREBASE_AUTH_DOMAIN',
  'PUBLIC_ADMIN_EMAILS'
];

const optional = [
  'PUBLIC_SITE_URL',
  'PUBLIC_FIREBASE_MEASUREMENT_ID'
];

console.log('🔍 Validando variables de entorno...\n');

const missing = required.filter(key => !process.env[key]);
const present = required.filter(key => process.env[key]);

// Mostrar variables presentes
if (present.length > 0) {
  console.log('✅ Variables requeridas presentes:');
  present.forEach(key => {
    const value = process.env[key];
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`   ${key} = ${preview}`);
  });
  console.log('');
}

// Mostrar variables faltantes
if (missing.length > 0) {
  console.log('❌ Variables requeridas faltantes:');
  missing.forEach(key => console.log(`   ${key}`));
  console.log('');
  
  console.log('💡 Para arreglar esto:');
  console.log('   1. Copia .env.example a .env');
  console.log('   2. Completa las variables faltantes con tus valores reales');
  console.log('');
  
  process.exit(1);
}

// Mostrar variables opcionales
console.log('ℹ️  Variables opcionales:');
optional.forEach(key => {
  const value = process.env[key];
  if (value) {
    const preview = value.length > 20 ? value.substring(0, 20) + '...' : value;
    console.log(`   ✅ ${key} = ${preview}`);
  } else {
    console.log(`   ⚠️  ${key} = (no definida)`);
  }
});

console.log('\n✅ Validación de variables de entorno completada exitosamente!');