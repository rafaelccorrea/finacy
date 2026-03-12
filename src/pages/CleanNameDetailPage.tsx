import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ArrowLeft, FileSearch, CheckCircle, Clock, AlertCircle,
  Loader2, ExternalLink, FileText, User, CreditCard,
  Phone, MapPin, DollarSign, Building2, Calendar, Info,
  RefreshCw,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { cleanNameService } from '../services/api';

const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const Spin = styled(Loader2)`animation:${spin} 1s linear infinite;`;

const Page = styled.div`padding:32px;max-width:900px;margin:0 auto;@media(max-width:768px){padding:20px 16px;}`;
const BackBtn = styled.button`display:flex;align-items:center;gap:8px;background:none;border:none;color:${({theme})=>theme.text.secondary};font-size:14px;cursor:pointer;margin-bottom:24px;padding:0;transition:color 0.2s;&:hover{color:${({theme})=>theme.text.primary};}`;
const Header = styled.div`display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap;`;
const TitleWrap = styled.div``;
const Title = styled.h1`font-size:22px;font-weight:700;color:${({theme})=>theme.text.primary};margin:0 0 6px;`;
const Subtitle = styled.p`font-size:14px;color:${({theme})=>theme.text.muted};margin:0;`;
const Card = styled.div`background:${({theme})=>theme.bg.card};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.lg};padding:24px;margin-bottom:20px;`;
const SecTitle = styled.h3`font-size:12px;font-weight:600;color:${({theme})=>theme.text.muted};text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;display:flex;align-items:center;gap:8px;`;
const Grid2 = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:16px;@media(max-width:600px){grid-template-columns:1fr;}`;
const Field = styled.div``;
const FieldLabel = styled.div`font-size:12px;color:${({theme})=>theme.text.muted};margin-bottom:4px;display:flex;align-items:center;gap:6px;`;
const FieldValue = styled.div`font-size:15px;font-weight:500;color:${({theme})=>theme.text.primary};`;
const SBadge = styled.span<{$s:string}>`display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:${({theme})=>theme.radius.full};font-size:13px;font-weight:600;background:${({$s,theme})=>$s==='completed'?theme.status.successBg:$s==='processing'?theme.status.infoBg:$s==='failed'?theme.status.dangerBg:theme.status.warningBg};color:${({$s,theme})=>$s==='completed'?theme.status.success:$s==='processing'?theme.status.info:$s==='failed'?theme.status.danger:theme.status.warning};`;
const DebtRow = styled.div`display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid ${({theme})=>theme.border.light};&:last-child{border-bottom:none;}`;
const DebtName = styled.div`font-size:14px;font-weight:500;color:${({theme})=>theme.text.primary};`;
const DebtMeta = styled.div`font-size:12px;color:${({theme})=>theme.text.muted};margin-top:2px;`;
const DebtAmt = styled.div`font-size:15px;font-weight:700;color:${({theme})=>theme.text.primary};`;
const AutoCard = styled.div<{$signed?:boolean}>`background:${({$signed,theme})=>$signed?theme.status.successBg:theme.status.infoBg};border:1px solid ${({$signed,theme})=>$signed?theme.status.success+'30':theme.status.info+'30'};border-radius:${({theme})=>theme.radius.lg};padding:20px 24px;margin-bottom:20px;`;
const AutoTitle = styled.div`font-size:14px;font-weight:600;color:${({theme})=>theme.text.primary};margin-bottom:8px;display:flex;align-items:center;gap:8px;`;
const AutoDesc = styled.div`font-size:13px;color:${({theme})=>theme.text.secondary};margin-bottom:12px;`;
const LinkBtn = styled.a`display:inline-flex;align-items:center;gap:8px;padding:8px 16px;background:${({theme})=>theme.accent.gradient};color:#fff;border-radius:${({theme})=>theme.radius.md};font-size:13px;font-weight:600;text-decoration:none;transition:opacity 0.2s;&:hover{opacity:0.9;}`;
const RefreshBtn = styled.button`display:flex;align-items:center;gap:6px;padding:8px 14px;background:transparent;border:1px solid ${({theme})=>theme.border.default};color:${({theme})=>theme.text.secondary};border-radius:${({theme})=>theme.radius.md};font-size:13px;cursor:pointer;transition:all 0.2s;&:hover{border-color:${({theme})=>theme.accent.primary};color:${({theme})=>theme.text.primary};}`;
const TimelineWrap = styled.div``;
const TLItem = styled.div<{$active?:boolean}>`display:flex;gap:12px;margin-bottom:16px;opacity:${({$active})=>$active?1:0.4};`;
const TLDot = styled.div<{$active?:boolean;$color?:string}>`width:32px;height:32px;border-radius:50%;background:${({$active,$color,theme})=>$active?($color||theme.accent.primary)+'20':'transparent'};border:2px solid ${({$active,$color,theme})=>$active?($color||theme.accent.primary):theme.border.default};display:flex;align-items:center;justify-content:center;flex-shrink:0;color:${({$active,$color,theme})=>$active?($color||theme.accent.primary):theme.text.muted};`;
const TLContent = styled.div`padding-top:4px;`;
const TLTitle = styled.div`font-size:14px;font-weight:600;color:${({theme})=>theme.text.primary};`;
const TLSub = styled.div`font-size:12px;color:${({theme})=>theme.text.muted};margin-top:2px;`;
const Empty = styled.div`text-align:center;padding:60px 24px;color:${({theme})=>theme.text.muted};svg{margin-bottom:16px;opacity:0.4;}p{margin:0;font-size:14px;}`;

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', processing: 'Em Andamento', completed: 'Concluído', failed: 'Falhou',
};
const DEBT_TYPE_LABEL: Record<string, string> = {
  cartao_credito: 'Cartão de Crédito', emprestimo_pessoal: 'Empréstimo Pessoal',
  financiamento: 'Financiamento', conta_servico: 'Conta de Serviço',
  loja_varejo: 'Loja / Varejo', outro: 'Outro',
};

