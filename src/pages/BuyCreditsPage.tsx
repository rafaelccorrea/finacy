import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Zap, CreditCard, QrCode, Star, Check, ArrowLeft, Loader, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { paymentsService } from '../services/api';

const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); }`;

const Page = styled.div`
  padding: 32px;
  animation: ${fadeIn} 0.4s ease;
  max-width: 1100px;
  margin: 0 auto;
`;

const BackBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-bottom: 28px;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.text.primary}; }
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  color: ${({ theme }) => theme.text.secondary};
  font-size: 15px;
  margin: 0;
`;

const BalanceCard = styled.div`
  background: ${({ theme }) => theme.accent.gradient};
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

const BalanceInfo = styled.div``;
const BalanceLabel = styled.p`
  color: rgba(255,255,255,0.75);
  font-size: 13px;
  margin: 0 0 4px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;
const BalanceValue = styled.p`
  color: #fff;
  font-size: 36px;
  font-weight: 800;
  margin: 0;
  line-height: 1;
`;
const BalanceSub = styled.p`
  color: rgba(255,255,255,0.65);
  font-size: 13px;
  margin: 6px 0 0;
`;

const ZapIcon = styled.div`
  width: 64px;
  height: 64px;
  background: rgba(255,255,255,0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 20px;
`;

const PackagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

interface PackageCardProps { $popular?: boolean; $selected?: boolean; }
const PackageCard = styled.div<PackageCardProps>`
  background: ${({ theme }) => theme.bg.card};
  border: 2px solid ${({ $popular, $selected, theme }) =>
    $selected ? theme.accent.primary : $popular ? theme.accent.primary + '60' : theme.border.default};
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.accent.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${({ theme }) => theme.accent.primary}20;
  }
`;

const PopularBadge = styled.div`
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme }) => theme.accent.gradient};
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 20px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PackageCredits = styled.div`
  font-size: 32px;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 4px;
`;

const PackageCreditsLabel = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 16px;
`;

const PackageName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: 6px;
`;

const PackageDesc = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: 16px;
  min-height: 36px;
`;

const PackagePrice = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.accent.primary};
`;

const PackagePricePer = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.text.secondary};
  margin-left: 4px;
`;

