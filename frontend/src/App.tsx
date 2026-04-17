import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RequestsPage from './pages/requests/RequestsPage';
import DataInventoryPage from './pages/inventory/DataInventoryPage';
import RisksPage from './pages/risks/RisksPage';
import IncidentsPage from './pages/incidents/IncidentsPage';
import ActionPlansPage from './pages/plans/ActionPlansPage';
import UsersPage from './pages/users/UsersPage';
import PoliciesPage from './pages/policies/PoliciesPage';
import CookieConsentPage from './pages/cookies/CookieConsentPage';
import AuditPage from './pages/audit/AuditPage';
import SettingsPage from './pages/settings/SettingsPage';
import PublicPortalPage from './pages/portal/PublicPortalPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/portal/:slug" element={<PublicPortalPage />} />

            {/* Protected dashboard */}
            <Route
              path="/painel"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="solicitacoes" element={<RequestsPage />} />
              <Route path="inventario" element={<DataInventoryPage />} />
              <Route path="riscos" element={<RisksPage />} />
              <Route path="incidentes" element={<IncidentsPage />} />
              <Route path="planos" element={<ActionPlansPage />} />
              <Route path="usuarios" element={<UsersPage />} />
              <Route path="politicas" element={<PoliciesPage />} />
              <Route path="cookies" element={<CookieConsentPage />} />
              <Route path="auditoria" element={<AuditPage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/painel" replace />} />
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
