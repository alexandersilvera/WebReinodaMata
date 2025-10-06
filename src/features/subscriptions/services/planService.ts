/**
 * Servicio para gestión de planes de suscripción
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  type Timestamp,
} from 'firebase/firestore';
import { db } from '@/core/firebase/config';
import type { SubscriptionPlan, SubscriptionPlanType, PlanBenefits } from '../types';

const PLANS_COLLECTION = 'subscription_plans';

/**
 * Convertir timestamp de Firestore a Date
 */
function convertTimestamp(data: any): SubscriptionPlan {
  return {
    ...data,
    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
  } as SubscriptionPlan;
}

export class PlanService {
  /**
   * Obtener todos los planes
   */
  static async getAllPlans(): Promise<SubscriptionPlan[]> {
    try {
      const q = query(
        collection(db, PLANS_COLLECTION),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting plans:', error);
      throw new Error('No se pudieron obtener los planes');
    }
  }

  /**
   * Obtener solo planes activos
   */
  static async getActivePlans(): Promise<SubscriptionPlan[]> {
    try {
      const q = query(
        collection(db, PLANS_COLLECTION),
        where('isActive', '==', true),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc =>
        convertTimestamp({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      console.error('Error getting active plans:', error);
      throw new Error('No se pudieron obtener los planes activos');
    }
  }

  /**
   * Obtener un plan por ID
   */
  static async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    try {
      const docRef = doc(db, PLANS_COLLECTION, planId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return convertTimestamp({ id: docSnap.id, ...docSnap.data() });
      }
      return null;
    } catch (error) {
      console.error('Error getting plan by ID:', error);
      throw new Error('No se pudo obtener el plan');
    }
  }

  /**
   * Obtener un plan por tipo
   */
  static async getPlanByType(type: SubscriptionPlanType): Promise<SubscriptionPlan | null> {
    try {
      const q = query(
        collection(db, PLANS_COLLECTION),
        where('type', '==', type),
        where('isActive', '==', true)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return convertTimestamp({ id: doc.id, ...doc.data() });
      }
      return null;
    } catch (error) {
      console.error('Error getting plan by type:', error);
      throw new Error('No se pudo obtener el plan');
    }
  }

  /**
   * Crear un nuevo plan (solo admin)
   */
  static async createPlan(
    planData: Omit<SubscriptionPlan, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, PLANS_COLLECTION), {
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating plan:', error);
      throw new Error('No se pudo crear el plan');
    }
  }

  /**
   * Actualizar un plan (solo admin)
   */
  static async updatePlan(
    planId: string,
    updates: Partial<SubscriptionPlan>
  ): Promise<void> {
    try {
      const docRef = doc(db, PLANS_COLLECTION, planId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating plan:', error);
      throw new Error('No se pudo actualizar el plan');
    }
  }

  /**
   * Eliminar un plan (solo admin)
   */
  static async deletePlan(planId: string): Promise<void> {
    try {
      const docRef = doc(db, PLANS_COLLECTION, planId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting plan:', error);
      throw new Error('No se pudo eliminar el plan');
    }
  }

  /**
   * Obtener beneficios de un plan
   */
  static getPlanBenefits(planType: SubscriptionPlanType): PlanBenefits {
    const benefits: Record<SubscriptionPlanType, PlanBenefits> = {
      free: {
        canAccessPremiumPapers: false,
        canRegisterToEvents: true,
        canParticipateInProjects: false,
        canGetCertificates: true,
        canAccessMentorship: false,
        maxEventRegistrations: 2,
        maxPaperDownloads: 0,
        hasEarlyAccess: false,
        hasPrioritySupport: false,
      },
      colaborador: {
        canAccessPremiumPapers: true,
        canRegisterToEvents: true,
        canParticipateInProjects: false,
        canGetCertificates: true,
        canAccessMentorship: false,
        maxEventRegistrations: 10,
        maxPaperDownloads: 20,
        hasEarlyAccess: false,
        hasPrioritySupport: false,
      },
      investigador: {
        canAccessPremiumPapers: true,
        canRegisterToEvents: true,
        canParticipateInProjects: true,
        canGetCertificates: true,
        canAccessMentorship: true,
        maxEventRegistrations: -1, // Ilimitado
        maxPaperDownloads: -1, // Ilimitado
        hasEarlyAccess: true,
        hasPrioritySupport: true,
      },
      institucion: {
        canAccessPremiumPapers: true,
        canRegisterToEvents: true,
        canParticipateInProjects: true,
        canGetCertificates: true,
        canAccessMentorship: true,
        maxEventRegistrations: -1, // Ilimitado
        maxPaperDownloads: -1, // Ilimitado
        hasEarlyAccess: true,
        hasPrioritySupport: true,
      },
    };

    return benefits[planType];
  }

  /**
   * Calcular precio con descuento anual
   */
  static calculateYearlyDiscount(monthlyPrice: number): number {
    // 17% de descuento en plan anual (equivalente a 2 meses gratis)
    return Math.round(monthlyPrice * 12 * 0.83);
  }

  /**
   * Comparar planes
   */
  static async comparePlans(): Promise<{
    plans: SubscriptionPlan[];
    comparison: Record<string, any>;
  }> {
    const plans = await this.getActivePlans();

    const comparison = {
      features: [
        {
          name: 'Acceso a papers premium',
          free: false,
          colaborador: true,
          investigador: true,
          institucion: true,
        },
        {
          name: 'Registro a eventos',
          free: 'Limitado (2)',
          colaborador: 'Hasta 10',
          investigador: 'Ilimitado',
          institucion: 'Ilimitado',
        },
        {
          name: 'Certificados digitales',
          free: true,
          colaborador: true,
          investigador: true,
          institucion: true,
        },
        {
          name: 'Participación en proyectos',
          free: false,
          colaborador: false,
          investigador: true,
          institucion: true,
        },
        {
          name: 'Mentoría',
          free: false,
          colaborador: false,
          investigador: 'Mensual',
          institucion: 'Personalizada',
        },
        {
          name: 'Acceso temprano',
          free: false,
          colaborador: false,
          investigador: true,
          institucion: true,
        },
        {
          name: 'Licencias incluidas',
          free: 1,
          colaborador: 1,
          investigador: 1,
          institucion: 5,
        },
      ],
    };

    return { plans, comparison };
  }
}
