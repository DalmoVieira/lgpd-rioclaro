import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

interface PolicyVersion {
  id: string;
  type: string;
  version: string;
  title: string;
  isActive: boolean;
  publishedAt?: string;
  createdAt: string;
  createdByUser?: { name: string };
}

export default function PoliciesPage() {
  const { data: policies = [], isLoading } = useQuery<PolicyVersion[]>({
    queryKey: ['privacy-policies'],
    queryFn: () => api.get('/privacy-policies').then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Políticas de Privacidade</h1>
        <p className="text-gray-500 mt-1">Versionamento de políticas e termos de uso</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : policies.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhuma política cadastrada</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Título</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Versão</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Publicada em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3 text-gray-600">{p.type === 'PRIVACY_POLICY' ? 'Política de Privacidade' : 'Termos de Uso'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{p.version}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-600'}`}>
                      {p.isActive ? 'Ativa' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('pt-BR') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
