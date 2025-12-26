/**
 * Servicio para gestión de donaciones y gamificación
 */

export interface DonationGoal {
    currentAmount: number;
    targetAmount: number;
    percentage: number;
    donorsCount: number;
    endDate: Date;
}

export interface Donor {
    id: string;
    name: string;
    amount: number;
    date: Date;
    message?: string;
    isAnonymous: boolean;
}

export class DonationService {
    /**
     * Obtener el estado actual de la meta de donaciones
     * TODO: Conectar con backend real
     */
    static async getDonationGoal(): Promise<DonationGoal> {
        // Simulación de delay de red
        await new Promise(resolve => setTimeout(resolve, 500));

        const currentAmount = 15400;
        const targetAmount = 50000;

        return {
            currentAmount,
            targetAmount,
            percentage: Math.min(Math.round((currentAmount / targetAmount) * 100), 100),
            donorsCount: 42,
            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), // Fin de mes actual
        };
    }

    /**
     * Obtener lista de donantes recientes
     * TODO: Conectar con backend real
     */
    static async getRecentDonors(): Promise<Donor[]> {
        await new Promise(resolve => setTimeout(resolve, 800));

        return [
            {
                id: '1',
                name: 'María González',
                amount: 1000,
                date: new Date(Date.now() - 1000 * 60 * 30), // Hace 30 mins
                message: '¡Gracias por todo lo que hacen!',
                isAnonymous: false,
            },
            {
                id: '2',
                name: 'Anónimo',
                amount: 500,
                date: new Date(Date.now() - 1000 * 60 * 60 * 2), // Hace 2 horas
                isAnonymous: true,
            },
            {
                id: '3',
                name: 'Juan Pérez',
                amount: 2000,
                date: new Date(Date.now() - 1000 * 60 * 60 * 5), // Hace 5 horas
                message: 'Para el mantenimiento del templo',
                isAnonymous: false,
            },
            {
                id: '4',
                name: 'Lucía Rodríguez',
                amount: 500,
                date: new Date(Date.now() - 1000 * 60 * 60 * 24), // Hace 1 día
                isAnonymous: false,
            },
            {
                id: '5',
                name: 'Anónimo',
                amount: 200,
                date: new Date(Date.now() - 1000 * 60 * 60 * 26), // Hace 1 día y 2 horas
                isAnonymous: true,
            },
        ];
    }
}
