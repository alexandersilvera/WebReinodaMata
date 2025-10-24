/**
 * Utilidad para control de acceso basado en suscripciones
 */

import type { SubscriptionPlanType, PlanBenefits } from '../types';
import { PlanService } from './planService';
import { SubscriptionService } from './subscriptionService';

/**
 * Niveles de acceso ordenados de menor a mayor
 */
const ACCESS_HIERARCHY: SubscriptionPlanType[] = [
  'free',
  'colaborador',
  'investigador',
  'institucion',
];

export class AccessControl {
  /**
   * Verificar si un nivel de plan tiene acceso a contenido de otro nivel
   */
  static hasAccessLevel(
    userPlanType: SubscriptionPlanType,
    requiredLevel: SubscriptionPlanType
  ): boolean {
    const userLevel = ACCESS_HIERARCHY.indexOf(userPlanType);
    const requiredLevelIndex = ACCESS_HIERARCHY.indexOf(requiredLevel);

    return userLevel >= requiredLevelIndex;
  }

  /**
   * Verificar si el usuario puede acceder a papers premium
   */
  static async canAccessPremiumPapers(userId: string): Promise<boolean> {
    return await SubscriptionService.canAccessFeature(userId, 'canAccessPremiumPapers');
  }

  /**
   * Verificar si el usuario puede registrarse a eventos
   */
  static async canRegisterToEvents(userId: string): Promise<boolean> {
    return await SubscriptionService.canAccessFeature(userId, 'canRegisterToEvents');
  }

  /**
   * Verificar si el usuario puede participar en proyectos
   */
  static async canParticipateInProjects(userId: string): Promise<boolean> {
    return await SubscriptionService.canAccessFeature(userId, 'canParticipateInProjects');
  }

  /**
   * Verificar si el usuario puede obtener certificados
   */
  static async canGetCertificates(userId: string): Promise<boolean> {
    return await SubscriptionService.canAccessFeature(userId, 'canGetCertificates');
  }

  /**
   * Verificar si el usuario puede acceder a mentoría
   */
  static async canAccessMentorship(userId: string): Promise<boolean> {
    return await SubscriptionService.canAccessFeature(userId, 'canAccessMentorship');
  }

  /**
   * Obtener límite de registros a eventos del usuario
   */
  static async getMaxEventRegistrations(userId: string): Promise<number> {
    const planType = await SubscriptionService.getUserPlanType(userId);
    const benefits = PlanService.getPlanBenefits(planType);
    return benefits.maxEventRegistrations;
  }

  /**
   * Obtener límite de descargas de papers del usuario
   */
  static async getMaxPaperDownloads(userId: string): Promise<number> {
    const planType = await SubscriptionService.getUserPlanType(userId);
    const benefits = PlanService.getPlanBenefits(planType);
    return benefits.maxPaperDownloads;
  }

  /**
   * Verificar si el usuario ha alcanzado el límite de registros a eventos
   */
  static async hasReachedEventLimit(
    userId: string,
    currentRegistrations: number
  ): Promise<boolean> {
    const maxRegistrations = await this.getMaxEventRegistrations(userId);

    // -1 significa ilimitado
    if (maxRegistrations === -1) {
      return false;
    }

    return currentRegistrations >= maxRegistrations;
  }

  /**
   * Verificar si el usuario ha alcanzado el límite de descargas
   */
  static async hasReachedDownloadLimit(
    userId: string,
    currentDownloads: number
  ): Promise<boolean> {
    const maxDownloads = await this.getMaxPaperDownloads(userId);

    // -1 significa ilimitado
    if (maxDownloads === -1) {
      return false;
    }

    return currentDownloads >= maxDownloads;
  }

  /**
   * Obtener mensaje de upgrade necesario
   */
  static getUpgradeMessage(
    currentPlan: SubscriptionPlanType,
    feature: string
  ): string {
    const messages: Record<string, string> = {
      premium_papers: `Para acceder a papers premium, necesitas mejorar tu plan a Colaborador o superior.`,
      projects: `Para participar en proyectos de investigación, necesitas el plan Investigador o superior.`,
      mentorship: `Para acceder a mentoría, necesitas el plan Investigador o superior.`,
      unlimited_events: `Para registros ilimitados a eventos, mejora al plan Investigador.`,
      unlimited_downloads: `Para descargas ilimitadas, mejora al plan Investigador.`,
      early_access: `Para acceso temprano a contenido, necesitas el plan Investigador o superior.`,
    };

    return messages[feature] || `Mejora tu plan para acceder a esta funcionalidad.`;
  }

