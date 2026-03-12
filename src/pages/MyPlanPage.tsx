import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Star, Zap, Crown, AlertTriangle, CreditCard, QrCode } from 'lucide-react';
import { Card, Badge, Button, Skeleton } from '@/components/ui';
import { plansService, subscriptionsService, paymentsService } from '@/services/api';
import type { Plan, Subscription } from '@/types';
import { format, differenceInDays } from 'date-fns';

const planIcons = [Zap, Star, Crown];
const planColors = [
  { gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' },
  { gradient: 'from-indigo-500 to-violet-500', bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/30' },
  { gradient: 'from-violet-500 to-pink-500', bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500/30' },
];

type PaymentMethod = 'CREDIT_CARD' | 'PIX';

export const MyPlanPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: plansData, isLoading: loadingPlans } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plansService.list(),
  });

  const { data: subData, isLoading: loadingSub } = useQuery({
    queryKey: ['current-subscription'],
    queryFn: () => subscriptionsService.current(),
    retry: false,
  });

  const subscribeMutation = useMutation({
    mutationFn: ({ planId, method }: { planId: string; method: PaymentMethod }) =>
      paymentsService.subscribe(planId, method),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-dashboard'] });
      setShowPaymentModal(false);
      setSelectedPlan(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (subscriptionId: string) => paymentsService.cancel(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    },
  });

  const plans: Plan[] = plansData?.data?.data || [];
  const subscription: Subscription | null = subData?.data?.data || null;

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    if (!selectedPlan) return;
    subscribeMutation.mutate({ planId: selectedPlan, method: paymentMethod });
  };

  const daysRemaining = subscription?.currentPeriodEnd
    ? differenceInDays(new Date(subscription.currentPeriodEnd), new Date())
    : 0;

  return (
    <div className="space-y-8">
      {/* Current Subscription */}
      {loadingSub ? (
        <Card><Skeleton className="h-24 w-full" /></Card>
      ) : subscription && subscription.status !== 'CANCELED' ? (
        <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-500/5 to-cyan-500/5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-[var(--text-primary)]">Plano Atual</h3>
                <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'} dot>
                  {subscription.status === 'ACTIVE' ? 'Ativo' : subscription.status}
                </Badge>
              </div>
              <p className="text-2xl font-black text-[var(--text-primary)]">{subscription.plan?.name}</p>
              <p className="text-[var(--text-secondary)] mt-1">
                R$ {Number(subscription.plan?.price).toFixed(2).replace('.', ',')}/mês
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-muted)]">Próxima renovação</p>
              <p className="text-[var(--text-primary)] font-semibold">
                {format(new Date(subscription.currentPeriodEnd), 'dd/MM/yyyy')}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{daysRemaining} dias restantes</p>
            </div>
          </div>

          {/* Credits Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-[var(--text-secondary)]">Créditos Limpa Nome</span>
              <span className="font-medium text-[var(--text-primary)]">
                {subscription.cleanNameCreditsUsed}/{subscription.cleanNameCreditsTotal}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500"
                style={{
                  width: `${subscription.cleanNameCreditsTotal > 0
                    ? (subscription.cleanNameCreditsUsed / subscription.cleanNameCreditsTotal) * 100
                    : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button
              variant="danger"
              size="sm"
              onClick={() => cancelMutation.mutate(subscription.id)}
              loading={cancelMutation.isPending}
            >
              Cancelar Assinatura
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="text-center py-6 border-dashed">
          <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <p className="font-semibold text-[var(--text-primary)]">Nenhuma assinatura ativa</p>
          <p className="text-sm text-[var(--text-muted)] mt-1">Escolha um plano abaixo para começar</p>
        </Card>
      )}

      {/* Plans Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Planos Disponíveis</h2>
          <p className="text-[var(--text-secondary)] mt-1">Escolha o plano ideal para você</p>
        </div>

        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}><Skeleton className="h-64 w-full" /></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, index) => {
              const colors = planColors[index % planColors.length];
              const Icon = planIcons[index % planIcons.length];
              const isCurrentPlan = subscription?.planId === plan.id && subscription?.status === 'ACTIVE';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border p-6 transition-all duration-300 ${
                    plan.isHighlighted
                      ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 scale-105'
                      : `${colors.border} hover:shadow-md hover:-translate-y-1`
                  } bg-[var(--bg-card)]`}
                >
                  {plan.isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500">
                        MAIS POPULAR
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${colors.text}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--text-primary)]">{plan.name}</h3>
                      {plan.trialDays && (
                        <p className="text-xs text-emerald-500">{plan.trialDays} dias grátis</p>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm text-[var(--text-muted)]">R$</span>
                      <span className="text-4xl font-black text-[var(--text-primary)]">
                        {Number(plan.price).toFixed(0)}
                      </span>
                      <span className="text-sm text-[var(--text-muted)]">/mês</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{plan.description}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {plan.features?.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                      {plan.cleanNameCredits} crédito{plan.cleanNameCredits > 1 ? 's' : ''} Limpa Nome
                    </li>
                  </ul>

                  {/* CTA */}
                  {isCurrentPlan ? (
                    <Badge variant="success" className="w-full justify-center py-2">
                      Plano Atual
                    </Badge>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.isHighlighted ? 'primary' : 'outline'}
                      onClick={() => handleSubscribe(plan.id)}
                    >
                      {subscription ? 'Trocar para este plano' : 'Assinar agora'}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Escolha a forma de pagamento</h3>

            <div className="space-y-3 mb-6">
              {[
                { value: 'CREDIT_CARD' as PaymentMethod, icon: CreditCard, label: 'Cartão de Crédito', desc: 'Visa, Mastercard, Elo' },
                { value: 'PIX' as PaymentMethod, icon: QrCode, label: 'PIX', desc: 'Pagamento instantâneo' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPaymentMethod(option.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === option.value
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-[var(--border-color)] hover:border-indigo-500/50'
                  }`}
                >
                  <option.icon className={`h-6 w-6 ${paymentMethod === option.value ? 'text-indigo-500' : 'text-[var(--text-muted)]'}`} />
                  <div className="text-left">
                    <p className="font-medium text-[var(--text-primary)]">{option.label}</p>
                    <p className="text-xs text-[var(--text-muted)]">{option.desc}</p>
                  </div>
                  {paymentMethod === option.value && (
                    <CheckCircle className="h-5 w-5 text-indigo-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmPayment}
                loading={subscribeMutation.isPending}
              >
                Confirmar
              </Button>
            </div>

            {subscribeMutation.isError && (
              <p className="mt-3 text-sm text-rose-500 text-center">
                Erro ao processar pagamento. Tente novamente.
              </p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
