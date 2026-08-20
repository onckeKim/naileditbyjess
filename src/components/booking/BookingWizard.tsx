"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import {
  describeServicePrice,
  calculateMainServicePrice,
  calculateAddOnPrice,
  calculateDeposit,
  formatRand,
} from "@/lib/pricing";
import { parseBusinessHours } from "@/lib/business-hours";
import { getAvailableTimeSlots, todayIsoDate } from "@/lib/time-slots";
import { AddOnRow } from "./AddOnRow";
import type { ServiceOption, AddOnSelectionState } from "./types";

const STEP_LABELS = ["Service", "Add-Ons", "Date & Time", "Your Details", "Inspiration", "Review & Submit"];

function emptyAddOnState(): AddOnSelectionState {
  return { selected: false, mode: "FULL_SET", nailCount: 1 };
}

function WizardInner({
  primaryServices,
  addOnServices,
  depositPercentage,
  policyVersion,
  businessHours,
}: {
  primaryServices: ServiceOption[];
  addOnServices: ServiceOption[];
  depositPercentage: number;
  policyVersion: string;
  businessHours: string;
}) {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("service");

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<string | null>(preselected);
  const [addOns, setAddOns] = useState<Record<string, AddOnSelectionState>>({});
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [designNotes, setDesignNotes] = useState("");
  const [inspirationImageUrl, setInspirationImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [policyAccepted, setPolicyAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<{ reference: string; estimatedTotal: number; depositAmount: number; remainingBalance: number } | null>(null);

  const hours = useMemo(() => parseBusinessHours(businessHours), [businessHours]);
  const timeSlots = useMemo(() => (date ? getAvailableTimeSlots(hours, date) : []), [hours, date]);

  const service = primaryServices.find((s) => s.id === serviceId) || null;

  const selectedAddOns = addOnServices
    .map((svc) => ({ svc, state: addOns[svc.id] }))
    .filter((x) => x.state?.selected);

  const quote = useMemo(() => {
    if (!service) return null;
    const { price: serviceSubtotal, isEstimate: serviceEstimate } = calculateMainServicePrice(service);
    let addOnsTotal = 0;
    let addOnsEstimate = false;
    const details = selectedAddOns.map(({ svc, state }) => {
      const r = calculateAddOnPrice(svc, state);
      addOnsTotal += r.price;
      if (r.isEstimate) addOnsEstimate = true;
      return { svc, state, ...r };
    });
    const estimatedTotal = Math.round((serviceSubtotal + addOnsTotal) * 100) / 100;
    const { deposit, remaining } = calculateDeposit(estimatedTotal, depositPercentage);
    return {
      serviceSubtotal,
      addOnsTotal,
      estimatedTotal,
      isEstimate: serviceEstimate || addOnsEstimate,
      deposit,
      remaining,
      details,
    };
  }, [service, selectedAddOns, depositPercentage]);

  useEffect(() => {
    setTime("");
  }, [date]);

  function canAdvance(current: number) {
    if (current === 1) return !!serviceId;
    if (current === 2) return true;
    if (current === 3) return !!date && !!time;
    if (current === 4) return clientName.trim().length > 1 && /\S+@\S+\.\S+/.test(clientEmail) && clientPhone.trim().length > 5;
    if (current === 5) return true;
    return true;
  }

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setInspirationImageUrl(data.url);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!service || !quote) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        serviceId: service.id,
        addOns: selectedAddOns.map(({ svc, state }) => ({
          serviceId: svc.id,
          mode: state.mode,
          nailCount: state.nailCount,
        })),
        requestedDate: date,
        requestedTime: time,
        clientName,
        clientEmail,
        clientPhone,
        designNotes,
        inspirationImageUrl,
        policyAccepted: true,
      };
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <Card className="p-8 md:p-10 text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-black">Request Sent</h2>
        <p className="text-charcoal max-w-md">
          Your appointment request has been sent to Nailed It Jess. Your booking is only confirmed once the request has been
          accepted and you have received a confirmation email.
        </p>
        <div className="bg-bg border border-marble rounded-lg p-5 w-full max-w-sm text-left text-sm space-y-1">
          <p><span className="text-medium-grey">Reference:</span> <strong>{result.reference}</strong></p>
          <p><span className="text-medium-grey">Estimated total:</span> {formatRand(result.estimatedTotal)}</p>
          <p><span className="text-medium-grey">Required deposit ({depositPercentage}%):</span> {formatRand(result.depositAmount)}</p>
          <p><span className="text-medium-grey">Estimated balance:</span> {formatRand(result.remainingBalance)}</p>
        </div>
        <p className="text-xs text-medium-grey">Keep your reference number handy — it will also be in your confirmation email.</p>
      </Card>
    );
  }

  return (
    <div>
      <ol className="flex flex-wrap justify-center gap-2 mb-8">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={n > step}
                onClick={() => n < step && setStep(n)}
                className={`text-xs px-3 py-1.5 rounded-full border tracking-wide ${
                  active
                    ? "bg-black text-white border-black"
                    : done
                    ? "bg-white text-black border-black cursor-pointer"
                    : "bg-white text-medium-grey border-marble cursor-not-allowed"
                }`}
              >
                {n}. {label}
              </button>
            </li>
          );
        })}
      </ol>

      <Card className="p-6 md:p-10">
        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-black mb-1">Select a Service</h2>
            <p className="text-sm text-medium-grey mb-6">Choose the primary service you'd like to book.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {primaryServices.map((s) => {
                const { label, isEstimate } = describeServicePrice(s);
                const selected = s.id === serviceId;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setServiceId(s.id)}
                    className={`text-left border rounded-lg overflow-hidden transition-colors ${
                      selected ? "border-black ring-1 ring-black" : "border-marble hover:border-medium-grey"
                    }`}
                  >
                    {s.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.imageUrl} alt={s.name} className="w-full aspect-[16/9] object-cover" />
                    ) : (
                      <PlaceholderArt icon="drop" className="w-full aspect-[16/9]" />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-display text-lg text-black">{s.name}</p>
                        <p className="font-display text-black whitespace-nowrap">
                          {label}
                          {isEstimate ? " est." : ""}
                        </p>
                      </div>
                      <p className="text-xs text-medium-grey mt-1">{s.durationMinutes} min</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-black mb-1">Add-Ons (Optional)</h2>
            <p className="text-sm text-medium-grey mb-6">Enhance your set with nail art, chrome, or embellishments.</p>
            <div className="flex flex-col gap-3">
              {addOnServices.map((svc) => (
                <AddOnRow
                  key={svc.id}
                  service={svc}
                  state={addOns[svc.id] ?? emptyAddOnState()}
                  onChange={(next) => setAddOns((prev) => ({ ...prev, [svc.id]: next }))}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-black mb-1">Select a Date &amp; Time</h2>
            <p className="text-sm text-medium-grey mb-6">Pick your preferred appointment slot — this is a request, not a guarantee.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-md">
              <div>
                <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Date</label>
                <input
                  type="date"
                  min={todayIsoDate()}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Time</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  disabled={!date || timeSlots.length === 0}
                  className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black disabled:bg-bg"
                >
                  <option value="">{date ? (timeSlots.length ? "Select a time" : "Closed on this day") : "Select a date first"}</option>
                  {timeSlots.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-black mb-1">Your Details</h2>
            <p className="text-sm text-medium-grey mb-6">We'll use these to send your booking confirmation.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div className="sm:col-span-2">
                <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Full Name</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Phone</label>
                <input
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="060 000 0000"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs tracking-wide uppercase text-medium-grey mb-2">Design Notes (Optional)</label>
                <textarea
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-marble rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-black"
                  placeholder="Tell us about the design, colours, or inspiration you have in mind."
                />
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-black mb-1">Inspiration Photo (Optional)</h2>
            <p className="text-sm text-medium-grey mb-6">Upload a photo of the design you'd like, if you have one.</p>
            <div className="max-w-sm">
              {inspirationImageUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={inspirationImageUrl} alt="Inspiration" className="w-full rounded-lg border border-marble" />
                  <button
                    type="button"
                    onClick={() => setInspirationImageUrl(null)}
                    className="mt-3 text-xs underline text-medium-grey"
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-medium-grey rounded-lg p-10 cursor-pointer hover:bg-bg">
                  <span className="text-sm text-charcoal">{uploading ? "Uploading…" : "Click to upload an image"}</span>
                  <span className="text-xs text-medium-grey">JPEG, PNG, WEBP up to 8MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {step === 6 && service && quote && (
          <div>
            <h2 className="font-display text-2xl font-semibold text-black mb-1">Review &amp; Submit</h2>
            <p className="text-sm text-medium-grey mb-6">Please review your request before submitting.</p>

            <div className="bg-bg border border-marble rounded-lg p-5 mb-6 text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-charcoal">{service.name}</span>
                <span className="text-black">{formatRand(quote.serviceSubtotal)}</span>
              </div>
              {quote.details.map(({ svc, price }) => (
                <div key={svc.id} className="flex justify-between py-1.5 text-medium-grey">
                  <span>{svc.name}</span>
                  <span>{formatRand(price)}</span>
                </div>
              ))}
              <div className="border-t border-marble mt-2 pt-2 flex justify-between font-medium">
                <span>Estimated Total{quote.isEstimate ? " (estimate)" : ""}</span>
                <span>{formatRand(quote.estimatedTotal)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Required {depositPercentage}% Deposit</span>
                <span>{formatRand(quote.deposit)}</span>
              </div>
              <div className="flex justify-between pt-1 text-medium-grey">
                <span>Estimated Remaining Balance</span>
                <span>{formatRand(quote.remaining)}</span>
              </div>
              <div className="border-t border-marble mt-3 pt-3 text-xs text-medium-grey space-y-0.5">
                <p>{date} at {time}</p>
                <p>{clientName} · {clientEmail} · {clientPhone}</p>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm mb-6">
              <input
                type="checkbox"
                checked={policyAccepted}
                onChange={(e) => setPolicyAccepted(e.target.checked)}
                className="mt-1 h-4 w-4 accent-black"
              />
              <span className="text-charcoal">
                I have reviewed and agree to the Nailed It Jess deposit, cancellation, no-show, and appointment policies
                (version {policyVersion}). See the{" "}
                <a href="/policies" target="_blank" className="underline">
                  full policies
                </a>
                .
              </span>
            </label>

            {submitError && (
              <p className="text-error text-sm mb-4 bg-error/10 border border-error/30 rounded-sm px-3 py-2">{submitError}</p>
            )}

            <Button onClick={handleSubmit} disabled={!policyAccepted || submitting} size="lg" className="w-full sm:w-auto">
              {submitting ? "Submitting…" : "Submit Booking Request"}
            </Button>
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-marble">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 6 && (
            <Button onClick={() => setStep((s) => Math.min(6, s + 1))} disabled={!canAdvance(step)}>
              Continue
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

export function BookingWizard(props: {
  primaryServices: ServiceOption[];
  addOnServices: ServiceOption[];
  depositPercentage: number;
  policyVersion: string;
  businessHours: string;
}) {
  return (
    <Suspense fallback={null}>
      <WizardInner {...props} />
    </Suspense>
  );
}
