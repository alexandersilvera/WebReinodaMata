#!/usr/bin/env node

/**
 * Script de verificación de seguridad para WebReinodaMata
 * Verifica que no haya credenciales hardcodeadas ni vulnerabilidades comunes
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Patrones peligrosos a buscar
const dangerousPatterns = [
  {
    pattern: /key-[a-f0-9]{32}/gi,
    description: 'Posible API key de Mailgun hardcodeada',
    severity: 'CRÍTICO'
  },
  {
    pattern: /alexandersilvera@hotmail\.com/gi,
    description: 'Email de administrador hardcodeado',
    severity: 'ALTO'
  },
  {
    pattern: /password\s*[:=]\s*['"][^'"]{3,}/gi,
    description: 'Posible contraseña hardcodeada',
    severity: 'CRÍTICO'
  },
  {
    pattern: /secret\s*[:=]\s*['"][^'"]{10,}/gi,
    description: 'Posible secreto hardcodeado',
    severity: 'CRÍTICO'
  },
  {
    pattern: /token\s*[:=]\s*['"][^'"]{20,}/gi,
    description: 'Posible token hardcodeado',
    severity: 'ALTO'
  },
  {
    pattern: /sk_[a-zA-Z0-9]{20,}/gi,
    description: 'Posible Stripe secret key',
    severity: 'CRÍTICO'
  },
  {
    pattern: /AKIA[0-9A-Z]{16}/gi,
    description: 'Posible AWS Access Key',
    severity: 'CRÍTICO'
  }
];

// Archivos a ignorar
const ignoredFiles = [
  '.git',
  'node_modules',
  'dist',
  '.astro',
  'functions/node_modules',
  'functions/lib',
  '.env.example',
  '.env.template',
  'scripts/verify-security.js'
];

// Extensiones de archivos a verificar
const allowedExtensions = ['.ts', '.js', '.tsx', '.jsx', '.astro', '.json', '.md'];

/**
 * Busca archivos recursivamente
 */
function findFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    // Saltar archivos/carpetas ignorados
    if (ignoredFiles.some(ignored => fullPath.includes(ignored))) {
      continue;
    }
    
    if (stat.isDirectory()) {
      findFiles(fullPath, files);
    } else if (allowedExtensions.some(ext => fullPath.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Verifica un archivo específico
 */
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  for (const { pattern, description, severity } of dangerousPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        file: filePath,
        pattern: pattern.toString(),
        description,
        severity,
        matches: matches.slice(0, 3) // Máximo 3 matches para no hacer spam
      });
    }
  }
  
  return issues;
}

/**
 * Verifica variables de entorno
 */
function checkEnvFiles() {
  const issues = [];
  const envFiles = ['.env', '.env.local', '.env.production'];
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      const content = fs.readFileSync(envFile, 'utf8');
      
      // Verificar que no contenga valores reales en .env (debería estar en .gitignore)
      if (envFile === '.env' && content.includes('=') && !content.includes('your-')) {
        issues.push({
          file: envFile,
          description: 'Archivo .env contiene valores reales (debería estar en .gitignore)',
          severity: 'CRÍTICO'
        });
      }
    }
  }
  
  return issues;
}

/**
 * Verifica que .gitignore esté configurado correctamente
 */
function checkGitignore() {
  const issues = [];
  
  if (!fs.existsSync('.gitignore')) {
    issues.push({
      file: '.gitignore',
      description: 'Archivo .gitignore no existe',
      severity: 'ALTO'
    });
    return issues;
  }
  
  const content = fs.readFileSync('.gitignore', 'utf8');
  const requiredPatterns = ['.env', '.env.local', 'node_modules', 'firebase-adminsdk-*.json'];
  
  for (const pattern of requiredPatterns) {
    if (!content.includes(pattern)) {
      issues.push({
        file: '.gitignore',
        description: `Patrón "${pattern}" no está en .gitignore`,
        severity: 'ALTO'
      });
    }
  }
  
  return issues;
}

