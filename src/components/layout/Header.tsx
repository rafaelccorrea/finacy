import React from 'react';
import { Bell, Sun, Moon, Search } from 'lucide-react';
import { useThemeStore, useAuthStore, useUIStore } from '@/store';
import { Avatar, cn } from '@/components/ui';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 h-16 flex items-center justify-between px-6',
        'bg-[var(--bg-primary)]/80 backdrop-blur-md border-b border-[var(--border-color)]',
        'transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-16',
      )}
    >
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-[var(--text-primary)]">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--text-muted)]">{subtitle}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
          <Search className="h-4 w-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500" />
        </button>

        {/* User Avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
            <Avatar name={user.name} size="sm" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-[var(--text-primary)] leading-none">{user.name.split(' ')[0]}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
