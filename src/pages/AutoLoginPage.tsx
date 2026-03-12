import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { authService } from '../services/api';

export const AutoLoginPage: React.FC = () => {
  const [status, setStatus] = useState('Conectando ao servidor...');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const doLogin = async () => {
      try {
        setStatus('Autenticando admin@finacy.com...');
        const response = await authService.login('admin@finacy.com', 'Admin@2025');
        const { user, accessToken, refreshToken } = response.data.data;
        setAuth(user, accessToken, refreshToken);
        setStatus('Login realizado! Redirecionando...');
        setTimeout(() => navigate('/dashboard'), 500);
      } catch (err: any) {
        setStatus('Erro: ' + (err.response?.data?.message || err.message));
      }
    };
    doLogin();
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #164e63 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      color: 'white',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <img
        src="/logo-dark.png"
        alt="Finacy"
        style={{ height: '48px', width: 'auto', objectFit: 'contain', marginBottom: '8px', filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.5))' }}
      />
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(255,255,255,0.3)',
        borderTopColor: '#06b6d4',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{status}</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
