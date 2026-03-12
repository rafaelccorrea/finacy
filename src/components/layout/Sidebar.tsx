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
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: sidebarOpen ? '256px' : '64px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease',
        backgroundColor: '#0D0C1A',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: '64px',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
        }}
      >
        {sidebarOpen ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  height: '36px',
                  width: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
                }}
              >
                <span style={{ color: 'white', fontWeight: 900, fontSize: '16px' }}>F</span>
              </div>
              <div>
                <span style={{ color: 'white', fontWeight: 900, fontSize: '18px', letterSpacing: '-0.5px' }}>Finacy</span>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', marginTop: '2px' }}>Gestão Financeira</p>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              style={{
                padding: '6px',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.3)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'white'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)'; (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'; }}
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <>
            <div
              style={{
                height: '36px',
                width: '36px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
              }}
            >
              <span style={{ color: 'white', fontWeight: 900, fontSize: '16px' }}>F</span>
            </div>
          </>
        )}
      </div>

      {/* Toggle button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '80px',
            height: '24px',
            width: '24px',
            borderRadius: '50%',
            background: '#4F46E5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            zIndex: 50,
            boxShadow: '0 2px 8px rgba(79,70,229,0.5)',
          }}
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '24px 12px 12px', overflowY: 'auto' }}>
        {sidebarOpen && (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: '12px' }}>
            Menu
          </p>
        )}
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActive
                    ? 'linear-gradient(135deg, #4F46E5, #06B6D4)'
                    : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.5)',
                  boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLDivElement).style.color = 'white';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.5)';
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontWeight: 500, fontSize: '14px' }}>{label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {sidebarOpen && (
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 12px', marginBottom: '12px' }}>
            Conta
          </p>
        )}

        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            title={!sidebarOpen ? label : undefined}
            style={{ textDecoration: 'none' }}
          >
            {({ isActive }) => (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.08)';
                    (e.currentTarget as HTMLDivElement).style.color = 'white';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLDivElement).style.color = 'rgba(255,255,255,0.4)';
                  }
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontSize: '14px' }}>{label}</span>}
              </div>
            )}
          </NavLink>
        ))}

        {/* User info */}
        {sidebarOpen && user && (
          <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  height: '28px',
                  width: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span style={{ color: 'white', fontWeight: 700, fontSize: '12px' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: 'white', fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={!sidebarOpen ? 'Sair' : undefined}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '12px',
            marginTop: '4px',
            color: 'rgba(248,113,113,0.7)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = '#FCA5A5';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(239,68,68,0.1)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(248,113,113,0.7)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: 500 }}>Sair</span>}
        </button>
      </div>
    </aside>
  );
};
