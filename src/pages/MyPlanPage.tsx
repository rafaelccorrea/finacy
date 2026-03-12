import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  CheckCircle,
  Star,
  Zap,
  Crown,
  AlertTriangle,
  CreditCard,
  QrCode,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { plansService, subscriptionsService, paymentsService } from '../services/api';
import { Card, Badge } from '../components/ui';

/* ─── Animations ──────────────────────────────────────────────────────────── */
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── Styled Components ───────────────────────────────────────────────────── */
const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  animation: ${fadeIn} 0.4s ease;
`;

const SectionHeader = styled.div`
  h2 {
    font-size: 22px;
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

/* Current Plan Card */
const CurrentPlanCard = styled(Card)<{ $active?: boolean }>`
  border-color: ${({ $active, theme }) => $active ? theme.accent.primary + '40' : theme.border.default};
  background: ${({ $active, theme }) => $active
    ? `linear-gradient(135deg, ${theme.accent.primary}08, ${theme.accent.secondary}08)`
    : theme.bg.card};
`;

const PlanRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`;

const PlanInfo = styled.div`
  h3 {
    font-size: 15px;
    font-weight: 600;
    color: ${({ theme }) => theme.text.muted};
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .plan-name {
    font-size: 24px;
    font-weight: 900;
    color: ${({ theme }) => theme.text.primary};
    margin: 0 0 4px 0;
  }
  .plan-price {
    font-size: 14px;
    color: ${({ theme }) => theme.text.muted};
  }
`;

const PlanRight = styled.div`
  text-align: right;
  .label { font-size: 13px; color: ${({ theme }) => theme.text.muted}; }
  .value { font-size: 15px; font-weight: 600; color: ${({ theme }) => theme.text.primary}; margin-top: 2px; }
  .sub { font-size: 12px; color: ${({ theme }) => theme.text.muted}; margin-top: 2px; }
`;

const ProgressBar = styled.div`
  margin-top: 20px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 8px;
  .label { color: ${({ theme }) => theme.text.muted}; }
  .value { font-weight: 600; color: ${({ theme }) => theme.text.primary}; }
`;

const ProgressTrack = styled.div`
  height: 8px;
  border-radius: 4px;
  background: ${({ theme }) => theme.bg.tertiary};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  border-radius: 4px;
  width: ${p => p.$pct}%;
  background: ${({ theme }) => theme.accent.gradient};
  transition: width 0.5s ease;
`;

const CancelBtn = styled.button`
  margin-top: 16px;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.status.danger}40;
  background: ${({ theme }) => theme.status.dangerBg};
  color: ${({ theme }) => theme.status.danger};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover { background: ${({ theme }) => theme.status.danger}20; }
`;

/* Empty State */
const EmptyBox = styled(Card)`
  text-align: center;
  padding: 32px;
  border-style: dashed;
`;

/* Plans Grid */
const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const PlanCard = styled.div<{ $highlighted?: boolean }>`
  position: relative;
  border-radius: ${({ theme }) => theme.radius.lg};
  border: 1.5px solid ${({ $highlighted, theme }) =>
    $highlighted ? theme.accent.primary + '50' : theme.border.default};
  padding: 28px 24px;
  background: ${({ theme }) => theme.bg.card};
  transition: all 0.3s ease;
  transform: ${({ $highlighted }) => $highlighted ? 'scale(1.03)' : 'none'};
  box-shadow: ${({ $highlighted }) => $highlighted ? '0 8px 30px rgba(99,102,241,0.15)' : 'none'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadow.glow};
  }
`;

const PopularTag = styled.span`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: white;
  background: ${({ theme }) => theme.accent.gradient};
  white-space: nowrap;
`;

const PlanIconBox = styled.div<{ $bg: string; $color: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${p => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${p => p.$color};
  margin-bottom: 16px;
`;

const PlanName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 4px 0;
`;

const PlanTrialNote = styled.p`
  font-size: 12px;
  color: #10B981;
  margin: 0;
`;

const PriceRow = styled.div`
  margin: 20px 0;
  display: flex;
  align-items: baseline;
  gap: 4px;
  .currency { font-size: 14px; color: ${({ theme }) => theme.text.muted}; }
  .amount { font-size: 40px; font-weight: 900; color: ${({ theme }) => theme.text.primary}; line-height: 1; }
  .period { font-size: 14px; color: ${({ theme }) => theme.text.muted}; }
`;

const PlanDesc = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin: 0 0 20px 0;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
`;

const SubscribeBtn = styled.button<{ $primary?: boolean }>`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${({ $primary, theme }) => $primary ? 'none' : `1.5px solid ${theme.border.default}`};
  background: ${({ $primary, theme }) => $primary ? theme.accent.gradient : 'transparent'};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.text.primary};
  box-shadow: ${({ $primary }) => $primary ? '0 4px 14px rgba(99,102,241,0.3)' : 'none'};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${({ $primary }) => $primary
      ? '0 6px 20px rgba(99,102,241,0.4)'
      : '0 4px 12px rgba(0,0,0,0.1)'};
  }
`;

