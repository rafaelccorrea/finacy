import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { plansService, paymentsService } from '../services/api';
import { useAuthStore } from '../store';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.bg.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: -200px;
    left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 800px;
    background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
  animation: ${fadeIn} 0.5s ease;
`;

const Logo = styled.div`
  width: 56px;
  height: 56px;
  background: ${({ theme }) => theme.accent.gradient};
  border-radius: ${({ theme }) => theme.radius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 24px;
  font-weight: 800;
  color: white;
  box-shadow: ${({ theme }) => theme.shadow.glow};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 12px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0;
  max-width: 480px;
`;

const AlertBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.3);
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 14px 20px;
  margin-bottom: 40px;
  max-width: 700px;
  width: 100%;
  animation: ${fadeIn} 0.5s ease 0.1s both;
  svg { color: #F59E0B; flex-shrink: 0; }
  span { font-size: 14px; color: #F59E0B; font-weight: 500; }
`;

const PlansGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  max-width: 960px;
  width: 100%;
  animation: ${fadeIn} 0.5s ease 0.2s both;
`;

const PlanCard = styled.div<{ $popular?: boolean; $selected?: boolean }>`
  background: ${({ theme }) => theme.bg.card};
  border: 2px solid ${({ theme, $selected, $popular }) =>
    $selected ? theme.accent.primary : $popular ? 'rgba(99,102,241,0.4)' : theme.border.default};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 32px 28px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  ${({ $popular, theme }) => $popular && `
    background: linear-gradient(145deg, ${theme.bg.card}, rgba(99,102,241,0.05));
    box-shadow: ${theme.shadow.glow};
  `}
  &:hover {
    border-color: ${({ theme }) => theme.accent.primary};
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadow.lg};
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: ${({ theme }) => theme.accent.gradient};
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: ${({ theme }) => theme.radius.full};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PlanName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 8px;
`;

const PlanDescription = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  margin: 0 0 24px;
  line-height: 1.5;
`;

const PlanPrice = styled.div`
  margin-bottom: 24px;
  .amount { font-size: 40px; font-weight: 800; color: ${({ theme }) => theme.text.primary}; line-height: 1; }
  .currency { font-size: 20px; font-weight: 600; color: ${({ theme }) => theme.text.secondary}; vertical-align: super; margin-right: 2px; }
  .period { font-size: 14px; color: ${({ theme }) => theme.text.muted}; margin-top: 4px; }
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: ${({ theme }) => theme.text.secondary};
  svg { color: ${({ theme }) => theme.status.success}; flex-shrink: 0; }
`;

const SelectButton = styled.button<{ $selected?: boolean; $popular?: boolean }>`
  width: 100%;
  padding: 14px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ theme, $selected, $popular }) =>
    $selected || $popular ? theme.accent.gradient : 'transparent'};
  color: ${({ theme, $selected, $popular }) =>
    $selected || $popular ? 'white' : theme.text.primary};
  border: 2px solid ${({ theme, $selected, $popular }) =>
    $selected || $popular ? 'transparent' : theme.border.default};
  &:hover { background: ${({ theme }) => theme.accent.gradient}; color: white; border-color: transparent; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

const LoadingCard = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: ${({ theme }) => theme.radius.xl};
  padding: 32px 28px;
  height: 380px;
  background: linear-gradient(90deg,
    ${({ theme }) => theme.bg.card} 25%,
    ${({ theme }) => theme.bg.cardHover} 50%,
    ${({ theme }) => theme.bg.card} 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const LogoutButton = styled.button`
  margin-top: 32px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.muted};
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: color 0.2s ease;
  animation: ${fadeIn} 0.5s ease 0.4s both;
  &:hover { color: ${({ theme }) => theme.text.secondary}; }
`;

const PaymentMethodSelect = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const MethodButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 10px;
  border-radius: ${({ theme }) => theme.radius.sm};
  border: 2px solid ${({ theme, $active }) => $active ? theme.accent.primary : theme.border.default};
  background: ${({ theme, $active }) => $active ? 'rgba(99,102,241,0.1)' : 'transparent'};
  color: ${({ theme, $active }) => $active ? theme.accent.primary : theme.text.secondary};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
`;

interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  cleanNameCredits: number;
  isPopular: boolean;
  features: Record<string, any>;
}

