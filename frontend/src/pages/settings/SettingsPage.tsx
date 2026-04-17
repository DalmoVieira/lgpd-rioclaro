import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { TenantSettings } from '../../types';

export default function SettingsPage() {
  const { data: settings, isLoading } = useQuery<TenantSettings>({
    queryKey: ['tenant-settings'],
    queryFn: () => api.get('/tenant-settings').then((r) => r.data),
  });

  if (isLoading) return <div className="text-center py-8 text-gray-500">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Configurações do tenant e identidade visual</p>
      </div>

      {settings && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Informações do Município</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Município</dt><dd className="font-medium">{settings.municipalityName}</dd></div>
                <div><dt className="text-gray-500">Estado</dt><dd className="font-medium">{settings.state}</dd></div>
                <div><dt className="text-gray-500">Cor primária</dt><dd className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded" style={{ backgroundColor: settings.primaryColor }} />
                  {settings.primaryColor}
                </dd></div>
              </dl>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Encarregado (DPO)</h3>
              <dl className="space-y-2 text-sm">
                <div><dt className="text-gray-500">Nome</dt><dd className="font-medium">{settings.dpoName}</dd></div>
                <div><dt className="text-gray-500">E-mail</dt><dd className="font-medium">{settings.dpoEmail}</dd></div>
                {settings.dpoPhone && <div><dt className="text-gray-500">Telefone</dt><dd className="font-medium">{settings.dpoPhone}</dd></div>}
              </dl>
            </div>
          </div>

          {(settings.privacyPortalTitle || settings.privacyPortalDescription) && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Portal de Privacidade</h3>
              <dl className="space-y-2 text-sm">
                {settings.privacyPortalTitle && <div><dt className="text-gray-500">Título</dt><dd className="font-medium">{settings.privacyPortalTitle}</dd></div>}
                {settings.privacyPortalDescription && <div><dt className="text-gray-500">Descrição</dt><dd className="font-medium">{settings.privacyPortalDescription}</dd></div>}
              </dl>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
