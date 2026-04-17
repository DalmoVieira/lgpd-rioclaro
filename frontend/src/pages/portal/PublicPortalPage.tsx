import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import { Shield, FileText, Search, CheckCircle } from 'lucide-react';

interface TenantPublicInfo {
  id: string;
  name: string;
  slug: string;
  settings?: {
    primaryColor: string;
    municipalityName: string;
    dpoName: string;
    dpoEmail: string;
    dpoPhone?: string;
    privacyPortalTitle?: string;
    privacyPortalDescription?: string;
  };
}

const requestTypes = [
  { value: 'ACESSO', label: 'Acesso aos meus dados' },
  { value: 'CORRECAO', label: 'Correção de dados' },
  { value: 'EXCLUSAO', label: 'Exclusão de dados' },
  { value: 'PORTABILIDADE', label: 'Portabilidade de dados' },
  { value: 'REVOGACAO_CONSENTIMENTO', label: 'Revogar consentimento' },
  { value: 'INFORMACAO', label: 'Informações sobre tratamento' },
  { value: 'OPOSICAO', label: 'Oposição ao tratamento' },
];

export default function PublicPortalPage() {
  const { slug } = useParams<{ slug: string }>();
  const [tab, setTab] = useState<'request' | 'lookup'>('request');

  // Fetch tenant info
  const { data: tenant, isLoading } = useQuery<TenantPublicInfo>({
    queryKey: ['tenant-public', slug],
    queryFn: () => api.get(`/tenants/public/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

  // Request form
  const [form, setForm] = useState({
    type: 'ACESSO',
    requesterName: '',
    requesterEmail: '',
    requesterCpf: '',
    requesterPhone: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState<{ protocol: string } | null>(null);

  const submitMutation = useMutation({
    mutationFn: (data: typeof form) =>
      api.post('/data-subject-requests/public', { ...data, tenantSlug: slug }),
    onSuccess: (res) => setSubmitted(res.data),
  });

  // Lookup form
  const [lookupData, setLookupData] = useState({ protocol: '', cpf: '' });
  const [lookupResult, setLookupResult] = useState<any>(null);

  const lookupMutation = useMutation({
    mutationFn: (data: typeof lookupData) =>
      api.post('/data-subject-requests/public/lookup', { ...data, tenantSlug: slug }),
    onSuccess: (res) => setLookupResult(res.data),
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando portal...</div>;
  if (!tenant) return <div className="min-h-screen flex items-center justify-center text-gray-500">Portal não encontrado</div>;

  const color = tenant.settings?.primaryColor ?? '#1d4ed8';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
            <Shield size={28} style={{ color }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {tenant.settings?.privacyPortalTitle ?? `Portal de Privacidade - ${tenant.name}`}
            </h1>
            <p className="text-sm text-gray-500">
              {tenant.settings?.privacyPortalDescription ?? 'Canal do titular de dados pessoais conforme a LGPD'}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* DPO Info */}
        {tenant.settings && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm">
            <p className="font-medium text-blue-900">Encarregado de Dados (DPO): {tenant.settings.dpoName}</p>
            <p className="text-blue-700">E-mail: {tenant.settings.dpoEmail}</p>
            {tenant.settings.dpoPhone && <p className="text-blue-700">Telefone: {tenant.settings.dpoPhone}</p>}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setTab('request'); setSubmitted(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'request' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <FileText size={16} /> Nova Solicitação
          </button>
          <button
            onClick={() => { setTab('lookup'); setLookupResult(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === 'lookup' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <Search size={16} /> Consultar Solicitação
          </button>
        </div>

        {/* New Request */}
        {tab === 'request' && !submitted && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercer seus direitos como titular</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); submitMutation.mutate(form); }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Solicitação</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {requestTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  <input type="text" required value={form.requesterName}
                    onChange={(e) => setForm({ ...form, requesterName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input type="text" required value={form.requesterCpf}
                    onChange={(e) => setForm({ ...form, requesterCpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" required value={form.requesterEmail}
                    onChange={(e) => setForm({ ...form, requesterEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input type="tel" value={form.requesterPhone}
                    onChange={(e) => setForm({ ...form, requesterPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea required rows={4} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full py-2.5 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                {submitMutation.isPending ? 'Enviando...' : 'Enviar Solicitação'}
              </button>
              {submitMutation.isError && (
                <p className="text-red-600 text-sm">Erro ao enviar. Tente novamente.</p>
              )}
            </form>
          </div>
        )}

        {/* Success */}
        {tab === 'request' && submitted && (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Solicitação Registrada!</h2>
            <p className="text-gray-600 mb-4">Seu número de protocolo é:</p>
            <p className="text-2xl font-bold font-mono text-blue-700">{submitted.protocol}</p>
            <p className="text-sm text-gray-500 mt-4">
              Guarde este número para acompanhar o andamento da sua solicitação.
            </p>
          </div>
        )}

        {/* Lookup */}
        {tab === 'lookup' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Consultar solicitação</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); lookupMutation.mutate(lookupData); }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Protocolo</label>
                  <input type="text" required value={lookupData.protocol}
                    onChange={(e) => setLookupData({ ...lookupData, protocol: e.target.value })}
                    placeholder="LGPD-2025-0001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                  <input type="text" required value={lookupData.cpf}
                    onChange={(e) => setLookupData({ ...lookupData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <button
                type="submit"
                disabled={lookupMutation.isPending}
                className="px-6 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
                style={{ backgroundColor: color }}
              >
                {lookupMutation.isPending ? 'Consultando...' : 'Consultar'}
              </button>
            </form>

            {lookupResult && (
              <div className="mt-6 border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Protocolo:</span><span className="font-medium">{lookupResult.protocol}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tipo:</span><span>{lookupResult.type?.replace(/_/g, ' ')}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Status:</span>
                  <span className="font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">{lookupResult.status}</span>
                </div>
                <div className="flex justify-between"><span className="text-gray-500">Prazo:</span><span>{lookupResult.deadline ? new Date(lookupResult.deadline).toLocaleDateString('pt-BR') : '-'}</span></div>
              </div>
            )}
            {lookupMutation.isError && (
              <p className="mt-4 text-red-600 text-sm">Solicitação não encontrada. Verifique o protocolo e CPF.</p>
            )}
          </div>
        )}
      </main>

      <footer className="border-t bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Portal de Privacidade — {tenant.name}</p>
          <p className="mt-1">Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</p>
        </div>
      </footer>
    </div>
  );
}
