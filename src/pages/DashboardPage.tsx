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
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { subscriptionsService, cleanNameService } from '@/services/api';
import { useAuthStore } from '@/store';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig = {
  ACTIVE: { label: 'Ativo', variant: 'success' as const },
  TRIALING: { label: 'Período de Teste', variant: 'info' as const },
  PAST_DUE: { label: 'Pagamento Pendente', variant: 'warning' as const },
  CANCELED: { label: 'Cancelado', variant: 'danger' as const },
  UNPAID: { label: 'Inadimplente', variant: 'danger' as const },
  INACTIVE: { label: 'Inativo', variant: 'default' as const },
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data: subscriptionData, isLoading: loadingSub } = useQuery({
    queryKey: ['subscription-dashboard'],
    queryFn: () => subscriptionsService.dashboard(),
    retry: false,
  });

  const { data: cleanNameData, isLoading: loadingClean } = useQuery({
    queryKey: ['clean-name-stats'],
    queryFn: () => cleanNameService.stats(),
    retry: false,
  });

  const subscription = subscriptionData?.data?.data;
  const cleanStats = cleanNameData?.data?.data;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const daysRemaining = subscription?.currentPeriodEnd
    ? differenceInDays(new Date(subscription.currentPeriodEnd), new Date())
    : 0;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            {greeting()}, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-[var(--text-secondary)] mt-1">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button
          onClick={() => navigate('/clean-name')}
          leftIcon={<Zap className="h-4 w-4" />}
        >
          Solicitar Limpa Nome
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subscription Status */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-indigo-500/10 -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-indigo-500" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Assinatura</span>
          </div>
          {loadingSub ? (
            <Skeleton className="h-6 w-24 mb-2" />
          ) : (
            <>
              <p className="text-xl font-bold text-[var(--text-primary)] mb-1">
                {subscription?.plan?.name || 'Sem plano'}
              </p>
              {subscription && (
                <Badge variant={statusConfig[subscription.status as keyof typeof statusConfig]?.variant || 'default'} dot>
                  {statusConfig[subscription.status as keyof typeof statusConfig]?.label || subscription.status}
                </Badge>
              )}
            </>
          )}
        </Card>

        {/* Days Remaining */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-cyan-500/10 -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-cyan-500" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Dias Restantes</span>
          </div>
          {loadingSub ? (
            <Skeleton className="h-6 w-16 mb-2" />
          ) : (
            <>
              <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                {subscription ? daysRemaining : '—'}
              </p>
              {subscription?.currentPeriodEnd && (
                <p className="text-xs text-[var(--text-muted)]">
                  Renova em {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}
                </p>
              )}
            </>
          )}
        </Card>

        {/* Clean Name Credits */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-emerald-500/10 -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <FileCheck className="h-5 w-5 text-emerald-500" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Créditos Limpa Nome</span>
          </div>
          {loadingClean ? (
            <Skeleton className="h-6 w-16 mb-2" />
          ) : (
            <>
              <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                {cleanStats?.creditsRemaining ?? '—'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {cleanStats ? `${cleanStats.creditsUsed} de ${cleanStats.creditsTotal} utilizados` : 'Sem dados'}
              </p>
            </>
          )}
        </Card>

        {/* Total Requests */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-violet-500/10 -translate-y-4 translate-x-4" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-violet-500" />
            </div>
            <span className="text-sm font-medium text-[var(--text-secondary)]">Total Solicitações</span>
          </div>
          {loadingClean ? (
            <Skeleton className="h-6 w-16 mb-2" />
          ) : (
            <>
              <p className="text-3xl font-bold text-[var(--text-primary)] mb-1">
                {cleanStats?.totalRequests ?? '0'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {cleanStats?.completedRequests ?? 0} concluídas
              </p>
            </>
          )}
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Card */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-[var(--text-primary)]">Detalhes da Assinatura</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/my-plan')}
                rightIcon={<ArrowRight className="h-3 w-3" />}
              >
                Ver plano
              </Button>
            </div>

            {loadingSub ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                {/* Plan Info */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[var(--text-primary)] text-lg">{subscription.plan?.name}</p>
                      <p className="text-[var(--text-secondary)] text-sm mt-0.5">
                        R$ {Number(subscription.plan?.price).toFixed(2).replace('.', ',')}/mês
                      </p>
                    </div>
                    <Badge
                      variant={statusConfig[subscription.status as keyof typeof statusConfig]?.variant || 'default'}
                      dot
                    >
                      {statusConfig[subscription.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </div>

                {/* Features */}
                {subscription.plan?.features && (
                  <div className="grid grid-cols-2 gap-2">
                    {subscription.plan.features.slice(0, 4).map((feature: string) => (
                      <div key={feature} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </div>
                    ))}
                  </div>
                )}

                {/* Period */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-muted)]">Período atual:</span>
                  <span className="text-[var(--text-secondary)] font-medium">
                    {format(new Date(subscription.currentPeriodStart), 'dd/MM/yyyy')} —{' '}
                    {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-[var(--text-muted)] mx-auto mb-3" />
                <p className="text-[var(--text-secondary)] font-medium">Nenhuma assinatura ativa</p>
                <p className="text-[var(--text-muted)] text-sm mt-1">Escolha um plano para começar</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate('/my-plan')}
                >
                  Ver Planos
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <h3 className="font-semibold text-[var(--text-primary)] mb-6">Ações Rápidas</h3>
          <div className="space-y-3">
            {[
              {
                icon: FileCheck,
                label: 'Nova Solicitação',
                desc: 'Limpa Nome',
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10',
                action: () => navigate('/clean-name'),
              },
              {
                icon: CreditCard,
                label: 'Gerenciar Plano',
                desc: 'Alterar assinatura',
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/10',
                action: () => navigate('/my-plan'),
              },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors text-left group"
              >
                <div className={`h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center`}>
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                  <p className="text-xs text-[var(--text-muted)]">{item.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
