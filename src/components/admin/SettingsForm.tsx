"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DAY_LABELS, parseBusinessHours, type BusinessHours } from "@/lib/business-hours";
import { BlockedDatesManager } from "./BlockedDatesManager";
import { RemindersLog } from "./RemindersLog";

type FaqItem = { question: string; answer: string };

type Settings = {
  businessName: string;
  established: string;
  whatsapp: string;
  instagram: string;
  contactEmail: string;
  address: string;
  logoUrl: string | null;
  businessPhone: string;
  addressPublic: boolean;
  heroHeading: string;
  heroSubtext: string;
  heroImageUrl: string | null;
  aboutBio: string;
  aboutQualifications: string;
  aboutLocation: string;
  aboutYearsExperience: string;
  businessHours: string;
  depositPercentage: number;
  lateCancellationHours: number;
  lateCancellationFeePercentage: number;
  cancellationFeeMode: "FORFEIT_SATISFIES" | "ADDITIONAL_FEE" | "MANUAL_REVIEW";
  cancellationPolicyText: string;
  policyVersion: string;
  eftDetails: string;
  prepareForAppointmentText: string;
  faq: string;
  declineReasonTemplates: string;
  bookingEnabled: boolean;
  minNoticeHours: number;
  maxAdvanceDays: number;
  bufferMinutes: number;
  proposalExpiryHours: number;
  remindersEnabled: boolean;
  remind24hEnabled: boolean;
  remind2hEnabled: boolean;
  remind24hMessage: string;
  remind2hMessage: string;
  nailRepairsPolicyText: string;
  nailRepairsPolicyPublished: boolean;
  guestsChildrenPolicyText: string;
  guestsChildrenPolicyPublished: boolean;
  healthAllergyPolicyText: string;
  healthAllergyPolicyPublished: boolean;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs tracking-wide uppercase text-medium-grey mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-charcoal">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-black" />
      {label}
    </label>
  );
}

const inputClass = "w-full border border-marble rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-black";

function parseFaq(json: string): FaqItem[] {
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function faqToText(items: FaqItem[]) {
  return items.map((i) => `${i.question} | ${i.answer}`).join("\n");
}

function textToFaq(text: string): FaqItem[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...rest] = line.split("|");
      return { question: question.trim(), answer: rest.join("|").trim() };
    });
}

