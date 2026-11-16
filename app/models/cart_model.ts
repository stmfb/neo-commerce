/** GET /cart and every cart mutation return the whole cart. Money is kobo. */

export interface ApiCartItem {
  cartItemId: string;
  listingId: string;
  variantId?: string;
  title: string;
  variantLabel?: string;
  image: string;
  quantity: number;
  maxQuantity: number;
  unitPriceKobo: number;
  lineTotalKobo: number;
  bnplEligible: boolean;
  /** No longer buyable (gone, ineligible or out of stock); the shopper must remove it. */
  flaggedForRemoval: boolean;
}

export interface ApiEtaRange {
  min: number;
  max: number;
}

export interface ApiCartGroup {
  merchantId: string;
  merchantName: string;
  merchantVerified?: boolean;
  items: ApiCartItem[];
  subtotalKobo: number;
  fulfilmentEtaDays?: ApiEtaRange;
}

export interface ApiBasketRule {
  code: string;
  limit: number;
  current: number;
  message: string;
}

export type ApiCartChangeType = "price_increased" | "price_decreased" | "stock_reduced" | "unavailable";

export interface ApiCartChange {
  cartItemId: string;
  merchantName: string;
  title: string;
  type: ApiCartChangeType;
  from?: number;
  to?: number;
}

export interface ApiRevalidation {
  /** Present only when something changed; send it back to accept the changes. */
  revalidationId?: string;
  valid: boolean;
  changes?: ApiCartChange[];
  checkedAt: string;
}

export interface ApiCart {
  cartId: string;
  version: number;
  groups: ApiCartGroup[];
  total: { itemsKobo: number; taxKobo: number; totalKobo: number; itemCount: number };
  limits: { maxMerchants: number; maxItems: number; maxValueKobo: number };
  violations?: ApiBasketRule[];
  revalidation?: ApiRevalidation;
}

export interface AddCartItemBody {
  listingId: string;
  variantId?: string;
  quantity: number;
}

export interface AcceptCartChangesBody {
  revalidationId: string;
  cartVersion: number;
  removeItemIds?: string[];
}
