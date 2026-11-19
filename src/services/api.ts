import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export type UserRole = "doctor" | "patient" | "support";

export interface AuthSession {
  role: UserRole;
  email: string;
  fullName?: string;
  token: string;
  verified2FA: boolean;
  loggedInAt: string;
}

export interface LoginPayload {
  role: UserRole;
  email: string;
  password: string;
}

export interface RegisterPayload {
  role: "patient" | "doctor";
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  medicalLicense?: string;
  hospitalName?: string;
}

const SESSION_STORAGE_KEY = "ecgenius_session";
const USE_MOCK_API = true;

const BASE_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_API_BASE_URL || "https://api.ecgenius.health/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 12000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function getStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

// Attach Bearer token automatically to outgoing requests
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = getStoredSession();
  if (session?.token && config.headers) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

// Handle 401 session expiration cleanly
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearSession();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login?reason=expired";
      }
    }
    return Promise.reject(error);
  },
);

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  async login(payload: LoginPayload): Promise<{
    requires2FA: boolean;
    accountStatus: "active" | "pending";
    session?: AuthSession;
  }> {
    if (!USE_MOCK_API) {
      const { data } = await apiClient.post("/auth/login", payload);
      return data;
    }

    await delay(450);

    if (
      payload.role === "doctor" &&
      payload.email.toLowerCase().includes("pending")
    ) {
      return { requires2FA: false, accountStatus: "pending" };
    }

    const requires2FA = payload.role === "doctor" || payload.role === "support";
    const session: AuthSession = {
      role: payload.role,
      email: payload.email.trim(),
      token: `mock-jwt-${payload.role}-${Date.now()}`,
      verified2FA: !requires2FA,
      loggedInAt: new Date().toISOString(),
    };

    if (!requires2FA) {
      saveSession(session);
    }

    return { requires2FA, accountStatus: "active", session };
  },

  async verifyTwoFactor(params: {
    role: UserRole;
    email: string;
    code: string;
  }): Promise<AuthSession> {
    if (!USE_MOCK_API) {
      const { data } = await apiClient.post("/auth/2fa/verify", params);
      if (data.session) saveSession(data.session);
      return data.session;
    }

    await delay(450);
    const session: AuthSession = {
      role: params.role,
      email: params.email.trim(),
      token: `mock-2fa-jwt-${params.role}-${Date.now()}`,
      verified2FA: true,
      loggedInAt: new Date().toISOString(),
    };
    saveSession(session);
    return session;
  },

  async register(payload: RegisterPayload): Promise<{
    status: "created" | "pending_approval";
    session?: AuthSession;
  }> {
    if (!USE_MOCK_API) {
      const { data } = await apiClient.post("/auth/register", payload);
      if (data.session) saveSession(data.session);
      return data;
    }

    await delay(500);

    if (payload.role === "doctor") {
      return { status: "pending_approval" };
    }

    const session: AuthSession = {
      role: "patient",
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      token: `mock-patient-jwt-${Date.now()}`,
      verified2FA: true,
      loggedInAt: new Date().toISOString(),
    };
    saveSession(session);
    return { status: "created", session };
  },

  async requestPasswordReset(email: string): Promise<{ sent: boolean }> {
    if (!USE_MOCK_API) {
      const { data } = await apiClient.post("/auth/forgot-password", { email });
      return data;
    }

    await delay(400);
    return { sent: true };
  },

  logout(): void {
    clearSession();
  },
};
