import type { MutationCtx, QueryCtx } from "./_generated/server";

function normalizePassword(value: string | undefined | null) {
  return value?.trim() ?? "";
}

export async function isAdmin(
  _ctx: QueryCtx | MutationCtx,
  suppliedPassword?: string,
) {
  const expectedPassword = normalizePassword(
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
      ?.ADMIN_PASSWORD,
  );
  if (!expectedPassword) {
    return false;
  }

  return normalizePassword(suppliedPassword) === expectedPassword;
}

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  suppliedPassword?: string,
) {
  const authorized = await isAdmin(ctx, suppliedPassword);
  if (!authorized) {
    throw new Error("Unauthorized: valid admin password required.");
  }
}
