// Test script para verificar configuración de administradores
import { config, configUtils } from './src/core/config/index.ts';

console.log('🔍 Testing Admin Configuration');
console.log('================================');

// Mostrar configuración actual
console.log('📧 Admin emails configurados:');
config.admin.emails.forEach((email, index) => {
  console.log(`  ${index + 1}. ${email}`);
});

console.log('\n🧪 Testing isAdminEmail function:');
const testEmails = [
  'alexandersilvera@hotmail.com',
  'ALEXANDERSILVERA@HOTMAIL.COM', // Case sensitivity test
  'admin@centroumbandistareinodamata.org',
  'user@example.com' // Should be false
];

testEmails.forEach(email => {
  const isAdmin = configUtils.isAdminEmail(email);
  console.log(`  ${email} -> ${isAdmin ? '✅ Admin' : '❌ Not Admin'}`);
});

console.log('\n🌍 Environment info:');
console.log('  Environment:', config.app.environment);
console.log('  Site URL:', config.app.siteUrl);
console.log('  Firebase Project ID:', config.firebase.projectId);

console.log('\n✅ Configuration test completed');