const SubscriptionGatePage: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadPlans(); }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await plansService.list();
      const data = response.data?.data || response.data || [];
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setError('Nao foi possivel carregar os planos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    setSubmitting(true);
    setError(null);
    try {
      const response = await paymentsService.createSubscriptionCheckout({
        planId: selectedPlan,
        paymentMethod: paymentMethod === 'credit_card' ? 'card' : 'pix',
        successUrl: window.location.origin + '/dashboard?subscribed=true',
        cancelUrl: window.location.origin + '/choose-plan',
      });
      const data = response.data?.data || response.data;
      const url = data?.checkoutUrl || data?.url;
      if (url) {
        window.location.href = url;
      } else {
        setError('Nao foi possivel iniciar o checkout. Tente novamente.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const getFeatures = (plan: Plan) => {
    const features: string[] = [];
    if (plan.cleanNameCredits > 0) features.push(plan.cleanNameCredits + ' solicitacao' + (plan.cleanNameCredits > 1 ? 'es' : '') + ' Limpa Nome');
    if (plan.features?.dashboard) features.push('Dashboard completo');
    if (plan.features?.reports) features.push('Relatorios avancados');
    if (plan.features?.api) features.push('Acesso a API');
    if (plan.features?.support === 'email') features.push('Suporte por e-mail');
    if (plan.features?.support === 'priority') features.push('Suporte prioritario');
    if (plan.features?.support === 'dedicated') features.push('Suporte dedicado');
    return features;
  };

  return (
    <PageWrapper>
      <Header>
        <Logo>F</Logo>
        <Title>Escolha seu Plano</Title>
        <Subtitle>Para acessar o Finacy, voce precisa ter uma assinatura ativa. Escolha o plano ideal para voce.</Subtitle>
      </Header>

      <AlertBanner>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>Sua conta nao possui uma assinatura ativa. Assine um plano para continuar.</span>
      </AlertBanner>

      {error && (
        <AlertBanner style={{ borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', marginBottom: 24 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ color: '#EF4444' }}>{error}</span>
        </AlertBanner>
      )}

      <PlansGrid>
        {loading ? (
          <><LoadingCard /><LoadingCard /><LoadingCard /></>
        ) : plans.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#8B8BA3', fontSize: 16 }}>Nenhum plano disponivel no momento. Entre em contato com o suporte.</p>
          </div>
        ) : (
          plans.map((plan) => (
            <PlanCard key={plan.id} $popular={plan.isPopular} $selected={selectedPlan === plan.id} onClick={() => setSelectedPlan(plan.id)}>
              {plan.isPopular && <PopularBadge>Mais popular</PopularBadge>}
              <PlanName>{plan.name}</PlanName>
              <PlanDescription>{plan.description}</PlanDescription>
              <PlanPrice>
                <span className="currency">R$</span>
                <span className="amount">{Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</span>
                <div className="period">por mes</div>
              </PlanPrice>
              <FeatureList>
                {getFeatures(plan).map((feature, i) => (
                  <FeatureItem key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {feature}
                  </FeatureItem>
                ))}
              </FeatureList>
              {selectedPlan === plan.id && (
                <PaymentMethodSelect>
                  <MethodButton $active={paymentMethod === 'credit_card'} onClick={(e) => { e.stopPropagation(); setPaymentMethod('credit_card'); }}>Cartao</MethodButton>
                  <MethodButton $active={paymentMethod === 'pix'} onClick={(e) => { e.stopPropagation(); setPaymentMethod('pix'); }}>PIX</MethodButton>
                </PaymentMethodSelect>
              )}
              <SelectButton
                $selected={selectedPlan === plan.id}
                $popular={plan.isPopular}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedPlan === plan.id) { handleSubscribe(); }
                  else { setSelectedPlan(plan.id); }
                }}
                disabled={submitting}
              >
                {submitting && selectedPlan === plan.id ? 'Processando...' : selectedPlan === plan.id ? 'Confirmar e Assinar' : 'Selecionar Plano'}
              </SelectButton>
            </PlanCard>
          ))
        )}
      </PlansGrid>

      <LogoutButton onClick={handleLogout}>Sair da conta</LogoutButton>
    </PageWrapper>
  );
};

export default SubscriptionGatePage;
