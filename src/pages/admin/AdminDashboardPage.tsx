import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Users, CreditCard, TrendingUp, DollarSign,
  ArrowUpRight, ArrowDownRight, Activity, FileText,
  RefreshCw, AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    newUsersThisMonth: number;
    userGrowthPct: number;
    totalSubscriptions: number;
    activeSubscriptions: number;
    trialingSubscriptions: number;
    canceledSubscriptions: number;
    totalCleanNameRequests: number;
    totalRevenue: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueGrowth: number;
    mrr: number;
  };
  charts: {
    revenueByMonth: { month: string; total: string; count: string }[];
    revenueByType: { type: string; total: string; count: string }[];
    planDistribution: { planName: string; price: string; count: string }[];
    userGrowth: { month: string; count: string }[];
  };
}

// ─── Styled Components ─────────────────────────────────────────────────────────
const Page = styled.div`
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text.muted};
  margin: 4px 0 0 0;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.border.default};
  background: ${({ theme }) => theme.bg.card};
  color: ${({ theme }) => theme.text.secondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.accent.primary}; color: ${({ theme }) => theme.accent.primary}; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const StatCard = styled.div<{ $accent?: string }>`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 16px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.2s;
  &:hover { border-color: ${({ theme }) => theme.border.focus}40; transform: translateY(-2px); }
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: ${({ $accent }) => $accent || 'linear-gradient(90deg, #6366F1, #06B6D4)'};
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIcon = styled.div<{ $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: ${({ $color }) => $color}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $color }) => $color};
`;

const StatBadge = styled.div<{ $positive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $positive, theme }) => $positive ? theme.status.success : theme.status.danger};
  background: ${({ $positive, theme }) => $positive ? theme.status.successBg : theme.status.dangerBg};
  padding: 4px 8px;
  border-radius: 20px;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  line-height: 1;
  margin-bottom: 6px;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.muted};
`;

const StatSub = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 8px;
`;

const ChartsRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  @media (max-width: 1024px) { grid-template-columns: 1fr; }
`;

const ChartCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 16px;
  padding: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 24px 0;
`;

const BarChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 160px;
`;

const Bar = styled.div<{ $height: number; $color: string }>`
  flex: 1;
  height: ${({ $height }) => $height}%;
  min-height: 4px;
  background: ${({ $color }) => $color};
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  &:hover { opacity: 0.85; }
  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 110%;
    left: 50%;
    transform: translateX(-50%);
    background: #1A1A2E;
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 11px;
    white-space: nowrap;
    z-index: 10;
  }
`;

const BarLabel = styled.div`
  text-align: center;
  font-size: 11px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 8px;
`;

const BarChartWrapper = styled.div``;

const DonutChart = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DonutItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DonutDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  flex-shrink: 0;
`;

const DonutBar = styled.div`
  flex: 1;
  height: 8px;
  background: ${({ theme }) => theme.bg.tertiary};
  border-radius: 4px;
  overflow: hidden;
`;

const DonutFill = styled.div<{ $width: number; $color: string }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  transition: width 0.6s ease;
`;

const DonutLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  min-width: 80px;
`;

const DonutValue = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  min-width: 40px;
  text-align: right;
`;

const BottomRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const SubStatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

const SubStatusCard = styled.div<{ $color: string }>`
  background: ${({ $color }) => $color}12;
  border: 1px solid ${({ $color }) => $color}30;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const SubStatusValue = styled.div<{ $color: string }>`
  font-size: 28px;
  font-weight: 800;
  color: ${({ $color }) => $color};
`;

const SubStatusLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 4px;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.text.muted};
  gap: 12px;
  font-size: 15px;
`;

const ErrorState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.status.danger};
  gap: 12px;
  font-size: 15px;
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatMonth = (yyyyMM: string) => {
  const [year, month] = yyyyMM.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return months[parseInt(month) - 1] + '/' + year.slice(2);
};

const PLAN_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

