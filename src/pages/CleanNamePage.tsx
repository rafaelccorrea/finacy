import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  FileSearch, Plus, Trash2, Upload, X, CheckCircle, Clock,
  AlertCircle, Loader2, ChevronRight, FileText, User, CreditCard,
  Phone, MapPin, DollarSign, Building2, Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cleanNameService, documentsService } from '../services/api';

// ─── Helpers de máscara ───────────────────────────────────────────────────────
const maskCPF = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');

const maskPhone = (v: string) =>
  v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');

const maskCurrency = (raw: string): string => {
  const num = raw.replace(/\D/g, '');
  if (!num) return '';
  const cents = parseInt(num, 10);
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const parseCurrency = (v: string): number => {
  const n = v.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(n) || 0;
};

const validateCPF = (cpf: string): boolean => {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(c[i]) * (10 - i);
  let r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(c[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(c[i]) * (11 - i);
  r = (s * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(c[10]);
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DebtItem { id: string; creditorName: string; amount: string; debtType: string; }
interface CleanRequest {
  id: string; personName: string; cpf: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalDebtAmount?: number; createdAt: string;
  metadata?: { autentiqueDocumentId?: string; autentiqueAllSigned?: boolean; };
}

// ─── Styled Components ────────────────────────────────────────────────────────
const spin = keyframes`from{transform:rotate(0deg)}to{transform:rotate(360deg)}`;
const Spin = styled(Loader2)`animation:${spin} 1s linear infinite;`;

const Page = styled.div`padding:32px;max-width:1100px;margin:0 auto;@media(max-width:768px){padding:20px 16px;}`;
const Header = styled.div`display:flex;align-items:center;justify-content:space-between;margin-bottom:28px;gap:16px;flex-wrap:wrap;`;
const Title = styled.h1`font-size:24px;font-weight:700;color:${({theme})=>theme.text.primary};display:flex;align-items:center;gap:12px;margin:0;`;
const NewBtn = styled.button`display:flex;align-items:center;gap:8px;padding:10px 20px;background:${({theme})=>theme.accent.gradient};color:#fff;border:none;border-radius:${({theme})=>theme.radius.md};font-size:14px;font-weight:600;cursor:pointer;transition:opacity 0.2s;&:hover{opacity:0.9;}`;
const StatsGrid = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px;@media(max-width:900px){grid-template-columns:repeat(2,1fr);}@media(max-width:500px){grid-template-columns:1fr;}`;
const StatCard = styled.div`background:${({theme})=>theme.bg.card};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.lg};padding:20px 24px;`;
const StatVal = styled.div<{$color:string}>`font-size:28px;font-weight:700;color:${({$color})=>$color};`;
const StatLbl = styled.div`font-size:12px;color:${({theme})=>theme.text.muted};margin-bottom:6px;`;
const FormCard = styled.div`background:${({theme})=>theme.bg.card};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.lg};padding:28px;margin-bottom:32px;`;
const Grid2 = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:24px;@media(max-width:900px){grid-template-columns:1fr;}`;
const SecTitle = styled.h3`font-size:12px;font-weight:600;color:${({theme})=>theme.text.muted};text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;display:flex;align-items:center;gap:8px;`;
const FG = styled.div`margin-bottom:14px;`;
const Lbl = styled.label`display:block;font-size:13px;font-weight:500;color:${({theme})=>theme.text.secondary};margin-bottom:5px;`;
const IW = styled.div<{$err?:boolean;$focus?:boolean}>`display:flex;align-items:center;gap:10px;padding:0 14px;height:44px;background:${({theme})=>theme.bg.input};border:1px solid ${({$err,$focus,theme})=>$err?theme.status.danger:$focus?theme.accent.primary:theme.border.default};border-radius:${({theme})=>theme.radius.md};transition:border-color 0.2s;svg{color:${({theme})=>theme.text.muted};flex-shrink:0;}`;
const SI = styled.input`flex:1;background:transparent;border:none;outline:none;color:${({theme})=>theme.text.primary};font-size:14px;&::placeholder{color:${({theme})=>theme.text.muted};}`;
const TA = styled.textarea`width:100%;min-height:76px;background:${({theme})=>theme.bg.input};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.md};padding:12px 14px;color:${({theme})=>theme.text.primary};font-size:14px;resize:vertical;outline:none;font-family:inherit;&:focus{border-color:${({theme})=>theme.accent.primary};}&::placeholder{color:${({theme})=>theme.text.muted};}`;
const Sel = styled.select`width:100%;height:44px;background:${({theme})=>theme.bg.input};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.md};padding:0 14px;color:${({theme})=>theme.text.primary};font-size:14px;outline:none;cursor:pointer;&:focus{border-color:${({theme})=>theme.accent.primary};}`;
const Err = styled.span`font-size:12px;color:${({theme})=>theme.status.danger};margin-top:3px;display:block;`;
const InfoBox = styled.div`display:flex;gap:10px;padding:12px 16px;background:${({theme})=>theme.status.infoBg};border-radius:${({theme})=>theme.radius.md};margin-bottom:20px;font-size:13px;color:${({theme})=>theme.status.info};svg{flex-shrink:0;margin-top:1px;}`;
const UpArea = styled.div<{$drag?:boolean;$has?:boolean}>`border:2px dashed ${({$drag,$has,theme})=>$has?theme.status.success:$drag?theme.accent.primary:theme.border.default};border-radius:${({theme})=>theme.radius.md};padding:24px;text-align:center;cursor:pointer;transition:all 0.2s;background:${({$drag,theme})=>$drag?theme.accent.primary+'10':'transparent'};&:hover{border-color:${({theme})=>theme.accent.primary};}`;
const UpIcon = styled.div`width:48px;height:48px;border-radius:50%;background:${({theme})=>theme.accent.primary}20;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:${({theme})=>theme.accent.primary};`;
const UpTxt = styled.p`font-size:14px;color:${({theme})=>theme.text.secondary};margin:0 0 4px;strong{color:${({theme})=>theme.accent.primary};}`;
const UpHint = styled.p`font-size:12px;color:${({theme})=>theme.text.muted};margin:0;`;
const DebtC = styled.div`background:${({theme})=>theme.bg.secondary};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.md};padding:16px;margin-bottom:10px;position:relative;`;
const DR = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:10px;@media(max-width:600px){grid-template-columns:1fr;}`;
const RmBtn = styled.button`position:absolute;top:12px;right:12px;background:${({theme})=>theme.status.dangerBg};color:${({theme})=>theme.status.danger};border:none;border-radius:${({theme})=>theme.radius.sm};width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;`;
const AddBtn = styled.button`display:flex;align-items:center;gap:8px;padding:8px 16px;background:transparent;border:1px dashed ${({theme})=>theme.accent.primary};color:${({theme})=>theme.accent.primary};border-radius:${({theme})=>theme.radius.md};font-size:13px;font-weight:500;cursor:pointer;width:100%;justify-content:center;transition:background 0.2s;&:hover{background:${({theme})=>theme.accent.primary}15;}`;
const SubBtn = styled.button<{$load?:boolean}>`width:100%;height:48px;background:${({theme})=>theme.accent.gradient};color:#fff;border:none;border-radius:${({theme})=>theme.radius.md};font-size:15px;font-weight:600;cursor:${({$load})=>$load?'not-allowed':'pointer'};opacity:${({$load})=>$load?0.7:1};display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px;`;
const ReqCard = styled.div`background:${({theme})=>theme.bg.card};border:1px solid ${({theme})=>theme.border.default};border-radius:${({theme})=>theme.radius.lg};padding:20px 24px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;gap:16px;cursor:pointer;transition:all 0.2s;&:hover{border-color:${({theme})=>theme.accent.primary}60;background:${({theme})=>theme.bg.cardHover};}`;
const ReqName = styled.div`font-size:15px;font-weight:600;color:${({theme})=>theme.text.primary};margin-bottom:4px;`;
const ReqMeta = styled.div`font-size:13px;color:${({theme})=>theme.text.muted};display:flex;align-items:center;gap:12px;flex-wrap:wrap;`;
const SBadge = styled.span<{$s:string}>`display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:${({theme})=>theme.radius.full};font-size:12px;font-weight:600;background:${({$s,theme})=>$s==='completed'?theme.status.successBg:$s==='processing'?theme.status.infoBg:$s==='failed'?theme.status.dangerBg:theme.status.warningBg};color:${({$s,theme})=>$s==='completed'?theme.status.success:$s==='processing'?theme.status.info:$s==='failed'?theme.status.danger:theme.status.warning};`;
const ABadge = styled.span`display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:${({theme})=>theme.radius.full};font-size:11px;font-weight:500;background:${({theme})=>theme.accent.primary}20;color:${({theme})=>theme.accent.primary};`;
const Empty = styled.div`text-align:center;padding:48px 24px;color:${({theme})=>theme.text.muted};svg{margin-bottom:16px;opacity:0.4;}p{margin:0;font-size:14px;}`;

const DEBT_TYPES = [
  { v: 'cartao_credito', l: 'Cartão de Crédito' },
  { v: 'emprestimo_pessoal', l: 'Empréstimo Pessoal' },
  { v: 'financiamento', l: 'Financiamento' },
  { v: 'conta_servico', l: 'Conta de Serviço' },
  { v: 'loja_varejo', l: 'Loja / Varejo' },
  { v: 'outro', l: 'Outro' },
];
const DOC_TYPES = [
  { v: 'cnh', l: 'CNH (Carteira de Habilitação)' },
  { v: 'rg', l: 'RG (Identidade)' },
  { v: 'cpf', l: 'CPF (Comprovante)' },
];
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente', processing: 'Em Andamento', completed: 'Concluído', failed: 'Falhou',
};

export const CleanNamePage: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState<CleanRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [personName, setPersonName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('cnh');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focused, setFocused] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const [rr, sr] = await Promise.all([cleanNameService.list(), cleanNameService.stats()]);
      setRequests(rr.data?.data || rr.data || []);
      setStats(sr.data?.data || sr.data);
    } catch { /* silencioso */ } finally { setLoading(false); }
  };

  const addDebt = () =>
    setDebts(p => [...p, { id: Date.now().toString(), creditorName: '', amount: '', debtType: 'outro' }]);

  const rmDebt = (id: string) => setDebts(p => p.filter(d => d.id !== id));

  const updDebt = (id: string, f: keyof DebtItem, v: string) =>
    setDebts(p => p.map(d => d.id !== id ? d : f === 'amount'
      ? { ...d, amount: maskCurrency(v.replace(/[^\d]/g, '')) }
      : { ...d, [f]: v }));

  const handleFile = (f: File | null) => {
    if (!f) return;
    if (!['image/jpeg','image/png','image/webp','application/pdf'].includes(f.type)) {
      setErrors(e => ({ ...e, file: 'Tipo não permitido. Use JPEG, PNG, WEBP ou PDF.' })); return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErrors(e => ({ ...e, file: 'Arquivo muito grande. Máximo 10MB.' })); return;
    }
    setFile(f);
    setErrors(e => ({ ...e, file: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!personName.trim() || personName.trim().length < 3) e.personName = 'Nome deve ter ao menos 3 caracteres';
    if (!cpf || !validateCPF(cpf)) e.cpf = 'CPF inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      let documentId: string | undefined;
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('documentType', docType);
        const up = await documentsService.uploadForCleanName(fd);
        documentId = up.data?.data?.id || up.data?.id;
      }
      await cleanNameService.create({
        personName: personName.trim(), cpf,
        phone: phone || undefined, address: address || undefined,
        notes: notes || undefined, documentId,
        totalDebtAmount: debts.length ? debts.reduce((s, d) => s + parseCurrency(d.amount), 0) : undefined,
        debts: debts.length ? debts.map(d => ({
          creditorName: d.creditorName, amount: parseCurrency(d.amount), debtType: d.debtType,
        })) : undefined,
      });
      setPersonName(''); setCpf(''); setPhone(''); setAddress(''); setNotes('');
      setDebts([]); setFile(null); setShowForm(false);
      await load();
    } catch (err: any) {
      const m = err?.response?.data?.message || 'Erro ao criar solicitação.';
      setErrors(e => ({ ...e, submit: Array.isArray(m) ? m.join(', ') : m }));
    } finally { setSubmitting(false); }
  };

  const totalDebt = debts.reduce((s, d) => s + parseCurrency(d.amount), 0);

  return (
    <Page>
      <Header>
        <Title><FileSearch size={28} color="#6366F1" />Limpa Nome</Title>
        {!showForm && <NewBtn onClick={() => setShowForm(true)}><Plus size={18} />Nova Solicitação</NewBtn>}
      </Header>

      {stats && (
        <StatsGrid>
          {[
            { l: 'Créditos Disponíveis', v: stats.creditsAvailable ?? 0, c: '#6366F1' },
            { l: 'Pendentes', v: stats.pending ?? 0, c: '#F59E0B' },
            { l: 'Em Andamento', v: stats.processing ?? 0, c: '#3B82F6' },
            { l: 'Concluídas', v: stats.completed ?? 0, c: '#10B981' },
          ].map(s => (
            <StatCard key={s.l}>
              <StatLbl>{s.l}</StatLbl>
              <StatVal $color={s.c}>{s.v}</StatVal>
            </StatCard>
          ))}
        </StatsGrid>
      )}

      {showForm && (
        <FormCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Nova Solicitação de Limpa Nome</h2>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
              <X size={20} />
            </button>
          </div>

          <InfoBox>
            <Info size={16} />
            <span>
              Ao enviar, um contrato de negociação será gerado e enviado para assinatura digital via{' '}
              <strong>Autentique</strong>. O link de assinatura será disponibilizado na solicitação.
            </span>
          </InfoBox>

          <form onSubmit={handleSubmit}>
            <Grid2>
              {/* Coluna 1: Dados pessoais */}
              <div>
                <SecTitle><User size={13} />Dados do Solicitante</SecTitle>

                <FG>
                  <Lbl>Nome Completo *</Lbl>
                  <IW $err={!!errors.personName} $focus={focused === 'name'}>
                    <User size={16} />
                    <SI value={personName} onChange={e => setPersonName(e.target.value)}
                      onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                      placeholder="Nome completo da pessoa" />
                  </IW>
                  {errors.personName && <Err>{errors.personName}</Err>}
                </FG>

                <FG>
                  <Lbl>CPF *</Lbl>
                  <IW $err={!!errors.cpf} $focus={focused === 'cpf'}>
                    <CreditCard size={16} />
                    <SI value={cpf} onChange={e => setCpf(maskCPF(e.target.value))}
                      onFocus={() => setFocused('cpf')} onBlur={() => setFocused('')}
                      placeholder="000.000.000-00" maxLength={14} />
                  </IW>
                  {errors.cpf && <Err>{errors.cpf}</Err>}
                </FG>

                <FG>
                  <Lbl>Telefone</Lbl>
                  <IW $focus={focused === 'phone'}>
                    <Phone size={16} />
                    <SI value={phone} onChange={e => setPhone(maskPhone(e.target.value))}
                      onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                      placeholder="(11) 99999-9999" maxLength={15} />
                  </IW>
                </FG>

                <FG>
                  <Lbl>Endereço</Lbl>
                  <IW $focus={focused === 'addr'}>
                    <MapPin size={16} />
                    <SI value={address} onChange={e => setAddress(e.target.value)}
                      onFocus={() => setFocused('addr')} onBlur={() => setFocused('')}
                      placeholder="Rua, número, cidade - UF" />
                  </IW>
                </FG>

                <FG>
                  <Lbl>Observações</Lbl>
                  <TA value={notes} onChange={e => setNotes(e.target.value)}
                    placeholder="Informações adicionais..." />
                </FG>
              </div>

              {/* Coluna 2: Documento + Dívidas */}
              <div>
                <SecTitle><FileText size={13} />Documento de Identificação</SecTitle>

                <FG>
                  <Lbl>Tipo de Documento</Lbl>
                  <Sel value={docType} onChange={e => setDocType(e.target.value)}>
                    {DOC_TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                  </Sel>
                </FG>

                <UpArea $drag={dragging} $has={!!file}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0] || null); }}>
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf"
                    style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0] || null)} />
                  <UpIcon>{file ? <CheckCircle size={24} /> : <Upload size={24} />}</UpIcon>
                  {file ? (
                    <>
                      <UpTxt><strong>{file.name}</strong></UpTxt>
                      <UpHint>{(file.size / 1024).toFixed(0)} KB — clique para trocar</UpHint>
                    </>
                  ) : (
                    <>
                      <UpTxt><strong>Clique para enviar</strong> ou arraste</UpTxt>
                      <UpHint>JPEG, PNG, WEBP ou PDF — máx. 10MB</UpHint>
                    </>
                  )}
                </UpArea>
                {errors.file && <Err>{errors.file}</Err>}

                <div style={{ marginTop: 20 }}>
                  <SecTitle>
                    <DollarSign size={13} />Dívidas
                    {totalDebt > 0 && (
                      <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: '#6366F1' }}>
                        Total: {totalDebt.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    )}
                  </SecTitle>

                  {debts.map((d, i) => (
                    <DebtC key={d.id}>
                      <RmBtn type="button" onClick={() => rmDebt(d.id)}><Trash2 size={13} /></RmBtn>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8 }}>Dívida #{i + 1}</div>
                      <DR>
                        <FG style={{ marginBottom: 0 }}>
                          <Lbl>Credor *</Lbl>
                          <IW><Building2 size={14} />
                            <SI value={d.creditorName} onChange={e => updDebt(d.id, 'creditorName', e.target.value)} placeholder="Banco / Loja" />
                          </IW>
                        </FG>
                        <FG style={{ marginBottom: 0 }}>
                          <Lbl>Valor</Lbl>
                          <IW><DollarSign size={14} />
                            <SI value={d.amount} onChange={e => updDebt(d.id, 'amount', e.target.value)} placeholder="R$ 0,00" />
                          </IW>
                        </FG>
                      </DR>
                      <FG style={{ marginTop: 10, marginBottom: 0 }}>
                        <Lbl>Tipo</Lbl>
                        <Sel value={d.debtType} onChange={e => updDebt(d.id, 'debtType', e.target.value)}>
                          {DEBT_TYPES.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
                        </Sel>
                      </FG>
                    </DebtC>
                  ))}

                  <AddBtn type="button" onClick={addDebt}><Plus size={15} />Adicionar Dívida</AddBtn>
                </div>
              </div>
            </Grid2>

            {errors.submit && (
              <div style={{ marginTop: 14, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, color: '#EF4444', fontSize: 13 }}>
                {errors.submit}
              </div>
            )}

            <SubBtn type="submit" $load={submitting} disabled={submitting}>
              {submitting ? <><Spin size={18} />Enviando...</> : 'Enviar Solicitação'}
            </SubBtn>
          </form>
        </FormCard>
      )}

      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Minhas Solicitações</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin size={32} /></div>
      ) : requests.length === 0 ? (
        <Empty>
          <FileSearch size={48} />
          <p>Nenhuma solicitação encontrada.</p>
          <p style={{ marginTop: 8 }}>Clique em "Nova Solicitação" para começar.</p>
        </Empty>
      ) : (
        requests.map(req => (
          <ReqCard key={req.id} onClick={() => navigate(`/clean-name/${req.id}`)}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ReqName>{req.personName}</ReqName>
              <ReqMeta>
                <span>CPF: {req.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</span>
                {req.totalDebtAmount && (
                  <span>{Number(req.totalDebtAmount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                )}
                <span>{new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
              </ReqMeta>
              {req.metadata?.autentiqueDocumentId && (
                <div style={{ marginTop: 6 }}>
                  <ABadge>
                    <FileText size={11} />
                    {req.metadata.autentiqueAllSigned ? 'Contrato Assinado' : 'Aguardando Assinatura'}
                  </ABadge>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SBadge $s={req.status}>
                {req.status === 'completed' ? <CheckCircle size={13} /> :
                 req.status === 'failed' ? <AlertCircle size={13} /> : <Clock size={13} />}
                {STATUS_LABEL[req.status] || req.status}
              </SBadge>
              <ChevronRight size={18} style={{ opacity: 0.4 }} />
            </div>
          </ReqCard>
        ))
      )}
    </Page>
  );
};

export default CleanNamePage;
