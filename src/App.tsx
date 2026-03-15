import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
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

// ─── PostCheckoutHandler ──────────────────────────────────────────────────────
// Detecta o retorno do Stripe (?subscribed=true ou ?payment=success) e faz
// polling no /auth/me ate a assinatura ser confirmada no backend (webhook).
// Enquanto aguarda, exibe uma tela de carregamento para evitar o redirect errado.
const PostCheckoutHandler: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, hasActiveSubscription, setSubscription } = useAuthStore();
  const [checking, setChecking] = useState(false);

  const isPostCheckout =
    searchParams.get('subscribed') === 'true' ||
    searchParams.get('payment') === 'success' ||
    searchParams.get('type') === 'subscription';

  useEffect(() => {
    if (!isAuthenticated || !isPostCheckout || hasActiveSubscription) return;

    // Retornou do Stripe mas assinatura ainda nao esta ativa no store
    // Faz polling no /auth/me por ate 30s (webhook pode demorar alguns segundos)
    setChecking(true);
    let attempts = 0;
    const maxAttempts = 10; // 10 tentativas x 3s = 30s maximo
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await authService.me();
        const data = res.data?.data || res.data;
        if (data?.hasActiveSubscription) {
          setSubscription(true, data?.subscription ?? null);
          clearInterval(interval);
          setChecking(false);
          // Limpar os parametros da URL e ir para o dashboard
          navigate('/dashboard', { replace: true });
        } else if (attempts >= maxAttempts) {
          // Timeout: mesmo sem confirmar, deixa o usuario tentar acessar
          clearInterval(interval);
          setChecking(false);
          setSubscription(data?.hasActiveSubscription ?? false, data?.subscription ?? null);
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setChecking(false);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isPostCheckout, hasActiveSubscription]);

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0F1117',
        gap: '24px',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          fontWeight: 800,
          color: 'white',
        }}>F</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(99,102,241,0.3)',
            borderTop: '3px solid #6366F1',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#E2E8F0', fontSize: '18px', fontWeight: 600, margin: '0 0 8px' }}>
            Confirmando sua assinatura...
          </p>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
            Aguarde enquanto processamos seu pagamento
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
};

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
          <Route
            path="/"
            element={
              <PostCheckoutHandler>
                <SubscriptionGuard>
                  <AppLayout />
                </SubscriptionGuard>
              </PostCheckoutHandler>
            }
          >
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
