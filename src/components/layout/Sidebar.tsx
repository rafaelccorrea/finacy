import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LayoutDashboard, CreditCard, FileSearch, LogOut, Zap } from 'lucide-react';
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

const LogoText = styled.div`
  h1 {
    font-size: 20px;
    font-weight: 800;
    color: ${({ theme }) => theme.text.primary};
    line-height: 1.2;
    margin: 0;
  }
  span {
    font-size: 11px;
    color: ${({ theme }) => theme.text.muted};
    font-weight: 400;
  }
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
  const { logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Overlay $visible={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <SidebarContainer $open={sidebarOpen}>
        <Logo>
          <LogoImg
            src="/logo-dark.png"
            alt="Finacy"
          />
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
          <StyledNavLink to="/buy-credits" onClick={() => setSidebarOpen(false)}>
            <Zap /> Comprar Créditos
          </StyledNavLink>
        </NavSection>

        <Spacer />

        <LogoutBtn onClick={handleLogout}>
          <LogOut /> Sair
        </LogoutBtn>
      </SidebarContainer>
    </>
  );
};
