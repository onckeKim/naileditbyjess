const HEADER = (business: string) => `
  <div style="background:linear-gradient(120deg,#111111 0%,#2b2b2b 45%,#888886 75%,#c8c8c5 100%);padding:28px 32px;border-radius:12px 12px 0 0;">
    <p style="margin:0;color:#f7f7f5;letter-spacing:0.18em;font-size:11px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Nailed It Jess</p>
    <p style="margin:4px 0 0;color:#ffffff;font-size:24px;font-family:Georgia,'Times New Roman',serif;">${business}</p>
  </div>
`;

const WRAP = (business: string, bodyHtml: string) => `
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

export function requestReceivedEmail(opts: { businessName: string; reference: string; serviceName: string; date: string; time: string }) {
  const html = WRAP(
    opts.businessName,
    `
    <p>Hi there,</p>
    <p>Your appointment request has been sent to ${opts.businessName}.</p>
    <p><strong>Your booking is only confirmed once the request has been accepted and you have received a confirmation email.</strong></p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">
      <strong>Reference:</strong> ${opts.reference}<br/>
      <strong>Service:</strong> ${opts.serviceName}<br/>
      <strong>Requested:</strong> ${opts.date} at ${opts.time}
    </p>
    <p>We'll be in touch shortly.</p>
    `
  );
  return { subject: `Booking request received — ${opts.reference}`, html };
}

export function acceptedAwaitingDepositEmail(opts: {
  businessName: string;
  reference: string;
  serviceName: string;
  date: string;
  time: string;
  depositAmount: string;
  remainingBalance: string;
  totalAmount: string;
  eftDetails: string;
}) {
  const html = WRAP(
    opts.businessName,
    `
    <p>Great news — your appointment request has been <strong>accepted</strong>.</p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">
      <strong>Reference:</strong> ${opts.reference}<br/>
      <strong>Service:</strong> ${opts.serviceName}<br/>
      <strong>Date &amp; time:</strong> ${opts.date} at ${opts.time}<br/>
      <strong>Estimated total:</strong> ${opts.totalAmount}<br/>
      <strong>Required 50% deposit:</strong> ${opts.depositAmount}<br/>
      <strong>Estimated remaining balance:</strong> ${opts.remainingBalance}
    </p>
    <p>To secure your appointment, please pay the deposit by EFT using the details below and keep your proof of payment on hand.</p>
    <pre style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;white-space:pre-wrap;font-family:inherit;font-size:14px;">${opts.eftDetails}</pre>
    <p>Your appointment is not fully secured until the deposit has been recorded. Cancellations within 24 hours of your appointment will result in forfeiture of the deposit — please review our booking policies on the website.</p>
    `
  );
  return { subject: `Appointment accepted — deposit required (${opts.reference})`, html };
}

export function confirmedEmail(opts: { businessName: string; reference: string; serviceName: string; date: string; time: string }) {
  const html = WRAP(
    opts.businessName,
    `
    <p>Your appointment is now <strong>confirmed</strong>. We can't wait to see you!</p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">
      <strong>Reference:</strong> ${opts.reference}<br/>
      <strong>Service:</strong> ${opts.serviceName}<br/>
      <strong>Date &amp; time:</strong> ${opts.date} at ${opts.time}
    </p>
    <p>Please arrive on time. If you need to cancel or reschedule, please give at least 24 hours notice in line with our booking policies.</p>
    `
  );
  return { subject: `Appointment confirmed — ${opts.reference}`, html };
}

export function proposedNewTimeEmail(opts: { businessName: string; reference: string; serviceName: string; proposedDate: string; proposedTime: string }) {
  const html = WRAP(
    opts.businessName,
    `
    <p>Thank you for your booking request. Unfortunately your requested time isn't available, but we'd love to offer you an alternative.</p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">
      <strong>Reference:</strong> ${opts.reference}<br/>
      <strong>Service:</strong> ${opts.serviceName}<br/>
      <strong>Proposed date &amp; time:</strong> ${opts.proposedDate} at ${opts.proposedTime}
    </p>
    <p>Please contact us via WhatsApp to confirm this new time, or to discuss other options.</p>
    `
  );
  return { subject: `New time proposed — ${opts.reference}`, html };
}

export function declinedEmail(opts: { businessName: string; reference: string; serviceName: string; reason?: string }) {
  const html = WRAP(
    opts.businessName,
    `
    <p>Thank you for your interest in booking with ${opts.businessName}.</p>
    <p>Unfortunately we're unable to accept the following request:</p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">
      <strong>Reference:</strong> ${opts.reference}<br/>
      <strong>Service:</strong> ${opts.serviceName}
      ${opts.reason ? `<br/><strong>Note:</strong> ${opts.reason}` : ""}
    </p>
    <p>Please feel free to submit a new request for a different date or time.</p>
    `
  );
  return { subject: `Booking request declined — ${opts.reference}`, html };
}

export function cancellationEmail(opts: { businessName: string; reference: string; feeMessage: string }) {
  const html = WRAP(
    opts.businessName,
    `
    <p>Your appointment (${opts.reference}) has been cancelled.</p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">${opts.feeMessage}</p>
    <p>If you have any questions, please contact us via WhatsApp.</p>
    `
  );
  return { subject: `Booking cancelled — ${opts.reference}`, html };
}

export function noShowEmail(opts: { businessName: string; reference: string; feeMessage: string; restricted: boolean }) {
  const html = WRAP(
    opts.businessName,
    `
    <p>You were marked as a no-show for your appointment (${opts.reference}).</p>
    <p style="background:#F7F7F5;border:1px solid #E7E7E5;border-radius:8px;padding:16px;margin:20px 0;">${opts.feeMessage}</p>
    ${opts.restricted ? `<p>Please contact us directly via WhatsApp before booking another appointment.</p>` : ""}
    `
  );
  return { subject: `Missed appointment — ${opts.reference}`, html };
}
