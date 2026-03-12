import React from 'react';
import styled from 'styled-components';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useAuthStore, useThemeStore, useUIStore } from '../../store';
import { Avatar } from '../ui';

const HeaderContainer = styled.header`
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: ${({ theme }) => theme.bg.card};
  border-bottom: 1px solid ${({ theme }) => theme.border.default};
  position: sticky;
  top: 0;
  z-index: 30;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  transition: all 0.15s ease;
  &:hover { background: ${({ theme }) => theme.bg.cardHover}; color: ${({ theme }) => theme.text.primary}; }
  @media (max-width: 768px) { display: flex; }
`;

const PageTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.sm};
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  transition: all 0.15s ease;
  position: relative;
  &:hover { background: ${({ theme }) => theme.bg.cardHover}; color: ${({ theme }) => theme.text.primary}; }
`;

const NotifDot = styled.span`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.status.danger};
  border: 2px solid ${({ theme }) => theme.bg.card};
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 8px;
  padding-left: 16px;
  border-left: 1px solid ${({ theme }) => theme.border.default};
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  @media (max-width: 640px) { display: none; }
`;

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Painel' }) => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { toggleSidebar } = useUIStore();

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <Menu size={20} />
        </MenuButton>
        <PageTitle>{title}</PageTitle>
      </LeftSection>

      <RightSection>
        <IconButton onClick={toggleTheme} title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </IconButton>

        <IconButton>
          <Bell size={18} />
          <NotifDot />
        </IconButton>

        <UserSection>
          <Avatar name={user?.name || 'U'} size="sm" />
          <UserName>{user?.name}</UserName>
        </UserSection>
      </RightSection>
    </HeaderContainer>
  );
};
