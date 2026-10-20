/**
 * SLA calculator: adds and measures *business* minutes on a tenant's calendar.
 *
 * A calendar is a fixed UTC offset, the working weekdays and the working hours. Fixed
 * offsets do not model daylight saving time, and there are no public holidays yet.
 * Chapter 7 attacks this file with property-based tests.
 */
export interface BusinessCalendar {
  utcOffsetMinutes: number;
  workdays: number[]; // ISO weekdays: 1 = Monday … 7 = Sunday
  startHour: number;  // local, inclusive
  endHour: number;    // local, exclusive
}

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

function isoWeekday(localMs: number): number {
  const d = new Date(localMs).getUTCDay(); // localMs is already shifted, so UTC getters read local time
  return d === 0 ? 7 : d;
}

function dayStartLocal(localMs: number): number {
  return Math.floor(localMs / DAY) * DAY;
}

function check(cal: BusinessCalendar): void {
  if (cal.workdays.length === 0) throw new Error("A business calendar needs at least one workday.");
  if (!(cal.startHour >= 0 && cal.endHour <= 24 && cal.startHour < cal.endHour)) {
    throw new Error("Working hours must satisfy 0 <= startHour < endHour <= 24.");
  }
}

/** The moment that is `minutes` business minutes after `start`. */
export function addBusinessMinutes(start: Date, minutes: number, cal: BusinessCalendar): Date {
  check(cal);
  if (minutes <= 0) return new Date(start);
  const offset = cal.utcOffsetMinutes * MINUTE;
  let t = start.getTime() + offset;
  let remaining = minutes * MINUTE;

  for (;;) {
    const day = dayStartLocal(t);
    const open = day + cal.startHour * 60 * MINUTE;
    const close = day + cal.endHour * 60 * MINUTE;
    if (!cal.workdays.includes(isoWeekday(t)) || t >= close) {
      t = day + DAY + cal.startHour * 60 * MINUTE; // next day's opening time
      continue;
    }
    if (t < open) t = open;
    const available = close - t;
    if (remaining <= available) return new Date(t + remaining - offset);
    remaining -= available;
    t = day + DAY + cal.startHour * 60 * MINUTE;
  }
}

/** Business minutes between `from` and `to`. Zero if `to` is not after `from`. */
export function businessMinutesBetween(from: Date, to: Date, cal: BusinessCalendar): number {
  check(cal);
  const offset = cal.utcOffsetMinutes * MINUTE;
  let t = from.getTime() + offset;
  const end = to.getTime() + offset;
  let total = 0;

  while (t < end) {
    const day = dayStartLocal(t);
    const open = day + cal.startHour * 60 * MINUTE;
    const close = day + cal.endHour * 60 * MINUTE;
    if (cal.workdays.includes(isoWeekday(t))) {
      const a = Math.max(t, open);
      const b = Math.min(end, close);
      if (b > a) total += b - a;
    }
    t = day + DAY;
  }
  return Math.round(total / MINUTE);
}

export interface SlaState {
  firstResponse: { dueAt: Date; respondedAt: Date | null; breached: boolean };
  resolution: { dueAt: Date; solvedAt: Date | null; paused: boolean; breached: boolean };
}

export function slaState(
  t: { firstResponseDueAt: Date; firstResponseAt: Date | null; resolutionDueAt: Date; solvedAt: Date | null; pendingSince: Date | null },
  now = new Date(),
): SlaState {
  const respondedAt = t.firstResponseAt;
  return {
    firstResponse: {
      dueAt: t.firstResponseDueAt,
      respondedAt,
      breached: respondedAt ? respondedAt > t.firstResponseDueAt : now > t.firstResponseDueAt,
    },
    resolution: {
      dueAt: t.resolutionDueAt,
      solvedAt: t.solvedAt,
      paused: t.pendingSince !== null,
      breached: t.solvedAt ? t.solvedAt > t.resolutionDueAt : t.pendingSince === null && now > t.resolutionDueAt,
    },
  };
}
