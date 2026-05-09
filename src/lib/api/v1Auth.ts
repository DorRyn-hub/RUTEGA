import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { authenticateApiKey, requireScope, type ApiScope } from "./keys";

export interface V1Context {
  organizationId: string;
  scopes: string[];
}

export async function authV1(
  req: NextRequest,
  scope: ApiScope,
): Promise<{ ok: true; ctx: V1Context } | { ok: false; res: NextResponse }> {
  const auth = req.headers.get("authorization") ?? "";
  let token: string | null = null;
  if (auth.toLowerCase().startsWith("bearer ")) {
    token = auth.slice(7).trim();
  } else {
    token = req.headers.get("x-api-key");
  }
  const key = await authenticateApiKey(token);
  if (!key) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "missing or invalid API key", hint: "Send 'Authorization: Bearer <key>' or X-Api-Key" },
        { status: 401 },
      ),
    };
  }
  if (!requireScope(key, scope)) {
    return {
      ok: false,
      res: NextResponse.json(
        { error: "insufficient_scope", required: scope, available: key.scopes },
        { status: 403 },
      ),
    };
  }
  return { ok: true, ctx: { organizationId: key.organizationId, scopes: key.scopes } };
}
