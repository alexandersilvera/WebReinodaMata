/**
 * Componente de filtros para eventos académicos
 */
import { useState } from 'react';
import type { AcademicEvent } from '@/features/research/types';

interface EventFiltersProps {
  onFilterChange: (filters: EventFilterState) => void;
  initialFilters?: EventFilterState;
}

export interface EventFilterState {
  type?: AcademicEvent['type'];
  isFree?: boolean;
  isOnline?: boolean;
  dateRange?: 'upcoming' | 'thisMonth' | 'thisYear';
}

const eventTypes: { value: AcademicEvent['type']; label: string }[] = [
  { value: 'workshop', label: 'Talleres' },
  { value: 'seminar', label: 'Seminarios' },
  { value: 'conference', label: 'Conferencias' },
  { value: 'lecture', label: 'Charlas' },
  { value: 'course', label: 'Cursos' },
  { value: 'ceremony', label: 'Ceremonias' },
  { value: 'retreat', label: 'Retiros' },
];

export default function EventFilters({
  onFilterChange,
  initialFilters = {},
}: EventFiltersProps) {
  const [filters, setFilters] = useState<EventFilterState>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = <K extends keyof EventFilterState>(key: K, value: EventFilterState[K] | undefined | string) => {
    const newFilters = { ...filters };

    if (value === undefined || value === '') {
      delete newFilters[key];
    } else {
      newFilters[key] = value as EventFilterState[K];
    }

    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* Header con botón para mostrar/ocultar en mobile */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
              clipRule="evenodd"
            />
          </svg>
          Filtros
          {activeFiltersCount > 0 && (
            <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </h3>

        {/* Botón toggle para mobile */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-blue-600 font-medium text-sm"
        >
          {isOpen ? 'Ocultar' : 'Mostrar'}
        </button>

        {/* Botón limpiar filtros */}
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="hidden md:block text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${isOpen ? 'block' : 'hidden md:grid'}`}>
        {/* Tipo de evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de evento
          </label>
          <select
            value={filters.type || ''}
            onChange={(e) => updateFilter('type', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio
          </label>
          <select
            value={
              filters.isFree === undefined
                ? ''
                : filters.isFree
                  ? 'free'
                  : 'paid'
            }
            onChange={(e) => {
              if (e.target.value === 'free') {
                updateFilter('isFree', true);
              } else if (e.target.value === 'paid') {
                updateFilter('isFree', false);
              } else {
                updateFilter('isFree', undefined);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="free">Gratuitos</option>
            <option value="paid">De pago</option>
          </select>
        </div>

        {/* Modalidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidad
          </label>
          <select
            value={
              filters.isOnline === undefined
                ? ''
                : filters.isOnline
                  ? 'online'
                  : 'presential'
            }
            onChange={(e) => {
              if (e.target.value === 'online') {
                updateFilter('isOnline', true);
              } else if (e.target.value === 'presential') {
                updateFilter('isOnline', false);
              } else {
                updateFilter('isOnline', undefined);
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="online">Online</option>
            <option value="presential">Presencial</option>
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período
          </label>
          <select
            value={filters.dateRange || ''}
            onChange={(e) =>
              updateFilter('dateRange', e.target.value || undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="upcoming">Próximos</option>
            <option value="thisMonth">Este mes</option>
            <option value="thisYear">Este año</option>
          </select>
        </div>
      </div>

      {/* Botón limpiar en mobile */}
      {activeFiltersCount > 0 && isOpen && (
        <div className="mt-4 md:hidden">
          <button
            onClick={clearFilters}
            className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
