import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  DollarSign,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store';
import { cleanNameService } from '../services/api';
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
  gap: 24px;
  animation: ${fadeIn} 0.4s ease;
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
  align-items: center;
  gap: 14px;
`;

const StatIcon = styled.div<{ $bg: string; $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${p => p.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${p => p.$color};
`;

const StatInfo = styled.div`
  .value { font-size: 24px; font-weight: 800; color: ${({ theme }) => theme.text.primary}; line-height: 1.1; }
  .label { font-size: 12px; color: ${({ theme }) => theme.text.muted}; margin-top: 2px; }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const SectionText = styled.div`
  h2 { font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.text.primary}; margin: 0 0 2px 0; }
  p { font-size: 13px; color: ${({ theme }) => theme.text.muted}; margin: 0; }
`;

const NewBtn = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 12px;
  background: ${({ theme }) => theme.accent.gradient};
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.disabled ? 0.5 : 1};
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,0.4); transform: translateY(-1px); }
`;

const WarningBox = styled(Card)`
  border-color: rgba(245,158,11,0.3);
  background: rgba(245,158,11,0.05);
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RequestItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: ${({ theme }) => theme.radius.md};
  border: 1px solid ${({ theme }) => theme.border.default};
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.accent.primary}30;
    background: ${({ theme }) => theme.bg.cardHover};
  }
`;

const ReqIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.bg.tertiary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.text.muted};
`;

const ReqInfo = styled.div`
  flex: 1;
  min-width: 0;
  .name { font-size: 14px; font-weight: 600; color: ${({ theme }) => theme.text.primary}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .date { font-size: 12px; color: ${({ theme }) => theme.text.muted}; margin-top: 2px; }
`;

const EmptyList = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: ${({ theme }) => theme.text.muted};
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
  max-width: 500px;
  animation: ${fadeIn} 0.3s ease;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  h3 { font-size: 18px; font-weight: 700; color: ${({ theme }) => theme.text.primary}; margin: 0; }
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.muted};
  cursor: pointer;
  padding: 4px;
  &:hover { color: ${({ theme }) => theme.text.primary}; }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const FormInput = styled.input`
  height: 44px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1.5px solid ${({ theme }) => theme.border.default};
  background: ${({ theme }) => theme.bg.input};
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  &:focus { border-color: ${({ theme }) => theme.accent.primary}; }
  &::placeholder { color: ${({ theme }) => theme.text.muted}; }
`;

const FormTextarea = styled.textarea`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1.5px solid ${({ theme }) => theme.border.default};
  background: ${({ theme }) => theme.bg.input};
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  outline: none;
  resize: none;
  transition: border-color 0.2s ease;
  &:focus { border-color: ${({ theme }) => theme.accent.primary}; }
  &::placeholder { color: ${({ theme }) => theme.text.muted}; }
`;

const NoteBox = styled.div`
  padding: 12px 16px;
  border-radius: 10px;
  background: rgba(245,158,11,0.1);
  border: 1px solid rgba(245,158,11,0.2);
  font-size: 12px;
  color: #D97706;
  margin-bottom: 20px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
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
  color: ${({ theme }) => theme.status.danger};
  font-size: 12px;
  margin-top: 4px;
`;

/* ─── Types ───────────────────────────────────────────────────────────────── */
interface Stats {
  creditsRemaining: number;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
}

interface Request {
  id: string;
  creditorName: string;
  debtAmount?: number;
  status: string;
  createdAt: string;
}

const statusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'info' | 'danger' | 'default' }> = {
  PENDING: { label: 'Pendente', variant: 'warning' },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'info' },
  COMPLETED: { label: 'Concluido', variant: 'success' },
  FAILED: { label: 'Falhou', variant: 'danger' },
  CANCELED: { label: 'Cancelado', variant: 'default' },
};

/* ─── Component ───────────────────────────────────────────────────────────── */
export const CleanNamePage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [creditorName, setCreditorName] = useState('');
  const [debtAmount, setDebtAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      const [statsRes, reqRes] = await Promise.all([
        cleanNameService.stats(),
        cleanNameService.list(),
      ]);
      setStats(statsRes.data.data || null);
      setRequests(reqRes.data.data?.data || reqRes.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!creditorName.trim()) {
      setFormError('Nome do credor e obrigatorio');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await cleanNameService.create({
        creditorName: creditorName.trim(),
        debtAmount: debtAmount ? parseFloat(debtAmount) : undefined,
        description: description.trim() || undefined,
      });
      setShowForm(false);
      setCreditorName('');
      setDebtAmount('');
      setDescription('');
      fetchData();
    } catch {
      setFormError('Erro ao criar solicitacao. Tente novamente.');
    } finally { setSubmitting(false); }
  };

  return (
    <Page>
      {/* Stats */}
      <StatsGrid>
        <StatCard>
          <StatIcon $bg="rgba(16,185,129,0.12)" $color="#10B981"><FileCheck size={22} /></StatIcon>
          <StatInfo>
            <div className="value">{loading ? '—' : stats?.creditsRemaining ?? 0}</div>
            <div className="label">Creditos Disponiveis</div>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $bg="rgba(99,102,241,0.12)" $color="#6366F1"><FileCheck size={22} /></StatIcon>
          <StatInfo>
            <div className="value">{loading ? '—' : stats?.totalRequests ?? 0}</div>
            <div className="label">Total Solicitacoes</div>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $bg="rgba(245,158,11,0.12)" $color="#F59E0B"><Clock size={22} /></StatIcon>
          <StatInfo>
            <div className="value">{loading ? '—' : stats?.pendingRequests ?? 0}</div>
            <div className="label">Em Andamento</div>
          </StatInfo>
        </StatCard>
        <StatCard>
          <StatIcon $bg="rgba(6,182,212,0.12)" $color="#06B6D4"><CheckCircle2 size={22} /></StatIcon>
          <StatInfo>
            <div className="value">{loading ? '—' : stats?.completedRequests ?? 0}</div>
            <div className="label">Concluidas</div>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Header */}
      <SectionHeader>
        <SectionText>
          <h2>Minhas Solicitacoes</h2>
          <p>Acompanhe o status das suas solicitacoes</p>
        </SectionText>
        <NewBtn onClick={() => setShowForm(true)} disabled={!stats || stats.creditsRemaining <= 0}>
          <Plus size={16} /> Nova Solicitacao
        </NewBtn>
      </SectionHeader>

      {/* No Credits Warning */}
      {stats && stats.creditsRemaining <= 0 && (
        <WarningBox>
          <AlertCircle size={20} color="#F59E0B" />
          <div>
            <p style={{ fontWeight: 600, fontSize: 14 }}>Creditos esgotados</p>
            <p style={{ fontSize: 13, opacity: 0.7 }}>Faca upgrade do seu plano para continuar.</p>
          </div>
        </WarningBox>
      )}

      {/* Requests List */}
      <Card>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#999' }}>Carregando...</div>
        ) : requests.length === 0 ? (
          <EmptyList>
            <FileCheck size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontWeight: 600, fontSize: 14 }}>Nenhuma solicitacao ainda</p>
            <p style={{ fontSize: 13, marginTop: 4 }}>Clique em "Nova Solicitacao" para comecar</p>
          </EmptyList>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {requests.map(req => {
              const st = statusMap[req.status] || statusMap.PENDING;
              return (
                <RequestItem key={req.id}>
                  <ReqIcon><Building2 size={20} /></ReqIcon>
                  <ReqInfo>
                    <div className="name">{req.creditorName}</div>
                    <div className="date">
                      {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                      {req.debtAmount && ` · R$ ${Number(req.debtAmount).toFixed(2).replace('.', ',')}`}
                    </div>
                  </ReqInfo>
                  <Badge variant={st.variant} dot>{st.label}</Badge>
                </RequestItem>
              );
            })}
          </div>
        )}
      </Card>

      {/* New Request Modal */}
      {showForm && (
        <Overlay>
          <ModalCard>
            <ModalHeader>
              <h3>Nova Solicitacao de Limpa Nome</h3>
              <CloseBtn onClick={() => setShowForm(false)}><X size={20} /></CloseBtn>
            </ModalHeader>

            <FormGroup>
              <FormLabel>Nome do Credor *</FormLabel>
              <FormInput
                placeholder="Ex: Banco XYZ, Loja ABC"
                value={creditorName}
                onChange={e => setCreditorName(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Valor da Divida (opcional)</FormLabel>
              <FormInput
                type="number"
                placeholder="0,00"
                value={debtAmount}
                onChange={e => setDebtAmount(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Descricao (opcional)</FormLabel>
              <FormTextarea
                rows={3}
                placeholder="Descreva detalhes sobre a divida..."
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </FormGroup>

            <NoteBox>
              <strong>Atencao:</strong> Esta solicitacao consumira 1 credito do seu plano.
              Voce possui {stats?.creditsRemaining ?? 0} credito(s) disponivel(is).
            </NoteBox>

            {formError && <ErrorText>{formError}</ErrorText>}

            <ModalActions>
              <ModalBtn onClick={() => setShowForm(false)}>Cancelar</ModalBtn>
              <ModalBtn $primary onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Enviando...' : 'Enviar Solicitacao'}
              </ModalBtn>
            </ModalActions>
          </ModalCard>
        </Overlay>
      )}
    </Page>
  );
};
