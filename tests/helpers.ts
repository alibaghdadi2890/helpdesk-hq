import { POST as devLogin } from "@/app/auth/dev-login/route";

export const BASE = "http://helpdesk.test";

export async function login(email: string): Promise<string> {
  const res = await devLogin(json("POST", "/auth/dev-login", { email }), undefined);
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status}`);
  return ((await res.json()) as { token: string }).token;
}

export function json(method: string, path: string, body?: unknown, token?: string): Request {
  return new Request(BASE + path, {
    method,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export function get(path: string, token?: string): Request {
  return json("GET", path, undefined, token);
}

export const params = <T extends Record<string, string>>(p: T) => ({ params: Promise.resolve(p) });
