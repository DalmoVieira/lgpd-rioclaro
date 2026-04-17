import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { SecurityIncident } from '../../types';
import clsx from 'clsx';

const severityColors: Record<string, string> = {
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-orange-50 text-orange-700',
  CRITICAL: 'bg-red-50 text-red-700',
};

export default function IncidentsPage() {
  const { data: incidents = [], isLoading } = useQuery<SecurityIncident[]>({
    queryKey: ['incidents'],
    queryFn: () => api.get('/incidents').then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Incidentes de Segurança</h1>
        <p className="text-gray-500 mt-1">Gestão de incidentes com dados pessoais</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum incidente registrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Severidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prazo ANPD</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {incidents.map((i) => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{i.title}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', severityColors[i.severity] ?? 'bg-gray-50')}>
                      {i.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{i.status}</td>
                  <td className="px-4 py-3 text-xs">
                    {i.anpdDeadline ? new Date(i.anpdDeadline).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(i.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