const SelectedCheck = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  width: 24px;
  height: 24px;
  background: ${({ theme }) => theme.accent.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PaymentSection = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 24px;
`;

const PaymentTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 16px;
`;

const PaymentMethods = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

interface MethodBtnProps { $active?: boolean; }
const MethodBtn = styled.button<MethodBtnProps>`
  flex: 1;
  min-width: 140px;
  padding: 14px 20px;
  border-radius: 12px;
  border: 2px solid ${({ $active, theme }) => $active ? theme.accent.primary : theme.border.default};
  background: ${({ $active, theme }) => $active ? theme.accent.primary + '15' : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.accent.primary : theme.text.secondary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  &:hover {
    border-color: ${({ theme }) => theme.accent.primary};
    color: ${({ theme }) => theme.accent.primary};
  }
`;

const CheckoutBtn = styled.button`
  width: 100%;
  padding: 16px;
  background: ${({ theme }) => theme.accent.gradient};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s, transform 0.1s;
  &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SecurityNote = styled.p`
  text-align: center;
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin: 12px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: ${({ theme }) => theme.text.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const SpinLoader = styled(Loader)`
  animation: ${spin} 1s linear infinite;
`;

// ─── Pacotes padrão (fallback se API não retornar) ────────────────────────────
const DEFAULT_PACKAGES = [
  { id: 'starter', name: 'Starter', description: 'Ideal para começar', credits: 5, price: 29.90, isPopular: false },
  { id: 'popular', name: 'Popular', description: 'Mais escolhido pelos clientes', credits: 15, price: 69.90, isPopular: true },
  { id: 'pro', name: 'Pro', description: 'Para uso intenso', credits: 30, price: 119.90, isPopular: false },
  { id: 'enterprise', name: 'Enterprise', description: 'Máximo de créditos', credits: 60, price: 199.90, isPopular: false },
];

const BuyCreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const [packages, setPackages] = useState<any[]>(DEFAULT_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');
  const [balance, setBalance] = useState({ available: 0, used: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pkgRes, balRes] = await Promise.allSettled([
          paymentsService.listCreditPackages(),
          paymentsService.getCreditsBalance(),
        ]);

        if (pkgRes.status === 'fulfilled' && pkgRes.value?.data?.data?.length > 0) {
          setPackages(pkgRes.value.data.data);
        }
        if (balRes.status === 'fulfilled' && balRes.value?.data?.data) {
          setBalance(balRes.value.data.data);
        }
      } catch (_) {
        // usa defaults
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleCheckout = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    try {
      const res = await paymentsService.createCreditCheckout({
        packageId: selectedPackage,
        paymentMethod,
        successUrl: `${window.location.origin}/dashboard?payment=success`,
        cancelUrl: `${window.location.origin}/buy-credits`,
      });

      const url = res?.data?.data?.checkoutUrl;
      if (url) {
        window.location.href = url;
      } else {
        alert('Link de pagamento não disponível. Verifique as configurações do Stripe.');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao criar checkout. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const selectedPkg = packages.find(p => p.id === selectedPackage);

  return (
    <Page>
      <BackBtn onClick={() => navigate(-1)}>
        <ArrowLeft size={16} />
        Voltar
      </BackBtn>

      <Header>
        <Title>Comprar Créditos</Title>
        <Subtitle>Adicione créditos para solicitar limpeza de nome a qualquer momento</Subtitle>
      </Header>

      {/* Saldo atual */}
      <BalanceCard>
        <BalanceInfo>
          <BalanceLabel>Saldo atual de créditos</BalanceLabel>
          <BalanceValue>{loadingData ? '...' : balance.available}</BalanceValue>
          <BalanceSub>{balance.used} créditos utilizados no total</BalanceSub>
        </BalanceInfo>
        <ZapIcon>
          <Zap size={28} color="#fff" />
        </ZapIcon>
      </BalanceCard>

      {/* Pacotes */}
      <SectionTitle>Escolha um pacote</SectionTitle>
      {loadingData ? (
        <EmptyState>
          <SpinLoader size={32} />
          <p>Carregando pacotes...</p>
        </EmptyState>
      ) : (
        <PackagesGrid>
          {packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              $popular={pkg.isPopular}
              $selected={selectedPackage === pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.isPopular && (
                <PopularBadge>
                  <Star size={10} fill="#fff" />
                  Mais popular
                </PopularBadge>
              )}
              {selectedPackage === pkg.id && (
                <SelectedCheck>
                  <Check size={14} color="#fff" strokeWidth={3} />
                </SelectedCheck>
              )}
              <PackageCredits>{pkg.credits}</PackageCredits>
              <PackageCreditsLabel>créditos Limpa Nome</PackageCreditsLabel>
              <PackageName>{pkg.name}</PackageName>
              <PackageDesc>{pkg.description}</PackageDesc>
              <PackagePrice>
                R$ {Number(pkg.price).toFixed(2).replace('.', ',')}
                <PackagePricePer>
                  · R$ {(Number(pkg.price) / pkg.credits).toFixed(2).replace('.', ',')} / crédito
                </PackagePricePer>
              </PackagePrice>
            </PackageCard>
          ))}
        </PackagesGrid>
      )}

      {/* Método de pagamento */}
      {selectedPackage && (
        <PaymentSection>
          <PaymentTitle>Forma de pagamento</PaymentTitle>
          <PaymentMethods>
            <MethodBtn
              $active={paymentMethod === 'card'}
              onClick={() => setPaymentMethod('card')}
            >
              <CreditCard size={18} />
              Cartão de Crédito
            </MethodBtn>
            <MethodBtn
              $active={paymentMethod === 'pix'}
              onClick={() => setPaymentMethod('pix')}
            >
              <QrCode size={18} />
              PIX
            </MethodBtn>
          </PaymentMethods>
        </PaymentSection>
      )}

      {/* Botão de checkout */}
      <CheckoutBtn
        onClick={handleCheckout}
        disabled={!selectedPackage || loading}
      >
        {loading ? (
          <>
            <SpinLoader size={18} />
            Redirecionando...
          </>
        ) : selectedPkg ? (
          <>
            <CreditCard size={18} />
            Pagar R$ {Number(selectedPkg.price).toFixed(2).replace('.', ',')} via {paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
          </>
        ) : (
          <>
            <Zap size={18} />
            Selecione um pacote para continuar
          </>
        )}
      </CheckoutBtn>

      <SecurityNote>
        <Shield size={13} />
        Pagamento 100% seguro via Stripe · SSL · PCI-DSS
      </SecurityNote>
    </Page>
  );
};

export { BuyCreditsPage };
export default BuyCreditsPage;
