import NepaliDate from "nepali-date-converter";

export interface BsDate {
  year: number;
  month: number;
  date: number;
  day: number;
}

const NP_CACHE = new Map<number, NepaliDate>();

function getNp(adDate: Date): NepaliDate | null {
  const t = adDate.getTime();
  const cached = NP_CACHE.get(t);
  if (cached) return cached;
  try {
    const nd = new NepaliDate(adDate);
    NP_CACHE.set(t, nd);
    return nd;
  } catch {
    return null;
  }
}

export function adToBs(adDateStr: string): BsDate {
  try {
    const adDate = new Date(adDateStr);
    if (isNaN(adDate.getTime())) throw new Error("Invalid AD date");
    const nd = getNp(adDate);
    if (!nd) throw new Error("Conversion failed");
    const bs = nd.getBS();
    return {
      year: bs.year ?? 0,
      month: bs.month ?? 0,
      date: bs.date ?? 0,
      day: bs.day ?? 0,
    };
  } catch {
    return { year: 0, month: 0, date: 0, day: 0 };
  }
}

export function bsToJsDate(year: number, month: number, date: number): Date | null {
  try {
    const nd = new NepaliDate(year, month, date);
    return nd.toJsDate();
  } catch {
    return null;
  }
}

export function daysInBsMonth(year: number, month: number): number {
  const start = bsToJsDate(year, month, 1);
  if (!start) return 30;
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear = year + 1;
  }
  const end = bsToJsDate(nextYear, nextMonth, 1);
  if (!end) return 30;
  return Math.round((end.getTime() - start.getTime()) / 86400000) || 29;
}

export function firstDayOfBsMonth(year: number, month: number): number {
  try {
    const nd = new NepaliDate(year, month, 1);
    const bs = nd.getBS();
    return bs.day ?? 0;
  } catch {
    return 0;
  }
}

export function formatBsDate(adDateStr: string): BsDate {
  return adToBs(adDateStr);
}

const BS_MONTH_NAMES = [
  "Baisakh", "Jestha", "Ashadh", "Shrawan", "Bhadra",
  "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra",
];

export function getBsMonthName(month: number, short?: boolean): string {
  const name = BS_MONTH_NAMES[month] || "";
  return short ? name.slice(0, 3) : name;
}

const BS_DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export function getBsDayName(day: number): string {
  return BS_DAY_NAMES[day] || "";
}
