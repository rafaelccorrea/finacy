// ─── User Types ──────────────────────────────────────────────────────────────
export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  stripeCustomerId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth Types ───────────────────────────────────────────────────────────────
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ─── Plan Types ───────────────────────────────────────────────────────────────
export type PlanInterval = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: PlanInterval;
  stripePriceId: string;
  features: string[];
  cleanNameCredits: number;
  trialDays?: number;
  isActive: boolean;
  isHighlighted: boolean;
  order: number;
}

// ─── Subscription Types ───────────────────────────────────────────────────────
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'TRIALING'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'UNPAID'
  | 'INACTIVE';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  plan: Plan;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  cleanNameCreditsTotal: number;
  cleanNameCreditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Payment Types ────────────────────────────────────────────────────────────
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELED';
export type PaymentMethod = 'CREDIT_CARD' | 'PIX';

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  description?: string;
  pixQrCode?: string;
  pixExpiresAt?: string;
  createdAt: string;
}

// ─── Clean Name Types ─────────────────────────────────────────────────────────
export type CleanNameStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELED';

export interface CleanNameRequest {
  id: string;
  userId: string;
  creditorName: string;
  debtAmount?: number;
  description?: string;
  status: CleanNameStatus;
  documentUrl?: string;
  autentiqueDocumentId?: string;
  notes?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CleanNameStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  creditsTotal: number;
  creditsUsed: number;
  creditsRemaining: number;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────────
export interface DashboardStats {
  subscription: {
    status: SubscriptionStatus;
    planName: string;
    currentPeriodEnd: string;
    daysRemaining: number;
  } | null;
  cleanName: CleanNameStats;
  recentPayments: Payment[];
}

// ─── API Response Types ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  path: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}
