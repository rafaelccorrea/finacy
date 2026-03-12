import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { useThemeStore, useAuthStore, useUIStore } from '@/store';

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
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: sidebarOpen ? '256px' : '64px',
        zIndex: 30,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'left 0.3s ease',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Title */}
      <div>
        <h1 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1 }}>{subtitle}</p>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Alternar tema"
          title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          style={{
            padding: '8px',
            borderRadius: '10px',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-tertiary)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button
          title="Notificações"
          style={{
            position: 'relative',
            padding: '8px',
            borderRadius: '10px',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-tertiary)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
          }}
        >
          <Bell size={16} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              height: '8px',
              width: '8px',
              borderRadius: '50%',
              backgroundColor: '#F43F5E',
              border: '2px solid var(--bg-primary)',
            }}
          />
        </button>

        {/* Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', margin: '0 8px' }} />

        {/* User Avatar */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <div
              style={{
                height: '32px',
                width: '32px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ color: 'white', fontWeight: 700, fontSize: '13px' }}>
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'none' }} className="sm:block">
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
                {user.name?.split(' ')[0]}
              </p>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', textTransform: 'capitalize' }}>
                {user.role?.toLowerCase().replace('_', ' ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
