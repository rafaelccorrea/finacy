import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Loader2 } from 'lucide-react';

/* ─── Button ──────────────────────────────────────────────────────────────── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const spin = keyframes`to { transform: rotate(360deg); }`;

const StyledButton = styled.button<{ $variant: string; $size: string; $fullWidth?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.97);
  }

  ${({ $size }) => {
    switch ($size) {
      case 'sm': return css`height: 32px; padding: 0 12px; font-size: 13px;`;
      case 'lg': return css`height: 48px; padding: 0 24px; font-size: 15px;`;
      default: return css`height: 40px; padding: 0 16px; font-size: 14px;`;
    }
  }}

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${theme.accent.gradient};
          color: white;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
          &:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(99,102,241,0.4); transform: translateY(-1px); }
        `;
      case 'secondary':
        return css`
          background: ${theme.accent.primary};
          color: white;
          &:hover:not(:disabled) { background: ${theme.accent.primaryHover}; }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.text.secondary};
          &:hover:not(:disabled) { background: ${theme.bg.cardHover}; color: ${theme.text.primary}; }
        `;
      case 'danger':
        return css`
          background: ${theme.status.danger};
          color: white;
          &:hover:not(:disabled) { opacity: 0.9; }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.text.primary};
          border: 1px solid ${theme.border.default};
          &:hover:not(:disabled) { background: ${theme.bg.cardHover}; border-color: ${theme.accent.primary}; }
        `;
      default:
        return css`background: ${theme.accent.gradient}; color: white;`;
    }
  }}
`;

const SpinnerIcon = styled(Loader2)`
  width: 16px;
  height: 16px;
  animation: ${spin} 0.6s linear infinite;
`;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => (
    <StyledButton
      ref={ref}
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <SpinnerIcon /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </StyledButton>
  ),
);
Button.displayName = 'Button';

/* ─── Card ────────────────────────────────────────────────────────────────── */
export const Card = styled.div<{ $hoverable?: boolean }>`
  background: ${({ theme }) => theme.bg.card};
  border: 1px solid ${({ theme }) => theme.border.default};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 24px;
  transition: all 0.2s ease;
  ${({ $hoverable, theme }) => $hoverable && css`
    cursor: pointer;
    &:hover {
      border-color: ${theme.accent.primary}40;
      box-shadow: ${theme.shadow.glow};
      transform: translateY(-2px);
    }
  `}
`;

/* ─── Badge ───────────────────────────────────────────────────────────────── */
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
}

const StyledBadge = styled.span<{ $variant: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;

  ${({ $variant, theme }) => {
    const map: Record<string, { bg: string; color: string }> = {
      default: { bg: theme.bg.cardHover, color: theme.text.secondary },
      success: { bg: theme.status.successBg, color: theme.status.success },
      warning: { bg: theme.status.warningBg, color: theme.status.warning },
      danger: { bg: theme.status.dangerBg, color: theme.status.danger },
      info: { bg: theme.status.infoBg, color: theme.status.info },
      purple: { bg: 'rgba(124,58,237,0.12)', color: '#A78BFA' },
    };
    const s = map[$variant] || map.default;
    return css`background: ${s.bg}; color: ${s.color};`;
  }}
`;

const BadgeDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', dot, children }) => (
  <StyledBadge $variant={variant}>
    {dot && <BadgeDot />}
    {children}
  </StyledBadge>
);

/* ─── Input ───────────────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const InputLabel = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.text.secondary};
`;

const InputContainer = styled.div<{ $hasError?: boolean; $focused?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  height: 44px;
  background: ${({ theme }) => theme.bg.input};
  border: 1px solid ${({ $hasError, $focused, theme }) =>
    $hasError ? theme.status.danger :
    $focused ? theme.accent.primary :
    theme.border.default};
  border-radius: ${({ theme }) => theme.radius.md};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ $hasError, theme }) => $hasError ? theme.status.danger : theme.accent.primary + '60'};
  }
`;

const StyledInput = styled.input`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: ${({ theme }) => theme.text.primary};
  font-size: 14px;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.text.muted};
  }
`;

const InputError = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.status.danger};
`;

const InputIconWrap = styled.span`
  color: ${({ theme }) => theme.text.muted};
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <InputWrapper>
        {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}
        <InputContainer $hasError={!!error} $focused={focused}>
          {leftIcon && <InputIconWrap>{leftIcon}</InputIconWrap>}
          <StyledInput
            ref={ref}
            id={inputId}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            {...props}
          />
          {rightIcon && <InputIconWrap>{rightIcon}</InputIconWrap>}
        </InputContainer>
        {error && <InputError>{error}</InputError>}
      </InputWrapper>
    );
  }
);
Input.displayName = 'Input';

/* ─── Skeleton ────────────────────────────────────────────────────────────── */
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export const Skeleton = styled.div<{ $w?: string; $h?: string }>`
  width: ${({ $w }) => $w || '100%'};
  height: ${({ $h }) => $h || '20px'};
  border-radius: ${({ theme }) => theme.radius.sm};
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.bg.cardHover} 25%,
    ${({ theme }) => theme.bg.card} 50%,
    ${({ theme }) => theme.bg.cardHover} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

/* ─── Avatar ──────────────────────────────────────────────────────────────── */
interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarCircle = styled.div<{ $size: string }>`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  background: ${({ theme }) => theme.accent.gradient};
  flex-shrink: 0;
  ${({ $size }) => {
    switch ($size) {
      case 'sm': return css`width: 32px; height: 32px; font-size: 12px;`;
      case 'lg': return css`width: 48px; height: 48px; font-size: 16px;`;
      default: return css`width: 40px; height: 40px; font-size: 14px;`;
    }
  }}
`;

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  return <AvatarCircle $size={size}>{initials}</AvatarCircle>;
};

/* ─── Divider ─────────────────────────────────────────────────────────────── */
export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${({ theme }) => theme.border.default};
  margin: 0;
`;

/* ─── StatCard ────────────────────────────────────────────────────────────── */
interface StatCardProps {
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string | number;
  subtitle?: string;
  children?: React.ReactNode;
}

const StatIconBox = styled.div<{ $bg: string }>`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ $bg }) => $bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const StatCard: React.FC<StatCardProps> = ({ icon, iconColor, iconBg, label, value, subtitle, children }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <StatIconBox $bg={iconBg}>
        <span style={{ color: iconColor, display: 'flex' }}>{icon}</span>
      </StatIconBox>
      <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.6 }}>{label}</span>
    </div>
    <div>
      <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      {subtitle && <div style={{ fontSize: '12px', opacity: 0.5, marginTop: '4px' }}>{subtitle}</div>}
    </div>
    {children}
  </Card>
);
