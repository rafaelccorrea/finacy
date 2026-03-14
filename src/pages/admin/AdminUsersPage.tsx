import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import {
  Search, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Shield, User, UserCheck, UserX, Plus, AlertCircle,
  CheckCircle, XCircle, Clock,
} from 'lucide-react';
import { adminService } from '../../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UserItem {
  id: string;
  name: string;
  email: string;
  cpf: string | null;
  phone: string | null;
  role: string;
  status: string;
  cleanNameCredits: number;
  cleanNameCreditsUsed: number;
  lastLoginAt: string | null;
  createdAt: string;
  activeSubscription: {
    id: string;
    status: string;
    planName: string;
    currentPeriodEnd: string;
  } | null;
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
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
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

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 42px;
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 10px;
  flex: 1;
  min-width: 220px;
  max-width: 380px;
  &:focus-within { border-color: ${({ theme }) => theme.accent.primary}; }
`;

const SearchInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  &::placeholder { color: ${({ theme }) => theme.text.muted}; }
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

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr 1.2fr;
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

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 1fr 1.2fr;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.light};
  gap: 12px;
  align-items: center;
  transition: background 0.15s;
  &:last-child { border-bottom: none; }
  &:hover { background: ${({ theme }) => theme.bg.cardHover}; }
`;

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

const ActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionBtn = styled.button<{ $variant?: 'danger' | 'success' | 'primary' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 8px;
  border: 1px solid ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.status.danger + '40' :
    $variant === 'success' ? theme.status.success + '40' :
    theme.border.default};
  background: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.status.dangerBg :
    $variant === 'success' ? theme.status.successBg :
    theme.bg.secondary};
  color: ${({ $variant, theme }) =>
    $variant === 'danger' ? theme.status.danger :
    $variant === 'success' ? theme.status.success :
    theme.text.secondary};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  &:hover { opacity: 0.8; }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.border.default};
  background: ${({ theme }) => theme.bg.card};
  border-radius: 0 0 16px 16px;
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
  &:hover:not(:disabled) { border-color: ${({ theme }) => theme.accent.primary}; }
`;

// Modal
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 20px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 20px 0;
`;

const ModalInput = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background: ${({ theme }) => theme.bg.input};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: 10px;
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 16px;
  &:focus { border-color: ${({ theme }) => theme.accent.primary}; }
`;

const ModalBtns = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ModalBtn = styled.button<{ $primary?: boolean }>`
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid ${({ $primary, theme }) => $primary ? 'transparent' : theme.border.default};
  background: ${({ $primary, theme }) => $primary ? theme.accent.primary : theme.bg.secondary};
  color: ${({ $primary }) => $primary ? 'white' : 'inherit'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.85; }
`;

const EmptyState = styled.div`
  padding: 60px;
  text-align: center;
  color: ${({ theme }) => theme.text.muted};
  font-size: 15px;
