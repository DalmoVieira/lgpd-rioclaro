import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { DataSubjectRequest } from '../../types';
import clsx from 'clsx';

const statusColors: Record<string, string> = {
  ABERTA: 'bg-blue-50 text-blue-700',
  EM_ANALISE: 'bg-yellow-50 text-yellow-700',
  EM_ATENDIMENTO: 'bg-orange-50 text-orange-700',
  CONCLUIDA: 'bg-green-50 text-green-700',
  CANCELADA: 'bg-gray-50 text-gray-600',
};

export default function RequestsPage() {
  const { data: requests = [], isLoading } = useQuery<DataSubjectRequest[]>({
    queryKey: ['requests'],
    queryFn: () => api.get('/data-subject-requests').then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitações de Titulares</h1>
          <p className="text-gray-500 mt-1">Gerenciar requisições LGPD</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma solicitação encontrada</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Protocolo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Solicitante</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prazo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{req.protocol}</td>
                  <td className="px-4 py-3">{req.type.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">{req.requesterName}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', statusColors[req.status] ?? 'bg-gray-50')}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(req.deadline).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3 text-xs">{new Date(req.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
