/**
 * All appointment dates/times in this app are wall-clock local time for the
 * business (Africa/Johannesburg, SAST). South Africa has used a fixed
 * UTC+2 offset with no daylight saving since 1943, so a lightweight fixed
 * offset is accurate here without pulling in a full IANA timezone library.
 *
 * The server this app runs on may be in a different timezone (most
 * serverless hosts default to UTC), so anywhere "now" needs to be compared
 * against an appointment's wall-clock date/time, go through these helpers
 * rather than `new Date(\`${date}T${time}\`)`, which would be interpreted in
 * the server's local timezone and silently produce the wrong answer.
 */

const SAST_OFFSET_MINUTES = 2 * 60;

/** Converts a business-local wall-clock date+time into the correct UTC Date instant. */
export function saDateTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcMillis = Date.UTC(year, month - 1, day, hour, minute) - SAST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMillis);
}

/** The current date/time expressed as SAST wall-clock values. */
export function nowInSA(): { date: string; time: string; instant: Date } {
  const instant = new Date();
  const sast = new Date(instant.getTime() + SAST_OFFSET_MINUTES * 60 * 1000);
  const date = `${sast.getUTCFullYear()}-${String(sast.getUTCMonth() + 1).padStart(2, "0")}-${String(sast.getUTCDate()).padStart(2, "0")}`;
  const time = `${String(sast.getUTCHours()).padStart(2, "0")}:${String(sast.getUTCMinutes()).padStart(2, "0")}`;
  return { date, time, instant };
}

/** Hours between now (SAST) and the given business-local wall-clock date+time. Negative if in the past. */
export function hoursUntilSA(date: string, time: string): number {
  const target = saDateTimeToUtc(date, time);
  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
}
