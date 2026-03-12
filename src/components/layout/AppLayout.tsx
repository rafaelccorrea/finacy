import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.text.primary};
`;

const MainArea = styled.div`
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

export const AppLayout: React.FC = () => {
  return (
    <LayoutWrapper>
      <Sidebar />
      <MainArea>
        <Header />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainArea>
    </LayoutWrapper>
  );
};
