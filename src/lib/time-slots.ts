import type { BusinessHours } from "./business-hours";

const DAY_KEYS: (keyof BusinessHours)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function dayKeyForDate(dateStr: string): keyof BusinessHours {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return DAY_KEYS[date.getDay()];
}

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function toTimeStr(mins: number) {
  const h = Math.floor(mins / 60)
    .toString()
    .padStart(2, "0");
  const m = (mins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function getAvailableTimeSlots(hours: BusinessHours, dateStr: string, intervalMinutes = 30) {
  const day = hours[dayKeyForDate(dateStr)];
  if (!day || day.closed || !day.open || !day.close) return [];

  const slots: string[] = [];
  const start = toMinutes(day.open);
  const end = toMinutes(day.close);
  for (let t = start; t < end; t += intervalMinutes) {
    slots.push(toTimeStr(t));
  }
  return slots;
}

export function todayIsoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
