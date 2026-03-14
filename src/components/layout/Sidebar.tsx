import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  LayoutDashboard, CreditCard, FileSearch, LogOut, Zap,
  Users, BarChart2, ShieldCheck,
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';

const SidebarContainer = styled.aside<{ $open: boolean }>`
  width: 260px;
  min-width: 260px;
  height: 100vh;
  background: ${({ theme }) => theme.bg.sidebar};
  border-right: 1px solid ${({ theme }) => theme.border.default};
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 50;
  transition: transform 0.3s ease;
  @media (max-width: 768px) {
    transform: ${({ $open }) => $open ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
  margin-bottom: 32px;
`;

const LogoImg = styled.img`
  height: 36px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
`;

const NavSection = styled.div`
  margin-bottom: 24px;
`;

const NavLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: ${({ theme }) => theme.text.muted};
  padding: 0 12px;
  margin-bottom: 8px;
`;

const AdminLabel = styled(NavLabel)`
  color: ${({ theme }) => theme.accent.primary};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
  transition: all 0.15s ease;
  text-decoration: none;
  margin-bottom: 2px;
  &:hover {
    background: ${({ theme }) => theme.bg.cardHover};
    color: ${({ theme }) => theme.text.primary};
  }
  &.active {
    background: ${({ theme }) => theme.accent.primary}15;
    color: ${({ theme }) => theme.accent.primary};
    font-weight: 600;
  }
  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const AdminNavLink = styled(StyledNavLink)`
  &.active {
    background: ${({ theme }) => theme.accent.primary}20;
    color: ${({ theme }) => theme.accent.primary};
  }
`;

const AdminBadge = styled.span`
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 20px;
  background: ${({ theme }) => theme.accent.primary}20;
  color: ${({ theme }) => theme.accent.primary};
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.border.default};
  margin: 8px 0 20px 0;
`;

const Spacer = styled.div`flex: 1;`;

const LogoutBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.status.danger};
  background: transparent;
  border: none;
  width: 100%;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    background: ${({ theme }) => theme.status.dangerBg};
  }
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Overlay = styled.div<{ $visible: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $visible }) => $visible ? 'block' : 'none'};
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 40;
  }
`;

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Overlay $visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <SidebarContainer $open={sidebarOpen}>
        <Logo>
          <LogoImg src="/logo-dark.png" alt="Finacy" />
        </Logo>

        <NavSection>
          <NavLabel>Menu</NavLabel>
          <StyledNavLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
            <LayoutDashboard /> Painel
          </StyledNavLink>
          <StyledNavLink to="/my-plan" onClick={() => setSidebarOpen(false)}>
            <CreditCard /> Meu Plano
          </StyledNavLink>
          <StyledNavLink to="/clean-name" onClick={() => setSidebarOpen(false)}>
            <FileSearch /> Limpa Nome
          </StyledNavLink>
          {!isAdmin && (
            <StyledNavLink to="/buy-credits" onClick={() => setSidebarOpen(false)}>
              <Zap /> Comprar Créditos
            </StyledNavLink>
          )}
        </NavSection>

        {isAdmin && (
          <>
            <Divider />
            <NavSection>
              <AdminLabel>
                <ShieldCheck size={13} />
                Administração
              </AdminLabel>
              <AdminNavLink to="/admin" end onClick={() => setSidebarOpen(false)}>
                <BarChart2 /> Dashboard Admin
                <AdminBadge>Admin</AdminBadge>
              </AdminNavLink>
              <AdminNavLink to="/admin/users" onClick={() => setSidebarOpen(false)}>
                <Users /> Usuários
              </AdminNavLink>
              <AdminNavLink to="/admin/subscriptions" onClick={() => setSidebarOpen(false)}>
                <CreditCard /> Assinaturas & Pagamentos
              </AdminNavLink>
            </NavSection>
          </>
        )}

        <Spacer />

        <LogoutBtn onClick={handleLogout}>
          <LogOut /> Sair
        </LogoutBtn>
      </SidebarContainer>
    </>
  );
};