const CurrentBadge = styled.div`
  width: 100%;
  padding: 10px;
  border-radius: 12px;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #10B981;
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.2);
`;

/* Modal */
const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(4px);
`;

const ModalCard = styled(Card)`
  width: 100%;
  max-width: 440px;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  h3 {
    font-size: 18px;
    font-weight: 700;
    color: ${({ theme }) => theme.text.primary};
    margin: 0;
  }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.muted};
  cursor: pointer;
  padding: 4px;
  &:hover { color: ${({ theme }) => theme.text.primary}; }
`;

const PaymentOption = styled.button<{ $selected?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid ${({ $selected, theme }) =>
    $selected ? theme.accent.primary : theme.border.default};
  background: ${({ $selected, theme }) =>
    $selected ? theme.accent.primary + '10' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover { border-color: ${({ theme }) => theme.accent.primary}60; }
`;

const PayOptionText = styled.div`
  flex: 1;
  .label { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.text.primary}; }
  .desc { font-size: 12px; color: ${({ theme }) => theme.text.muted}; }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const ModalBtn = styled.button<{ $primary?: boolean }>`
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border: ${({ $primary, theme }) => $primary ? 'none' : `1.5px solid ${theme.border.default}`};
  background: ${({ $primary, theme }) => $primary ? theme.accent.gradient : 'transparent'};
  color: ${({ $primary, theme }) => $primary ? 'white' : theme.text.primary};
`;

const ErrorText = styled.p`
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.status.danger};
  margin-top: 12px;
