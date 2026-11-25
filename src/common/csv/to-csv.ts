const FORMULA_LEADERS = ['=', '+', '-', '@', '\t', '\r'];

function escapeField(value: string | number | null): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (s.length > 0 && FORMULA_LEADERS.includes(s[0])) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(header: string[], rows: (string | number | null)[][]): string {
  const lines = [header, ...rows].map((r) => r.map(escapeField).join(','));
  return '﻿' + lines.join('\r\n');
}
