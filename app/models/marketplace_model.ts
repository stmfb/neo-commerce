export type ApiStockLevel = "in_stock" | "low_stock" | "out_of_stock";

export interface ApiStock {
  level: ApiStockLevel;
  available?: number;
  lowStockThreshold?: number;
}

export interface ApiListing {
  listingId: string;
  title: string;
  image?: string;
  merchantId: string;
  merchantName: string;
  merchantVerified: boolean;
  priceKobo: number;
  instalmentFromKobo?: number;
  bnplEligible: boolean;
  stock: ApiStock;
}

export interface ApiRail {
  id: string;
  title: string;
  link: string;
  listings: ApiListing[];
}

export interface ApiCategory {
  slug: string;
  name: string;
  image?: string;
}

export interface ApiOfficialStore {
  id: string;
  name: string;
  logo?: string;
  verified: boolean;
}

/** The home payload only says whether a limit is known; details come from /me/affordability. */
export interface ApiHomeAffordability {
  known: boolean;
}

export interface MarketplaceHome {
  rails: ApiRail[];
  categories: ApiCategory[];
  officialStores: ApiOfficialStore[];
  affordability: ApiHomeAffordability;
}

/** Slider bounds for picking a monthly budget, in kobo. */
interface ApiAffordabilitySlider {
  sliderMinKobo: number;
  sliderMaxKobo: number;
  sliderStepKobo: number;
  guidanceCopy: string;
}

/** GET /me/affordability when we don't know the shopper's limit (e.g. not signed in). */
export interface ApiAffordabilityUnknown extends ApiAffordabilitySlider {
  known: false;
}

/**
 * GET /me/affordability when the shopper's limit is known.
 * TODO: shape not yet observed — the backend only returns `known: false` today.
 * `monthlyLimitKobo` is an assumed name; confirm with the API and adjust.
 */
export interface ApiAffordabilityKnown extends Partial<ApiAffordabilitySlider> {
  known: true;
  monthlyLimitKobo?: number;
}

export type ApiAffordability = ApiAffordabilityUnknown | ApiAffordabilityKnown;

export interface ApiBreadcrumbItem {
  label: string;
  slug: string;
}

export interface ApiFacetOption {
  id: string;
  label: string;
  count: number;
  selected: boolean;
}

export interface ApiCategoryFacets {
  brands: ApiFacetOption[];
  merchants: ApiFacetOption[];
  conditions: ApiFacetOption[];
}

/** Raw `data` payload of GET /categories/:slug/listings on the upstream API. */
export interface ApiCategoryListings {
  breadcrumb: ApiBreadcrumbItem[];
  listings: ApiListing[];
  facets: ApiCategoryFacets;
  applied: { sort: ListingSort; [filter: string]: unknown };
  page: { total: number };
}

/** What our /api/categories/:slug/listings route returns to the app. */
export interface CategoryListingsPage extends ApiCategoryListings {
  /** Offset to request the next page with, or null when everything is loaded. */
  nextCursor: number | null;
}

export type ListingSort = "relevance" | "price_asc" | "price_desc" | "newest";

export interface CategoryListingsQuery {
  sort?: ListingSort;
  limit?: number;
  cursor?: number;
}

export interface ApiListingVariant {
  id: string;
  /** e.g. `{ size: "M" }` or `{ colour: "Black", storage: "128GB" }` */
  attributes: Record<string, string>;
  priceKobo: number;
  instalmentFromKobo?: number;
  stock: ApiStock;
}

export interface ApiListingMerchant {
  id: string;
  name: string;
  logo?: string;
  verified: boolean;
  /** Days the buyer has to return an item. */
  returnsWindow: number;
  fulfilmentEtaDays: { min: number; max: number };
  supportContact: { email: string; phone: string; hours: string };
}

/** Raw `data` payload of GET /listings/:id on the upstream API. */
export interface ApiListingDetail extends ApiListing {
  description?: string;
  gallery?: string[];
  /** Omitted entirely for single-SKU listings. */
  variants?: ApiListingVariant[];
  merchant: ApiListingMerchant;
  maxQuantity?: number;
  notifyMeSupported?: boolean;
}

/** Merchant availability. Only "live" is confirmed so far; anything else is treated as not taking orders. */
export type ApiMerchantStatus = "live" | (string & {});

/** Raw `data` payload of GET /merchants/:id on the upstream API. */
export interface ApiMerchantDetail extends ApiListingMerchant {
  banner?: string;
  categories?: ApiCategory[];
  returnsPolicy?: string;
  status: ApiMerchantStatus;
  listings: ApiListing[];
  /** `nextCursor` is only present when `limit` was sent and more pages remain. */
  page: { total: number; cursor?: string; nextCursor?: string };
}

/** What our /api/merchant/:id route returns to the app. */
export interface MerchantPage extends ApiMerchantDetail {
  nextCursor: string | null;
}

/** Filters accepted by GET /search. Money values are in kobo, like the rest of the API. */
export interface SearchQuery {
  q?: string;
  sort?: ListingSort;
  /** Brand facet ids, e.g. ["Tecno", "Infinix"] (sent as repeated `brand=` params). */
  brand?: string[];
  /** Merchant ids (repeated `merchant=` params). */
  merchant?: string[];
  /** Condition ids, e.g. ["new", "used"] (repeated `condition=` params). */
  condition?: string[];
  minPrice?: number;
  maxPrice?: number;
  maxMonthly?: number;
  limit?: number;
  cursor?: string;
}

/** Sent instead of results when nothing matches. */
export interface ApiSearchEmpty {
  message: string;
  /** Only present when the query itself matched nothing (not when filters did). */
  suggestedCategories?: ApiCategory[];
}

/** Raw `data` payload of GET /search on the upstream API. */
export interface ApiSearchResults {
  listings: ApiListing[];
  /** Comes back as `{}` when there are no results. */
  facets: Partial<ApiCategoryFacets>;
  applied: { sort: ListingSort; merchants?: string[]; maxMonthlyKobo?: number; [filter: string]: unknown };
  page: { total: number; cursor?: string; nextCursor?: string };
  empty?: ApiSearchEmpty;
}

/** What our /api/search route returns to the app. */
export interface SearchPage extends ApiSearchResults {
  nextCursor: string | null;
}
