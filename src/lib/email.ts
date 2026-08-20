import "server-only";
import { Resend } from "resend";
import { prisma } from "./prisma";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bookingId?: string;
  /** Short machine-readable tag identifying which template was used (see EmailLog.type). */
  type?: string;
};

const FROM_ADDRESS = process.env.EMAIL_FROM || "Nailed It Jess <bookings@naileditbyjess.example>";

let resendClient: Resend | null = null;
function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

/**
 * Email delivery is abstracted behind this single function so callers never
 * touch a provider SDK directly. Every send is recorded in EmailLog
 * regardless of outcome, which doubles as the email log the admin can
 * review.
 *
 * Without RESEND_API_KEY configured, this only logs — nothing is actually
 * sent. Once the env var is set, real email goes out via Resend and the
 * provider's message id / failure reason are recorded too.
 */
export async function sendEmail(payload: EmailPayload) {
  const resend = getResendClient();

  if (!resend) {
    console.log(`[email:logged-only] to=${payload.to} subject="${payload.subject}"`);
    await prisma.emailLog.create({
      data: {
        to: payload.to,
        subject: payload.subject,
        body: payload.html,
        bookingId: payload.bookingId,
        type: payload.type || "GENERAL",
        status: "LOGGED_ONLY",
      },
    });
    return { ok: true, sent: false };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_ADDRESS,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (result.error) {
      await prisma.emailLog.create({
        data: {
          to: payload.to,
          subject: payload.subject,
          body: payload.html,
          bookingId: payload.bookingId,
          type: payload.type || "GENERAL",
          status: "FAILED",
          failureReason: result.error.message,
        },
      });
      console.error(`[email:failed] to=${payload.to} subject="${payload.subject}" error=${result.error.message}`);
      return { ok: false, sent: false };
    }

    await prisma.emailLog.create({
      data: {
        to: payload.to,
        subject: payload.subject,
        body: payload.html,
        bookingId: payload.bookingId,
        type: payload.type || "GENERAL",
        status: "SENT",
        providerMessageId: result.data?.id,
      },
    });
    return { ok: true, sent: true };
  } catch (err) {
    const failureReason = err instanceof Error ? err.message : "Unknown error";
    await prisma.emailLog.create({
      data: {
        to: payload.to,
        subject: payload.subject,
        body: payload.html,
        bookingId: payload.bookingId,
        type: payload.type || "GENERAL",
        status: "FAILED",
        failureReason,
      },
    });
    console.error(`[email:failed] to=${payload.to} subject="${payload.subject}" error=${failureReason}`);
    return { ok: false, sent: false };
  }
}

/** Resends a previously logged failed email by id, incrementing its retry count on the new log entry. */
export async function resendFailedEmail(emailLogId: string) {
  const original = await prisma.emailLog.findUnique({ where: { id: emailLogId } });
  if (!original) throw new Error("Email log entry not found.");

  const result = await sendEmail({
    to: original.to,
    subject: original.subject,
    html: original.body,
    bookingId: original.bookingId ?? undefined,
    type: original.type,
  });

  const latest = await prisma.emailLog.findFirst({
    where: { to: original.to, subject: original.subject, bookingId: original.bookingId },
    orderBy: { createdAt: "desc" },
  });
  if (latest) {
    await prisma.emailLog.update({ where: { id: latest.id }, data: { retryCount: original.retryCount + 1 } });
  }

  return result;
}
