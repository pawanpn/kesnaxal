import NepaliDate from "nepali-date-converter";

export interface BsDate {
  year: number;
  month: number; // 0-indexed (0 = Baisakh)
  date: number;
  day: number;   // 0 = Sunday
}

export function adToBs(adDateStr: string): BsDate {
  const nd = new NepaliDate(new Date(adDateStr));
  const bs = nd.getBS() as { year: number; month: number; date: number; day: number };
  return { year: bs.year, month: bs.month, date: bs.date, day: bs.day };
}

export function bsToJsDate(year: number, month: number, date: number): Date {
  const nd = new NepaliDate();
  nd.setYear(year);
  nd.setMonth(month);
  nd.setDate(date);
  return nd.toJsDate();
}

export function daysInBsMonth(year: number, month: number): number {
  const start = bsToJsDate(year, month, 1);
  let nextMonth = month + 1;
  let nextYear = year;
  if (nextMonth > 11) {
    nextMonth = 0;
    nextYear = year + 1;
  }
  const end = bsToJsDate(nextYear, nextMonth, 1);
  return Math.round((end.getTime() - start.getTime()) / 86400000);
}

export function firstDayOfBsMonth(year: number, month: number): number {
  const d = new NepaliDate();
  d.setYear(year);
  d.setMonth(month);
  d.setDate(1);
  return (d.getBS() as { day: number }).day;
}

export function formatBsDate(adDateStr: string): BsDate {
  return adToBs(adDateStr);
}
