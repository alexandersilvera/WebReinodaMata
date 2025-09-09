/**
 * Script para migrar administradores existentes al nuevo sistema RBAC
 * Ejecutar una sola vez para migrar del sistema anterior
 */

import { config } from '@/core/config';
import RBACService from '../roles/rbacService';
import { AdminRole } from '../roles/types';
import { syncLogger } from '../services/logger';

interface MigrationResult {
  success: boolean;
  migratedUsers: string[];
  errors: Array<{ email: string; error: string }>;
  skippedUsers: string[];
}

export async function migrateAdminRoles(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    migratedUsers: [],
    errors: [],
    skippedUsers: []
  };

  try {
    syncLogger.info('Starting admin roles migration');

    // Obtener lista de admins de la configuración actual
    const adminEmails = config.admin.emails || [];
    
    if (adminEmails.length === 0) {
      syncLogger.warn('No admin emails found in configuration');
      return result;
    }

    syncLogger.info(`Found ${adminEmails.length} admin emails to migrate`);

    // Migrar cada admin
    for (const email of adminEmails) {
      try {
        // Verificar si ya tiene un rol asignado
        const existingRole = await RBACService.getUserRole(email);
        
        if (existingRole) {
          syncLogger.info(`User ${email} already has role: ${existingRole.role}`);
          result.skippedUsers.push(email);
          continue;
        }

        // Asignar rol de SUPER_ADMIN a todos los admins existentes
        await RBACService.assignRole(
          email,
          AdminRole.SUPER_ADMIN,
          'system_migration'
        );

        result.migratedUsers.push(email);
        syncLogger.info(`Successfully migrated ${email} to SUPER_ADMIN role`);

      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error';
        result.errors.push({ email, error: errorMessage });
        result.success = false;
        syncLogger.error(`Failed to migrate ${email}`, { error });
      }
    }

    const summary = {
      total: adminEmails.length,
      migrated: result.migratedUsers.length,
      skipped: result.skippedUsers.length,
      errors: result.errors.length
    };

    syncLogger.info('Migration completed', summary);
    console.log('📊 Migration Summary:', summary);

    if (result.migratedUsers.length > 0) {
      console.log('✅ Migrated users:', result.migratedUsers);
    }

    if (result.skippedUsers.length > 0) {
      console.log('⏭️  Skipped users (already had roles):', result.skippedUsers);
    }

    if (result.errors.length > 0) {
      console.log('❌ Errors:', result.errors);
    }

    return result;

  } catch (error: any) {
    syncLogger.error('Migration process failed', { error });
    result.success = false;
    result.errors.push({ email: 'system', error: error.message });
    return result;
  }
}

/**
 * Función para verificar el estado de la migración
 */
export async function checkMigrationStatus(): Promise<{
  configAdmins: string[];
  migratedAdmins: string[];
  needsMigration: string[];
}> {
  const configAdmins = config.admin.emails || [];
  const migratedAdmins: string[] = [];
  const needsMigration: string[] = [];

  for (const email of configAdmins) {
    try {
      const role = await RBACService.getUserRole(email);
      if (role) {
        migratedAdmins.push(email);
      } else {
        needsMigration.push(email);
      }
    } catch (error) {
      needsMigration.push(email);
    }
  }

  return {
    configAdmins,
    migratedAdmins,
    needsMigration
  };
}

/**
 * Función para ejecutar la migración desde la consola del navegador
 * Usar: window.migrateAdminRoles()
 */
if (typeof window !== 'undefined') {
  (window as any).migrateAdminRoles = async () => {
    console.log('🚀 Starting admin roles migration...');
    const result = await migrateAdminRoles();
    
    if (result.success) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with errors. Check the logs.');
    }
    
    return result;
  };

  (window as any).checkMigrationStatus = async () => {
    console.log('🔍 Checking migration status...');
    const status = await checkMigrationStatus();
    
    console.log('📊 Migration Status:', {
      'Total config admins': status.configAdmins.length,
      'Already migrated': status.migratedAdmins.length,
      'Need migration': status.needsMigration.length
    });
    
    if (status.needsMigration.length > 0) {
      console.log('⚠️  Users that need migration:', status.needsMigration);
      console.log('💡 Run migrateAdminRoles() to migrate them.');
    } else {
      console.log('✅ All users are migrated!');
    }
    
    return status;
  };

  console.log('🛠️  Admin migration tools loaded. Available commands:');
  console.log('   - migrateAdminRoles(): Migrate all admin users');
  console.log('   - checkMigrationStatus(): Check migration status');
}