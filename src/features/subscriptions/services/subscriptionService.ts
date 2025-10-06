/**
 * Servicio para gestión de suscripciones de usuarios
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import type {
  Subscription,
  SubscriptionStatus,
  BillingPeriod,
  SubscriptionPlanType,
} from '../types';
import { PlanService } from './planService';

const SUBSCRIPTIONS_COLLECTION = 'subscriptions';

/**
 * Convertir timestamp de Firestore a Date
 */
function convertTimestamp(data: any): Subscription {
  return {
    ...data,
    currentPeriodStart: data.currentPeriodStart?.toDate?.() || new Date(data.currentPeriodStart),
    currentPeriodEnd: data.currentPeriodEnd?.toDate?.() || new Date(data.currentPeriodEnd),
    trialEnd: data.trialEnd?.toDate?.() || (data.trialEnd ? new Date(data.trialEnd) : undefined),
    canceledAt: data.canceledAt?.toDate?.() || (data.canceledAt ? new Date(data.canceledAt) : undefined),
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
  } as Subscription;
}

export class SubscriptionService {
  /**
   * Obtener la suscripción activa de un usuario
   */
  static async getUserSubscription(userId: string): Promise<Subscription | null> {
    try {
      const q = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where('userId', '==', userId),
        where('status', 'in', ['active', 'trial']),
        orderBy('createdAt', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return convertTimestamp({ id: doc.id, ...doc.data() });
      }

      return null;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      throw new Error('No se pudo obtener la suscripción del usuario');
    }
  }

  /**
   * Obtener todas las suscripciones de un usuario (incluyendo canceladas)
   */
  static async getUserSubscriptionHistory(userId: string): Promise<Subscription[]> {
    try {
      const q = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting user subscription history:', error);
      throw new Error('No se pudo obtener el historial de suscripciones');
    }
  }