// ─── Component ─────────────────────────────────────────────────────────────────
const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminService.getDashboardStats();
      setStats(res.data?.data || res.data);
    } catch {
      setError('Erro ao carregar métricas. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <Page>
        <LoadingState>
          <RefreshCw size={20} className="spin" />
          Carregando métricas...
        </LoadingState>
      </Page>
    );
  }

  if (error || !stats) {
    return (
      <Page>
        <ErrorState>
          <AlertCircle size={20} />
          {error || 'Nenhum dado disponível.'}
        </ErrorState>
      </Page>
    );
  }

  const { overview, charts } = stats;

  // Calcular máximo para normalizar barras
  const maxRevenue = Math.max(...charts.revenueByMonth.map(r => parseFloat(r.total) || 0), 1);
  const maxUsers = Math.max(...charts.userGrowth.map(u => parseInt(u.count) || 0), 1);
  const totalPlanSubs = charts.planDistribution.reduce((acc, p) => acc + parseInt(p.count), 0) || 1;

  return (
    <Page>
      <Header>
        <div>
          <Title>Painel Administrativo</Title>
          <Subtitle>Visão geral de receitas, usuários e assinaturas em tempo real</Subtitle>
        </div>
        <RefreshBtn onClick={load}>
          <RefreshCw size={15} />
          Atualizar
        </RefreshBtn>
      </Header>

      {/* KPI Cards */}
      <StatsGrid>
        <StatCard $accent="linear-gradient(90deg, #6366F1, #818CF8)">
          <StatHeader>
            <StatIcon $color="#6366F1"><DollarSign size={20} /></StatIcon>
            {overview.revenueGrowth !== 0 && (
              <StatBadge $positive={overview.revenueGrowth > 0}>
                {overview.revenueGrowth > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(overview.revenueGrowth)}%
              </StatBadge>
            )}
          </StatHeader>
          <StatValue>{formatCurrency(overview.revenueThisMonth)}</StatValue>
          <StatLabel>Receita este mês</StatLabel>
          <StatSub>Total acumulado: {formatCurrency(overview.totalRevenue)}</StatSub>
        </StatCard>

        <StatCard $accent="linear-gradient(90deg, #10B981, #34D399)">
          <StatHeader>
            <StatIcon $color="#10B981"><TrendingUp size={20} /></StatIcon>
          </StatHeader>
          <StatValue>{formatCurrency(overview.mrr)}</StatValue>
          <StatLabel>MRR (Receita Recorrente Mensal)</StatLabel>
          <StatSub>{overview.activeSubscriptions + overview.trialingSubscriptions} assinaturas ativas</StatSub>
        </StatCard>

        <StatCard $accent="linear-gradient(90deg, #06B6D4, #22D3EE)">
          <StatHeader>
            <StatIcon $color="#06B6D4"><Users size={20} /></StatIcon>
            {overview.userGrowthPct !== 0 && (
              <StatBadge $positive={overview.userGrowthPct > 0}>
                {overview.userGrowthPct > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(overview.userGrowthPct)}%
              </StatBadge>
            )}
          </StatHeader>
          <StatValue>{overview.totalUsers}</StatValue>
          <StatLabel>Total de usuários</StatLabel>
          <StatSub>+{overview.newUsersThisMonth} novos este mês</StatSub>
        </StatCard>

        <StatCard $accent="linear-gradient(90deg, #F59E0B, #FCD34D)">
          <StatHeader>
            <StatIcon $color="#F59E0B"><CreditCard size={20} /></StatIcon>
          </StatHeader>
          <StatValue>{overview.activeSubscriptions}</StatValue>
          <StatLabel>Assinaturas ativas</StatLabel>
          <StatSub>{overview.trialingSubscriptions} em período de trial</StatSub>
        </StatCard>

        <StatCard $accent="linear-gradient(90deg, #8B5CF6, #A78BFA)">
          <StatHeader>
            <StatIcon $color="#8B5CF6"><FileText size={20} /></StatIcon>
          </StatHeader>
          <StatValue>{overview.totalCleanNameRequests}</StatValue>
          <StatLabel>Solicitações Limpa Nome</StatLabel>
          <StatSub>Total de solicitações realizadas</StatSub>
        </StatCard>

        <StatCard $accent="linear-gradient(90deg, #EF4444, #F87171)">
          <StatHeader>
            <StatIcon $color="#EF4444"><Activity size={20} /></StatIcon>
          </StatHeader>
          <StatValue>{overview.canceledSubscriptions}</StatValue>
          <StatLabel>Assinaturas canceladas</StatLabel>
          <StatSub>Total histórico de cancelamentos</StatSub>
        </StatCard>
      </StatsGrid>

      {/* Charts Row */}
      <ChartsRow>
        {/* Receita por mês */}
        <ChartCard>
          <ChartTitle>Receita por mês (últimos 6 meses)</ChartTitle>
          {charts.revenueByMonth.length === 0 ? (
            <LoadingState style={{ height: 180 }}>Sem dados de receita ainda</LoadingState>
          ) : (
            <BarChartWrapper>
              <BarChart>
                {charts.revenueByMonth.map((item) => {
                  const val = parseFloat(item.total) || 0;
                  const height = Math.max((val / maxRevenue) * 100, 2);
                  return (
                    <Bar
                      key={item.month}
                      $height={height}
                      $color="linear-gradient(180deg, #6366F1, #4F46E5)"
                      data-tooltip={formatCurrency(val)}
                    />
                  );
                })}
              </BarChart>
              <div style={{ display: 'flex', gap: 8 }}>
                {charts.revenueByMonth.map((item) => (
                  <BarLabel key={item.month} style={{ flex: 1 }}>
                    {formatMonth(item.month)}
                  </BarLabel>
                ))}
              </div>
            </BarChartWrapper>
          )}
        </ChartCard>

        {/* Distribuição de planos */}
        <ChartCard>
          <ChartTitle>Distribuição de planos</ChartTitle>
          {charts.planDistribution.length === 0 ? (
            <LoadingState style={{ height: 180 }}>Sem assinaturas ativas</LoadingState>
          ) : (
            <DonutChart>
              {charts.planDistribution.map((item, i) => {
                const count = parseInt(item.count);
                const pct = Math.round((count / totalPlanSubs) * 100);
                return (
                  <DonutItem key={item.planName}>
                    <DonutDot $color={PLAN_COLORS[i % PLAN_COLORS.length]} />
                    <DonutLabel>{item.planName}</DonutLabel>
                    <DonutBar>
                      <DonutFill $width={pct} $color={PLAN_COLORS[i % PLAN_COLORS.length]} />
                    </DonutBar>
                    <DonutValue>{count}</DonutValue>
                  </DonutItem>
                );
              })}
            </DonutChart>
          )}
        </ChartCard>
      </ChartsRow>

      {/* Bottom Row */}
      <BottomRow>
        {/* Crescimento de usuários */}
        <ChartCard>
          <ChartTitle>Novos usuários por mês</ChartTitle>
          {charts.userGrowth.length === 0 ? (
            <LoadingState style={{ height: 160 }}>Sem dados de crescimento</LoadingState>
          ) : (
            <BarChartWrapper>
              <BarChart>
                {charts.userGrowth.map((item) => {
                  const val = parseInt(item.count) || 0;
                  const height = Math.max((val / maxUsers) * 100, 2);
                  return (
                    <Bar
                      key={item.month}
                      $height={height}
                      $color="linear-gradient(180deg, #06B6D4, #0891B2)"
                      data-tooltip={`${val} usuários`}
                    />
                  );
                })}
              </BarChart>
              <div style={{ display: 'flex', gap: 8 }}>
                {charts.userGrowth.map((item) => (
                  <BarLabel key={item.month} style={{ flex: 1 }}>
                    {formatMonth(item.month)}
                  </BarLabel>
                ))}
              </div>
            </BarChartWrapper>
          )}
        </ChartCard>

        {/* Status de assinaturas */}
        <ChartCard>
          <ChartTitle>Status das assinaturas</ChartTitle>
          <SubStatusGrid>
            <SubStatusCard $color="#10B981">
              <SubStatusValue $color="#10B981">{overview.activeSubscriptions}</SubStatusValue>
              <SubStatusLabel>Ativas</SubStatusLabel>
            </SubStatusCard>
            <SubStatusCard $color="#F59E0B">
              <SubStatusValue $color="#F59E0B">{overview.trialingSubscriptions}</SubStatusValue>
              <SubStatusLabel>Trial</SubStatusLabel>
            </SubStatusCard>
            <SubStatusCard $color="#EF4444">
              <SubStatusValue $color="#EF4444">{overview.canceledSubscriptions}</SubStatusValue>
              <SubStatusLabel>Canceladas</SubStatusLabel>
            </SubStatusCard>
            <SubStatusCard $color="#6366F1">
              <SubStatusValue $color="#6366F1">{overview.totalSubscriptions}</SubStatusValue>
              <SubStatusLabel>Total</SubStatusLabel>
            </SubStatusCard>
          </SubStatusGrid>
        </ChartCard>
      </BottomRow>
    </Page>
  );
};

export default AdminDashboardPage;
