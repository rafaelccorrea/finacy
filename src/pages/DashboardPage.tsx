import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  CreditCard,
  FileCheck,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { Badge, Skeleton } from '@/components/ui';
import { subscriptionsService, cleanNameService } from '@/services/api';
import { useAuthStore } from '@/store';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'success' | 'info' | 'warning' | 'danger' | 'default' }> = {
  ACTIVE: { label: 'Ativo', variant: 'success' },
  TRIALING: { label: 'Período de Teste', variant: 'info' },
  PAST_DUE: { label: 'Pagamento Pendente', variant: 'warning' },
  CANCELED: { label: 'Cancelado', variant: 'danger' },
  UNPAID: { label: 'Inadimplente', variant: 'danger' },
  INACTIVE: { label: 'Inativo', variant: 'default' },
};

const card: React.CSSProperties = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden',
};

// Formata data com segurança — retorna fallback se inválida
function safeFormat(date: string | Date | null | undefined, fmt: string, opts?: object): string {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return format(d, fmt, opts);
  } catch {
    return '—';
  }
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Dashboard de assinaturas — retorna { hasActiveSubscription, currentPlan, subscriptionStatus, currentPeriodEnd, ... }
  const { data: dashboardData, isLoading: loadingSub } = useQuery({
    queryKey: ['subscription-dashboard'],
    queryFn: () => subscriptionsService.dashboard(),
    retry: false,
  });

  // Stats de Limpa Nome — retorna { total, completed, pending, creditsUsed, creditsTotal, creditsAvailable }
  const { data: cleanNameData, isLoading: loadingClean } = useQuery({
    queryKey: ['clean-name-stats'],
    queryFn: () => cleanNameService.stats(),
    retry: false,
  });

  // Extrair dados da resposta da API (axios → data → data do interceptor)
  const dash = dashboardData?.data?.data as {
    hasActiveSubscription: boolean;
    currentPlan: { id: string; name: string; price: number; features?: string[] } | null;
    subscriptionStatus: string | null;
    currentPeriodEnd: string | null;
    cleanNameCreditsUsed: number;
    cleanNameCreditsTotal: number;
    totalSubscriptions: number;
  } | null;

  const cleanStats = cleanNameData?.data?.data as {
    total: number;
    completed: number;
    pending: number;
    creditsUsed: number;
    creditsTotal: number;
    creditsAvailable: number;
  } | null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const daysRemaining = dash?.currentPeriodEnd
    ? Math.max(0, differenceInDays(new Date(dash.currentPeriodEnd), new Date()))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Greeting */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontSize: '14px' }}>
            {safeFormat(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <button
          onClick={() => navigate('/clean-name')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
            color: 'white',
            fontWeight: 600,
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
          }}
        >
          <Zap size={16} />
          Solicitar Limpa Nome
        </button>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

        {/* Subscription Status */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ height: '40px', width: '40px', borderRadius: '12px', backgroundColor: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={20} style={{ color: '#4F46E5' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Assinatura</span>
          </div>
          {loadingSub ? (
            <Skeleton className="h-6 w-24 mb-2" />
          ) : (
            <>
              <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {dash?.currentPlan?.name || 'Sem plano'}
              </p>
              {dash?.subscriptionStatus && (
                <Badge variant={statusConfig[dash.subscriptionStatus]?.variant || 'default'} dot>
                  {statusConfig[dash.subscriptionStatus]?.label || dash.subscriptionStatus}
                </Badge>
              )}
              {!dash?.hasActiveSubscription && (
                <Badge variant="default">Inativo</Badge>
              )}
            </>
          )}
        </div>

        {/* Days Remaining */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ height: '40px', width: '40px', borderRadius: '12px', backgroundColor: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} style={{ color: '#06B6D4' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Dias Restantes</span>
          </div>
          {loadingSub ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {dash?.hasActiveSubscription ? daysRemaining : '—'}
              </p>
              {dash?.currentPeriodEnd && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Renova em {safeFormat(dash.currentPeriodEnd, 'dd/MM/yyyy')}
                </p>
              )}
            </>
          )}
        </div>

        {/* Clean Name Credits */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ height: '40px', width: '40px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={20} style={{ color: '#10B981' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Créditos Limpa Nome</span>
          </div>
          {loadingClean ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {cleanStats?.creditsAvailable ?? '—'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {cleanStats
                  ? `${cleanStats.creditsUsed} de ${cleanStats.creditsTotal} utilizados`
                  : 'Sem dados'}
              </p>
            </>
          )}
        </div>

        {/* Total Requests */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ height: '40px', width: '40px', borderRadius: '12px', backgroundColor: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} style={{ color: '#7C3AED' }} />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>Total Solicitações</span>
          </div>
          {loadingClean ? (
            <Skeleton className="h-8 w-16 mb-2" />
          ) : (
            <>
              <p style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {cleanStats?.total ?? '0'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {cleanStats?.completed ?? 0} concluídas
              </p>
            </>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

        {/* Subscription Detail Card */}
        <div style={{ ...card, gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px' }}>Detalhes da Assinatura</h3>
            <button
              onClick={() => navigate('/my-plan')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 10px',
                borderRadius: '8px',
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
              Ver plano <ArrowRight size={12} />
            </button>
          </div>

          {loadingSub ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ) : dash?.hasActiveSubscription && dash.currentPlan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Plan Info */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.1), rgba(6,182,212,0.1))',
                border: '1px solid rgba(79,70,229,0.2)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>
                      {dash.currentPlan.name}
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px' }}>
                      R$ {Number(dash.currentPlan.price).toFixed(2).replace('.', ',')}/mês
                    </p>
                  </div>
                  {dash.subscriptionStatus && (
                    <Badge variant={statusConfig[dash.subscriptionStatus]?.variant || 'default'} dot>
                      {statusConfig[dash.subscriptionStatus]?.label || dash.subscriptionStatus}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Features */}
              {dash.currentPlan.features && dash.currentPlan.features.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {dash.currentPlan.features.slice(0, 4).map((feature: string) => (
                    <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <CheckCircle size={14} style={{ color: '#10B981', flexShrink: 0 }} />
                      {feature}
                    </div>
                  ))}
                </div>
              )}

              {/* Period */}
              {dash.currentPeriodEnd && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Próxima renovação:</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {safeFormat(dash.currentPeriodEnd, 'dd/MM/yyyy')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <AlertCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Nenhuma assinatura ativa</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                Escolha um plano para começar
              </p>
              <button
                onClick={() => navigate('/my-plan')}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #4F46E5, #06B6D4)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Ver Planos
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={card}>
          <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '15px', marginBottom: '24px' }}>
            Ações Rápidas
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                icon: FileCheck,
                label: 'Nova Solicitação',
                desc: 'Limpa Nome',
                iconColor: '#10B981',
                iconBg: 'rgba(16,185,129,0.1)',
                action: () => navigate('/clean-name'),
              },
              {
                icon: CreditCard,
                label: 'Gerenciar Plano',
                desc: 'Alterar assinatura',
                iconColor: '#4F46E5',
                iconBg: 'rgba(79,70,229,0.1)',
                action: () => navigate('/my-plan'),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--bg-tertiary)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  height: '40px',
                  width: '40px',
                  borderRadius: '12px',
                  backgroundColor: item.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <item.icon size={20} style={{ color: item.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
