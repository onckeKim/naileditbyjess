// Shared visual building blocks. Every transactional email uses these so the
// whole set reads as one system: white background, a subtle marble-inspired
// header, a black wordmark, large serif headings, black CTA buttons, soft
// grey borders — matching the public site's brand.

const HEADER = (business: string) => `
  <div style="background:linear-gradient(120deg,#111111 0%,#2b2b2b 45%,#888886 75%,#c8c8c5 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <p style="margin:0;color:#f7f7f5;letter-spacing:0.18em;font-size:11px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Nailed It Jess</p>
    <p style="margin:4px 0 0;color:#ffffff;font-size:24px;font-family:Georgia,'Times New Roman',serif;">${business}</p>
  </div>
`;

function shell(business: string, bodyHtml: string) {
  return `
<div style="font-family:Arial,Helvetica,sans-serif;background:#F7F7F5;padding:32px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #E7E7E5;border-radius:12px;overflow:hidden;">
    ${HEADER(business)}
    <div style="padding:32px;color:#2B2B2B;line-height:1.6;font-size:15px;">
      ${bodyHtml}
    </div>
    <div style="padding:20px 32px;border-top:1px solid #E7E7E5;color:#888886;font-size:12px;">
      Nailed It Jess · Est. 2021 · WhatsApp available on request
    </div>
  </div>
</div>`;
}

function ctaButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;margin:6px 8px 6px 0;">${label}</a>`;
}

function secondaryButton(label: string, href: string) {
  return `<a href="${href}" style="display:inline-block;background:#ffffff;color:#111111;text-decoration:none;padding:12px 24px;border-radius:4px;font-size:14px;font-weight:600;border:1px solid #111111;margin:6px 8px 6px 0;">${label}</a>`;
}

function infoBox(rows: [string, string][]) {
  const lines = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([label, value]) => `<strong>${label}:</strong> ${value}`)
    .join("<br/>");
  return `<p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">${lines}</p>`;
}

// ---------------------------------------------------------------------------
// Shared context for the "full booking summary" the spec requires on
// confirmation-type emails: client, reference, service, add-ons, date, time,
// duration, prices, deposit, balance, address (where appropriate), contact,
// prep instructions, cancellation/late-arrival policy, calendar + manage
// links.
export type BookingSummaryContext = {
  clientName: string;
  reference: string;
  serviceName: string;
  addOnLines?: string[];
  date: string;
  time: string;
  durationMinutes: number;
  serviceSubtotal: string;
  addOnsTotal?: string;
  estimatedTotal: string;
  depositAmount: string;
  depositStatusLabel: string;
  remainingBalance: string;
  address?: string;
  whatsapp: string;
  instagram: string;
  prepareText?: string;
  cancellationSummary?: string;
  calendarUrl?: string;
  manageUrl?: string;
};

function summaryBlock(ctx: BookingSummaryContext) {
  const addOnsHtml = ctx.addOnLines?.length
    ? `<p style="margin:8px 0 0;color:#888886;font-size:13px;">Add-ons: ${ctx.addOnLines.join(", ")}</p>`
    : "";

  return `
    ${infoBox([
      ["Client", ctx.clientName],
      ["Reference", ctx.reference],
      ["Service", ctx.serviceName],
      ["Date & time", `${ctx.date} at ${ctx.time}`],
      ["Estimated duration", `${ctx.durationMinutes} min`],
      ["Service price", ctx.serviceSubtotal],
      ["Add-ons total", ctx.addOnsTotal ?? ""],
      ["Estimated total", ctx.estimatedTotal],
      ["Required deposit", ctx.depositAmount],
      ["Deposit status", ctx.depositStatusLabel],
      ["Estimated remaining balance", ctx.remainingBalance],
      ["Studio address", ctx.address ?? ""],
    ])}
    ${addOnsHtml}
    <p style="margin:16px 0 4px;font-size:13px;color:#888886;">Contact: WhatsApp ${ctx.whatsapp} · Instagram ${ctx.instagram}</p>
    ${
      ctx.prepareText
        ? `<p style="margin:16px 0 4px;"><strong>Preparing for your appointment:</strong></p><p style="white-space:pre-line;font-size:13px;color:#2B2B2B;">${ctx.prepareText}</p>`
        : ""
    }
    ${
      ctx.cancellationSummary
        ? `<p style="margin:16px 0 4px;font-size:13px;color:#888886;"><strong>Cancellation &amp; late-arrival policy:</strong> ${ctx.cancellationSummary}</p>`
        : ""
    }
    <div style="margin-top:20px;">
      ${ctx.calendarUrl ? secondaryButton("Add to Calendar", ctx.calendarUrl) : ""}
      ${ctx.manageUrl ? secondaryButton("Manage My Booking", ctx.manageUrl) : ""}
    </div>
  `;
}

