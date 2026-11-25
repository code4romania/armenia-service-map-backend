/**
 * Parses TRUST_PROXY_HOPS. A blank, non-numeric, fractional or negative value
 * falls back to 1 hop — `Number('')` is 0, which would silently disable proxy
 * trust and make every client share one throttle bucket (the proxy's IP).
 */
export function parseTrustProxyHops(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value >= 0 ? value : 1;
  }
  if (typeof value !== 'string' || !/^\s*\d+\s*$/.test(value)) return 1;
  const hops = Number(value);
  return Number.isSafeInteger(hops) ? hops : 1;
}
