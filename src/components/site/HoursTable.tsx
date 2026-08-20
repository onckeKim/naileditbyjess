import { DAY_LABELS, type BusinessHours } from "@/lib/business-hours";

export function HoursTable({ hours }: { hours: BusinessHours }) {
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3).toLowerCase() as keyof BusinessHours;
  return (
    <div className="divide-y divide-marble">
      {(Object.keys(DAY_LABELS) as (keyof BusinessHours)[]).map((day) => {
        const d = hours[day];
        const isToday = day === today;
        return (
          <div key={day} className={`flex items-center justify-between py-3 ${isToday ? "text-black font-medium" : "text-charcoal"}`}>
            <span className="text-sm">{DAY_LABELS[day]}</span>
            <span className="text-sm">{d?.closed ? "Closed" : `${d?.open} – ${d?.close}`}</span>
          </div>
        );
      })}
    </div>
  );
}
