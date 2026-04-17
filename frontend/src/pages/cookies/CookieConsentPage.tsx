import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

interface ConsentStats {
  total: number;
  consented: number;
  denied: number;
  consentRate: number;
}

export default function CookieConsentPage() {
  const { data: stats, isLoading } = useQuery<ConsentStats>({
    queryKey: ['cookie-consent-stats'],
    queryFn: () => api.get('/cookie-consent/stats').then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consentimento de Cookies</h1>
        <p className="text-gray-500 mt-1">Estatísticas de consentimento do portal</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Carregando...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total de Registros</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Consentidos</p>
            <p className="text-3xl font-bold text-green-600 mt-1">{stats.consented}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Recusados</p>
            <p className="text-3xl font-bold text-red-600 mt-1">{stats.denied}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Taxa de Consentimento</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">{stats.consentRate}%</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
