import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { User } from '../../types';
import clsx from 'clsx';

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  DPO: 'DPO',
  ADMIN: 'Administrador',
  COMITE_PRIVACIDADE: 'Comitê de Privacidade',
  GESTOR_SETORIAL: 'Gestor Setorial',
  OPERADOR: 'Operador',
  ETIR: 'ETIR',
  AUDITOR: 'Auditor',
};

export default function UsersPage() {
  const { data, isLoading } = useQuery<{ data: User[] }>({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((r) => r.data),
  });
  const users = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-500 mt-1">Gerenciar usuários do sistema</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">Nenhum usuário encontrado</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Perfil</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {roleLabels[u.role] ?? u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded text-xs font-medium',
                      u.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    )}>
                      {u.isActive ? 'Ativo' : 'Inativo'}
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
