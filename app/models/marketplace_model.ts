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

export interface ApiAffordability {
  known: boolean;
  [key: string]: unknown;
}

export interface MarketplaceHome {
  rails: ApiRail[];
  categories: ApiCategory[];
  officialStores: ApiOfficialStore[];
  affordability: ApiAffordability;
}

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
