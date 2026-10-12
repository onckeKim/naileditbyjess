import { Card, Badge } from "@/components/ui/Card";
import { LinkButton } from "@/components/ui/Button";
import { describeServicePrice, calculateMainServicePrice, calculateDeposit, formatRand } from "@/lib/pricing";
import type { ServiceLike } from "@/lib/pricing";

type Service = ServiceLike & {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  depositOverridePercentage: number | null;
};

export function ServiceCard({ service, defaultDepositPercentage }: { service: Service; defaultDepositPercentage: number }) {
  const { label, isEstimate } = describeServicePrice(service);
  const { price } = calculateMainServicePrice(service);
  const depositPct = service.depositOverridePercentage ?? defaultDepositPercentage;
  const { deposit } = calculateDeposit(price, depositPct);

  return (
    <Card className="flex flex-col overflow-hidden h-full">
      <div className="h-1.5 brand-gradient-bar" aria-hidden="true" />
      <div className="p-6 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-black">{service.name}</h3>
          <span className="font-display text-lg text-black whitespace-nowrap">{label}</span>
        </div>
        {service.description && <p className="text-sm text-medium-grey leading-relaxed">{service.description}</p>}

        <div className="flex flex-wrap gap-2 mt-1">
          <Badge>{service.durationMinutes} min</Badge>
          {deposit > 0 && <Badge tone="neutral">{formatRand(deposit)} deposit</Badge>}
          {isEstimate && <Badge tone="warning">Estimate — varies by design</Badge>}
        </div>

        <div className="mt-auto pt-4">
          <LinkButton href={`/book?service=${service.id}`} className="w-full">
            Book This Service
          </LinkButton>
        </div>
      </div>
    </Card>
  );
}
