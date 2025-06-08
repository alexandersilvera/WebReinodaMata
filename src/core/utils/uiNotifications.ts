/**
 * Muestra un mensaje de UI al usuario.
 * @param message El mensaje a mostrar.
 * @param type El tipo de mensaje ('success', 'error', 'info').
 * @param targetElementId El ID del elemento HTML donde se mostrará el mensaje.
 * @param duration La duración en milisegundos antes de que el mensaje se oculte.
 */
export function showUIMessage(
  message: string,
  type: 'success' | 'error' | 'info' = 'info',
  targetElementId: string = 'status-message', // ID por defecto del elemento de estado
  duration: number = 5000
): void {
  const statusElement = document.getElementById(targetElementId);

  if (!statusElement) {
    console.warn(`[showUIMessage] Elemento con ID '${targetElementId}' no encontrado.`);
    return;
  }

  // Establecer el mensaje directamente en el elemento contenedor.
  // Si hay un span hijo específico para el texto (ej: #status-text), se podría usar,
  // pero para simplicidad, el mensaje se pone en el contenedor principal.
  statusElement.textContent = message;

  // Limpiar clases de tipo previas y añadir las nuevas
  statusElement.classList.remove(
    'bg-blue-600/80', 'text-white', // Clases base para info (pueden variar)
    'bg-green-600/80', // Clases para success
    'bg-red-600/80'    // Clases para error
    // Asegúrate de que 'text-white', 'p-4', 'rounded-md' sean clases base en el HTML o añádelas aquí
  );

  // Aplicar clases base si no están en el HTML permanentemente
  statusElement.classList.add('p-4', 'rounded-md', 'text-white'); // Clases comunes

  switch (type) {
    case 'success':
      statusElement.classList.add('bg-green-600/80');
      break;
    case 'error':
      statusElement.classList.add('bg-red-600/80');
      break;
    case 'info':
    default:
      statusElement.classList.add('bg-blue-600/80');
      break;
  }

  statusElement.classList.remove('hidden');

  // Ocultar el mensaje después de la duración especificada
  setTimeout(() => {
    statusElement.classList.add('hidden');
    // Opcional: Limpiar el texto y las clases de tipo después de ocultar
    // statusElement.textContent = '';
    // statusElement.classList.remove('bg-green-600/80', 'bg-red-600/80', 'bg-blue-600/80');
  }, duration);
}
