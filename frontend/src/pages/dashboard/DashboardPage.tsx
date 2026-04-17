import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import type { DashboardData } from '../../types';
import {
  FileText, Shield, AlertTriangle, ClipboardList, Database,
  TrendingUp, AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <div className={clsx('p-2 rounded-lg', color)}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then((r) => r.data),
  });

  if (isLoading) return <div className="text-center py-12 text-gray-500">Carregando...</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Visão geral da governança de privacidade</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText} label="Solicitações" value={data.requests.total}
          sub={`${data.requests.open} em aberto`} color="bg-blue-500"
        />
        <StatCard
          icon={Shield} label="Incidentes" value={data.incidents.total}
          sub={`${data.incidents.overdue} em atraso`} color="bg-red-500"
        />
        <StatCard
          icon={AlertTriangle} label="Riscos" value={data.risks.total}
          sub={`${data.risks.highCritical} alto/crítico`} color="bg-orange-500"
        />
        <StatCard
          icon={ClipboardList} label="Planos de Ação" value={data.actionPlans.total}
          sub={`${data.actionPlans.open} em aberto`} color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Atividades de Tratamento</h3>
          <div className="flex items-center gap-3">
            <Database size={20} className="text-blue-500" />
            <div>
              <span className="text-2xl font-bold">{data.activities.total}</span>
              <span className="text-gray-500 ml-2">ativas</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">RIPD Pendentes</h3>
          <div className="flex items-center gap-3">
            {data.ripd.pending > 0 ? (
              <>
                <AlertCircle size={20} className="text-amber-500" />
                <span className="text-2xl font-bold text-amber-600">{data.ripd.pending}</span>
                <span className="text-gray-500">relatórios pendentes</span>
              </>
            ) : (
              <>
                <TrendingUp size={20} className="text-green-500" />
                <span className="text-green-600 font-medium">Todos em dia</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Charts placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Solicitações por Tipo</h3>
          <div className="space-y-2">
            {data.charts?.requestsByType?.map((item) => (
              <div key={item.type} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{item.type.replace(/_/g, ' ')}</span>
                <span className="font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{item._count}</span>
              </div>
            ))}
            {(!data.charts?.requestsByType || data.charts.requestsByType.length === 0) && (
              <p className="text-sm text-gray-400">Nenhuma solicitação registrada</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Riscos por Nível</h3>
          <div className="space-y-2">
            {data.charts?.risksByLevel?.map((item) => {
              const colors: Record<string, string> = {
                LOW: 'bg-green-50 text-green-700',
                MEDIUM: 'bg-yellow-50 text-yellow-700',
                HIGH: 'bg-orange-50 text-orange-700',
                CRITICAL: 'bg-red-50 text-red-700',
              };
              return (
                <div key={item.riskLevel} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{item.riskLevel}</span>
                  <span className={clsx('font-medium px-2 py-0.5 rounded', colors[item.riskLevel] ?? 'bg-gray-50')}>{item._count}</span>
                </div>
              );
            })}
            {(!data.charts?.risksByLevel || data.charts.risksByLevel.length === 0) && (
              <p className="text-sm text-gray-400">Nenhum risco registrado</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
