/**
 * Hook para gestionar suscripciones del usuario
 */

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/core/firebase/config';
import type { Subscription, SubscriptionPlan, SubscriptionPlanType } from '../types';
import { SubscriptionService } from '../services/subscriptionService';
import { PlanService } from '../services/planService';
import { AccessControl } from '../services/accessControl';

export function useSubscription() {
  const [user, loadingAuth] = useAuthState(auth);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loadingAuth) return;

    if (!user) {
      setSubscription(null);
      setPlan(null);
      setLoading(false);
      return;
    }

    loadSubscription();
  }, [user, loadingAuth]);

  const loadSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Obtener suscripción del usuario
      const userSubscription = await SubscriptionService.getUserSubscription(user.uid);
      setSubscription(userSubscription);

      // Obtener plan asociado
      if (userSubscription) {
        const userPlan = await PlanService.getPlanById(userSubscription.planId);
        setPlan(userPlan);
      } else {
        // Usuario sin suscripción, obtener plan gratuito
        const freePlan = await PlanService.getPlanByType('free');
        setPlan(freePlan);
      }
    } catch (err) {
      console.error('Error loading subscription:', err);
      setError('No se pudo cargar la suscripción');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    return subscription !== null && subscription.status === 'active';
  };

  const getPlanType = (): SubscriptionPlanType => {
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    return subscription.planType;
  };

  const canAccessFeature = async (feature: string): Promise<boolean> => {
    if (!user) return false;

    const planType = getPlanType();
    const benefits = PlanService.getPlanBenefits(planType);

    switch (feature) {
      case 'premium_papers':
        return benefits.canAccessPremiumPapers;
      case 'events':
        return benefits.canRegisterToEvents;
      case 'projects':
        return benefits.canParticipateInProjects;
      case 'certificates':
        return benefits.canGetCertificates;
      case 'mentorship':
        return benefits.canAccessMentorship;
      default:
        return false;
    }
  };

  const getDaysRemaining = (): number | null => {
    if (!subscription || subscription.status !== 'active') {
      return null;
    }

    const now = new Date();
    const endDate = new Date(subscription.currentPeriodEnd);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  const isTrialing = (): boolean => {
    if (!subscription) return false;
    return subscription.status === 'trial';
  };

  const isCanceled = (): boolean => {
    if (!subscription) return false;
    return subscription.cancelAtPeriodEnd;
  };

  const needsUpgrade = (requiredPlan: SubscriptionPlanType): boolean => {
    const currentPlan = getPlanType();
    return AccessControl.needsUpgrade(currentPlan, requiredPlan);
  };

  const getUpgradeMessage = (feature: string): string => {
    const currentPlan = getPlanType();
    return AccessControl.getUpgradeMessage(currentPlan, feature);
  };

  return {
    // Estados
    subscription,
    plan,
    loading: loading || loadingAuth,
    error,

    // Funciones de verificación
    hasActiveSubscription,
    getPlanType,
    canAccessFeature,
    getDaysRemaining,
    isTrialing,
    isCanceled,
    needsUpgrade,
    getUpgradeMessage,

    // Función para recargar
    refresh: loadSubscription,
  };
}

/**
 * Hook simplificado para verificar acceso rápido
 */
export function useSubscriptionAccess() {
  const { getPlanType, loading } = useSubscription();

  const hasAccess = (requiredLevel: SubscriptionPlanType): boolean => {
    if (loading) return false;
    const currentLevel = getPlanType();
    return AccessControl.hasAccessLevel(currentLevel, requiredLevel);
  };

  return {
    loading,
    hasAccess,
    isPremium: hasAccess('colaborador'),
    isInvestigator: hasAccess('investigador'),
    isInstitution: hasAccess('institucion'),
  };
}
