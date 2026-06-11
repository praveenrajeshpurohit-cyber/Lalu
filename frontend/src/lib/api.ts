import { storage } from "@/src/utils/storage";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL || "";
const TOKEN_KEY = "cs_token";

export type ApiError = { status: number; detail: string };

async function request<T = any>(
  path: string,
  init: RequestInit = {},
  auth: boolean = true,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) || {}),
  };
  if (auth) {
    const token = await storage.getItem<string>(TOKEN_KEY, "");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}/api${path}`, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const detail =
      (data && (data.detail || data.message)) || res.statusText || "Request failed";
    const err: ApiError = {
      status: res.status,
      detail: typeof detail === "string" ? detail : JSON.stringify(detail),
    };
    throw err;
  }
  return data as T;
}

export const api = {
  get: <T = any>(p: string, auth = true) => request<T>(p, { method: "GET" }, auth),
  post: <T = any>(p: string, body?: any, auth = true) =>
    request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }, auth),
  put: <T = any>(p: string, body?: any, auth = true) =>
    request<T>(p, { method: "PUT", body: body ? JSON.stringify(body) : undefined }, auth),
  del: <T = any>(p: string, auth = true) => request<T>(p, { method: "DELETE" }, auth),
};

export async function saveToken(token: string) {
  await storage.setItem(TOKEN_KEY, token);
}

export async function getToken() {
  return storage.getItem<string>(TOKEN_KEY, "");
}

export async function clearToken() {
  await storage.removeItem(TOKEN_KEY);
}
