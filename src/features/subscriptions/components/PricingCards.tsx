/**
 * Componente de tarjetas de precios para planes de suscripción
 */

import { useState, useEffect } from 'react';
import type { SubscriptionPlan, BillingPeriod } from '../types';
import { PlanService } from '../services/planService';

interface PricingCardsProps {
  onSelectPlan?: (planId: string, billingPeriod: BillingPeriod) => void;
  currentPlanType?: string;
  showFree?: boolean;
}

export function PricingCards({
  onSelectPlan,
  currentPlanType,
  showFree = true,
}: PricingCardsProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const activePlans = await PlanService.getActivePlans();

      // Filtrar plan free si no se debe mostrar
      const filteredPlans = showFree
        ? activePlans
        : activePlans.filter(p => p.type !== 'free');

      setPlans(filteredPlans);
    } catch (err) {
      setError('No se pudieron cargar los planes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency: 'UYU',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
  };

  const getPricePerMonth = (plan: SubscriptionPlan) => {
    if (billingPeriod === 'monthly') {
      return plan.price.monthly;
    }
    return Math.round(plan.price.yearly / 12);
  };

  const getSavings = (plan: SubscriptionPlan) => {
    if (billingPeriod === 'yearly') {
      const monthlyTotal = plan.price.monthly * 12;
      const savings = monthlyTotal - plan.price.yearly;
      return savings > 0 ? savings : 0;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={loadPlans}
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Toggle de período de facturación */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
              billingPeriod === 'yearly'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            Anual
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>
      </div>

      {/* Grid de planes */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-xl border-2 p-6 flex flex-col ${
              plan.isPopular
                ? 'border-blue-700 shadow-xl scale-105'
                : 'border-gray-200 shadow-md'
            } ${currentPlanType === plan.type ? 'bg-blue-50' : 'bg-white'}`}
          >
            {/* Badge de popular */}
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  MÁS POPULAR
                </span>
              </div>
            )}

            {/* Badge de plan actual */}
            {currentPlanType === plan.type && (
              <div className="absolute top-4 right-4">
                <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
                  Plan Actual
                </span>
              </div>
            )}

            {/* Nombre del plan */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

            {/* Precio */}
            <div className="mb-6">
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  {plan.type === 'free' ? 'Gratis' : formatPrice(getPricePerMonth(plan))}
                </span>
                {plan.type !== 'free' && (
                  <span className="text-gray-600 ml-2">/mes</span>
                )}
              </div>
              {billingPeriod === 'yearly' && plan.type !== 'free' && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Facturado anualmente: {formatPrice(getPrice(plan))}
                  </p>
                  {getSavings(plan) > 0 && (
                    <p className="text-sm text-green-600 font-medium">
                      Ahorras {formatPrice(getSavings(plan))} al año
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Features destacadas */}
            <div className="mb-6 flex-grow">
              <ul className="space-y-3">
                {plan.highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 text-sm">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Botón de acción */}
            <button
              onClick={() => onSelectPlan?.(plan.id, billingPeriod)}
              disabled={currentPlanType === plan.type}
              className={`w-full py-3 px-6 rounded-lg font-medium transition-all ${
                plan.isPopular
                  ? 'bg-blue-700 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                  : 'bg-white border-2 border-blue-700 text-blue-700 hover:bg-blue-50'
              } ${
                currentPlanType === plan.type
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:transform hover:scale-105'
              }`}
            >
              {currentPlanType === plan.type
                ? 'Plan Actual'
                : plan.type === 'free'
                ? 'Comenzar Gratis'
                : 'Seleccionar Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-12 text-center">
        <p className="text-gray-600 mb-4">
          Todos los planes incluyen acceso al blog y recursos educativos básicos
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <a href="#" className="text-blue-700 hover:underline">
            Comparar todos los planes
          </a>
          <span className="text-gray-400">|</span>
          <a href="#" className="text-blue-700 hover:underline">
            Preguntas frecuentes
          </a>
          <span className="text-gray-400">|</span>
          <a href="/contacto" className="text-blue-700 hover:underline">
            ¿Necesitas ayuda?
          </a>
        </div>
      </div>
    </div>
  );
}
