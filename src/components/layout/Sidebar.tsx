import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  FileCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
} from 'lucide-react';
import { cn } from '@/components/ui';
import { useAuthStore, useUIStore } from '@/store';
import { authService } from '@/services/api';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Painel' },
  { to: '/my-plan', icon: CreditCard, label: 'Meu Plano' },
  { to: '/clean-name', icon: FileCheck, label: 'Limpa Nome' },
];

const bottomItems = [
  { to: '/profile', icon: User, label: 'Perfil' },
  { to: '/settings', icon: Settings, label: 'Configurações' },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300',
        'bg-[var(--bg-sidebar)] border-r border-white/5',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center h-16 px-4 border-b border-white/5',
          sidebarOpen ? 'justify-between' : 'justify-center',
        )}
      >
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/40 flex-shrink-0">
              <span className="text-white font-black text-base leading-none">F</span>
            </div>
            <div>
              <span className="text-white font-black text-lg tracking-tight leading-none">Finacy</span>
              <p className="text-white/30 text-[10px] leading-none mt-0.5">Gestão Financeira</p>
            </div>
          </div>
        )}

        {!sidebarOpen && (
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <span className="text-white font-black text-base leading-none">F</span>
          </div>
        )}

        {sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Toggle button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors z-50"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {sidebarOpen && (
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
            Menu
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-white/50 hover:text-white hover:bg-white/8',
                !sidebarOpen && 'justify-center',
              )
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="py-4 px-3 border-t border-white/5 space-y-1">
        {sidebarOpen && (
          <p className="text-white/20 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
            Conta
          </p>
        )}

        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-white/15 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/8',
                !sidebarOpen && 'justify-center',
              )
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}

        {/* User info */}
        {sidebarOpen && user && (
          <div className="mt-3 mx-0 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xs">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate leading-none">{user.name}</p>
                <p className="text-white/30 text-[10px] truncate mt-0.5">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1',
            'text-rose-400/70 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200',
            !sidebarOpen && 'justify-center',
          )}
          title={!sidebarOpen ? 'Sair' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
};
