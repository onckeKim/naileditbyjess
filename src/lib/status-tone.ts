import type { BookingStatus, DepositStatus, CancellationFeeStatus } from "./types";

export function bookingStatusTone(status: BookingStatus): "neutral" | "success" | "warning" | "error" | "black" {
  switch (status) {
    case "CONFIRMED":
    case "COMPLETED":
      return "success";
    case "PENDING":
    case "PROPOSED_NEW_TIME":
    case "ACCEPTED_AWAITING_DEPOSIT":
    case "DEPOSIT_SUBMITTED":
      return "warning";
    case "DECLINED":
    case "CANCELLED":
    case "NO_SHOW":
      return "error";
    default:
      return "neutral";
  }
}

export function depositStatusTone(status: DepositStatus): "neutral" | "success" | "warning" | "error" | "black" {
  switch (status) {
    case "DEPOSIT_PAID":
      return "success";
    case "AWAITING_DEPOSIT":
    case "DEPOSIT_SUBMITTED":
      return "warning";
    case "DEPOSIT_FAILED":
    case "DEPOSIT_FORFEITED":
      return "error";
    case "DEPOSIT_REFUNDED":
      return "neutral";
    default:
      return "neutral";
  }
}

export function cancellationFeeStatusTone(status: CancellationFeeStatus): "neutral" | "success" | "warning" | "error" | "black" {
  switch (status) {
    case "FEE_PAID":
    case "SATISFIED_BY_DEPOSIT":
      return "success";
    case "ADDITIONAL_FEE_DUE":
    case "MANUAL_REVIEW":
      return "warning";
    default:
      return "neutral";
  }
}
