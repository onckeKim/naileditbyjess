// Pure helpers with no server-only imports, safe to use from client components
// (e.g. the booking wizard) as well as server components.

export type BusinessHours = Record<
  "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
  { open: string; close: string; closed: boolean }
>;

export function parseBusinessHours(json: string): BusinessHours {
  try {
    return JSON.parse(json);
  } catch {
    return {
      mon: { open: "09:00", close: "17:00", closed: false },
      tue: { open: "09:00", close: "17:00", closed: false },
      wed: { open: "09:00", close: "17:00", closed: false },
      thu: { open: "09:00", close: "17:00", closed: false },
      fri: { open: "09:00", close: "17:00", closed: false },
      sat: { open: "09:00", close: "14:00", closed: false },
      sun: { open: "", close: "", closed: true },
    };
  }
}

export const DAY_LABELS: Record<keyof BusinessHours, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};
