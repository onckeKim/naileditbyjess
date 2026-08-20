import "server-only";
import { prisma } from "./prisma";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  bookingId?: string;
};

/**
 * Email delivery is abstracted behind this single function so a real provider
 * (Resend, SendGrid, SMTP via nodemailer, etc.) can be plugged in later
 * without touching any of the booking workflow code that calls it.
 * For now it logs the email and stores it in EmailLog so the admin can
 * review exactly what would have been sent.
 */
export async function sendEmail(payload: EmailPayload) {
  console.log(`[email] to=${payload.to} subject="${payload.subject}"`);

  await prisma.emailLog.create({
    data: {
      to: payload.to,
      subject: payload.subject,
      body: payload.html,
      bookingId: payload.bookingId,
      status: "SENT",
    },
  });

  return { ok: true };
}