// ---------------------------------------------------------------------------
export function requestReceivedEmail(opts: {
  businessName: string;
  reference: string;
  serviceName: string;
  date: string;
  time: string;
  manageUrl?: string;
}) {
  const html = shell(
    opts.businessName,
    `
    <p>Hi there,</p>
    <p>Your appointment request has been sent to ${opts.businessName}.</p>
    <p><strong>Your booking is only confirmed once the request has been accepted and you have received a confirmation email.</strong></p>
    ${infoBox([
      ["Reference", opts.reference],
      ["Service", opts.serviceName],
      ["Requested", `${opts.date} at ${opts.time}`],
    ])}
    <p>We'll be in touch shortly.</p>
    ${opts.manageUrl ? `<div style="margin-top:16px;">${secondaryButton("View My Request", opts.manageUrl)}</div>` : ""}
    `
  );
  return { subject: `Booking request received — ${opts.reference}`, html, type: "REQUEST_RECEIVED" };
}

export function notifyArtistNewRequestEmail(opts: {
  businessName: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  serviceName: string;
  date: string;
  time: string;
  adminUrl?: string;
}) {
  const html = shell(
    opts.businessName,
    `
    <p>New booking request received.</p>
    ${infoBox([
      ["Reference", opts.reference],
      ["Client", `${opts.clientName} (${opts.clientPhone})`],
      ["Service", opts.serviceName],
      ["Requested", `${opts.date} at ${opts.time}`],
    ])}
    ${opts.adminUrl ? ctaButton("Review in Dashboard", opts.adminUrl) : ""}
    `
  );
  return { subject: `New booking request — ${opts.reference}`, html, type: "ARTIST_NEW_REQUEST" };
}

export function acceptedAwaitingDepositEmail(opts: { businessName: string; eftDetails: string } & BookingSummaryContext) {
  const html = shell(
    opts.businessName,
    `
    <p>Great news — your appointment request has been <strong>accepted</strong>.</p>
    ${summaryBlock(opts)}
    <p>To secure your appointment, please pay the deposit by EFT using the details below and keep your proof of payment on hand.</p>
    <pre style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;white-space:pre-wrap;font-family:inherit;font-size:14px;">${opts.eftDetails}</pre>
    <p>Your appointment is not fully secured until the deposit has been recorded. Cancellations within the late-cancellation window will result in forfeiture of the deposit — please review our booking policies on the website.</p>
    `
  );
  return { subject: `Appointment accepted — deposit required (${opts.reference})`, html, type: "ACCEPTED_DEPOSIT_REQUIRED" };
}

export function depositRecordedEmail(opts: BookingSummaryContext) {
  const html = shell(
    "Nailed It Jess",
    `
    <p>Thanks — we've recorded your deposit submission and it's being verified.</p>
    ${summaryBlock(opts)}
    <p>You'll receive a further email once your appointment is fully confirmed.</p>
    `
  );
  return { subject: `Deposit recorded — ${opts.reference}`, html, type: "DEPOSIT_RECORDED" };
}

