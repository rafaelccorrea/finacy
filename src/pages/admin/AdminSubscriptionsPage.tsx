import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  RefreshCw, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, Clock, AlertCircle, CreditCard,
} from 'lucide-react';
import { adminService } from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SubItem {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  cleanNameCreditsUsed: number;
  cleanNameCreditsTotal: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
  plan: { id: string; name: string; price: number; slug: string };
}

interface PaymentItem {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string | null;
  paymentType: string;
  creditsAmount: number | null;
  paidAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  receiptUrl: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  plan: { name: string; price: number } | null;
}

// ─── Styled Components ─────────────────────────────────────────────────────────
const Page = styled.div`
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 28px;
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

const Tabs = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: ${({ theme }) => theme.bg.secondary};
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: ${({ $active, theme }) => $active ? theme.bg.card : 'transparent'};
  color: ${({ $active, theme }) => $active ? theme.text.primary : theme.text.muted};
  font-size: 14px;
  font-weight: ${({ $active }) => $active ? 700 : 500};
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${({ $active }) => $active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'};
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  height: 42px;
  padding: 0 12px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 10px;
  color: ${({ theme }) => theme.text.secondary};
  font-size: 13px;
  cursor: pointer;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.accent.primary}; }
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 42px;
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

const Table = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 16px;
  overflow: hidden;
`;

const SubTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
  padding: 14px 20px;
  background: ${({ theme }) => theme.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.default};
  gap: 12px;
`;

const PayTableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
  padding: 14px 20px;
  background: ${({ theme }) => theme.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.default};
  gap: 12px;
`;

const TableHeaderCell = styled.div`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.text.muted};
`;

const SubRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.light};
  gap: 12px;
  align-items: center;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.bg.cardHover}; }
`;

const PayRow = styled(SubRow)``;

const UserInfo = styled.div``;
const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.primary};
`;
const UserEmail = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 2px;
`;

const Badge = styled.span<{ $color: string; $bg: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  background: ${({ $bg }) => $bg};
`;

const CellText = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.secondary};
`;

const Amount = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
`;

const ReceiptLink = styled.a`
  font-size: 12px;
  color: ${({ theme }) => theme.accent.primary};
  text-decoration: none;
  &:hover { text-decoration: underline; }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.border.default};
`;

const PaginationInfo = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.text.muted};
`;

const PaginationBtns = styled.div`
  display: flex;
  gap: 8px;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${({ $active, theme }) => $active ? theme.accent.primary : theme.border.default};
  background: ${({ $active, theme }) => $active ? theme.accent.primary : theme.bg.secondary};
  color: ${({ $active }) => $active ? 'white' : 'inherit'};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
  font-size: 15px;
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getSubStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return { label: 'Ativa', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={11} /> };
    case 'trialing': return { label: 'Trial', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={11} /> };
    case 'canceled': return { label: 'Cancelada', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={11} /> };
    case 'past_due': return { label: 'Vencida', color: '#F97316', bg: 'rgba(249,115,22,0.12)', icon: <AlertCircle size={11} /> };
    default: return { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: null };
  }
};

