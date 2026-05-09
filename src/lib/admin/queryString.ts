type AnyParams = Record<string, string | number | undefined | null>;

export function buildQuery(base: string, current: AnyParams, override: AnyParams = {}): string {
  const merged: AnyParams = { ...current, ...override };
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}
