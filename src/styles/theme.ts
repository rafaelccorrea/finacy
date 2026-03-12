export const darkTheme = {
  bg: {
    primary: '#0B0B14',
    secondary: '#101020',
    card: '#12121E',
    cardHover: '#1A1A2E',
    sidebar: '#0E0E1A',
    input: '#16162A',
    tertiary: '#1A1A2E',
    overlay: 'rgba(0,0,0,0.6)',
  },
  text: {
    primary: '#F1F1F6',
    secondary: '#8B8BA3',
    muted: '#5C5C73',
    inverse: '#0B0B14',
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.03)',
    focus: '#6366F1',
  },
  accent: {
    primary: '#6366F1',
    primaryHover: '#818CF8',
    secondary: '#06B6D4',
    gradient: 'linear-gradient(135deg, #6366F1, #06B6D4)',
    gradientHover: 'linear-gradient(135deg, #818CF8, #22D3EE)',
  },
  status: {
    success: '#10B981',
    successBg: 'rgba(16,185,129,0.12)',
    warning: '#F59E0B',
    warningBg: 'rgba(245,158,11,0.12)',
    danger: '#EF4444',
    dangerBg: 'rgba(239,68,68,0.12)',
    info: '#3B82F6',
    infoBg: 'rgba(59,130,246,0.12)',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.3)',
    lg: '0 8px 24px rgba(0,0,0,0.4)',
    glow: '0 0 20px rgba(99,102,241,0.15)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export const lightTheme: typeof darkTheme = {
  bg: {
    primary: '#F5F5FA',
    secondary: '#EEEEF5',
    card: '#FFFFFF',
    cardHover: '#F8F8FC',
    sidebar: '#FFFFFF',
    input: '#F0F0F8',
    tertiary: '#E8E8F0',
    overlay: 'rgba(0,0,0,0.3)',
  },
  text: {
    primary: '#1A1A2E',
    secondary: '#64648C',
    muted: '#9494AD',
    inverse: '#FFFFFF',
  },
  border: {
    default: 'rgba(0,0,0,0.08)',
    light: 'rgba(0,0,0,0.04)',
    focus: '#6366F1',
  },
  accent: {
    primary: '#6366F1',
    primaryHover: '#4F46E5',
    secondary: '#06B6D4',
    gradient: 'linear-gradient(135deg, #6366F1, #06B6D4)',
    gradientHover: 'linear-gradient(135deg, #4F46E5, #0891B2)',
  },
  status: {
    success: '#10B981',
    successBg: 'rgba(16,185,129,0.08)',
    warning: '#F59E0B',
    warningBg: 'rgba(245,158,11,0.08)',
    danger: '#EF4444',
    dangerBg: 'rgba(239,68,68,0.08)',
    info: '#3B82F6',
    infoBg: 'rgba(59,130,246,0.08)',
  },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.06)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
    glow: '0 0 20px rgba(99,102,241,0.08)',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  font: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
};

export type Theme = typeof darkTheme;
