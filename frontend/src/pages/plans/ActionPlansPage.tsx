import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { ActionPlan } from '../../types';
import clsx from 'clsx';

const priorityColors: Record<string, string> = {
  LOW: 'bg-green-50 text-green-700',
  MEDIUM: 'bg-yellow-50 text-yellow-700',
  HIGH: 'bg-orange-50 text-orange-700',
  URGENT: 'bg-red-50 text-red-700',
};

export default function ActionPlansPage() {
  const { data: plans = [], isLoading } = useQuery<ActionPlan[]>({
    queryKey: ['action-plans'],
    queryFn: () => api.get('/action-plans').then((r) => r.data.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planos de Ação</h1>
        <p className="text-gray-500 mt-1">Acompanhamento de ações corretivas e preventivas</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : plans.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum plano de ação registrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prioridade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Prazo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {plans.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', priorityColors[p.priority] ?? 'bg-gray-50')}>
                      {p.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.status}</td>
                  <td className="px-4 py-3 text-xs">
                    {p.dueDate ? new Date(p.dueDate).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
