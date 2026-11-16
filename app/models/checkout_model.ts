import type { ApiCartGroup, ApiEtaRange } from "~/models/cart_model";

/** Checkout endpoints. Money is kobo; the frontend never computes plan figures. */

export interface ApiReason {
  code: string;
  message: string;
}

export interface ApiInstalment {
  seq: number;
  /** YYYY-MM-DD, only once the loan is booked. */
  dueDate?: string;
  /** "30 days after first delivery" before booking, "Due 7 Dec 2026" after. */
  dueLabel: string;
  amountKobo: number;
  status?: string;
}

export interface ApiPlan {
  planCode: string;
  label: string;
  tenorDays: number;
  /** Absent when the tenor isn't whole months (e.g. 14 days). */
  tenorMonths?: number;
  downPaymentKobo: number;
  /** The largest instalment in the plan. */
  instalmentKobo: number;
  instalmentCount: number;
  instalments: ApiInstalment[];
  totalRepayableKobo: number;
  totalCostOfCreditKobo: number;
}

export interface ApiAddress {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  phone: string;
  serviceable: boolean;
}

export interface ApiAddressCheck {
  serviceable: boolean;
  message?: string;
}

/** POST /addresses/validate saves the address and returns it with its check. */
export interface ApiValidatedAddress extends ApiAddress {
  check: ApiAddressCheck;
}

export type AddressInput = Pick<ApiAddress, "label" | "line1" | "line2" | "city" | "state" | "phone">;

export interface QuoteBody {
  cartId: string;
  cartVersion: number;
  addressId?: string;
  excludeListingIds?: string[];
}

/** POST /checkout: the quote. Its `checkoutId` drives every later checkout call. */
export interface ApiQuote {
  checkoutId: string;
  expiresAt: string;
  totalKobo: number;
  eligible: boolean;
  declineReason?: ApiReason;
  plans: ApiPlan[];
  defaultPlanCode?: string;
  ineligibleItems?: { listingId: string; title: string; reason: string }[];
  summary: ApiCartGroup[];
  address?: ApiAddressCheck;
}

export interface ApiDisclosure {
  id: string;
  version: string;
  summary: string;
  fullText: string;
  merchants?: string[];
  checkLabel: string;
}

export interface ApiDisclosures {
  sellerLiability: ApiDisclosure;
  creditAgreement: ApiDisclosure;
  planCode: string;
  plan: ApiPlan;
}

export interface AcknowledgeBody {
  planCode: string;
  addressId: string;
  acknowledgements: { disclosureId: string; version: string; acceptedAt: string }[];
}

export interface AuthoriseBody {
  planCode: string;
  paymentMethod: { type: "transfer" };
  credential: { type: "pin"; pin: string } | { type: "biometric"; assertion: string };
}

export type CheckoutState = "pending" | "success" | "declined" | "auth_failed" | "kyc_required";

export interface ApiTransferDetails {
  bankName: string;
  accountNumber: string;
  accountName?: string;
  amountKobo: number;
  expiresAt: string;
}

export interface ApiAuthoriseResult {
  checkoutId: string;
  state: CheckoutState;
  duplicate: boolean;
  /** Wrong PIN: how many tries are left. */
  auth?: { attemptsRemaining: number; lockedUntil?: string };
  /** A credit step to finish before calling authorise again. */
  kyc?: { step: "employment" | "bank_link"; targetSeconds: number };
  /** Where to send the upfront payment. */
  transfer?: ApiTransferDetails;
}

export interface EmploymentBody {
  employer: string;
  role: string;
  monthlySalaryKobo: number;
  officeAddress: string;
  homeAddress: string;
}

/** Mono Connect widget details for linking the salary account. */
export interface ApiBankLink {
  publicKey: string;
  customerId: string;
  reference: string;
  scope: string[];
}

export interface ApiSubOrderRef {
  subOrderId: string;
  merchantId: string;
  merchantName: string;
  itemCount: number;
  fulfilmentEtaDays?: ApiEtaRange;
}

export interface ApiOrderResult {
  orderId: string;
  orderNumber: string;
  subOrders: ApiSubOrderRef[];
  downPaidKobo: number;
  schedulePreview: ApiInstalment[];
}

/** GET /checkout/:id/status, polled after authorise. */
export interface ApiCheckoutStatus {
  checkoutId: string;
  state: CheckoutState;
  elapsedMs: number;
  result?: ApiOrderResult;
  declineReason?: ApiReason;
  cartPreserved: boolean;
  nextActions?: string[];
}
