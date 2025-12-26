import { useState } from 'react';
import { MercadoPagoService } from '@/features/payments/services/mercadoPagoService';

const PREDEFINED_AMOUNTS = [200, 500, 1000, 2000];

export default function DonationForm() {
  const [amount, setAmount] = useState<number | ''>(500);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    setIsCustom(true);
    setAmount(Number(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const preference = await MercadoPagoService.createDonationPreference(
        Number(amount),
        name || undefined,
        email || undefined,
        message || undefined
      );

      MercadoPagoService.redirectToCheckout(preference);
    } catch (error) {
      console.error('Error creating donation:', error);
      alert('Hubo un error al procesar la donación. Por favor intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg mx-auto">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Elige tu aporte
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Montos Predefinidos */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {PREDEFINED_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleAmountSelect(val)}
              className={`py-3 px-4 rounded-lg font-medium transition-all ${
                !isCustom && amount === val
                  ? 'bg-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ${val}
            </button>
          ))}
        </div>

        {/* Monto Personalizado */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            O ingresa otro monto
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={handleCustomAmountChange}
              onFocus={() => setIsCustom(true)}
              className={`block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-green-500 focus:ring-green-500 py-3 ${
                isCustom ? 'border-green-500 ring-1 ring-green-500' : ''
              }`}
              placeholder="0.00"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-gray-500 sm:text-sm">UYU</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Datos Opcionales */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre (Opcional)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Opcional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje de apoyo (Opcional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Escribe un mensaje..."
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || (!amount && !customAmount)}
          className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : (
            `Donar $${amount || customAmount || '0'}`
          )}
        </button>

        <p className="text-xs text-center text-gray-500 mt-4">
          Pagos procesados de forma segura por Mercado Pago.
          <br />
          Tu donación ayuda a mantener el templo y nuestras actividades sociales.
        </p>
      </form>
    </div>
  );
}