interface RequestDetail {
  id: string; personName: string; cpf: string; status: string;
  totalDebtAmount?: number; createdAt: string; processedAt?: string;
  notes?: string; documentId?: string;
  debtDetails?: Array<{ creditorName: string; amount?: number; debtType?: string; notes?: string; }>;
  metadata?: {
    phone?: string; address?: string;
    autentiqueDocumentId?: string; autentiqueSignatoryLink?: string;
    autentiqueStatus?: string; autentiqueAllSigned?: boolean; autentiqueSignedAt?: string;
  };
}

export const CleanNameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [req, setReq] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = async (silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const res = await cleanNameService.getById(id);
      setReq(res.data?.data || res.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  if (loading) return (
    <Page><div style={{ textAlign: 'center', padding: 80 }}><Spin size={36} /></div></Page>
  );

  if (notFound || !req) return (
    <Page>
      <BackBtn onClick={() => navigate('/clean-name')}><ArrowLeft size={18} />Voltar</BackBtn>
      <Empty>
        <FileSearch size={48} />
        <p>Solicitação não encontrada.</p>
      </Empty>
    </Page>
  );

  const cpfFmt = req.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  const meta = req.metadata || {};
  const hasAutentique = !!meta.autentiqueDocumentId;
  const isSigned = !!meta.autentiqueAllSigned;

  const timeline = [
    {
      title: 'Solicitação Criada',
      sub: new Date(req.createdAt).toLocaleString('pt-BR'),
      active: true, color: '#6366F1',
      icon: <FileText size={14} />,
    },
    {
      title: 'Contrato Enviado para Assinatura',
      sub: hasAutentique ? 'Aguardando assinatura via Autentique' : 'Aguardando envio',
      active: hasAutentique, color: '#3B82F6',
      icon: <FileText size={14} />,
    },
    {
      title: 'Contrato Assinado',
      sub: meta.autentiqueSignedAt
        ? new Date(meta.autentiqueSignedAt).toLocaleString('pt-BR')
        : 'Pendente',
      active: isSigned, color: '#10B981',
      icon: <CheckCircle size={14} />,
    },
    {
      title: 'Em Negociação',
      sub: 'Negociação com credores em andamento',
      active: req.status === 'processing' || req.status === 'completed', color: '#F59E0B',
      icon: <Clock size={14} />,
    },
    {
      title: 'Concluído',
      sub: req.processedAt ? new Date(req.processedAt).toLocaleString('pt-BR') : 'Pendente',
      active: req.status === 'completed', color: '#10B981',
      icon: <CheckCircle size={14} />,
    },
  ];

  return (
    <Page>
      <BackBtn onClick={() => navigate('/clean-name')}><ArrowLeft size={18} />Voltar para Limpa Nome</BackBtn>

      <Header>
        <TitleWrap>
          <Title>{req.personName}</Title>
          <Subtitle>CPF: {cpfFmt} • Criado em {new Date(req.createdAt).toLocaleDateString('pt-BR')}</Subtitle>
        </TitleWrap>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <SBadge $s={req.status}>
            {req.status === 'completed' ? <CheckCircle size={14} /> :
             req.status === 'failed' ? <AlertCircle size={14} /> : <Clock size={14} />}
            {STATUS_LABEL[req.status] || req.status}
          </SBadge>
          <RefreshBtn onClick={() => load(true)} disabled={refreshing}>
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            Atualizar
          </RefreshBtn>
        </div>
      </Header>

      {/* Card Autentique */}
      {hasAutentique && (
        <AutoCard $signed={isSigned}>
          <AutoTitle>
            <FileText size={18} />
            {isSigned ? 'Contrato Assinado Digitalmente' : 'Contrato Aguardando Assinatura'}
          </AutoTitle>
          <AutoDesc>
            {isSigned
              ? `Contrato assinado em ${meta.autentiqueSignedAt ? new Date(meta.autentiqueSignedAt).toLocaleString('pt-BR') : 'data não disponível'}.`
              : 'O contrato de negociação foi gerado e enviado para assinatura digital via Autentique. Clique no botão abaixo para assinar.'}
          </AutoDesc>
          {!isSigned && meta.autentiqueSignatoryLink && (
            <LinkBtn href={meta.autentiqueSignatoryLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} />
              Assinar Contrato
            </LinkBtn>
          )}
        </AutoCard>
      )}

      <Grid2>
        {/* Dados pessoais */}
        <Card>
          <SecTitle><User size={13} />Dados do Solicitante</SecTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field>
              <FieldLabel><User size={12} />Nome</FieldLabel>
              <FieldValue>{req.personName}</FieldValue>
            </Field>
            <Field>
              <FieldLabel><CreditCard size={12} />CPF</FieldLabel>
              <FieldValue>{cpfFmt}</FieldValue>
            </Field>
            {meta.phone && (
              <Field>
                <FieldLabel><Phone size={12} />Telefone</FieldLabel>
                <FieldValue>{meta.phone}</FieldValue>
              </Field>
            )}
            {meta.address && (
              <Field>
                <FieldLabel><MapPin size={12} />Endereço</FieldLabel>
                <FieldValue>{meta.address}</FieldValue>
              </Field>
            )}
            {req.notes && (
              <Field>
                <FieldLabel><Info size={12} />Observações</FieldLabel>
                <FieldValue style={{ fontSize: 14 }}>{req.notes}</FieldValue>
              </Field>
            )}
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <SecTitle><Calendar size={13} />Histórico da Solicitação</SecTitle>
          <TimelineWrap>
            {timeline.map((t, i) => (
              <TLItem key={i} $active={t.active}>
                <TLDot $active={t.active} $color={t.color}>{t.icon}</TLDot>
                <TLContent>
                  <TLTitle>{t.title}</TLTitle>
                  <TLSub>{t.sub}</TLSub>
                </TLContent>
              </TLItem>
            ))}
          </TimelineWrap>
        </Card>
      </Grid2>

      {/* Dívidas */}
      {req.debtDetails && req.debtDetails.length > 0 && (
        <Card>
          <SecTitle>
            <DollarSign size={13} />Dívidas
            {req.totalDebtAmount && (
              <span style={{ marginLeft: 'auto', fontSize: 14, fontWeight: 700, color: '#6366F1' }}>
                Total: {Number(req.totalDebtAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            )}
          </SecTitle>
          {req.debtDetails.map((d, i) => (
            <DebtRow key={i}>
              <div>
                <DebtName>
                  <Building2 size={13} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                  {d.creditorName}
                </DebtName>
                {d.debtType && (
                  <DebtMeta>{DEBT_TYPE_LABEL[d.debtType] || d.debtType}</DebtMeta>
                )}
              </div>
              {d.amount != null && (
                <DebtAmt>
                  {Number(d.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </DebtAmt>
              )}
            </DebtRow>
          ))}
        </Card>
      )}
    </Page>
  );
};

export default CleanNameDetailPage;
