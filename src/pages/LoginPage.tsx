import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Mail, Lock, Eye, EyeOff, Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store';
import { authService } from '../services/api';

/* ─── Animations ──────────────────────────────────────────────────────────── */
const pulse = keyframes`
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.05); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ─── Layout ──────────────────────────────────────────────────────────────── */
const PageWrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const LeftPanel = styled.div`
  flex: 1.1;
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #164e63 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px;
  position: relative;
  overflow: hidden;

  @media (max-width: 900px) { display: none; }
`;

const GlowBlob = styled.div<{ $top: string; $left: string; $size: string; $color: string; $delay: string }>`
  position: absolute;
  top: ${p => p.$top};
  left: ${p => p.$left};
  width: ${p => p.$size};
  height: ${p => p.$size};
  border-radius: 50%;
  background: ${p => p.$color};
  filter: blur(80px);
  animation: ${pulse} 6s ease-in-out ${p => p.$delay} infinite;
  pointer-events: none;
`;

const Circle = styled.div<{ $i: number }>`
  position: absolute;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%);
  width: ${p => (p.$i + 1) * 120}px;
  height: ${p => (p.$i + 1) * 120}px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.05);
  pointer-events: none;
`;

const Content = styled.div`
  position: relative;
  z-index: 2;
`;

const LogoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 56px;
`;

const LogoBox = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: linear-gradient(135deg, #6366f1, #22d3ee);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(99,102,241,0.4);
`;

const LogoName = styled.span`
  font-size: 28px;
  font-weight: 900;
  color: white;
  letter-spacing: -0.5px;
`;

const HeroTitle = styled.h1`
  font-size: 46px;
  font-weight: 800;
  color: white;
  line-height: 1.12;
  margin: 0 0 20px 0;
`;

const GradientText = styled.span`
  background: linear-gradient(90deg, #67e8f9, #a5b4fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const HeroSub = styled.p`
  font-size: 16px;
  color: rgba(255,255,255,0.55);
  line-height: 1.7;
  max-width: 400px;
  margin: 0 0 44px 0;
`;

const Features = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const FeatureRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const FeatureIcon = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #67e8f9;
`;

const FeatureLabel = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: rgba(255,255,255,0.85);
`;

/* ─── Right Panel ─────────────────────────────────────────────────────────── */
const RightPanel = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background: ${({ theme }) => theme.bg.primary};
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  animation: ${fadeIn} 0.5s ease;
`;

const FormTitle = styled.h2`
  font-size: 30px;
  font-weight: 800;
  color: ${({ theme }) => theme.text.primary};
  margin: 0 0 8px 0;
`;

const FormSub = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.text.muted};
  margin: 0 0 32px 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.text.secondary};
`;

const InputBox = styled.div<{ $focused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 48px;
  background: ${({ theme }) => theme.bg.input};
  border: 1.5px solid ${({ $focused, theme }) => $focused ? theme.accent.primary : theme.border.default};
  border-radius: 12px;
  transition: all 0.2s ease;
  &:hover { border-color: ${({ theme }) => theme.accent.primary}80; }
`;

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  &::placeholder { color: ${({ theme }) => theme.text.muted}; }
`;

const IconWrap = styled.span`
  color: ${({ theme }) => theme.text.muted};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const ToggleBtn = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.text.muted};
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0;
  &:hover { color: ${({ theme }) => theme.text.primary}; }
`;

const SubmitBtn = styled.button<{ $loading?: boolean }>`
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #4F46E5, #06B6D4);
  color: white;
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: ${p => p.$loading ? 'not-allowed' : 'pointer'};
  opacity: ${p => p.$loading ? 0.7 : 1};
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(99,102,241,0.3);
  margin-top: 4px;

  &:hover:not(:disabled) {
    box-shadow: 0 6px 20px rgba(99,102,241,0.45);
    transform: translateY(-1px);
  }
`;

const ErrorBox = styled.div`
  background: ${({ theme }) => theme.status.dangerBg};
  color: ${({ theme }) => theme.status.danger};
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FooterText = styled.p`
  text-align: center;
  font-size: 13px;
  color: ${({ theme }) => theme.text.muted};
  margin-top: 28px;

  a {
    color: ${({ theme }) => theme.accent.primary};
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

/* ─── Component ───────────────────────────────────────────────────────────── */
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(email.trim(), password);
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais invalidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <LeftPanel>
        {[0,1,2,3,4,5].map(i => <Circle key={i} $i={i} />)}
        <GlowBlob $top="20%" $left="20%" $size="300px" $color="rgba(99,102,241,0.2)" $delay="0s" />
        <GlowBlob $top="60%" $left="60%" $size="200px" $color="rgba(6,182,212,0.15)" $delay="2s" />

        <Content>
          <LogoRow>
            <LogoBox><Shield size={24} color="white" /></LogoBox>
            <LogoName>Finacy</LogoName>
          </LogoRow>

          <HeroTitle>
            Sua liberdade<br />
            <GradientText>financeira</GradientText><br />
            comeca aqui.
          </HeroTitle>

          <HeroSub>
            Gerencie sua assinatura, acompanhe seus planos e solicite a limpeza do seu nome com facilidade.
          </HeroSub>

          <Features>
            <FeatureRow>
              <FeatureIcon><Shield size={20} /></FeatureIcon>
              <FeatureLabel>Seguranca de nivel bancario</FeatureLabel>
            </FeatureRow>
            <FeatureRow>
              <FeatureIcon><Zap size={20} /></FeatureIcon>
              <FeatureLabel>Processo rapido e transparente</FeatureLabel>
            </FeatureRow>
            <FeatureRow>
              <FeatureIcon><BarChart3 size={20} /></FeatureIcon>
              <FeatureLabel>Acompanhe tudo em tempo real</FeatureLabel>
            </FeatureRow>
          </Features>
        </Content>
      </LeftPanel>

      <RightPanel>
        <FormCard>
          <FormTitle>Bem-vindo de volta</FormTitle>
          <FormSub>Acesse sua conta para continuar</FormSub>

          <Form onSubmit={handleSubmit}>
            {error && <ErrorBox><Shield size={16} />{error}</ErrorBox>}

            <FieldGroup>
              <Label>E-mail</Label>
              <InputBox $focused={emailFocused}>
                <IconWrap><Mail size={18} /></IconWrap>
                <StyledInput
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  autoComplete="email"
                  required
                />
              </InputBox>
            </FieldGroup>

            <FieldGroup>
              <Label>Senha</Label>
              <InputBox $focused={passFocused}>
                <IconWrap><Lock size={18} /></IconWrap>
                <StyledInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                  autoComplete="current-password"
                  required
                />
                <ToggleBtn type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </ToggleBtn>
              </InputBox>
            </FieldGroup>

            <SubmitBtn type="submit" $loading={loading} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
              {!loading && <ArrowRight size={18} />}
            </SubmitBtn>
          </Form>

          <FooterText>
            Nao tem uma conta? <a href="/register">Criar conta gratis</a>
          </FooterText>
        </FormCard>
      </RightPanel>
    </PageWrapper>
  );
};
