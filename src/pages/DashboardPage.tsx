import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  CreditCard,
  FileSearch,
  TrendingUp,
  Clock,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { subscriptionsService } from '../services/api';
import { Card, Badge } from '../components/ui';

/* ─── Animations ──────────────────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

/* ─── Styled Components ───────────────────────────────────────────────────── */
const Page = styled.div`
  animation: ${fadeIn} 0.4s ease;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const GreetingSection = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const GreetingText = styled.div`
  h1 {
    font-size: 26px;
    font-weight: 800;
    color: ${({ theme }) => theme.text.primary};
    margin: 0 0 4px 0;
  }
  p {
    font-size: 14px;
    color: ${({ theme }) => theme.text.muted};
    margin: 0;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.accent.gradient};
  color: white;
  font-weight: 600;
  font-size: 14px;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  transition: all 0.2s ease;
  &:hover { box-shadow: 0 6px 20px rgba(99,102,241,0.4); transform: translateY(-1px); }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const StatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatIcon = styled.div<{ $bg: string; $color: string }>`
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${p => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.$color};
`;

const StatLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.muted};
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1.1;
`;

const StatSub = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 4px;
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 16px 0;
`;

const QuickAction = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 18px 20px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: ${({ theme }) => theme.radius.lg};
  transition: all 0.2s ease;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.accent.primary}40;
    box-shadow: ${({ theme }) => theme.shadow.glow};
    transform: translateY(-2px);
  }
`;

const QAIcon = styled.div<{ $bg: string; $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${p => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.$color};
`;

const QAText = styled.div`
  flex: 1;
  h3 { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.text.primary}; margin: 0 0 2px 0; }
  p { font-size: 12px; color: ${({ theme }) => theme.text.muted}; margin: 0; }
`;

const QAArrow = styled.div`
  color: ${({ theme }) => theme.text.muted};
  transition: all 0.2s ease;
  ${QuickAction}:hover & { transform: translateX(4px); color: ${({ theme }) => theme.accent.primary}; }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px dashed ${({ theme }) => theme.border.default};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent.primary}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${({ theme }) => theme.accent.primary};
`;

const SkeletonBox = styled.div<{ $w?: string; $h?: string }>`
  width: ${p => p.$w || '100%'};
  height: ${p => p.$h || '20px'};
  border-radius: 8px;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.bg.cardHover} 25%,
    ${({ theme }) => theme.bg.card} 50%,
    ${({ theme }) => theme.bg.cardHover} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface DashboardData {
  hasActiveSubscription: boolean;
  currentPlan: string | { name?: string } | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: string | null;
  cleanNameCreditsUsed: number;
  cleanNameCreditsTotal: number;
  totalSubscriptions: number;
}

/* ─── Component ───────────────────────────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await subscriptionsService.dashboard();
        setData(res.data.data);
      } catch { /* silently fail */ }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loading) {
    return (
      <Page>
        <GreetingText>
          <SkeletonBox $w="220px" $h="28px" />
          <div style={{ height: 8 }} />
          <SkeletonBox $w="300px" $h="16px" />
        </GreetingText>
        <StatsGrid>
          {[1,2,3,4].map(i => (
            <StatCard key={i}><SkeletonBox $h="44px" /><SkeletonBox $w="60%" $h="28px" /></StatCard>
          ))}
        </StatsGrid>
      </Page>
    );
  }

  return (
    <Page>
      {/* Greeting */}
      <GreetingSection>
        <GreetingText>
          <h1>{greeting()}, {firstName}!</h1>
          <p>Aqui esta o resumo da sua conta</p>
        </GreetingText>
        <ActionButton onClick={() => navigate('/clean-name')}>
          <Zap size={16} /> Solicitar Limpa Nome
        </ActionButton>
      </GreetingSection>

      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatHeader>
            <StatIcon $bg="rgba(99,102,241,0.12)" $color="#6366F1"><CreditCard size={22} /></StatIcon>
            <StatLabel>Plano Atual</StatLabel>
          </StatHeader>
          <div>
            <StatValue>{typeof data?.currentPlan === 'string' ? data.currentPlan : data?.currentPlan?.name || 'Sem plano'}</StatValue>
            <StatSub>
              {data?.hasActiveSubscription
                ? <Badge variant="success" dot>Ativo</Badge>
                : <Badge variant="warning" dot>Inativo</Badge>}
            </StatSub>
          </div>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="rgba(6,182,212,0.12)" $color="#06B6D4"><Clock size={22} /></StatIcon>
            <StatLabel>Dias Restantes</StatLabel>
          </StatHeader>
          <div>
            <StatValue>{data?.hasActiveSubscription ? '—' : '—'}</StatValue>
            <StatSub>periodo atual</StatSub>
          </div>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="rgba(16,185,129,0.12)" $color="#10B981"><FileSearch size={22} /></StatIcon>
            <StatLabel>Creditos Limpa Nome</StatLabel>
          </StatHeader>
          <div>
            <StatValue>{data?.cleanNameCreditsUsed || 0} / {data?.cleanNameCreditsTotal || 0}</StatValue>
            <StatSub>creditos utilizados</StatSub>
          </div>
        </StatCard>

        <StatCard>
          <StatHeader>
            <StatIcon $bg="rgba(124,58,237,0.12)" $color="#7C3AED"><TrendingUp size={22} /></StatIcon>
            <StatLabel>Total Assinaturas</StatLabel>
          </StatHeader>
          <div>
            <StatValue>{data?.totalSubscriptions || 0}</StatValue>
            <StatSub>desde o inicio</StatSub>
          </div>
        </StatCard>
      </StatsGrid>

      {/* Quick Actions */}
      <div>
        <SectionTitle>Acoes Rapidas</SectionTitle>
        <ActionsGrid>
          <QuickAction onClick={() => navigate('/my-plan')}>
            <QAIcon $bg="rgba(99,102,241,0.12)" $color="#6366F1"><CreditCard size={22} /></QAIcon>
            <QAText>
              <h3>Gerenciar Plano</h3>
              <p>Visualize ou altere sua assinatura</p>
            </QAText>
            <QAArrow><ArrowRight size={18} /></QAArrow>
          </QuickAction>

          <QuickAction onClick={() => navigate('/clean-name')}>
            <QAIcon $bg="rgba(16,185,129,0.12)" $color="#10B981"><FileSearch size={22} /></QAIcon>
            <QAText>
              <h3>Limpa Nome</h3>
              <p>Solicite a limpeza do seu nome</p>
            </QAText>
            <QAArrow><ArrowRight size={18} /></QAArrow>
          </QuickAction>
        </ActionsGrid>
      </div>

      {/* Empty State */}
      {!data?.hasActiveSubscription && (
        <EmptyState>
          <EmptyIcon><Shield size={28} /></EmptyIcon>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Nenhum plano ativo</h3>
          <p style={{ fontSize: 13, opacity: 0.6, marginBottom: 20 }}>
            Assine um plano para ter acesso a todas as funcionalidades
          </p>
          <ActionButton onClick={() => navigate('/my-plan')} style={{ margin: '0 auto' }}>
            <CreditCard size={16} /> Ver Planos
          </ActionButton>
        </EmptyState>
      )}
    </Page>
  );
};
