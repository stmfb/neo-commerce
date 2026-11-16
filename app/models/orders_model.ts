import type { ApiAddress, ApiInstalment, ApiReason } from "~/models/checkout_model";
import type { ApiCartItem } from "~/models/cart_model";

/** My orders. One order per checkout; one sub-order per seller. Money is kobo. */

export type OrderOverallStatus = "in_progress" | "partially_delivered" | "delivered" | "cancelled";

export interface ApiOrderSummary {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  merchantNames: string[];
  merchantCount: number;
  itemCount: number;
  totalKobo: number;
  overallStatus: OrderOverallStatus;
  /** e.g. "Set up your direct debit", "2 of 3 delivered". */
  statusLabel: string;
  thumbnails: string[];
}

export interface ApiOrders {
  orders: ApiOrderSummary[];
  page: { total: number; cursor?: string; nextCursor?: string };
}

export type SubOrderStatus = "created" | "accepted" | "dispatched" | "delivered" | "cancelled";

export interface ApiTimelineStep {
  status: SubOrderStatus;
  label: string;
  state: "done" | "current" | "pending" | "branch";
  at?: string;
}

export interface ApiSupportContact {
  email?: string;
  phone?: string;
  hours?: string;
}

export interface ApiSubOrder {
  subOrderId: string;
  merchantId: string;
  merchantName: string;
  merchantVerified?: boolean;
  merchantSupport: ApiSupportContact;
  status: SubOrderStatus;
  delayed: boolean;
  items: ApiCartItem[];
  subtotalKobo: number;
  timeline: ApiTimelineStep[];
  trackingRef?: string;
  /** True while dispatched: the shopper can say it arrived. */
  canConfirmDelivery: boolean;
}

/** Shown from approval until the shopper's bank authorises the direct debit. */
export interface ApiMandateAction {
  status: "awaiting_authorisation" | "failed";
  bankName: string;
  accountNumber: string;
  /** The small verification transfer, not the loan. */
  amountKobo: number;
  salaryBankName: string;
  message?: string;
}

export interface ApiRepaymentSchedule {
  loanId: string;
  /** True once the first delivery has started the loan. */
  activated: boolean;
  activatedAt?: string;
  activationNote: string;
  downPaidKobo: number;
  totalRepayableKobo: number;
  outstandingKobo: number;
  instalments: ApiInstalment[];
}

/**
 * A seller's part cancelled after checkout. Before repayments start the plan shrinks
 * (`plan_reduced`); after, the part is refunded to the shopper and the plan is unchanged.
 * Only `refunded` is sent today.
 */
export interface ApiPlanAdjustment {
  id: string;
  kind: "plan_reduced" | "refunded";
  subOrderId: string;
  merchantName: string;
  reason: ApiReason;
  previousTotalKobo?: number;
  newTotalKobo?: number;
  refundKobo?: number;
  at: string;
}

export interface ApiOrderDetail {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  address: ApiAddress;
  subOrders: ApiSubOrder[];
  /** Only when some, but not all, sub-orders are delivered. */
  fulfilment?: { delivered: number; total: number; label: string };
  adjustments?: ApiPlanAdjustment[];
  mandate?: ApiMandateAction;
  repayment: ApiRepaymentSchedule;
  neocashEscalation: ApiSupportContact;
}
