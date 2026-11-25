import { parseTrustProxyHops } from './trust-proxy';

describe('parseTrustProxyHops', () => {
  it.each<[unknown, number]>([
    ['', 1],
    ['   ', 1],
    ['abc', 1],
    ['-1', 1],
    ['1.5', 1],
    [undefined, 1],
    [null, 1],
    ['0', 0],
    ['1', 1],
    ['2', 2],
    [' 3 ', 3],
    [2, 2],
    [-1, 1],
  ])('parses %p as %p', (value, expected) => {
    expect(parseTrustProxyHops(value)).toBe(expected);
  });
});
