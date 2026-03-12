import React from 'react';
import { Bell, Sun, Moon, Menu } from 'lucide-react';
import { useThemeStore, useAuthStore, useUIStore } from '@/store';
import { Avatar, cn } from '@/components/ui';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 flex items-center justify-between px-6',
        'bg-[var(--bg-primary)]/90 backdrop-blur-md border-b border-[var(--border-color)]',
        'transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16',
      )}
    >
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-base font-bold text-[var(--text-primary)] leading-none">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-none">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Alternar tema"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          title="Notificações"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[var(--bg-primary)]" />
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-[var(--border-color)] mx-2" />

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <Avatar name={user.name} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--text-primary)] leading-none">
                {user.name.split(' ')[0]}
              </p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 capitalize">
                {user.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
