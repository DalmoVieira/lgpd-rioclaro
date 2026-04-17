import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { DataProcessingActivity } from '../../types';
import clsx from 'clsx';

export default function DataInventoryPage() {
  const { data: activities = [], isLoading } = useQuery<DataProcessingActivity[]>({
    queryKey: ['data-inventory'],
    queryFn: () => api.get('/data-inventory').then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inventário de Dados</h1>
        <p className="text-gray-500 mt-1">Atividades de tratamento de dados pessoais</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma atividade registrada</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Finalidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Base Legal</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activities.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{a.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{a.purpose}</td>
                  <td className="px-4 py-3 text-xs">{a.legalBasis.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      a.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'
                    )}>
                      {a.isActive ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