  /**
   * Obtener plan recomendado según necesidades
   */
  static getRecommendedPlan(features: string[]): SubscriptionPlanType {
    const featureRequirements: Record<string, SubscriptionPlanType> = {
      premium_papers: 'colaborador',
      events: 'colaborador',
      certificates: 'free',
      projects: 'investigador',
      mentorship: 'investigador',
      unlimited: 'investigador',
      early_access: 'investigador',
      multiple_licenses: 'institucion',
    };

    let recommendedLevel = 0;

    for (const feature of features) {
      const requiredPlan = featureRequirements[feature] || 'free';
      const level = ACCESS_HIERARCHY.indexOf(requiredPlan);
      if (level > recommendedLevel) {
        recommendedLevel = level;
      }
    }

    return ACCESS_HIERARCHY[recommendedLevel];
  }

  /**
   * Obtener beneficios del usuario
   */
  static async getUserBenefits(userId: string): Promise<PlanBenefits> {
    const planType = await SubscriptionService.getUserPlanType(userId);
    return PlanService.getPlanBenefits(planType);
  }

  /**
   * Comparar beneficios entre dos planes
   */
  static compareBenefits(
    currentPlan: SubscriptionPlanType,
    targetPlan: SubscriptionPlanType
  ): {
    newFeatures: string[];
    improvedLimits: string[];
  } {
    const currentBenefits = PlanService.getPlanBenefits(currentPlan);
    const targetBenefits = PlanService.getPlanBenefits(targetPlan);

    const newFeatures: string[] = [];
    const improvedLimits: string[] = [];

    // Verificar nuevas features
    if (!currentBenefits.canAccessPremiumPapers && targetBenefits.canAccessPremiumPapers) {
      newFeatures.push('Acceso a papers premium');
    }
    if (!currentBenefits.canParticipateInProjects && targetBenefits.canParticipateInProjects) {
      newFeatures.push('Participación en proyectos');
    }
    if (!currentBenefits.canAccessMentorship && targetBenefits.canAccessMentorship) {
      newFeatures.push('Mentoría mensual');
    }
    if (!currentBenefits.hasEarlyAccess && targetBenefits.hasEarlyAccess) {
      newFeatures.push('Acceso temprano a contenido');
    }
    if (!currentBenefits.hasPrioritySupport && targetBenefits.hasPrioritySupport) {
      newFeatures.push('Soporte prioritario');
    }

    // Verificar mejoras en límites
    if (
      currentBenefits.maxEventRegistrations !== -1 &&
      (targetBenefits.maxEventRegistrations === -1 ||
        targetBenefits.maxEventRegistrations > currentBenefits.maxEventRegistrations)
    ) {
      improvedLimits.push(
        `Registros a eventos: ${currentBenefits.maxEventRegistrations} → ${
          targetBenefits.maxEventRegistrations === -1
            ? 'Ilimitado'
            : targetBenefits.maxEventRegistrations
        }`
      );
    }

    if (
      currentBenefits.maxPaperDownloads !== -1 &&
      (targetBenefits.maxPaperDownloads === -1 ||
        targetBenefits.maxPaperDownloads > currentBenefits.maxPaperDownloads)
    ) {
      improvedLimits.push(
        `Descargas de papers: ${currentBenefits.maxPaperDownloads} → ${
          targetBenefits.maxPaperDownloads === -1
            ? 'Ilimitado'
            : targetBenefits.maxPaperDownloads
        }`
      );
    }

    return { newFeatures, improvedLimits };
  }

  /**
   * Verificar si el usuario necesita mejorar su plan
   */
  static needsUpgrade(
    currentPlan: SubscriptionPlanType,
    requiredPlan: SubscriptionPlanType
  ): boolean {
    return !this.hasAccessLevel(currentPlan, requiredPlan);
  }

  /**
   * Obtener siguiente plan superior
   */
  static getNextPlan(currentPlan: SubscriptionPlanType): SubscriptionPlanType | null {
    const currentIndex = ACCESS_HIERARCHY.indexOf(currentPlan);
    if (currentIndex < ACCESS_HIERARCHY.length - 1) {
      return ACCESS_HIERARCHY[currentIndex + 1];
    }
    return null;
  }
}
