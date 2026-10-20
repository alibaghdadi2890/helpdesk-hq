import { jwtVerify, SignJWT } from "jose";
import { forbidden, unauthorized } from "@/domain/errors";

export type Role = "agent" | "lead" | "admin";
export interface CurrentUser {
  userId: string;
  tenantId: string;
  role: Role;
  name: string;
}

function secret(): Uint8Array {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("JWT_SECRET must be set to at least 32 characters.");
  return new TextEncoder().encode(value);
}

export async function signToken(u: CurrentUser): Promise<string> {
  return new SignJWT({ tid: u.tenantId, role: u.role, name: u.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(u.userId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret());
}

/** The tenant always comes from the token. Nothing in a URL or body can change it. */
export async function requireUser(req: Request): Promise<CurrentUser> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw unauthorized();
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    const role = payload.role as Role;
    if (typeof payload.sub !== "string" || typeof payload.tid !== "string" || !["agent", "lead", "admin"].includes(role)) {
      throw new Error("bad claims");
    }
    return { userId: payload.sub, tenantId: payload.tid, role, name: String(payload.name ?? "") };
  } catch {
    throw unauthorized("The token is invalid or has expired. Sign in again.");
  }
}

export function requireRole(user: CurrentUser, ...roles: Role[]): void {
  if (!roles.includes(user.role)) throw forbidden(`This needs one of these roles: ${roles.join(", ")}.`);
}