`;

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getRoleBadge = (role: string) => {
  switch (role) {
    case 'super_admin': return { label: 'Super Admin', color: '#EF4444', bg: 'rgba(239,68,68,0.12)' };
    case 'admin': return { label: 'Admin', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' };
    default: return { label: 'Usuário', color: '#6366F1', bg: 'rgba(99,102,241,0.12)' };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active': return { label: 'Ativo', color: '#10B981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle size={11} /> };
    case 'inactive': return { label: 'Inativo', color: '#6B7280', bg: 'rgba(107,114,128,0.12)', icon: <XCircle size={11} /> };
    case 'suspended': return { label: 'Suspenso', color: '#EF4444', bg: 'rgba(239,68,68,0.12)', icon: <XCircle size={11} /> };
    default: return { label: 'Pendente', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: <Clock size={11} /> };
  }
};

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString('pt-BR') : '—';

// ─── Component ─────────────────────────────────────────────────────────────────
const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Credits modal
  const [creditsModal, setCreditsModal] = useState<{ userId: string; name: string } | null>(null);
  const [creditsAmount, setCreditsAmount] = useState('');
  const [creditsLoading, setCreditsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers(page, 20, search || undefined, roleFilter || undefined, statusFilter || undefined);
      const data = res.data?.data || res.data;
      setUsers(data.data || []);
      setTotal(data.total || 0);
      setLastPage(data.lastPage || 1);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await adminService.updateUserRole(userId, role);
      load();
    } catch { /* ignore */ }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await adminService.updateUserStatus(userId, status);
      load();
    } catch { /* ignore */ }
  };

  const handleAddCredits = async () => {
    if (!creditsModal || !creditsAmount) return;
    setCreditsLoading(true);
    try {
      await adminService.addCredits(creditsModal.userId, parseInt(creditsAmount));
      setCreditsModal(null);
      setCreditsAmount('');
      load();
    } catch { /* ignore */ }
    finally { setCreditsLoading(false); }
  };

  return (
    <Page>
      <Header>
        <div>
          <Title>Gestão de Usuários</Title>
          <Subtitle>{total} usuários cadastrados</Subtitle>
        </div>
      </Header>

      <Toolbar>
        <SearchBox>
          <Search size={16} color="var(--muted)" />
          <SearchInput
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </SearchBox>
        <Select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">Todos os roles</option>
          <option value="user">Usuário</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </Select>
        <Select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">Todos os status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
          <option value="suspended">Suspenso</option>
          <option value="pending_verification">Pendente</option>
        </Select>
        <RefreshBtn onClick={load}>
          <RefreshCw size={14} />
          Atualizar
        </RefreshBtn>
      </Toolbar>

      <Table>
        <TableHeader>
          <TableHeaderCell>Usuário</TableHeaderCell>
          <TableHeaderCell>Plano / Assinatura</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Créditos</TableHeaderCell>
          <TableHeaderCell>Último login</TableHeaderCell>
          <TableHeaderCell>Ações</TableHeaderCell>
        </TableHeader>

        {loading ? (
          <EmptyState>Carregando usuários...</EmptyState>
        ) : users.length === 0 ? (
          <EmptyState>Nenhum usuário encontrado.</EmptyState>
        ) : (
          users.map((u) => {
            const roleBadge = getRoleBadge(u.role);
            const statusBadge = getStatusBadge(u.status);
            return (
              <TableRow key={u.id}>
                <UserInfo>
                  <UserName>{u.name}</UserName>
                  <UserEmail>{u.email}</UserEmail>
                </UserInfo>

                <CellText>
                  {u.activeSubscription ? (
                    <>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{u.activeSubscription.planName}</div>
                      <div style={{ fontSize: 11, opacity: 0.6 }}>
                        até {formatDate(u.activeSubscription.currentPeriodEnd)}
                      </div>
                    </>
                  ) : (
                    <Badge $color="#6B7280" $bg="rgba(107,114,128,0.12)">Sem plano</Badge>
                  )}
                </CellText>

                <div>
                  <Badge $color={roleBadge.color} $bg={roleBadge.bg}>
                    <Shield size={10} />
                    {roleBadge.label}
                  </Badge>
                </div>

                <div>
                  <Badge $color={statusBadge.color} $bg={statusBadge.bg}>
                    {statusBadge.icon}
                    {statusBadge.label}
                  </Badge>
                </div>

                <CellText>
                  <span style={{ fontWeight: 700 }}>{u.cleanNameCredits - u.cleanNameCreditsUsed}</span>
                  <span style={{ opacity: 0.5 }}> / {u.cleanNameCredits}</span>
                </CellText>

                <CellText>{formatDate(u.lastLoginAt)}</CellText>

                <ActionRow>
                  {u.status === 'active' ? (
                    <ActionBtn $variant="danger" onClick={() => handleStatusChange(u.id, 'suspended')}>
                      <UserX size={11} /> Suspender
                    </ActionBtn>
                  ) : (
                    <ActionBtn $variant="success" onClick={() => handleStatusChange(u.id, 'active')}>
                      <UserCheck size={11} /> Ativar
                    </ActionBtn>
                  )}
                  {u.role !== 'admin' && u.role !== 'super_admin' && (
                    <ActionBtn onClick={() => handleRoleChange(u.id, 'admin')}>
                      <Shield size={11} /> Admin
                    </ActionBtn>
                  )}
                  <ActionBtn onClick={() => setCreditsModal({ userId: u.id, name: u.name })}>
                    <Plus size={11} /> Créditos
                  </ActionBtn>
                </ActionRow>
              </TableRow>
            );
          })
        )}

        <Pagination>
          <PaginationInfo>
            Mostrando {users.length} de {total} usuários
          </PaginationInfo>
          <PaginationBtns>
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft size={16} />
            </PageBtn>
            <PageBtn $active>{page}</PageBtn>
            <PageBtn onClick={() => setPage(p => Math.min(lastPage, p + 1))} disabled={page === lastPage}>
              <ChevronRight size={16} />
            </PageBtn>
          </PaginationBtns>
        </Pagination>
      </Table>

      {/* Modal de créditos */}
      {creditsModal && (
        <ModalOverlay onClick={() => setCreditsModal(null)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>Adicionar créditos — {creditsModal.name}</ModalTitle>
            <ModalInput
              type="number"
              min="1"
              placeholder="Quantidade de créditos"
              value={creditsAmount}
              onChange={e => setCreditsAmount(e.target.value)}
              autoFocus
            />
            <ModalBtns>
              <ModalBtn onClick={() => setCreditsModal(null)}>Cancelar</ModalBtn>
              <ModalBtn $primary onClick={handleAddCredits} disabled={creditsLoading || !creditsAmount}>
                {creditsLoading ? 'Adicionando...' : 'Adicionar'}
              </ModalBtn>
            </ModalBtns>
          </Modal>
        </ModalOverlay>
      )}
    </Page>
  );
};

export default AdminUsersPage;
