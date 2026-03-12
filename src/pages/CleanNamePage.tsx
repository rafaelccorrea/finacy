import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FileCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileText,
  DollarSign,
  Building2,
} from 'lucide-react';
import { Card, Badge, Button, Input, Skeleton } from '@/components/ui';
import { cleanNameService } from '@/services/api';
import type { CleanNameRequest, CleanNameStats } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const schema = z.object({
  creditorName: z.string().min(3, 'Nome do credor deve ter no mínimo 3 caracteres'),
  debtAmount: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const statusConfig = {
  PENDING: { label: 'Pendente', variant: 'warning' as const, icon: Clock },
  IN_PROGRESS: { label: 'Em Andamento', variant: 'info' as const, icon: Loader2 },
  COMPLETED: { label: 'Concluído', variant: 'success' as const, icon: CheckCircle2 },
  FAILED: { label: 'Falhou', variant: 'danger' as const, icon: XCircle },
  CANCELED: { label: 'Cancelado', variant: 'default' as const, icon: XCircle },
};

export const CleanNamePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CleanNameRequest | null>(null);
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['clean-name-stats'],
    queryFn: () => cleanNameService.stats(),
  });

  const { data: requestsData, isLoading: loadingRequests } = useQuery({
    queryKey: ['clean-name-requests'],
    queryFn: () => cleanNameService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => cleanNameService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clean-name-requests'] });
      queryClient.invalidateQueries({ queryKey: ['clean-name-stats'] });
      setShowForm(false);
      reset();
    },
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const stats: CleanNameStats | null = statsData?.data?.data || null;
  const requests: CleanNameRequest[] = requestsData?.data?.data?.data || [];

  const onSubmit = async (data: FormData) => {
    await createMutation.mutateAsync({
      creditorName: data.creditorName,
      debtAmount: data.debtAmount ? parseFloat(data.debtAmount) : undefined,
      description: data.description,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Créditos Disponíveis',
            value: loadingStats ? '—' : stats?.creditsRemaining ?? '0',
            icon: FileCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Total Solicitações',
            value: loadingStats ? '—' : stats?.totalRequests ?? '0',
            icon: FileText,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
          },
          {
            label: 'Em Andamento',
            value: loadingStats ? '—' : stats?.pendingRequests ?? '0',
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Concluídas',
            value: loadingStats ? '—' : stats?.completedRequests ?? '0',
            icon: CheckCircle2,
            color: 'text-cyan-500',
            bg: 'bg-cyan-500/10',
          },
        ].map((stat) => (
          <Card key={stat.label} className="flex items-center gap-4">
            <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              {loadingStats ? (
                <Skeleton className="h-6 w-12 mb-1" />
              ) : (
                <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
              )}
              <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Header + New Request Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Minhas Solicitações</h2>
          <p className="text-sm text-[var(--text-muted)]">Acompanhe o status das suas solicitações</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
          disabled={!stats || stats.creditsRemaining <= 0}
        >
          Nova Solicitação
        </Button>
      </div>

      {/* No Credits Warning */}
      {stats && stats.creditsRemaining <= 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-[var(--text-primary)]">Créditos esgotados</p>
              <p className="text-sm text-[var(--text-muted)]">
                Você não possui créditos disponíveis. Faça upgrade do seu plano para continuar.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Requests List */}
      <Card>
        {loadingRequests ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)]">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="h-16 w-16 text-[var(--text-muted)] mx-auto mb-4 opacity-50" />
            <p className="text-[var(--text-secondary)] font-medium">Nenhuma solicitação ainda</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Clique em "Nova Solicitação" para começar
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => {
              const status = statusConfig[request.status] || statusConfig.PENDING;
              const StatusIcon = status.icon;

              return (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-[var(--border-color)] hover:border-indigo-500/30 hover:bg-[var(--bg-tertiary)] transition-all text-left group"
                >
                  <div className="h-10 w-10 rounded-xl bg-[var(--bg-tertiary)] flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-5 w-5 text-[var(--text-muted)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[var(--text-primary)] truncate">{request.creditorName}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {format(new Date(request.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      {request.debtAmount && (
                        <span className="ml-2">
                          · R$ {Number(request.debtAmount).toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={status.variant} dot>
                      {status.label}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </Card>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Nova Solicitação de Limpa Nome</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Nome do Credor *"
                placeholder="Ex: Banco XYZ, Loja ABC"
                leftIcon={<Building2 className="h-4 w-4" />}
                error={errors.creditorName?.message}
                {...register('creditorName')}
              />

              <Input
                label="Valor da Dívida (opcional)"
                type="number"
                placeholder="0,00"
                leftIcon={<DollarSign className="h-4 w-4" />}
                {...register('debtAmount')}
              />

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--text-secondary)]">
                  Descrição (opcional)
                </label>
                <textarea
                  placeholder="Descreva detalhes sobre a dívida..."
                  className="w-full rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] focus:ring-2 focus:ring-indigo-500/20 resize-none"
                  rows={3}
                  {...register('description')}
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Atenção:</strong> Esta solicitação consumirá 1 crédito do seu plano.
                  Você possui {stats?.creditsRemaining ?? 0} crédito(s) disponível(is).
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={isSubmitting || createMutation.isPending}
                  leftIcon={<FileCheck className="h-4 w-4" />}
                >
                  Enviar Solicitação
                </Button>
              </div>

              {createMutation.isError && (
                <p className="text-sm text-rose-500 text-center">
                  Erro ao criar solicitação. Verifique seus créditos e tente novamente.
                </p>
              )}
            </form>
          </Card>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Detalhes da Solicitação</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Status</span>
                <Badge
                  variant={statusConfig[selectedRequest.status]?.variant || 'default'}
                  dot
                >
                  {statusConfig[selectedRequest.status]?.label || selectedRequest.status}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Credor</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{selectedRequest.creditorName}</span>
              </div>

              {selectedRequest.debtAmount && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Valor</span>
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    R$ {Number(selectedRequest.debtAmount).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}

              {selectedRequest.description && (
                <div>
                  <span className="text-sm text-[var(--text-muted)]">Descrição</span>
                  <p className="text-sm text-[var(--text-primary)] mt-1">{selectedRequest.description}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Criado em</span>
                <span className="text-sm text-[var(--text-secondary)]">
                  {format(new Date(selectedRequest.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                </span>
              </div>

              {selectedRequest.completedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-muted)]">Concluído em</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {format(new Date(selectedRequest.completedAt), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                </div>
              )}

              {selectedRequest.notes && (
                <div className="p-3 rounded-xl bg-[var(--bg-tertiary)]">
                  <p className="text-xs text-[var(--text-muted)] mb-1">Observações</p>
                  <p className="text-sm text-[var(--text-primary)]">{selectedRequest.notes}</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full mt-6"
              onClick={() => setSelectedRequest(null)}
            >
              Fechar
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
};
