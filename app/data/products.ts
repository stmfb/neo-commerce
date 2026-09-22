export interface ProductVariantOption {
  label: string;
  inStock: boolean;
}

export interface ProductVariantGroup {
  name: string;
  options: ProductVariantOption[];
}

export interface ProductSpec {
  label: string;
  value: string;
}

export type StockState = "in" | "low" | "out";

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  fromMonthly: number;
  merchantSlug: string;
  categorySlug: string;
  subCategory: string;
  stock: StockState;
  stockCount?: number;
  bnplEligible: boolean;
  description?: string;
  specs?: ProductSpec[];
  variants?: ProductVariantGroup[];
}

export const products: Product[] = [
  {
    id: "p1",
    slug: "firman-3-5kva-petrol-generator-key-start",
    name: "Firman 3.5kVA petrol generator, key start — SPG3800",
    price: 186000,
    fromMonthly: 13100,
    merchantSlug: "adeyemi-power",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "low",
    stockCount: 3,
    bnplEligible: true,
    description:
      "3.5kVA petrol generator with key start, 15-litre tank and roughly 9 hours of run time at half load. Copper-wound alternator, low-oil shutdown, and twin 220V sockets with a 12V DC output for charging.",
    specs: [
      { label: "Power output", value: "3.5kVA" },
      { label: "Fuel", value: "Petrol" },
      { label: "Tank", value: "15 litres" },
      { label: "Warranty", value: "12 months, seller-handled" },
    ],
    variants: [
      {
        name: "Start type",
        options: [
          { label: "Key start", inStock: true },
          { label: "Recoil start", inStock: true },
          { label: "Remote start", inStock: false },
        ],
      },
    ],
  },
  {
    id: "p2",
    slug: "oraimo-freepods-4-wireless-earbuds",
    name: "Oraimo FreePods 4 wireless earbuds",
    price: 34500,
    fromMonthly: 3100,
    merchantSlug: "ikeja-gadget-hub",
    categorySlug: "phones-tablets",
    subCategory: "Audio",
    stock: "in",
    bnplEligible: true,
    description:
      "Bluetooth 5.3 wireless earbuds with active noise cancellation, 30-hour case battery life and IPX5 water resistance.",
    specs: [
      { label: "Connectivity", value: "Bluetooth 5.3" },
      { label: "Battery", value: "Up to 30 hours with case" },
      { label: "Water resistance", value: "IPX5" },
      { label: "Warranty", value: "12 months, seller-handled" },
    ],
    variants: [
      {
        name: "Colour",
        options: [
          { label: "White", inStock: true },
          { label: "Black", inStock: true },
        ],
      },
    ],
  },
  {
    id: "p3",
    slug: "hisense-43-smart-tv-a4-series",
    name: 'Hisense 43" smart TV, A4 series',
    price: 242000,
    fromMonthly: 11900,
    merchantSlug: "balogun-electronics",
    categorySlug: "electronics",
    subCategory: "Televisions",
    stock: "low",
    stockCount: 3,
    bnplEligible: true,
    description:
      '43" full HD smart TV with VIDAA OS, built-in Wi-Fi, and three HDMI ports for external devices.',
    specs: [
      { label: "Screen size", value: '43"' },
      { label: "Resolution", value: "Full HD 1080p" },
      { label: "Smart platform", value: "VIDAA OS" },
      { label: "Warranty", value: "12 months, seller-handled" },
    ],
  },
  {
    id: "p4",
    slug: "binatone-1-7l-cordless-kettle",
    name: "Binatone 1.7L cordless kettle",
    price: 18900,
    fromMonthly: 1850,
    merchantSlug: "kitchen-republic",
    categorySlug: "home-kitchen",
    subCategory: "Small appliances",
    stock: "low",
    stockCount: 3,
    bnplEligible: true,
    description:
      "1.7-litre cordless electric kettle with auto shut-off, boil-dry protection and a 360-degree swivel base.",
    specs: [
      { label: "Capacity", value: "1.7 litres" },
      { label: "Power", value: "2200W" },
      { label: "Material", value: "Stainless steel" },
      { label: "Warranty", value: "6 months, seller-handled" },
    ],
  },
  {
    id: "p5",
    slug: "tecno-spark-20-128gb-dual-sim",
    name: "Tecno Spark 20, 128GB dual sim",
    price: 142000,
    fromMonthly: 6700,
    merchantSlug: "oja-mobile",
    categorySlug: "phones-tablets",
    subCategory: "Smartphones",
    stock: "low",
    stockCount: 3,
    bnplEligible: true,
    description:
      "6.6-inch smartphone with 128GB storage, 8GB RAM, 50MP main camera and a 5000mAh battery.",
    specs: [
      { label: "Storage", value: "128GB" },
      { label: "RAM", value: "8GB" },
      { label: "Battery", value: "5000mAh" },
      { label: "Warranty", value: "12 months, seller-handled" },
    ],
    variants: [
      {
        name: "Colour",
        options: [
          { label: "Gravity Black", inStock: true },
          { label: "Cyan Blue", inStock: true },
        ],
      },
    ],
  },
  {
    id: "p6",
    slug: "sumec-firman-eco2990-2-5kva-generator",
    name: "Sumec Firman ECO2990 2.5kVA generator",
    price: 142500,
    fromMonthly: 9900,
    merchantSlug: "sunlight-inverters",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p7",
    slug: "elepaq-2-5kva-constant-generator",
    name: "Elepaq 2.5kVA constant generator",
    price: 128000,
    fromMonthly: 8900,
    merchantSlug: "powerhub-nigeria",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p8",
    slug: "luminous-1-5kva-pure-sine-inverter",
    name: "Luminous 1.5kVA pure sine inverter",
    price: 218000,
    fromMonthly: 15200,
    merchantSlug: "sunlight-inverters",
    categorySlug: "generators-power",
    subCategory: "Inverters",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p9",
    slug: "felicity-200ah-tubular-battery",
    name: "Felicity 200Ah tubular battery",
    price: 165000,
    fromMonthly: 11500,
    merchantSlug: "powerhub-nigeria",
    categorySlug: "generators-power",
    subCategory: "Batteries",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p10",
    slug: "canadian-solar-400w-monocrystalline-panel",
    name: "Canadian Solar 400W monocrystalline panel",
    price: 88500,
    fromMonthly: 6100,
    merchantSlug: "mainland-solar",
    categorySlug: "generators-power",
    subCategory: "Solar panels",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p11",
    slug: "maxi-1-8kva-petrol-generator-recoil",
    name: "Maxi 1.8kVA petrol generator, recoil",
    price: 94000,
    fromMonthly: 6500,
    merchantSlug: "mainland-solar",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p12",
    slug: "honda-ep2500cx-2-2kva-generator",
    name: "Honda EP2500CX 2.2kVA generator",
    price: 398000,
    fromMonthly: 27600,
    merchantSlug: "adeyemi-power",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p13",
    slug: "generator-cover-heavy-duty-tarpaulin",
    name: "Generator cover, heavy-duty tarpaulin",
    price: 12400,
    fromMonthly: 1200,
    merchantSlug: "powerhub-nigeria",
    categorySlug: "generators-power",
    subCategory: "Accessories",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p14",
    slug: "generator-wheel-kit-universal-fit",
    name: "Generator wheel kit, universal fit",
    price: 18900,
    fromMonthly: 1700,
    merchantSlug: "mainland-solar",
    categorySlug: "generators-power",
    subCategory: "Accessories",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p15",
    slug: "lutian-3-8kva-petrol-generator",
    name: "Lutian 3.8kVA petrol generator",
    price: 204000,
    fromMonthly: 14600,
    merchantSlug: "sunlight-inverters",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "out",
    bnplEligible: true,
    description:
      "3.8kVA petrol generator with recoil start, 12-litre tank and a copper-wound alternator.",
    specs: [
      { label: "Power output", value: "3.8kVA" },
      { label: "Fuel", value: "Petrol" },
      { label: "Tank", value: "12 litres" },
      { label: "Warranty", value: "12 months, seller-handled" },
    ],
  },
  {
    id: "p16",
    slug: "thermocool-5kva-automatic-stabiliser",
    name: "Thermocool 5kVA automatic stabiliser",
    price: 49900,
    fromMonthly: 4400,
    merchantSlug: "adeyemi-power",
    categorySlug: "generators-power",
    subCategory: "Stabilisers",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p17",
    slug: "firman-6-5kva-three-phase-generator",
    name: "Firman 6.5kVA three-phase generator",
    price: 612000,
    fromMonthly: 42400,
    merchantSlug: "adeyemi-power",
    categorySlug: "generators-power",
    subCategory: "Petrol generators",
    stock: "in",
    bnplEligible: true,
  },
  {
    id: "p18",
    slug: "century-2-burner-table-top-gas-cooker",
    name: "Century 2-burner table-top gas cooker",
    price: 28400,
    fromMonthly: 2600,
    merchantSlug: "yaba-home-store",
    categorySlug: "home-kitchen",
    subCategory: "Cooking",
    stock: "in",
    bnplEligible: true,
    variants: [
      {
        name: "Finish",
        options: [{ label: "Stainless", inStock: true }],
      },
    ],
  },
  {
    id: "p19",
    slug: "nexus-20l-gas-cylinder",
    name: "Nexus 20L gas cylinder",
    price: 15400,
    fromMonthly: 0,
    merchantSlug: "yaba-home-store",
    categorySlug: "home-kitchen",
    subCategory: "Cooking",
    stock: "in",
    bnplEligible: false,
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductsByMerchant(merchantSlug: string): Product[] {
  return products.filter((product) => product.merchantSlug === merchantSlug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((product) => product.categorySlug === categorySlug);
}
