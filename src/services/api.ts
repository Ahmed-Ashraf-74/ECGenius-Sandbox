import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5255/api";

export const APP_NAME = import.meta.env.VITE_APP_NAME || "ECGenius";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorMessage = await response.text();

    throw new Error(
      errorMessage || `API Error: ${response.status} ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export type UserRole = "patient" | "doctor" | "admin";

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

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
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

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const session = getStoredSession();
  if (session?.token && config.headers) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

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
    accountStatus: "active" | "pending" | "deactivated";
    session?: AuthSession;
  }> {
    if (!USE_MOCK_API) {
      const { data } = await apiClient.post("/auth/login", payload);
      return data;
    }

    await delay(450);

    if (payload.email.toLowerCase().includes("deactivated")) {
      return { requires2FA: false, accountStatus: "deactivated" };
    }

    if (
      payload.role === "doctor" &&
      payload.email.toLowerCase().includes("pending")
    ) {
      return { requires2FA: false, accountStatus: "pending" };
    }

    const requires2FA = payload.role === "doctor" || payload.role === "admin";
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
