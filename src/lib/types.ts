export type ServiceCategory = "PRIMARY" | "ART_ADDON" | "REMOVAL";

export type PricingType =
  | "FIXED"
  | "PER_NAIL"
  | "PER_NAIL_OR_FULL_SET"
  | "PER_NAIL_RANGE"
  | "FULL_SET_ONLY"
  | "RANGE";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED_AWAITING_DEPOSIT"
  | "DEPOSIT_SUBMITTED"
  | "CONFIRMED"
  | "PROPOSED_NEW_TIME"
  | "PROPOSAL_DECLINED"
  | "DECLINED"
  | "CANCELLED"
  | "NO_SHOW"
  | "COMPLETED";

export type DepositStatus =
  | "NOT_REQUIRED"
  | "AWAITING_DEPOSIT"
  | "DEPOSIT_SUBMITTED"
  | "DEPOSIT_PAID"
  | "DEPOSIT_FAILED"
  | "DEPOSIT_REFUNDED"
  | "DEPOSIT_FORFEITED";

export type CancellationFeeStatus =
  | "NONE"
  | "SATISFIED_BY_DEPOSIT"
  | "ADDITIONAL_FEE_DUE"
  | "FEE_PAID"
  | "MANUAL_REVIEW";

export type CancellationFeeMode =
  | "FORFEIT_SATISFIES"
  | "ADDITIONAL_FEE"
  | "MANUAL_REVIEW";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending Request",
  ACCEPTED_AWAITING_DEPOSIT: "Accepted, Awaiting Deposit",
  DEPOSIT_SUBMITTED: "Deposit Submitted",
  CONFIRMED: "Confirmed",
  PROPOSED_NEW_TIME: "Alternative Proposed",
  PROPOSAL_DECLINED: "Alternative Declined",
  DECLINED: "Declined",
  CANCELLED: "Cancelled",
  NO_SHOW: "No Show",
  COMPLETED: "Completed",
};

export const DEPOSIT_STATUS_LABELS: Record<DepositStatus, string> = {
  NOT_REQUIRED: "Not Required",
  AWAITING_DEPOSIT: "Awaiting Deposit",
  DEPOSIT_SUBMITTED: "Deposit Submitted",
  DEPOSIT_PAID: "Deposit Paid",
  DEPOSIT_FAILED: "Deposit Failed",
  DEPOSIT_REFUNDED: "Deposit Refunded",
  DEPOSIT_FORFEITED: "Deposit Forfeited",
};

export const CANCELLATION_FEE_STATUS_LABELS: Record<CancellationFeeStatus, string> = {
  NONE: "None",
  SATISFIED_BY_DEPOSIT: "Satisfied by Forfeited Deposit",
  ADDITIONAL_FEE_DUE: "Additional Fee Due",
  FEE_PAID: "Fee Paid",
  MANUAL_REVIEW: "Manual Review",
};
