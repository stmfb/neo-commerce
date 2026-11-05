import type { Product, ProductVariantGroup, StockState } from "~/data/products";
import type { Merchant } from "~/data/merchants";
import type {
  ApiListing,
  ApiListingDetail,
  ApiListingMerchant,
  ApiListingVariant,
  ApiMerchantDetail,
  ApiOfficialStore,
  ApiStockLevel,
} from "~/models/marketplace_model";

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

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Turns flat API variants (`[{ attributes: { size: "S" } }, …]`) into the
 * grouped shape the product page renders (`[{ name: "Size", options: [...] }]`).
 * An option is in stock if any variant carrying it is in stock.
 */
export function variantsToGroups(variants: ApiListingVariant[]): ProductVariantGroup[] {
  const groups = new Map<string, Map<string, boolean>>();
  for (const variant of variants) {
    const inStock = variant.stock.level !== "out_of_stock";
    for (const [key, value] of Object.entries(variant.attributes)) {
      const options = groups.get(key) ?? new Map<string, boolean>();
      options.set(value, (options.get(value) ?? false) || inStock);
      groups.set(key, options);
    }
  }
  return Array.from(groups, ([key, options]) => ({
    name: capitalise(key),
    options: Array.from(options, ([label, inStock]) => ({ label, inStock })),
  }));
}

export function listingDetailToProduct(listing: ApiListingDetail): Product {
  return {
    ...listingToProduct(listing),
    description: listing.description || undefined,
    variants: listing.variants?.length ? variantsToGroups(listing.variants) : undefined,
  };
}

export function listingMerchantToMerchant(merchant: ApiListingMerchant): Merchant {
  const { min, max } = merchant.fulfilmentEtaDays;
  return {
    ...storeToMerchant(merchant),
    official: false,
    deliveryEta: min === max ? `Delivery in ${min} days` : `Delivery in ${min}–${max} days`,
    returnsNote: merchant.returnsWindow > 0 ? `${merchant.returnsWindow}-day returns` : "No returns on this item",
  };
}

export function merchantDetailToMerchant(merchant: Omit<ApiMerchantDetail, "listings" | "page">): Merchant {
  return {
    ...listingMerchantToMerchant(merchant),
    categorySlug: merchant.categories?.[0]?.slug ?? "",
    unavailable: merchant.status !== "live",
  };
}
