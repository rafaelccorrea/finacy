import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://finacy-back-git-main-rafaelccorreas-projects.vercel.app/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  },
);

// ─── Auth Service ─────────────────────────────────────────────────────────────
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: object) =>
    api.post('/auth/register', data),

  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
};

// ─── Plans Service ────────────────────────────────────────────────────────────
export const plansService = {
  list: () => api.get('/plans'),
  getById: (id: string) => api.get(`/plans/${id}`),
};

// ─── Subscriptions Service ────────────────────────────────────────────────────
export const subscriptionsService = {
  current: () => api.get('/subscriptions/current'),
  getCurrent: () => api.get('/subscriptions/current'),
  history: () => api.get('/subscriptions/history'),
  dashboard: () => api.get('/subscriptions/dashboard'),
};

// ─── Payments Service ─────────────────────────────────────────────────────────
export const paymentsService = {
  // Assinatura mensal
  createSubscriptionCheckout: (data: {
    planId: string;
    paymentMethod: 'card' | 'pix';
    successUrl: string;
    cancelUrl: string;
  }) => api.post('/payments/checkout/subscription', data),

  // Compra de créditos avulsos
  createCreditCheckout: (data: {
    packageId: string;
    paymentMethod: 'card' | 'pix';
    successUrl: string;
    cancelUrl: string;
  }) => api.post('/payments/checkout/credits', data),

  // Pacotes de créditos disponíveis
  listCreditPackages: () =>
    api.get('/payments/credit-packages'),

  // Saldo de créditos
  getCreditsBalance: () =>
    api.get('/payments/credits/balance'),

  // Histórico de pagamentos
  history: (page = 1, limit = 10) =>
    api.get(`/payments/history?page=${page}&limit=${limit}`),

  // Cancelar assinatura
  cancelSubscription: (id: string, immediately = false) =>
    api.post(`/payments/subscriptions/${id}/cancel`, { immediately }),

  // Portal do cliente Stripe
  createPortalSession: (returnUrl: string) =>
    api.post('/payments/portal', { returnUrl }),

  // Legado (mantido para compatibilidade)
  subscribe: (planId: string, paymentMethod: string) =>
    api.post(`/payments/subscribe/${planId}`, { paymentMethod }),

  createPix: (planId: string) =>
    api.post(`/payments/pix/${planId}`),

  cancel: (subscriptionId: string) =>
    api.post(`/payments/cancel/${subscriptionId}`),
};

// ─── Documents Service ──────────────────────────────────────────────────────
export const documentsService = {
  // Upload de documento de identificação (CNH, RG, CPF)
  upload: (formData: FormData) =>
    api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Upload específico para Limpa Nome (endpoint dedicado no CleanName)
  uploadForCleanName: (formData: FormData) =>
    api.post('/clean-name/upload-document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  list: () => api.get('/documents'),

  getById: (id: string) => api.get(`/documents/${id}`),
};

// ─── Clean Name Service ───────────────────────────────────────────────────────
export const cleanNameService = {
  create: (data: object) =>
    api.post('/clean-name/request', data),

  list: (page = 1, limit = 10) =>
    api.get(`/clean-name/requests?page=${page}&limit=${limit}`),

  stats: () =>
    api.get('/clean-name/stats'),

  getById: (id: string) =>
    api.get(`/clean-name/requests/${id}`),
};
