import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { darkTheme, lightTheme } from './styles/theme';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyPlanPage } from './pages/MyPlanPage';
import { CleanNamePage } from './pages/CleanNamePage';
import { AutoLoginPage } from './pages/AutoLoginPage';
import BuyCreditsPage from './pages/BuyCreditsPage';
import { useAuthStore, useThemeStore } from './store';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

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
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="my-plan" element={<MyPlanPage />} />
          <Route path="clean-name" element={<CleanNamePage />} />
          <Route path="buy-credits" element={<BuyCreditsPage />} />
        </Route>

        <Route path="/auto-login" element={<AutoLoginPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
