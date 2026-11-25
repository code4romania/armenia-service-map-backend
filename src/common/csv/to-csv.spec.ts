import { toCsv } from './to-csv';

describe('toCsv', () => {
  it('starts with BOM, quotes and escapes fields, uses CRLF', () => {
    const csv = toCsv(['h1', 'h2'], [['a"b', 'x,y'], ['line1\nline2', 'Այո']]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toBe('﻿"h1","h2"\r\n"a""b","x,y"\r\n"line1\nline2","Այո"');
  });

  it('prefixes formula-injection leaders with a single quote', () => {
    const csv = toCsv(['c'], [['=SUM(A1)'], ['+1'], ['-1'], ['@x'], ['\tx'], ['\rx']]);
    const lines = csv.slice(1).split('\r\n');
    expect(lines[1]).toBe(`"'=SUM(A1)"`);
    expect(lines[2]).toBe(`"'+1"`);
    expect(lines[3]).toBe(`"'-1"`);
    expect(lines[4]).toBe(`"'@x"`);
    expect(csv).toContain(`"'\tx"`);
    expect(csv).toContain(`"'\rx"`);
  });

  it('renders null as empty and numbers as strings', () => {
    expect(toCsv(['a', 'b'], [[null, 5]])).toBe('﻿"a","b"\r\n"","5"');
  });
});
