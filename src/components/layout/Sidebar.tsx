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
        'bg-[var(--bg-sidebar)] border-r border-[var(--border-color)]',
        sidebarOpen ? 'w-64' : 'w-16',
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-white/10',
        sidebarOpen ? 'justify-between' : 'justify-center',
      )}>
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
              <span className="text-white font-black text-sm">F</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Finacy</span>
          </div>
        )}
        {!sidebarOpen && (
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
            <span className="text-white font-black text-sm">F</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            'p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors',
            !sidebarOpen && 'hidden',
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Toggle button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
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
      <div className="py-4 px-3 border-t border-white/10 space-y-1">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/10',
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
          <div className="mt-3 px-3 py-2 rounded-xl bg-white/5">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/50 text-xs truncate">{user.email}</p>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl',
            'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all duration-200',
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
