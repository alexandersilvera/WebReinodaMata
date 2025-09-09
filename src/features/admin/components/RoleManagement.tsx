/**
 * Componente para gestión de roles de usuario
 * Permite asignar, modificar y revocar roles
 */

import React, { useState, useEffect } from 'react';
import { useRBAC } from '../hooks/useRBAC';
import RBACService from '../roles/rbacService';
import { AdminCard, LoadingSpinner } from './ui';
import type { UserRole, AdminRole } from '../roles/types';
import { ROLE_DEFINITIONS } from '../roles/types';

interface RoleManagementProps {
  className?: string;
}

interface RoleAssignmentForm {
  email: string;
  role: AdminRole;
  expiresAt?: string;
}

export const RoleManagement: React.FC<RoleManagementProps> = ({ className = '' }) => {
  const rbac = useRBAC();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignForm, setAssignForm] = useState<RoleAssignmentForm>({
    email: '',
    role: 'content_manager' as AdminRole
  });
  const [assignLoading, setAssignLoading] = useState(false);

  // Verificar si el usuario actual puede gestionar roles
  if (!rbac.canManageRoles) {
    return (
      <AdminCard title="Gestión de Roles" className={className}>
        <div className="text-center py-8">
          <div className="text-yellow-400 text-4xl mb-2">⚠️</div>
          <p className="text-gray-300">
            No tienes permisos para gestionar roles de usuario.
          </p>
        </div>
      </AdminCard>
    );
  }

  // Cargar roles existentes
  const loadUserRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const roles = await RBACService.getAllUserRoles();
      setUserRoles(roles);
    } catch (err: any) {
      setError(err.message || 'Error al cargar roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserRoles();
  }, []);

  // Asignar nuevo rol
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignForm.email || !assignForm.role) {
      setError('Email y rol son requeridos');
      return;
    }

    try {
      setAssignLoading(true);
      setError(null);

      const expiresAt = assignForm.expiresAt ? new Date(assignForm.expiresAt) : undefined;
      
      await RBACService.assignRole(
        assignForm.email.toLowerCase().trim(),
        assignForm.role,
        rbac.userRole?.email || 'unknown',
        expiresAt
      );

      // Resetear formulario
      setAssignForm({
        email: '',
        role: 'content_manager' as AdminRole,
        expiresAt: undefined
      });
      setShowAssignForm(false);

      // Recargar lista
      await loadUserRoles();
      
    } catch (err: any) {
      setError(err.message || 'Error al asignar rol');
    } finally {
      setAssignLoading(false);
    }
  };

  // Revocar rol
  const handleRevokeRole = async (email: string) => {
    if (!confirm(`¿Estás seguro de que quieres revocar el rol de ${email}?`)) {
      return;
    }

    try {
      await RBACService.revokeRole(email, rbac.userRole?.email || 'unknown');
      await loadUserRoles();
    } catch (err: any) {
      setError(err.message || 'Error al revocar rol');
    }
  };

  // Actualizar rol
  const handleUpdateRole = async (email: string, newRole: AdminRole) => {
    try {
      await RBACService.updateRole(
        email,
        { role: newRole },
        rbac.userRole?.email || 'unknown'
      );
      await loadUserRoles();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar rol');
    }
  };

  // Obtener roles que puede asignar el usuario actual
  const getAssignableRoles = (): AdminRole[] => {
    if (!rbac.userRole) return [];
    
    return Object.values(ROLE_DEFINITIONS)
      .filter(roleDef => rbac.canManageRole(roleDef.role))
      .map(roleDef => roleDef.role);
  };

  const assignableRoles = getAssignableRoles();

  return (
    <AdminCard title="Gestión de Roles" className={className}>
      {error && (
        <div className="bg-red-900/30 border border-red-600/30 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-300 text-xs mt-1"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Botón para mostrar formulario de asignación */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-white">
          Usuarios con Roles Administrativos
        </h3>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
        >
          {showAssignForm ? 'Cancelar' : '+ Asignar Rol'}
        </button>
      </div>

      {/* Formulario de asignación */}
      {showAssignForm && (
        <form onSubmit={handleAssignRole} className="bg-green-900/20 border border-green-600/30 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium mb-3">Asignar Nuevo Rol</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Email del Usuario
              </label>
              <input
                type="email"
                value={assignForm.email}
                onChange={(e) => setAssignForm({ ...assignForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Rol
              </label>
              <select
                value={assignForm.role}
                onChange={(e) => setAssignForm({ ...assignForm, role: e.target.value as AdminRole })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              >
                {assignableRoles.map(role => {
                  const roleDef = ROLE_DEFINITIONS[role];
                  return (
                    <option key={role} value={role}>
                      {roleDef.name}
                    </option>
                  );
                })}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Fecha de Expiración (Opcional)
              </label>
              <input
                type="datetime-local"
                value={assignForm.expiresAt || ''}
                onChange={(e) => setAssignForm({ ...assignForm, expiresAt: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={assignLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded text-sm transition-colors"
            >
              {assignLoading ? 'Asignando...' : 'Asignar Rol'}
            </button>
            <button
              type="button"
              onClick={() => setShowAssignForm(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Lista de usuarios con roles */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className="space-y-3">
          {userRoles.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No hay usuarios con roles asignados.
            </p>
          ) : (
            userRoles.map((userRole) => {
              const roleDef = ROLE_DEFINITIONS[userRole.role];
              const canManageThisRole = rbac.canManageRole(userRole.role);
              const isCurrentUser = userRole.email === rbac.userRole?.email;
              
              return (
                <div
                  key={userRole.email}
                  className="bg-gray-800/50 border border-gray-600/30 rounded-lg p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-white font-medium">{userRole.email}</h4>
                        {isCurrentUser && (
                          <span className="px-2 py-1 bg-blue-600/30 text-blue-300 text-xs rounded">
                            Tú
                          </span>
                        )}
                        {!userRole.isActive && (
                          <span className="px-2 py-1 bg-red-600/30 text-red-300 text-xs rounded">
                            Inactivo
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className={`px-2 py-1 rounded text-white ${roleDef?.color === 'red' ? 'bg-red-600' : roleDef?.color === 'blue' ? 'bg-blue-600' : roleDef?.color === 'green' ? 'bg-green-600' : roleDef?.color === 'purple' ? 'bg-purple-600' : 'bg-gray-600'}`}>
                          {roleDef?.name || userRole.role}
                        </span>
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded">
                          Nivel {roleDef?.level || 0}
                        </span>
                      </div>
                      
                      <p className="text-gray-400 text-xs mt-1">
                        Asignado: {userRole.assignedAt.toLocaleString?.() || 'Fecha desconocida'}
                        {userRole.expiresAt && (
                          <> • Expira: {userRole.expiresAt.toLocaleString?.()}</>
                        )}
                      </p>
                    </div>
                    
                    {canManageThisRole && !isCurrentUser && (
                      <div className="flex gap-2">
                        <select
                          value={userRole.role}
                          onChange={(e) => handleUpdateRole(userRole.email, e.target.value as AdminRole)}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        >
                          {assignableRoles.map(role => {
                            const roleDef = ROLE_DEFINITIONS[role];
                            return (
                              <option key={role} value={role}>
                                {roleDef.name}
                              </option>
                            );
                          })}
                        </select>
                        
                        <button
                          onClick={() => handleRevokeRole(userRole.email)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
                        >
                          Revocar
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {roleDef?.description && (
                    <p className="text-gray-400 text-xs mt-2 italic">
                      {roleDef.description}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Botón de recarga */}
      <div className="flex justify-center mt-6">
        <button
          onClick={loadUserRoles}
          disabled={loading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded text-sm transition-colors"
        >
          {loading ? 'Cargando...' : 'Actualizar Lista'}
        </button>
      </div>
    </AdminCard>
  );
};

export default RoleManagement;