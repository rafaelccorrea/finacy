import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useUIStore } from '@/store';
import { cn } from '@/components/ui';

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
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <Sidebar />
      <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
      <main
        className={cn(
          'transition-all duration-300 pt-16',
          sidebarOpen ? 'ml-64' : 'ml-16',
        )}
      >
        <div className="p-6 animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
