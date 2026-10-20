import { ZodError, type ZodType } from "zod";
import { AppError, badRequest } from "@/domain/errors";

type Handler<C> = (req: Request, ctx: C) => Promise<Response>;

/** Problem details (RFC 9457): the error format for every endpoint. */
export function problem(status: number, title: string, detail?: string, errors?: { field: string; message: string }[]): Response {
  return Response.json(
    { type: "about:blank", title, status, ...(detail ? { detail } : {}), ...(errors ? { errors } : {}) },
    { status, headers: { "content-type": "application/problem+json" } },
  );
}

/** Wrap a route handler so every failure becomes problem details and internals never leak. */
export function route<C>(handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof AppError) return problem(err.status, err.title, err.detail, err.errors);
      if (err instanceof ZodError) return problem(400, "Invalid request", "Some fields are invalid.", zodErrors(err));
      console.error(err);
      return problem(500, "Internal error", "Something went wrong on our side.");
    }
  };
}

export function zodErrors(err: ZodError): { field: string; message: string }[] {
  return err.issues.map((i) => ({ field: i.path.join(".") || "body", message: i.message }));
}

export async function readJson<T>(req: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw badRequest("The request body must be JSON.");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw badRequest("Some fields are invalid.", zodErrors(parsed.error));
  return parsed.data;
}

export function query(req: Request): URLSearchParams {
  return new URL(req.url).searchParams;
}

/** Route params arrive as a promise in Next.js 15 and later. */
export type Params<K extends string> = { params: Promise<Record<K, string>> };