const getPayStatusBadge = (status: string) => {
  switch (status) {
    case 'succeeded': return { label: 'Pago', color: '#10B981', bg: 'rgba(16,185,129,0.12)' };
    case 'pending': return { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
    case 'failed': return { label: 'Falhou', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
    case 'refunded': return { label: 'Reembolsado', color: '#6366F1', bg: 'rgba(99,102,241,0.12)' };
    default: return { label: status, color: '#6B7280', bg: 'rgba(107,114,128,0.12)' };
  }
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const getPaymentMethodLabel = (method: string | null) => {
  switch (method) {
    case 'card': return 'Cartão';
    case 'pix': return 'PIX';
    case 'boleto': return 'Boleto';
    default: return method || '—';
  }
};

// ─── Component ─────────────────────────────────────────────────────────────────
const AdminSubscriptionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'payments'>('subscriptions');

  // Subscriptions state
  const [subs, setSubs] = useState<SubItem[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [subPage, setSubPage] = useState(1);
  const [subLastPage, setSubLastPage] = useState(1);
  const [subStatus, setSubStatus] = useState('');
  const [subLoading, setSubLoading] = useState(true);

  // Payments state
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [payTotal, setPayTotal] = useState(0);
  const [payPage, setPayPage] = useState(1);
  const [payLastPage, setPayLastPage] = useState(1);
  const [payStatus, setPayStatus] = useState('');
  const [payType, setPayType] = useState('');
  const [payLoading, setPayLoading] = useState(true);

  const loadSubs = useCallback(async () => {
    setSubLoading(true);
    try {
      const res = await adminService.getSubscriptions(subPage, 20, subStatus || undefined);
      const data = res.data?.data || res.data;
      setSubs(data.data || []);
      setSubTotal(data.total || 0);
      setSubLastPage(data.lastPage || 1);
    } catch { setSubs([]); }
    finally { setSubLoading(false); }
  }, [subPage, subStatus]);

  const loadPayments = useCallback(async () => {
    setPayLoading(true);
    try {
      const res = await adminService.getPayments(payPage, 20, payStatus || undefined, payType || undefined);
      const data = res.data?.data || res.data;
      setPayments(data.data || []);
      setPayTotal(data.total || 0);
      setPayLastPage(data.lastPage || 1);
    } catch { setPayments([]); }
    finally { setPayLoading(false); }
  }, [payPage, payStatus, payType]);

  useEffect(() => { if (activeTab === 'subscriptions') loadSubs(); }, [loadSubs, activeTab]);
  useEffect(() => { if (activeTab === 'payments') loadPayments(); }, [loadPayments, activeTab]);

  return (
    <Page>
      <Header>
        <Title>Assinaturas & Pagamentos</Title>
        <Subtitle>Visão completa de todas as assinaturas e transações financeiras</Subtitle>
      </Header>

      <Tabs>
        <Tab $active={activeTab === 'subscriptions'} onClick={() => setActiveTab('subscriptions')}>
          Assinaturas
        </Tab>
        <Tab $active={activeTab === 'payments'} onClick={() => setActiveTab('payments')}>
          Pagamentos
        </Tab>
      </Tabs>

      {/* ── Subscriptions Tab ── */}
      {activeTab === 'subscriptions' && (
        <>
          <Toolbar>
            <Select value={subStatus} onChange={e => { setSubStatus(e.target.value); setSubPage(1); }}>
              <option value="">Todos os status</option>
              <option value="active">Ativa</option>
              <option value="trialing">Trial</option>
              <option value="canceled">Cancelada</option>
              <option value="past_due">Vencida</option>
            </Select>
            <RefreshBtn onClick={loadSubs}>
              <RefreshCw size={14} /> Atualizar
            </RefreshBtn>
          </Toolbar>

          <Table>
            <SubTableHeader>
              <TableHeaderCell>Usuário</TableHeaderCell>
              <TableHeaderCell>Plano</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Período atual</TableHeaderCell>
              <TableHeaderCell>Créditos usados</TableHeaderCell>
              <TableHeaderCell>Criada em</TableHeaderCell>
            </SubTableHeader>

            {subLoading ? (
              <EmptyState>Carregando assinaturas...</EmptyState>
            ) : subs.length === 0 ? (
              <EmptyState>Nenhuma assinatura encontrada.</EmptyState>
            ) : (
              subs.map((s) => {
                const badge = getSubStatusBadge(s.status);
                return (
                  <SubRow key={s.id}>
                    <UserInfo>
                      <UserName>{s.user.name}</UserName>
                      <UserEmail>{s.user.email}</UserEmail>
                    </UserInfo>
                    <CellText>
                      <div style={{ fontWeight: 600 }}>{s.plan.name}</div>
                      <div style={{ fontSize: 12, opacity: 0.6 }}>{formatCurrency(s.plan.price)}/mês</div>
                    </CellText>
                    <div>
                      <Badge $color={badge.color} $bg={badge.bg}>
                        {badge.icon} {badge.label}
                      </Badge>
                    </div>
                    <CellText>
                      {formatDate(s.currentPeriodStart)} — {formatDate(s.currentPeriodEnd)}
                    </CellText>
                    <CellText>
                      {s.cleanNameCreditsUsed} / {s.cleanNameCreditsTotal}
                    </CellText>
                    <CellText>{formatDate(s.createdAt)}</CellText>
                  </SubRow>
                );
              })
            )}

            <Pagination>
              <PaginationInfo>
                Mostrando {subs.length} de {subTotal} assinaturas
              </PaginationInfo>
              <PaginationBtns>
                <PageBtn onClick={() => setSubPage(p => Math.max(1, p - 1))} disabled={subPage === 1}>
                  <ChevronLeft size={16} />
                </PageBtn>
                <PageBtn $active>{subPage}</PageBtn>
                <PageBtn onClick={() => setSubPage(p => Math.min(subLastPage, p + 1))} disabled={subPage === subLastPage}>
                  <ChevronRight size={16} />
                </PageBtn>
              </PaginationBtns>
            </Pagination>
          </Table>
        </>
      )}

      {/* ── Payments Tab ── */}
      {activeTab === 'payments' && (
        <>
          <Toolbar>
            <Select value={payStatus} onChange={e => { setPayStatus(e.target.value); setPayPage(1); }}>
              <option value="">Todos os status</option>
              <option value="succeeded">Pago</option>
              <option value="pending">Pendente</option>
              <option value="failed">Falhou</option>
              <option value="refunded">Reembolsado</option>
            </Select>
            <Select value={payType} onChange={e => { setPayType(e.target.value); setPayPage(1); }}>
              <option value="">Todos os tipos</option>
              <option value="subscription">Assinatura</option>
              <option value="credits">Créditos</option>
            </Select>
            <RefreshBtn onClick={loadPayments}>
              <RefreshCw size={14} /> Atualizar
            </RefreshBtn>
          </Toolbar>

          <Table>
            <PayTableHeader>
              <TableHeaderCell>Usuário</TableHeaderCell>
              <TableHeaderCell>Plano / Tipo</TableHeaderCell>
              <TableHeaderCell>Valor</TableHeaderCell>
              <TableHeaderCell>Método</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Data</TableHeaderCell>
            </PayTableHeader>

            {payLoading ? (
              <EmptyState>Carregando pagamentos...</EmptyState>
            ) : payments.length === 0 ? (
              <EmptyState>Nenhum pagamento encontrado.</EmptyState>
            ) : (
              payments.map((p) => {
                const badge = getPayStatusBadge(p.status);
                return (
                  <PayRow key={p.id}>
                    <UserInfo>
                      <UserName>{p.user.name}</UserName>
                      <UserEmail>{p.user.email}</UserEmail>
                    </UserInfo>
                    <CellText>
                      <div style={{ fontWeight: 600 }}>
                        {p.plan?.name || (p.paymentType === 'credits' ? 'Créditos' : 'Assinatura')}
                      </div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>
                        {p.paymentType === 'credits' ? `${p.creditsAmount} créditos` : 'Recorrente'}
                      </div>
                    </CellText>
                    <Amount>{formatCurrency(Number(p.amount))}</Amount>
                    <CellText>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CreditCard size={13} />
                        {getPaymentMethodLabel(p.paymentMethod)}
                      </div>
                    </CellText>
                    <div>
                      <Badge $color={badge.color} $bg={badge.bg}>{badge.label}</Badge>
                    </div>
                    <CellText>
                      {formatDate(p.paidAt || p.createdAt)}
                      {p.receiptUrl && (
                        <div>
                          <ReceiptLink href={p.receiptUrl} target="_blank" rel="noopener">
                            Ver recibo
                          </ReceiptLink>
                        </div>
                      )}
                    </CellText>
                  </PayRow>
                );
              })
            )}

            <Pagination>
              <PaginationInfo>
                Mostrando {payments.length} de {payTotal} pagamentos
              </PaginationInfo>
              <PaginationBtns>
                <PageBtn onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPage === 1}>
                  <ChevronLeft size={16} />
                </PageBtn>
                <PageBtn $active>{payPage}</PageBtn>
                <PageBtn onClick={() => setPayPage(p => Math.min(payLastPage, p + 1))} disabled={payPage === payLastPage}>
                  <ChevronRight size={16} />
                </PageBtn>
              </PaginationBtns>
            </Pagination>
          </Table>
        </>
      )}
    </Page>
  );
};

export default AdminSubscriptionsPage;
