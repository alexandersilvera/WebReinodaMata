import React, { useState, useEffect } from 'react';
import { auth, onAuthStateChanged } from '@/core/firebase/config';
import { 
  getAllSubscribers, 
  subscribeToSubscribers, 
  updateSubscriberStatus, 
  deleteSubscriber,
  type Subscriber 
} from '@/features/newsletter/subscriberService';

interface SubscribersManagerProps {
  isAdmin: boolean;
}

const SubscribersManager: React.FC<SubscribersManagerProps> = ({ isAdmin }) => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Función para formatear fecha
  const formatDate = (timestamp: any) => {
    try {
      if (!timestamp) return "Fecha no disponible";
      
      let date: Date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        date = new Date(timestamp.seconds * 1000);
      } else {
        date = new Date(timestamp);
      }
      
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error("Error al formatear fecha:", error, "Input:", timestamp);
      return "Error de formato";
    }
  };

  // Función para obtener color de fuente
  const getSourceColor = (source: string) => {
    const colors = {
      'web': 'bg-blue-600',
      'auth_sync': 'bg-purple-600',
      'auth_auto': 'bg-green-600',
      'auth_trigger': 'bg-indigo-600',
      'auth_trigger_v2': 'bg-teal-600',
      'manual': 'bg-gray-600'
    };
    return colors[source] || 'bg-gray-600';
  };

  // Función para obtener etiqueta de fuente
  const getSourceLabel = (source: string) => {
    const labels = {
      'web': 'Web',
      'auth_sync': 'Auth (Sync)',
      'auth_auto': 'Auth (Auto)',
      'auth_trigger': 'Auth Trigger',
      'auth_trigger_v2': 'Auth Trigger v2',
      'manual': 'Manual'
    };
    return labels[source] || 'Desconocido';
  };

  // Función para cambiar estado de suscriptor
  const toggleSubscriberStatus = async (subscriberId: string, currentStatus: boolean) => {
    try {
      await updateSubscriberStatus(subscriberId, !currentStatus);
      console.log('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del suscriptor');
    }
  };

  // Función para eliminar suscriptor
  const deleteSubscriberConfirm = async (subscriberId: string, email: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al suscriptor ${email}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteSubscriber(subscriberId);
        console.log('Suscriptor eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el suscriptor');
      }
    }
  };

  // Configurar listener en tiempo real
  useEffect(() => {
    if (!isAdmin) return;

    console.log('🔄 Configurando listener para suscriptores...');
    
    const unsubscribe = subscribeToSubscribers((updatedSubscribers) => {
      console.log(`📊 Recibidos ${updatedSubscribers.length} suscriptores`);
      setSubscribers(updatedSubscribers);
      setLoading(false);
      setError('');
    });

    // Cleanup
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAdmin]);

  // Verificar si el usuario no es admin
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">Acceso denegado. Solo administradores pueden ver esta página.</p>
      </div>
    );
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-green-600 rounded-full"></div>
        <p className="text-green-300 mt-2">Cargando suscriptores...</p>
      </div>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  // Mostrar sin suscriptores
  if (subscribers.length === 0) {
    return (
      <div className="text-center py-10">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        </div>
        <p className="text-xl text-green-300">No hay suscriptores registrados</p>
        <p className="text-green-200 text-sm mt-2">Los nuevos suscriptores aparecerán aquí automáticamente</p>
      </div>
    );
  }

  // Renderizar tabla de suscriptores
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-green-700">
        <thead className="bg-green-800/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Fuente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Fecha de suscripción</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-green-300 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-green-900/20 divide-y divide-green-800">
          {subscribers.map((subscriber) => {
            const displayName = subscriber.name || 
              `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim() || 
              'Sin nombre';
              
            return (
              <tr key={subscriber.id} className="hover:bg-green-800/30">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{displayName}</div>
                  {subscriber.authUid && <div className="text-xs text-green-400">Usuario Auth</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-200">{subscriber.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSourceColor(subscriber.source || 'unknown')} text-white`}>
                    {getSourceLabel(subscriber.source || 'unknown')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-200">{formatDate(subscriber.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subscriber.active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {subscriber.active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.active)}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    {subscriber.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button 
                    onClick={() => deleteSubscriberConfirm(subscriber.id, subscriber.email)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubscribersManager;