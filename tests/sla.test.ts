import { describe, expect, it } from "vitest";
import { addBusinessMinutes, businessMinutesBetween, type BusinessCalendar } from "@/domain/sla";

// Helpdesk HQ: UTC+3, Monday to Friday, 09:00–17:00 local.
const hq: BusinessCalendar = { utcOffsetMinutes: 180, workdays: [1, 2, 3, 4, 5], startHour: 9, endHour: 17 };
// Souk Market: UTC+3, Sunday to Thursday, 09:00–18:00 local.
const souk: BusinessCalendar = { utcOffsetMinutes: 180, workdays: [7, 1, 2, 3, 4], startHour: 9, endHour: 18 };

/** Build a UTC Date from a local wall-clock time on a +3 calendar. */
const local = (iso: string) => new Date(new Date(`${iso}Z`).getTime() - 180 * 60_000);

describe("addBusinessMinutes", () => {
  it("adds within the same working day", () => {
    // Monday 19 October 2026, 10:00 local
    expect(addBusinessMinutes(local("2026-10-19T10:00:00"), 60, hq)).toEqual(local("2026-10-19T11:00:00"));
  });

  it("starts the clock at opening time when a ticket arrives early", () => {
    expect(addBusinessMinutes(local("2026-10-19T07:30:00"), 30, hq)).toEqual(local("2026-10-19T09:30:00"));
  });

  it("carries over the weekend", () => {
    // Friday 23 October 16:30 + 60 minutes = Monday 26 October 09:30
    expect(addBusinessMinutes(local("2026-10-23T16:30:00"), 60, hq)).toEqual(local("2026-10-26T09:30:00"));
  });

  it("treats a ticket created on Saturday as arriving on Monday morning", () => {
    expect(addBusinessMinutes(local("2026-10-24T12:00:00"), 120, hq)).toEqual(local("2026-10-26T11:00:00"));
  });

  it("follows a Sunday-to-Thursday week", () => {
    // Thursday 22 October 17:00 + 120 = Sunday 25 October 10:00 (Friday and Saturday are off)
    expect(addBusinessMinutes(local("2026-10-22T17:00:00"), 120, souk)).toEqual(local("2026-10-25T10:00:00"));
  });

  it("spans several days", () => {
    // 2,400 business minutes = five 8-hour days: Monday 09:00 to Friday 17:00
    expect(addBusinessMinutes(local("2026-10-19T09:00:00"), 2400, hq)).toEqual(local("2026-10-23T17:00:00"));
  });

  it("returns the start for zero minutes", () => {
    const start = local("2026-10-24T03:00:00");
    expect(addBusinessMinutes(start, 0, hq)).toEqual(start);
  });

  it("rejects a calendar with no working days", () => {
    expect(() => addBusinessMinutes(new Date(), 10, { ...hq, workdays: [] })).toThrow();
  });
});

describe("businessMinutesBetween", () => {
  it("counts only working hours", () => {
    expect(businessMinutesBetween(local("2026-10-23T16:00:00"), local("2026-10-26T10:00:00"), hq)).toBe(120);
  });

  it("is zero when the end is before the start", () => {
    expect(businessMinutesBetween(local("2026-10-26T10:00:00"), local("2026-10-23T16:00:00"), hq)).toBe(0);
  });

  it("undoes addBusinessMinutes for starts inside working hours", () => {
    const start = local("2026-10-21T13:17:00");
    for (const minutes of [1, 59, 480, 1000, 2400]) {
      expect(businessMinutesBetween(start, addBusinessMinutes(start, minutes, hq), hq)).toBe(minutes);
    }
  });
});
