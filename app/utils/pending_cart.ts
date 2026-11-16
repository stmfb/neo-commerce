/**
 * An "Add to cart" a signed-out shopper tapped. The cart needs an account, so it waits here
 * (this tab only) while they sign in or create one, then gets added (see the cart store's
 * `addPendingItem`).
 */
export interface PendingCartAdd {
  listingId: string;
  variantId?: string;
  quantity: number;
  /** For the sign-in page: "We'll add … to your cart". */
  title: string;
  savedAt: number;
}

const KEY = "nc_pending_cart_add";
/** As long as a sign-in token lasts. Older than that, adding it would come as a surprise. */
const MAX_AGE_MS = 30 * 60_000;

export function savePendingCartAdd(item: Omit<PendingCartAdd, "savedAt">) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...item, savedAt: Date.now() }));
  } catch {
    // Storage blocked: the shopper just taps "Add to cart" again after signing in.
  }
}

export function readPendingCartAdd(): PendingCartAdd | null {
  try {
    const item = JSON.parse(sessionStorage.getItem(KEY) ?? "null") as PendingCartAdd | null;
    if (!item || typeof item.listingId !== "string" || !(item.quantity >= 1)) return null;
    if (Date.now() - item.savedAt > MAX_AGE_MS) {
      clearPendingCartAdd();
      return null;
    }
    return item;
  } catch {
    return null;
  }
}

export function clearPendingCartAdd() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}
