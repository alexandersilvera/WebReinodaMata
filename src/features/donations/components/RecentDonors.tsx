import { useState, useEffect } from 'react';
import { DonationService, type Donor } from '../services/donationService';

export default function RecentDonors() {
    const [donors, setDonors] = useState<Donor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDonors();
    }, []);

    const loadDonors = async () => {
        try {
            const data = await DonationService.getRecentDonors();
            setDonors(data);
        } catch (error) {
            console.error('Error loading recent donors:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return `hace ${Math.floor(interval)} años`;

        interval = seconds / 2592000;
        if (interval > 1) return `hace ${Math.floor(interval)} meses`;

        interval = seconds / 86400;
        if (interval > 1) return `hace ${Math.floor(interval)} días`;

        interval = seconds / 3600;
        if (interval > 1) return `hace ${Math.floor(interval)} horas`;

        interval = seconds / 60;
        if (interval > 1) return `hace ${Math.floor(interval)} minutos`;

        return 'hace unos momentos';
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (donors.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-gray-900">Donantes Recientes</h3>
            </div>
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {donors.map((donor) => (
                    <div key={donor.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${donor.isAnonymous ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
                                }`}>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {donor.isAnonymous ? 'Anónimo' : donor.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Donó <span className="font-medium text-green-600">${donor.amount}</span> • {formatTimeAgo(donor.date)}
                                </p>
                                {donor.message && (
                                    <p className="mt-1 text-sm text-gray-600 italic">"{donor.message}"</p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
