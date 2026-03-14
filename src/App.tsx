import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { darkTheme, lightTheme } from './styles/theme';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyPlanPage } from './pages/MyPlanPage';
import { CleanNamePage } from './pages/CleanNamePage';
import CleanNameDetailPage from './pages/CleanNameDetailPage';
import { AutoLoginPage } from './pages/AutoLoginPage';
import BuyCreditsPage from './pages/BuyCreditsPage';
import SubscriptionGatePage from './pages/SubscriptionGatePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import { useAuthStore, useThemeStore } from './store';
import { authService } from './services/api';

// ─── SubscriptionChecker ──────────────────────────────────────────────────────
// Verifica o status da assinatura ao montar a aplicacao (para sessoes persistidas)
const SubscriptionChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, setSubscription } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated) {
      authService.me()
        .then((res) => {
          const data = res.data?.data || res.data;
          setSubscription(data?.hasActiveSubscription ?? false, data?.subscription ?? null);
        })
        .catch(() => {
          // Silently fail - o estado atual do store sera mantido
        });
    }
  }, [isAuthenticated]);
  return <>{children}</>;
};

// ─── ProtectedRoute ───────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// ─── SubscriptionGuard ────────────────────────────────────────────────────────
// Redireciona para /choose-plan se o usuario nao tiver assinatura ativa
// Admins e super_admins tem acesso irrestrito
const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasActiveSubscription, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  if (!isAdmin && !hasActiveSubscription) return <Navigate to="/choose-plan" replace />;
  return <>{children}</>;
};

// ─── AdminRoute ───────────────────────────────────────────────────────────────
// Bloqueia acesso a rotas /admin/* para usuarios sem role admin/super_admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

// ─── PublicRoute ──────────────────────────────────────────────────────────────
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

function App() {
  const { theme } = useThemeStore();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;
  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <SubscriptionChecker>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Pagina de escolha de plano - acessivel para usuarios autenticados sem assinatura */}
          <Route
            path="/choose-plan"
            element={
              <ProtectedRoute>
                <SubscriptionGatePage />
              </ProtectedRoute>
            }
          />

          {/* Rotas protegidas que exigem assinatura ativa (admin isento) */}
          <Route path="/" element={<SubscriptionGuard><AppLayout /></SubscriptionGuard>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="my-plan" element={<MyPlanPage />} />
            <Route path="clean-name" element={<CleanNamePage />} />
            <Route path="clean-name/:id" element={<CleanNameDetailPage />} />
            <Route path="buy-credits" element={<BuyCreditsPage />} />

            {/* Rotas administrativas - apenas admin/super_admin */}
            <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="admin/subscriptions" element={<AdminRoute><AdminSubscriptionsPage /></AdminRoute>} />
          </Route>

          <Route path="/auto-login" element={<AutoLoginPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SubscriptionChecker>
    </ThemeProvider>
  );
}

export default App;
