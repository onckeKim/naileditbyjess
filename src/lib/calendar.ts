import { saDateTimeToUtc } from "./timezone";

function toGoogleUtcStamp(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function googleCalendarUrl(opts: {
  title: string;
  description: string;
  date: string;
  time: string;
  durationMinutes: number;
  location?: string;
}) {
  const start = saDateTimeToUtc(opts.date, opts.time);
  const end = new Date(start.getTime() + opts.durationMinutes * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    details: opts.description,
    dates: `${toGoogleUtcStamp(start)}/${toGoogleUtcStamp(end)}`,
  });
  if (opts.location) params.set("location", opts.location);

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