export function confirmedEmail(opts: BookingSummaryContext) {
  const html = shell(
    "Nailed It Jess",
    `
    <p>Your appointment is now <strong>confirmed</strong>. We can't wait to see you!</p>
    ${summaryBlock(opts)}
    <p>Please arrive on time. If you need to cancel or reschedule, please review our booking policies for the applicable notice period.</p>
    `
  );
  return { subject: `Appointment confirmed — ${opts.reference}`, html, type: "CONFIRMED" };
}

export function rescheduledEmail(opts: BookingSummaryContext) {
  const html = shell(
    "Nailed It Jess",
    `
    <p>Your appointment has been <strong>rescheduled</strong>. Here are your updated details:</p>
    ${summaryBlock(opts)}
    `
  );
  return { subject: `Appointment rescheduled — ${opts.reference}`, html, type: "RESCHEDULED" };
}

export function proposedNewTimeEmail(opts: {
  businessName: string;
  reference: string;
  serviceName: string;
  requestedDate: string;
  requestedTime: string;
  proposedDate: string;
  proposedTime: string;
  message?: string;
  expiresAt?: string;
  acceptUrl: string;
  declineUrl: string;
}) {
  const html = shell(
    opts.businessName,
    `
    <p>Thank you for your booking request. Your requested time isn't available, but we'd love to offer you an alternative.</p>
    ${infoBox([
      ["Reference", opts.reference],
      ["Service", opts.serviceName],
      ["Originally requested", `${opts.requestedDate} at ${opts.requestedTime}`],
      ["Proposed date & time", `${opts.proposedDate} at ${opts.proposedTime}`],
    ])}
    ${opts.message ? `<p style="font-style:italic;color:#2B2B2B;">"${opts.message}"</p>` : ""}
    <div style="margin:20px 0;">
      ${ctaButton("Accept New Time", opts.acceptUrl)}
      ${secondaryButton("Decline New Time", opts.declineUrl)}
    </div>
    ${opts.expiresAt ? `<p style="font-size:12px;color:#888886;">This offer is held until ${opts.expiresAt}. After that, please contact us to check availability.</p>` : ""}
    `
  );
  return { subject: `New time proposed — ${opts.reference}`, html, type: "PROPOSAL_SENT" };
}

export function proposalAcceptedEmail(opts: BookingSummaryContext) {
  const html = shell(
    "Nailed It Jess",
    `
    <p>Thank you — you've accepted the proposed appointment time.</p>
    ${summaryBlock(opts)}
    `
  );
  return { subject: `New time confirmed — ${opts.reference}`, html, type: "PROPOSAL_ACCEPTED" };
}

export function proposalDeclinedEmail(opts: { businessName: string; reference: string; serviceName: string }) {
  const html = shell(
    opts.businessName,
    `
    <p>Thanks for letting us know the proposed time doesn't work.</p>
    ${infoBox([
      ["Reference", opts.reference],
      ["Service", opts.serviceName],
    ])}
    <p>Nailed It Jess will be in touch to find another time, or you're welcome to submit a new request.</p>
    `
  );
  return { subject: `Proposed time declined — ${opts.reference}`, html, type: "PROPOSAL_DECLINED" };
}

export function notifyArtistProposalRespondedEmail(opts: {
  businessName: string;
  reference: string;
  clientName: string;
  accepted: boolean;
  adminUrl?: string;
}) {
  const html = shell(
    opts.businessName,
    `
    <p>${opts.clientName} has <strong>${opts.accepted ? "accepted" : "declined"}</strong> the proposed appointment time for booking ${opts.reference}.</p>
    ${opts.adminUrl ? ctaButton("Open in Dashboard", opts.adminUrl) : ""}
    `
  );
  return {
    subject: `Client ${opts.accepted ? "accepted" : "declined"} proposed time — ${opts.reference}`,
    html,
    type: "ARTIST_PROPOSAL_RESPONSE",
  };
}

