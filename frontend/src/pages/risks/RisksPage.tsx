import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { RiskAssessment } from '../../types';
import clsx from 'clsx';

const levelColors: Record<string, string> = {
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

export default function RisksPage() {
  const { data: risks = [], isLoading } = useQuery<RiskAssessment[]>({
    queryKey: ['risks'],
    queryFn: () => api.get('/risk-assessments').then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avaliação de Riscos</h1>
        <p className="text-gray-500 mt-1">Mapeamento e classificação de riscos de privacidade</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : risks.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum risco registrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nível</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {risks.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{r.title}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', levelColors[r.riskLevel] ?? 'bg-gray-50')}>
                      {r.riskLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.status}</td>
                  <td className="px-4 py-3 text-xs">{new Date(r.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