  /**
   * Obtener suscripción por ID
   */
  static async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    try {
      const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertTimestamp({ id: docSnap.id, ...docSnap.data() });
      }
      return null;
    } catch (error) {
      console.error('Error getting subscription by ID:', error);
      throw new Error('No se pudo obtener la suscripción');
    }
  }

  /**
   * Crear una nueva suscripción
   */
  static async createSubscription(
    userId: string,
    planId: string,
    billingPeriod: BillingPeriod
  ): Promise<string> {
    try {
      const plan = await PlanService.getPlanById(planId);
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      const now = new Date();
      const periodEnd = new Date(now);

      if (billingPeriod === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const subscriptionData: Omit<Subscription, 'id'> = {
        userId,
        planId,
        planType: plan.type,
        status: 'pending',
        billingPeriod,
        paymentMethod: 'mercadopago',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
      };

      const docRef = await addDoc(collection(db, SUBSCRIPTIONS_COLLECTION), subscriptionData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw new Error('No se pudo crear la suscripción');
    }
  }

  /**
   * Actualizar estado de suscripción
   */
  static async updateSubscriptionStatus(
    subscriptionId: string,
    status: SubscriptionStatus,
    mercadoPagoData?: any
  ): Promise<void> {
    try {
      const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      const updateData: any = {
        status,
        updatedAt: new Date(),
      };

      if (mercadoPagoData) {
        updateData.mercadoPagoData = mercadoPagoData;
      }

      if (status === 'active' && mercadoPagoData?.lastPaymentId) {
        updateData['mercadoPagoData.lastPaymentId'] = mercadoPagoData.lastPaymentId;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new Error('No se pudo actualizar el estado de la suscripción');
    }
  }

  /**
   * Cancelar suscripción (al final del período)
   */
  static async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      await updateDoc(docRef, {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        cancelReason: reason || '',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('No se pudo cancelar la suscripción');
    }
  }

  /**
   * Reactivar suscripción cancelada
   */
  static async reactivateSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error('Suscripción no encontrada');
      }

      if (new Date() > subscription.currentPeriodEnd) {
        throw new Error('El período de suscripción ha expirado');
      }

      const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      await updateDoc(docRef, {
        cancelAtPeriodEnd: false,
        canceledAt: null,
        cancelReason: null,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw new Error('No se pudo reactivar la suscripción');
    }
  }

  /**
   * Renovar suscripción
   */
  static async renewSubscription(subscriptionId: string): Promise<void> {
    try {
      const subscription = await this.getSubscriptionById(subscriptionId);
      if (!subscription) {
        throw new Error('Suscripción no encontrada');
      }

      const newPeriodStart = subscription.currentPeriodEnd;
      const newPeriodEnd = new Date(newPeriodStart);

      if (subscription.billingPeriod === 'monthly') {
        newPeriodEnd.setMonth(newPeriodEnd.getMonth() + 1);
      } else {
        newPeriodEnd.setFullYear(newPeriodEnd.getFullYear() + 1);
      }

      const docRef = doc(db, SUBSCRIPTIONS_COLLECTION, subscriptionId);
      await updateDoc(docRef, {
        currentPeriodStart: newPeriodStart,
        currentPeriodEnd: newPeriodEnd,
        status: 'active',
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error renewing subscription:', error);
      throw new Error('No se pudo renovar la suscripción');
    }
  }

  /**
   * Verificar si un usuario tiene una suscripción activa
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription !== null && subscription.status === 'active';
  }

  /**
   * Obtener tipo de plan actual del usuario
   */
  static async getUserPlanType(userId: string): Promise<SubscriptionPlanType> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }

    return subscription.planType;
  }

  /**
   * Verificar si el usuario puede acceder a una feature
   */
  static async canAccessFeature(
    userId: string,
    feature: keyof ReturnType<typeof PlanService.getPlanBenefits>
  ): Promise<boolean> {
    const planType = await this.getUserPlanType(userId);
    const benefits = PlanService.getPlanBenefits(planType);
    return benefits[feature] as boolean;
  }

  /**
   * Obtener días restantes de suscripción
   */
  static async getDaysRemaining(userId: string): Promise<number | null> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      return null;
    }

    const now = new Date();
    const diffTime = subscription.currentPeriodEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Obtener todas las suscripciones activas (admin)
   */
  static async getAllActiveSubscriptions(): Promise<Subscription[]> {
    try {
      const q = query(
        collection(db, SUBSCRIPTIONS_COLLECTION),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting all active subscriptions:', error);
      throw new Error('No se pudieron obtener las suscripciones activas');
    }
  }

  /**
   * Obtener estadísticas de suscripciones (admin)
   */
  static async getSubscriptionStats(): Promise<{
    total: number;
    active: number;
    cancelled: number;
    expired: number;
    byPlan: Record<string, number>;
    monthlyRevenue: number;
    yearlyRevenue: number;
  }> {
    try {
      const querySnapshot = await getDocs(collection(db, SUBSCRIPTIONS_COLLECTION));
      const subscriptions = querySnapshot.docs.map(doc =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );

      const stats = {
        total: subscriptions.length,
        active: 0,
        cancelled: 0,
        expired: 0,
        byPlan: {} as Record<string, number>,
        monthlyRevenue: 0,
        yearlyRevenue: 0,
      };

      for (const sub of subscriptions) {
        if (sub.status === 'active') stats.active++;
        if (sub.status === 'cancelled') stats.cancelled++;
        if (sub.status === 'expired') stats.expired++;

        stats.byPlan[sub.planType] = (stats.byPlan[sub.planType] || 0) + 1;

        // Calcular revenue (necesitaríamos los precios de los planes)
        if (sub.status === 'active') {
          const plan = await PlanService.getPlanById(sub.planId);
          if (plan) {
            if (sub.billingPeriod === 'monthly') {
              stats.monthlyRevenue += plan.price.monthly;
            } else {
              stats.yearlyRevenue += plan.price.yearly;
            }
          }
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      throw new Error('No se pudieron obtener las estadísticas');
    }
  }
}