/**
 * Verifica configuración de Firebase Functions
 */
function checkFirebaseConfig() {
  const issues = [];
  
  try {
    const result = execSync('firebase functions:config:get', { encoding: 'utf8' });
    const config = JSON.parse(result || '{}');
    
    if (!config.mailgun || !config.mailgun.api_key) {
      issues.push({
        file: 'firebase-config',
        description: 'Configuración de Mailgun API key no encontrada en Firebase Functions',
        severity: 'CRÍTICO'
      });
    }
    
    if (!config.admin_emails) {
      issues.push({
        file: 'firebase-config',
        description: 'Configuración de emails de admin no encontrada',
        severity: 'ALTO'
      });
    }
    
  } catch (error) {
    issues.push({
      file: 'firebase-config',
      description: 'No se pudo verificar la configuración de Firebase Functions',
      severity: 'MEDIO'
    });
  }
  
  return issues;
}

/**
 * Función principal
 */
function main() {
  console.log(`${colors.blue}${colors.bold}🔒 Verificación de Seguridad - WebReinodaMata${colors.reset}\n`);
  
  const allIssues = [];
  
  // 1. Buscar patrones peligrosos en archivos
  console.log('📁 Verificando archivos del proyecto...');
  const files = findFiles('.');
  
  for (const file of files) {
    const issues = checkFile(file);
    allIssues.push(...issues);
  }
  
  // 2. Verificar archivos de variables de entorno
  console.log('🌐 Verificando variables de entorno...');
  allIssues.push(...checkEnvFiles());
  
  // 3. Verificar .gitignore
  console.log('📝 Verificando .gitignore...');
  allIssues.push(...checkGitignore());
  
  // 4. Verificar configuración de Firebase
  console.log('🔥 Verificando configuración de Firebase...');
  allIssues.push(...checkFirebaseConfig());
  
  // Mostrar resultados
  console.log('\n' + '='.repeat(60));
  
  if (allIssues.length === 0) {
    console.log(`${colors.green}${colors.bold}✅ ¡Verificación de seguridad exitosa!${colors.reset}`);
    console.log(`${colors.green}No se encontraron problemas de seguridad.${colors.reset}`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bold}❌ Se encontraron ${allIssues.length} problemas de seguridad:${colors.reset}\n`);
    
    // Agrupar por severidad
    const critical = allIssues.filter(i => i.severity === 'CRÍTICO');
    const high = allIssues.filter(i => i.severity === 'ALTO');
    const medium = allIssues.filter(i => i.severity === 'MEDIO');
    
    if (critical.length > 0) {
      console.log(`${colors.red}${colors.bold}🚨 CRÍTICOS (${critical.length}):${colors.reset}`);
      critical.forEach(issue => {
        console.log(`  ${colors.red}● ${issue.description}${colors.reset}`);
        console.log(`    Archivo: ${issue.file}`);
        if (issue.matches) {
          console.log(`    Matches: ${issue.matches.join(', ')}`);
        }
        console.log('');
      });
    }
    
    if (high.length > 0) {
      console.log(`${colors.yellow}${colors.bold}⚠️  ALTOS (${high.length}):${colors.reset}`);
      high.forEach(issue => {
        console.log(`  ${colors.yellow}● ${issue.description}${colors.reset}`);
        console.log(`    Archivo: ${issue.file}`);
        console.log('');
      });
    }
    
    if (medium.length > 0) {
      console.log(`${colors.blue}${colors.bold}ℹ️  MEDIOS (${medium.length}):${colors.reset}`);
      medium.forEach(issue => {
        console.log(`  ${colors.blue}● ${issue.description}${colors.reset}`);
        console.log(`    Archivo: ${issue.file}`);
        console.log('');
      });
    }
    
    console.log(`${colors.red}${colors.bold}❌ Por favor, corrige estos problemas antes del despliegue.${colors.reset}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { main, checkFile, dangerousPatterns }; 