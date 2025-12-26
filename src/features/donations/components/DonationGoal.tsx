import { useState, useEffect } from 'react';
import { DonationService, type DonationGoal } from '../services/donationService';

export default function DonationGoalComponent() {
    const [goal, setGoal] = useState<DonationGoal | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGoal();
    }, []);

    const loadGoal = async () => {
        try {
            const data = await DonationService.getDonationGoal();
            setGoal(data);
        } catch (error) {
            console.error('Error loading donation goal:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-UY', {
            style: 'currency',
            currency: 'UYU',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="animate-pulse bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        );
    }

    if (!goal) return null;

    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Meta Mensual</h3>
                    <p className="text-sm text-gray-500">Ayúdanos a alcanzar nuestro objetivo</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-sm text-gray-500"> de {formatCurrency(goal.targetAmount)}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${goal.percentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center text-gray-600">
                    <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span className="font-medium">{goal.donorsCount}</span>
                    <span className="ml-1">donantes este mes</span>
                </div>
                <div className="text-green-600 font-medium">
                    {goal.percentage}% completado
                </div>
            </div>

            {goal.percentage >= 100 && (
                <div className="mt-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm text-center font-medium">
                    🎉 ¡Gracias! Hemos alcanzado la meta de este mes.
                </div>
            )}
        </div>
    );
}
