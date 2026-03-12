import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'Painel', subtitle: 'Visão geral da sua conta' },
  '/my-plan': { title: 'Meu Plano', subtitle: 'Gerencie sua assinatura' },
  '/clean-name': { title: 'Limpa Nome', subtitle: 'Solicite a limpeza do seu nome' },
  '/profile': { title: 'Perfil', subtitle: 'Gerencie suas informações' },
  '/settings': { title: 'Configurações', subtitle: 'Preferências do sistema' },
};

export const AppLayout: React.FC = () => {
  const { sidebarOpen } = useUIStore();
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'Finacy' };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <Sidebar />
      <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
      <main
        style={{
          marginLeft: sidebarOpen ? '256px' : '64px',
          paddingTop: '64px',
          transition: 'margin-left 0.3s ease',
          minHeight: '100vh',
        }}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
