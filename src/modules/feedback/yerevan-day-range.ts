// Asia/Yerevan is a fixed UTC+4 (no DST). `from`/`to` are inclusive YYYY-MM-DD days.
const YEREVAN_OFFSET_MS = 4 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfYerevanDay(day: string): number {
  return Date.parse(`${day}T00:00:00Z`) - YEREVAN_OFFSET_MS;
}

export function yerevanDayRange(from?: string, to?: string): { gte?: Date; lt?: Date } {
  const range: { gte?: Date; lt?: Date } = {};
  if (from) range.gte = new Date(startOfYerevanDay(from));
  if (to) range.lt = new Date(startOfYerevanDay(to) + DAY_MS);
  return range;
}
