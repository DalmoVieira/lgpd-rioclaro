import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { AuditLog } from '../../types';

export default function AuditPage() {
  const { data, isLoading } = useQuery<{ data: AuditLog[] }>({
    queryKey: ['audit-logs'],
    queryFn: () => api.get('/audit-logs').then((r) => r.data),
  });
  const logs = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trilha de Auditoria</h1>
        <p className="text-gray-500 mt-1">Log de ações no sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum registro de auditoria</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Data</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Usuário</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Ação</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entidade</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs">{new Date(log.createdAt).toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3">{log.user?.name ?? '-'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.entity}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{log.entityId?.slice(0, 8) ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