export function SettingsForm({ initial }: { initial: Settings }) {
  const [values, setValues] = useState<Settings>(initial);
  const [hours, setHours] = useState<BusinessHours>(parseBusinessHours(initial.businessHours));
  const [faqText, setFaqText] = useState(() => faqToText(parseFaq(initial.faq)));
  const [declineTemplatesText, setDeclineTemplatesText] = useState(() => {
    try {
      const arr = JSON.parse(initial.declineReasonTemplates || "[]");
      return Array.isArray(arr) ? arr.join("\n") : "";
    } catch {
      return "";
    }
  });
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"logo" | "hero" | null>(null);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleUpload(file: File, field: "logoUrl" | "heroImageUrl", kind: "logo" | "hero") {
    setUploading(kind);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      set(field, data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(null);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          businessHours: JSON.stringify(hours),
          faq: JSON.stringify(textToFaq(faqText)),
          declineReasonTemplates: JSON.stringify(
            declineTemplatesText
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
          ),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save settings.");
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-3xl">
      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">Business Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name">
            <input className={inputClass} value={values.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </Field>
          <Field label="Established">
            <input className={inputClass} value={values.established} onChange={(e) => set("established", e.target.value)} />
          </Field>
          <Field label="WhatsApp Number">
            <input className={inputClass} value={values.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Business Phone (optional)">
            <input className={inputClass} value={values.businessPhone} onChange={(e) => set("businessPhone", e.target.value)} />
          </Field>
          <Field label="Instagram Handle">
            <input className={inputClass} value={values.instagram} onChange={(e) => set("instagram", e.target.value)} />
          </Field>
          <Field label="Contact Email">
            <input className={inputClass} value={values.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </Field>
          <Field label="Address">
            <input className={inputClass} value={values.address} onChange={(e) => set("address", e.target.value)} />
          </Field>
          <Field label="Address Visibility">
            <div className="pt-2">
              <Toggle
                label="Show address publicly (off = only shared once a booking is confirmed)"
                checked={values.addressPublic}
                onChange={(v) => set("addressPublic", v)}
              />
            </div>
          </Field>
          <Field label="Logo">
            <div className="flex items-center gap-3">
              {values.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.logoUrl} alt="" className="h-10" />
              )}
              <label className="text-xs underline text-medium-grey cursor-pointer">
                {uploading === "logo" ? "Uploading…" : "Upload logo"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "logoUrl", "logo")} />
              </label>
              {values.logoUrl && (
                <button type="button" onClick={() => set("logoUrl", null)} className="text-xs underline text-medium-grey">
                  Use text logo
                </button>
              )}
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">Hero Section</h2>
        <div className="flex flex-col gap-4">
          <Field label="Heading">
            <input className={inputClass} value={values.heroHeading} onChange={(e) => set("heroHeading", e.target.value)} />
          </Field>
          <Field label="Supporting Text">
            <textarea className={inputClass} rows={3} value={values.heroSubtext} onChange={(e) => set("heroSubtext", e.target.value)} />
          </Field>
          <Field label="Hero Image">
            <div className="flex items-center gap-3">
              {values.heroImageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.heroImageUrl} alt="" className="h-14 rounded border border-marble" />
              )}
              <label className="text-xs underline text-medium-grey cursor-pointer">
                {uploading === "hero" ? "Uploading…" : "Upload image"}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "heroImageUrl", "hero")} />
              </label>
              {values.heroImageUrl && (
                <button type="button" onClick={() => set("heroImageUrl", null)} className="text-xs underline text-medium-grey">
                  Remove
                </button>
              )}
            </div>
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">About Content</h2>
        <div className="flex flex-col gap-4">
          <Field label="Biography">
            <textarea className={inputClass} rows={4} value={values.aboutBio} onChange={(e) => set("aboutBio", e.target.value)} />
          </Field>
          <Field label="Qualifications">
            <textarea className={inputClass} rows={2} value={values.aboutQualifications} onChange={(e) => set("aboutQualifications", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Years of Experience">
              <input className={inputClass} value={values.aboutYearsExperience} onChange={(e) => set("aboutYearsExperience", e.target.value)} />
            </Field>
            <Field label="Location">
              <input className={inputClass} value={values.aboutLocation} onChange={(e) => set("aboutLocation", e.target.value)} />
            </Field>
          </div>
          <Field label="Prepare for Your Appointment">
            <textarea
              className={inputClass}
              rows={6}
              value={values.prepareForAppointmentText}
              onChange={(e) => set("prepareForAppointmentText", e.target.value)}
            />
          </Field>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">Business Hours</h2>
        <div className="flex flex-col gap-2">
          {(Object.keys(DAY_LABELS) as (keyof BusinessHours)[]).map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 text-sm text-charcoal">{DAY_LABELS[day]}</span>
              <label className="flex items-center gap-1.5 text-xs text-medium-grey">
                <input
                  type="checkbox"
                  checked={!hours[day].closed}
                  onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], closed: !e.target.checked } }))}
                  className="accent-black"
                />
                Open
              </label>
              <input
                type="time"
                disabled={hours[day].closed}
                value={hours[day].open}
                onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], open: e.target.value } }))}
                className="border border-marble rounded-sm px-2 py-1 text-xs disabled:bg-bg"
              />
              <span className="text-xs text-medium-grey">to</span>
              <input
                type="time"
                disabled={hours[day].closed}
                value={hours[day].close}
                onChange={(e) => setHours((h) => ({ ...h, [day]: { ...h[day], close: e.target.value } }))}
                className="border border-marble rounded-sm px-2 py-1 text-xs disabled:bg-bg"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-1">Online Booking &amp; Availability</h2>
        <p className="text-xs text-medium-grey mb-4">
          Online booking stays off until you turn it on here — review your business hours above first.
        </p>
        <div className="mb-4">
          <Toggle label="Online booking is open to clients" checked={values.bookingEnabled} onChange={(v) => set("bookingEnabled", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Minimum Notice (hours)">
            <input type="number" min={0} className={inputClass} value={values.minNoticeHours} onChange={(e) => set("minNoticeHours", Number(e.target.value))} />
          </Field>
          <Field label="Maximum Advance Booking (days)">
            <input type="number" min={1} className={inputClass} value={values.maxAdvanceDays} onChange={(e) => set("maxAdvanceDays", Number(e.target.value))} />
          </Field>
          <Field label="Buffer Between Appointments (minutes)">
            <input type="number" min={0} className={inputClass} value={values.bufferMinutes} onChange={(e) => set("bufferMinutes", Number(e.target.value))} />
          </Field>
          <Field label="Proposed-Time Offer Expiry (hours)">
            <input type="number" min={1} className={inputClass} value={values.proposalExpiryHours} onChange={(e) => set("proposalExpiryHours", Number(e.target.value))} />
          </Field>
        </div>

        <div className="mt-6 pt-6 border-t border-marble">
          <h3 className="text-sm font-medium text-black mb-3">Blocked Dates (holidays &amp; closures)</h3>
          <BlockedDatesManager />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">Appointment Reminders</h2>
        <div className="flex flex-col gap-3 mb-4">
          <Toggle label="Reminders enabled" checked={values.remindersEnabled} onChange={(v) => set("remindersEnabled", v)} />
          <Toggle label="Send a reminder 24 hours before" checked={values.remind24hEnabled} onChange={(v) => set("remind24hEnabled", v)} />
          <Toggle label="Send a second reminder 2 hours before" checked={values.remind2hEnabled} onChange={(v) => set("remind2hEnabled", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="24-Hour Reminder Message">
            <textarea className={inputClass} rows={3} value={values.remind24hMessage} onChange={(e) => set("remind24hMessage", e.target.value)} />
          </Field>
          <Field label="2-Hour Reminder Message">
            <textarea className={inputClass} rows={3} value={values.remind2hMessage} onChange={(e) => set("remind2hMessage", e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-medium-grey mt-3 mb-4">
          Reminders are sent by a scheduled job hitting <code>/api/cron/reminders</code> — see the README for how to connect an external
          scheduler after deployment.
        </p>
        <div className="pt-4 border-t border-marble">
          <h3 className="text-sm font-medium text-black mb-3">Recent Reminder Log</h3>
          <RemindersLog />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">Deposit &amp; Cancellation Policy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Deposit Percentage">
            <input type="number" min={0} max={100} className={inputClass} value={values.depositPercentage} onChange={(e) => set("depositPercentage", Number(e.target.value))} />
          </Field>
          <Field label="Late Cancellation Window (hours)">
            <input type="number" min={0} className={inputClass} value={values.lateCancellationHours} onChange={(e) => set("lateCancellationHours", Number(e.target.value))} />
          </Field>
          <Field label="Late Cancellation Fee %">
            <input type="number" min={0} max={100} className={inputClass} value={values.lateCancellationFeePercentage} onChange={(e) => set("lateCancellationFeePercentage", Number(e.target.value))} />
          </Field>
          <Field label="How Late-Cancellation Fees Are Applied">
            <select className={inputClass} value={values.cancellationFeeMode} onChange={(e) => set("cancellationFeeMode", e.target.value as Settings["cancellationFeeMode"])}>
              <option value="FORFEIT_SATISFIES">Forfeited deposit satisfies the fee</option>
              <option value="ADDITIONAL_FEE">Additional fee applies on top of forfeited deposit</option>
              <option value="MANUAL_REVIEW">Always require manual review</option>
            </select>
          </Field>
          <Field label="Policy Version">
            <input className={inputClass} value={values.policyVersion} onChange={(e) => set("policyVersion", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Full Cancellation Policy Text">
            <textarea className={inputClass} rows={8} value={values.cancellationPolicyText} onChange={(e) => set("cancellationPolicyText", e.target.value)} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="EFT / Payment Details">
            <textarea className={inputClass} rows={4} value={values.eftDetails} onChange={(e) => set("eftDetails", e.target.value)} />
          </Field>
        </div>
        <p className="text-xs text-medium-grey mt-2">
          Changing the policy version does not affect bookings already made — each booking permanently records the version the client
          agreed to at the time.
        </p>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-1">Additional Policies</h2>
        <p className="text-xs text-medium-grey mb-4">
          Not yet confirmed for this business — each stays hidden from the public Policies page until you publish it.
        </p>
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black">Nail Repairs</span>
              <Toggle label="Published" checked={values.nailRepairsPolicyPublished} onChange={(v) => set("nailRepairsPolicyPublished", v)} />
            </div>
            <textarea className={inputClass} rows={3} value={values.nailRepairsPolicyText} onChange={(e) => set("nailRepairsPolicyText", e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black">Guests &amp; Children</span>
              <Toggle label="Published" checked={values.guestsChildrenPolicyPublished} onChange={(v) => set("guestsChildrenPolicyPublished", v)} />
            </div>
            <textarea className={inputClass} rows={3} value={values.guestsChildrenPolicyText} onChange={(e) => set("guestsChildrenPolicyText", e.target.value)} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-black">Health &amp; Allergy Disclosure</span>
              <Toggle label="Published" checked={values.healthAllergyPolicyPublished} onChange={(v) => set("healthAllergyPolicyPublished", v)} />
            </div>
            <textarea className={inputClass} rows={3} value={values.healthAllergyPolicyText} onChange={(e) => set("healthAllergyPolicyText", e.target.value)} />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">FAQ</h2>
        <p className="text-xs text-medium-grey mb-2">One per line, formatted as: Question | Answer</p>
        <textarea className={inputClass} rows={6} value={faqText} onChange={(e) => setFaqText(e.target.value)} />
      </Card>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold text-black mb-4">Reusable Decline Messages</h2>
        <p className="text-xs text-medium-grey mb-2">One reusable message per line — shown as quick options when declining a request.</p>
        <textarea className={inputClass} rows={4} value={declineTemplatesText} onChange={(e) => setDeclineTemplatesText(e.target.value)} />
      </Card>

      {error && <p className="text-error text-sm bg-error/10 border border-error/30 rounded-sm px-3 py-2">{error}</p>}

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </Button>
        {savedAt && <span className="text-xs text-success">Saved.</span>}
      </div>
    </div>
  );
}
