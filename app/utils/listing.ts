import type { Product, StockState } from "~/data/products";
import type { Merchant } from "~/data/merchants";
import type { ApiListing, ApiOfficialStore, ApiStockLevel } from "~/models/marketplace_model";

const STOCK_MAP: Record<ApiStockLevel, StockState> = {
  in_stock: "in",
  low_stock: "low",
  out_of_stock: "out",
};

export const koboToNaira = (kobo: number) => kobo / 100;

/** Maps an API listing onto the Product shape the existing cards/grids use. */
export function listingToProduct(listing: ApiListing, categorySlug = ""): Product {
  return {
    id: listing.listingId,
    slug: listing.listingId,
    name: listing.title,
    image: listing.image,
    price: koboToNaira(listing.priceKobo),
    fromMonthly: listing.instalmentFromKobo ? koboToNaira(listing.instalmentFromKobo) : 0,
    merchantSlug: listing.merchantId,
    merchantName: listing.merchantName,
    merchantVerified: listing.merchantVerified,
    categorySlug,
    subCategory: "",
    stock: STOCK_MAP[listing.stock?.level] ?? "in",
    stockCount: listing.stock?.available,
    bnplEligible: listing.bnplEligible,
  };
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function storeToMerchant(store: ApiOfficialStore): Merchant {
  return {
    slug: store.id,
    name: store.name,
    initials: initials(store.name),
    logo: store.logo,
    tileColor: "bg-primary-dark-950",
    verified: store.verified,
    official: true,
    categorySlug: "",
    deliveryEta: "Delivery time varies by seller",
    returnsNote: "See seller's returns policy",
  };
}
