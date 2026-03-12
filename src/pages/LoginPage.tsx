import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { authService } from '@/services/api';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

const features = [
  {
    icon: Shield,
    title: 'Segurança de nível bancário',
    desc: 'Seus dados protegidos com criptografia AES-256',
  },
  {
    icon: Zap,
    title: 'Processo rápido e transparente',
    desc: 'Acompanhe cada etapa em tempo real',
  },
  {
    icon: BarChart3,
    title: 'Relatórios e métricas completas',
    desc: 'Visão clara da sua situação financeira',
  },
];

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const response = await authService.login(data.email, data.password);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Credenciais inválidas. Tente novamente.',
      );
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-indigo-900 to-cyan-900" />

        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '30%',
                transform: 'translate(-50%, -50%)',
                opacity: 1 - i * 0.12,
              }}
            />
          ))}
          {/* Glow blobs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12 text-white w-full">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="text-2xl font-black tracking-tight">Finacy</span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <h1 className="text-5xl font-black leading-tight mb-4">
              Sua liberdade<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-indigo-300">
                financeira
              </span>
              <br />começa aqui.
            </h1>
            <p className="text-white/60 text-lg leading-relaxed max-w-sm">
              Gerencie sua assinatura, acompanhe seus planos e solicite a limpeza do seu nome com facilidade.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{title}</p>
                  <p className="text-white/50 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="mt-16 flex items-center gap-6">
            {['SSL Seguro', 'LGPD', 'ISO 27001'].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 text-white/40 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400/60" />
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-secondary)]">
        <div className="w-full max-w-[400px] animate-fade-in">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-black">F</span>
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)]">Finacy</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
              Bem-vindo de volta
            </h2>
            <p className="text-[var(--text-secondary)]">
              Acesse sua conta para continuar
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              autoComplete="username"
              {...register('email')}
            />

            <div>
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                leftIcon={<Lock className="h-4 w-4" />}
                autoComplete="current-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-[var(--text-primary)] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-2"
              loading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Entrar
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-color)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[var(--bg-secondary)] text-[var(--text-muted)]">
                Novo por aqui?
              </span>
            </div>
          </div>

          <Link to="/register">
            <Button variant="outline" size="lg" className="w-full">
              Criar conta grátis
            </Button>
          </Link>

          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-indigo-500 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-indigo-500 hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
