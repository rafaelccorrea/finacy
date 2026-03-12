import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuthStore } from '@/store';
import { authService } from '@/services/api';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type FormData = z.infer<typeof schema>;

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const response = await authService.login(data.email, data.password);
      const { user, accessToken, refreshToken } = response.data.data;
      setAuth(user, accessToken, refreshToken);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-cyan-900">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/20"
              style={{
                width: `${(i + 1) * 40}px`,
                height: `${(i + 1) * 40}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white font-black text-xl">F</span>
            </div>
            <span className="text-3xl font-black tracking-tight">Finacy</span>
          </div>

          <h2 className="text-4xl font-bold leading-tight mb-6">
            Sua liberdade<br />
            <span className="text-cyan-400">financeira</span><br />
            começa aqui.
          </h2>

          <p className="text-white/70 text-lg mb-12 leading-relaxed">
            Gerencie sua assinatura, acompanhe seus planos e solicite a limpeza do seu nome com facilidade.
          </p>

          {/* Features */}
          <div className="space-y-4">
            {[
              { icon: '🛡️', text: 'Segurança de nível bancário' },
              { icon: '⚡', text: 'Processo rápido e transparente' },
              { icon: '📊', text: 'Acompanhe tudo em tempo real' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white/80">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[var(--bg-secondary)]">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-black">F</span>
            </div>
            <span className="text-2xl font-black text-[var(--text-primary)]">Finacy</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Bem-vindo de volta</h1>
            <p className="text-[var(--text-secondary)]">Acesse sua conta para continuar</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-400 transition-colors">
                Esqueceu a senha?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={isSubmitting}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Entrar
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-[var(--text-muted)]">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">
              Criar conta grátis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
