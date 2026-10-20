/** An error with an HTTP meaning. Route handlers turn it into problem details (RFC 9457). */
export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail?: string,
    public readonly errors?: { field: string; message: string }[],
  ) {
    super(detail ?? title);
  }
}

export const notFound = (what: string) => new AppError(404, "Not found", `${what} was not found.`);
export const conflict = (detail: string) => new AppError(409, "Conflict", detail);
export const badRequest = (detail: string, errors?: { field: string; message: string }[]) =>
  new AppError(400, "Invalid request", detail, errors);
export const forbidden = (detail = "You do not have permission to do this.") =>
  new AppError(403, "Forbidden", detail);
export const unauthorized = (detail = "Sign in first: POST /auth/dev-login.") =>
  new AppError(401, "Unauthorized", detail);
