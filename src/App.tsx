import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// ─── Guards ───────────────────────────────────────────────────────────────────

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

/**
 * Bloqueia acesso às rotas protegidas se o usuário não tiver assinatura ativa.
 * Admins e super admins têm acesso irrestrito.
 */
const SubscriptionGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, hasActiveSubscription } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Admins têm acesso irrestrito
  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <>{children}</>;
  }

  // Usuários sem assinatura ativa são redirecionados para escolher um plano
  if (!hasActiveSubscription) {
    return <Navigate to="/choose-plan" replace />;
  }

  return <>{children}</>;
};

/**
 * Rota exclusiva para admins.
 */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

/**
 * Verifica periodicamente se a assinatura ainda está ativa (revalidação silenciosa).
 */
const SubscriptionChecker: React.FC = () => {
  const { isAuthenticated, setAuth, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const check = async () => {
      try {
        const res = await authService.me();
        const data = res.data?.data || res.data;
        setAuth(
          data.accessToken || localStorage.getItem('accessToken') || '',
          data.refreshToken || localStorage.getItem('refreshToken') || '',
          data.user || data,
          data.hasActiveSubscription ?? false,
          data.subscription ?? null,
        );

        // Redireciona para escolher plano se não for admin e não tiver assinatura
        const role = (data.user || data)?.role;
        if (role !== 'admin' && role !== 'super_admin' && !data.hasActiveSubscription) {
          navigate('/choose-plan', { replace: true });
        }
      } catch {
        // Silently ignore — o interceptor de 401 já trata o logout
      }
    };

    check();
    // Revalida a cada 5 minutos
    const interval = setInterval(check, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return null;
};

// ─── App ──────────────────────────────────────────────────────────────────────

function App() {
  const { theme } = useThemeStore();
  const currentTheme = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <SubscriptionChecker />
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/auto-login" element={<AutoLoginPage />} />

        {/* Escolha de plano (acessível sem assinatura, mas requer autenticação) */}
        <Route
          path="/choose-plan"
          element={
            <ProtectedRoute>
              <SubscriptionGatePage />
            </ProtectedRoute>
          }
        />

        {/* Rotas protegidas — requerem autenticação + assinatura ativa (ou role admin) */}
        <Route
          path="/"
          element={
            <SubscriptionGuard>
              <AppLayout />
            </SubscriptionGuard>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-plan" element={<MyPlanPage />} />
          <Route path="clean-name" element={<CleanNamePage />} />
          <Route path="clean-name/:id" element={<CleanNameDetailPage />} />
          <Route path="buy-credits" element={<BuyCreditsPage />} />

          {/* Rotas administrativas */}
          <Route path="admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="admin/subscriptions" element={<AdminRoute><AdminSubscriptionsPage /></AdminRoute>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