`;

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface Plan {
  id: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
  cleanNameCredits: number;
  trialDays?: number;
  isHighlighted?: boolean;
}

interface Subscription {
  id: string;
  status: string;
  planId: string;
  plan?: Plan;
  currentPeriodEnd: string;
  cleanNameCreditsUsed?: number;
  cleanNameCreditsTotal?: number;
}

type PaymentMethod = 'CREDIT_CARD' | 'PIX';

const planIcons = [Zap, Star, Crown];
const planColorSets = [
  { bg: 'rgba(59,130,246,0.1)', color: '#3B82F6' },
  { bg: 'rgba(99,102,241,0.1)', color: '#6366F1' },
  { bg: 'rgba(139,92,246,0.1)', color: '#8B5CF6' },
];

/* ─── Component ───────────────────────────────────────────────────────────── */
export const MyPlanPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingSub, setLoadingSub] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CREDIT_CARD');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await plansService.list();
        setPlans(res.data.data || []);
      } catch {} finally { setLoadingPlans(false); }
    };
    const fetchSub = async () => {
      try {
        const res = await subscriptionsService.getCurrent();
        setSubscription(res.data.data || null);
      } catch {} finally { setLoadingSub(false); }
    };
    fetchPlans();
    fetchSub();
  }, []);

  const handleSubscribe = (planId: string) => {
    setSelectedPlan(planId);
    setShowModal(true);
    setError('');
  };

  const handleConfirm = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setError('');
    try {
      await paymentsService.subscribe(selectedPlan, paymentMethod);
      setShowModal(false);
      // Refresh subscription
      const res = await subscriptionsService.getCurrent();
      setSubscription(res.data.data || null);
    } catch {
      setError('Erro ao processar pagamento. Tente novamente.');
    } finally { setSubmitting(false); }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    try {
      await paymentsService.cancel(subscription.id);
      setSubscription(null);
    } catch {}
  };

  const creditsUsed = subscription?.cleanNameCreditsUsed || 0;
  const creditsTotal = subscription?.cleanNameCreditsTotal || 0;
  const creditsPct = creditsTotal > 0 ? (creditsUsed / creditsTotal) * 100 : 0;

  return (
    <Page>
      {/* Current Subscription */}
      <div>
        <SectionHeader>
          <h2>Meu Plano</h2>
          <p>Gerencie sua assinatura atual</p>
        </SectionHeader>
      </div>

      {loadingSub ? (
        <Card>
          <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            Carregando...
          </div>
        </Card>
      ) : subscription && subscription.status !== 'CANCELED' ? (
        <CurrentPlanCard $active>
          <PlanRow>
            <PlanInfo>
              <h3>Plano Atual <Badge variant="success" dot>Ativo</Badge></h3>
              <p className="plan-name">{subscription.plan?.name || 'Plano'}</p>
              <p className="plan-price">R$ {Number(subscription.plan?.price || 0).toFixed(2).replace('.', ',')}/mes</p>
            </PlanInfo>
            <PlanRight>
              <p className="label">Proxima renovacao</p>
              <p className="value">{new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</p>
            </PlanRight>
          </PlanRow>

          <ProgressBar>
            <ProgressLabel>
              <span className="label">Creditos Limpa Nome</span>
              <span className="value">{creditsUsed}/{creditsTotal}</span>
            </ProgressLabel>
            <ProgressTrack>
              <ProgressFill $pct={creditsPct} />
            </ProgressTrack>
          </ProgressBar>

          <CancelBtn onClick={handleCancel}>Cancelar Assinatura</CancelBtn>
        </CurrentPlanCard>
      ) : (
        <EmptyBox>
          <AlertTriangle size={40} color="#F59E0B" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 600, fontSize: 15 }}>Nenhuma assinatura ativa</p>
          <p style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>Escolha um plano abaixo para comecar</p>
        </EmptyBox>
      )}

      {/* Plans Grid */}
      <div>
        <SectionHeader>
          <h2>Planos Disponiveis</h2>
          <p>Escolha o plano ideal para voce</p>
        </SectionHeader>
      </div>

      {loadingPlans ? (
        <PlansGrid>
          {[1,2,3].map(i => (
            <Card key={i}>
              <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                Carregando...
              </div>
            </Card>
          ))}
        </PlansGrid>
      ) : (
        <PlansGrid>
          {plans.map((plan, index) => {
            const colors = planColorSets[index % planColorSets.length];
            const Icon = planIcons[index % planIcons.length];
            const isCurrent = subscription?.planId === plan.id && subscription?.status === 'ACTIVE';

            return (
              <PlanCard key={plan.id} $highlighted={plan.isHighlighted}>
                {plan.isHighlighted && <PopularTag>MAIS POPULAR</PopularTag>}

                <PlanIconBox $bg={colors.bg} $color={colors.color}>
                  <Icon size={22} />
                </PlanIconBox>

                <PlanName>{plan.name}</PlanName>
                {plan.trialDays && <PlanTrialNote>{plan.trialDays} dias gratis</PlanTrialNote>}

                <PriceRow>
                  <span className="currency">R$</span>
                  <span className="amount">{Number(plan.price).toFixed(0)}</span>
                  <span className="period">/mes</span>
                </PriceRow>

                {plan.description && <PlanDesc>{plan.description}</PlanDesc>}

                <FeatureList>
                  {plan.features?.map(f => (
                    <FeatureItem key={f}>
                      <CheckCircle size={16} color="#10B981" />
                      {f}
                    </FeatureItem>
                  ))}
                  <FeatureItem>
                    <CheckCircle size={16} color="#10B981" />
                    {plan.cleanNameCredits} credito{plan.cleanNameCredits > 1 ? 's' : ''} Limpa Nome
                  </FeatureItem>
                </FeatureList>

                {isCurrent ? (
                  <CurrentBadge>Plano Atual</CurrentBadge>
                ) : (
                  <SubscribeBtn $primary={plan.isHighlighted} onClick={() => handleSubscribe(plan.id)}>
                    {subscription ? 'Trocar para este plano' : 'Assinar agora'}
                  </SubscribeBtn>
                )}
              </PlanCard>
            );
          })}
        </PlansGrid>
      )}

      {/* Payment Modal */}
      {showModal && (
        <Overlay>
          <ModalCard>
            <ModalTitle>
              <h3>Forma de Pagamento</h3>
              <CloseBtn onClick={() => setShowModal(false)}><X size={20} /></CloseBtn>
            </ModalTitle>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <PaymentOption $selected={paymentMethod === 'CREDIT_CARD'} onClick={() => setPaymentMethod('CREDIT_CARD')}>
                <CreditCard size={22} color={paymentMethod === 'CREDIT_CARD' ? '#6366F1' : '#999'} />
                <PayOptionText>
                  <div className="label">Cartao de Credito</div>
                  <div className="desc">Visa, Mastercard, Elo</div>
                </PayOptionText>
                {paymentMethod === 'CREDIT_CARD' && <CheckCircle size={20} color="#6366F1" />}
              </PaymentOption>

              <PaymentOption $selected={paymentMethod === 'PIX'} onClick={() => setPaymentMethod('PIX')}>
                <QrCode size={22} color={paymentMethod === 'PIX' ? '#6366F1' : '#999'} />
                <PayOptionText>
                  <div className="label">PIX</div>
                  <div className="desc">Pagamento instantaneo</div>
                </PayOptionText>
                {paymentMethod === 'PIX' && <CheckCircle size={20} color="#6366F1" />}
              </PaymentOption>
            </div>

            <ModalActions>
              <ModalBtn onClick={() => setShowModal(false)}>Cancelar</ModalBtn>
              <ModalBtn $primary onClick={handleConfirm} disabled={submitting}>
                {submitting ? 'Processando...' : 'Confirmar'}
              </ModalBtn>
            </ModalActions>

            {error && <ErrorText>{error}</ErrorText>}
          </ModalCard>
        </Overlay>
      )}
    </Page>
  );
};