export function declinedEmail(opts: { businessName: string; reference: string; serviceName: string; reason?: string }) {
  const html = shell(
    opts.businessName,
    `
    <p>Thank you for your interest in booking with ${opts.businessName}.</p>
    <p>Unfortunately we're unable to accept the following request:</p>
    ${infoBox([
      ["Reference", opts.reference],
      ["Service", opts.serviceName],
      ["Note", opts.reason ?? ""],
    ])}
    <p>Please feel free to submit a new request for a different date or time.</p>
    `
  );
  return { subject: `Booking request declined — ${opts.reference}`, html, type: "DECLINED" };
}

export function cancellationEmail(opts: { businessName: string; reference: string; feeMessage: string }) {
  const html = shell(
    opts.businessName,
    `
    <p>Your appointment (${opts.reference}) has been cancelled.</p>
    ${infoBox([["Details", opts.feeMessage]])}
    <p>If you have any questions, please contact us via WhatsApp.</p>
    `
  );
  return { subject: `Booking cancelled — ${opts.reference}`, html, type: "CANCELLED" };
}

export function noShowEmail(opts: { businessName: string; reference: string; feeMessage: string; restricted: boolean }) {
  const html = shell(
    opts.businessName,
    `
    <p>You were marked as a no-show for your appointment (${opts.reference}).</p>
    ${infoBox([["Details", opts.feeMessage]])}
    ${opts.restricted ? `<p>Please contact us directly via WhatsApp before booking another appointment.</p>` : ""}
    `
  );
  return { subject: `Missed appointment — ${opts.reference}`, html, type: "NO_SHOW" };
}

export function reminderEmail(opts: {
  businessName: string;
  reference: string;
  serviceName: string;
  date: string;
  time: string;
  message: string;
  address?: string;
  whatsapp: string;
  calendarUrl?: string;
  manageUrl?: string;
}) {
  const html = shell(
    opts.businessName,
    `
    <p>${opts.message}</p>
    ${infoBox([
      ["Reference", opts.reference],
      ["Service", opts.serviceName],
      ["Date & time", `${opts.date} at ${opts.time}`],
      ["Studio address", opts.address ?? ""],
    ])}
    <p style="font-size:13px;color:#888886;">Need to reach us? WhatsApp ${opts.whatsapp}.</p>
    <div style="margin-top:16px;">
      ${opts.calendarUrl ? secondaryButton("Add to Calendar", opts.calendarUrl) : ""}
      ${opts.manageUrl ? secondaryButton("Manage My Booking", opts.manageUrl) : ""}
    </div>
    `
  );
  return { subject: `Reminder: your appointment — ${opts.reference}`, html, type: "REMINDER" };
}

/**
 * Sent once a booking is marked Completed. Combines the "appointment
 * completed", "thank-you", and "review request" emails from the spec into a
 * single message — since they fire at the same moment for the same booking,
 * sending three separate emails back-to-back would be poor UX. The review
 * CTA opens WhatsApp with a pre-filled message rather than a public
 * submission form, since reviews are added to the site by the administrator
 * after approval, not submitted directly by clients.
 */
export function completedEmail(opts: { businessName: string; reference: string; clientName: string; reviewWhatsAppUrl: string }) {
  const html = shell(
    opts.businessName,
    `
    <p>Thank you, ${opts.clientName}! We hope you're loving your new set.</p>
    <p>It was a pleasure having you in — your support means a lot to a small, growing studio.</p>
    ${infoBox([["Reference", opts.reference]])}
    <p>If you have a moment, we'd love to hear what you thought:</p>
    <div style="margin-top:12px;">${ctaButton("Share a Review on WhatsApp", opts.reviewWhatsAppUrl)}</div>
    `
  );
  return { subject: `Thank you for visiting Nailed It Jess — ${opts.reference}`, html, type: "COMPLETED_THANK_YOU" };
}
