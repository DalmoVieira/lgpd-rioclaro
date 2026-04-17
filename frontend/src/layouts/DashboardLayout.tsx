import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Users, FileText, Shield, AlertTriangle,
  ClipboardList, Database, Settings, LogOut, Menu, ScrollText, Cookie,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

const navItems = [
  { to: '/painel', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/painel/solicitacoes', icon: FileText, label: 'Solicitações' },
  { to: '/painel/inventario', icon: Database, label: 'Inventário de Dados' },
  { to: '/painel/riscos', icon: AlertTriangle, label: 'Riscos' },
  { to: '/painel/incidentes', icon: Shield, label: 'Incidentes' },
  { to: '/painel/planos', icon: ClipboardList, label: 'Planos de Ação' },
  { to: '/painel/usuarios', icon: Users, label: 'Usuários' },
  { to: '/painel/politicas', icon: ScrollText, label: 'Políticas' },
  { to: '/painel/cookies', icon: Cookie, label: 'Consentimento' },
  { to: '/painel/auditoria', icon: FileText, label: 'Auditoria' },
  { to: '/painel/configuracoes', icon: Settings, label: 'Configurações' },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-blue-700">LGPD Governança</h1>
          <p className="text-xs text-gray-500 mt-1">Sistema de Privacidade</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/painel'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 truncate">{user?.name}</div>
          <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          <div className="text-xs text-blue-600 font-medium mt-0.5">{user?.role}</div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-bold text-blue-700">LGPD</h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
