# Finacy — Frontend

> Interface moderna para a plataforma de Gestão Financeira e Limpeza de Nome

## Stack Tecnológica

| Tecnologia | Finalidade |
|---|---|
| **React 19** | Framework de UI |
| **TypeScript 5** | Tipagem estática |
| **Vite 7** | Build tool e dev server |
| **TailwindCSS 4** | Estilização utilitária |
| **React Router v7** | Roteamento SPA |
| **TanStack Query v5** | Gerenciamento de estado servidor |
| **Zustand v5** | Estado global (auth, tema, UI) |
| **React Hook Form + Zod** | Formulários com validação |
| **Axios** | Cliente HTTP com interceptors |
| **Stripe.js** | Integração de pagamentos |
| **Lucide React** | Ícones |
| **date-fns** | Manipulação de datas |

## Paleta de Cores

### Modo Light
| Papel | Hex |
|---|---|
| Background primário | `#FFFFFF` |
| Background secundário | `#F8FAFC` |
| Sidebar | `#1E1B4B` |
| Texto primário | `#0F172A` |
| Borda | `#E2E8F0` |

### Modo Dark
| Papel | Hex |
|---|---|
| Background primário | `#0F0E1A` |
| Background secundário | `#1A1830` |
| Texto primário | `#F1F5F9` |
| Borda | `#2D2B4E` |

### Cores de Marca
| Nome | Hex |
|---|---|
| Primary (Indigo) | `#4F46E5` |
| Accent (Cyan) | `#06B6D4` |
| Secondary (Violet) | `#7C3AED` |
| Success (Emerald) | `#10B981` |
| Warning (Amber) | `#F59E0B` |
| Danger (Rose) | `#F43F5E` |

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/           # Button, Card, Badge, Input, Avatar, Skeleton
│   └── layout/       # Sidebar, Header, AppLayout
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── MyPlanPage.tsx
│   └── CleanNamePage.tsx
├── services/api.ts   # Axios + interceptors + serviços
├── store/index.ts    # Zustand (auth, theme, UI)
├── types/index.ts    # Tipos TypeScript globais
└── App.tsx           # Roteamento principal
```

## Instalação

```bash
cp .env.example .env
pnpm install
pnpm run dev
```

## Funcionalidades

- **Painel**: visão geral, créditos, dias restantes, ações rápidas
- **Meu Plano**: listagem de planos, assinatura via Stripe (PIX/Cartão), cancelamento
- **Limpa Nome**: solicitações, acompanhamento de status, controle de créditos
- **Tema**: Light/Dark com persistência automática
- **Autenticação**: JWT com refresh token automático
