export type SubOrderStatus =
  | "delivered"
  | "on-the-way"
  | "cancelled"
  | "processing";

export interface OrderTimelineEvent {
  label: string;
  date: string;
  done: boolean;
}

export interface SubOrder {
  code: string;
  merchantSlug: string;
  merchantName: string;
  itemsLabel: string;
  amount: number;
  status: SubOrderStatus;
  deliveryNote: string;
  trackingCode?: string;
  events: OrderTimelineEvent[];
}

export type OrderStatus = "partly-delivered" | "delivered" | "repaid";

export type RepaymentStatus = "paid" | "due" | "upcoming";

export interface RepaymentEntry {
  label: string;
  date: string;
  amount: number;
  status: RepaymentStatus;
}

export interface Order {
  id: string;
  placedDate: string;
  closedDate?: string;
  status: OrderStatus;
  planMonths: number;
  payToday: number;
  monthlyAmount: number;
  totalRepayable: number;
  deliveryAddress: string;
  subOrders: SubOrder[];
  repaymentSchedule: RepaymentEntry[];
}

export const seedOrders: Order[] = [
  {
    id: "NC-88214",
    placedDate: "4 August",
    status: "partly-delivered",
    planMonths: 6,
    payToday: 91400,
    monthlyAmount: 39200,
    totalRepayable: 326600,
    deliveryAddress: "Chidi Okafor — 14 Adeola Odeku Street, Victoria Island, Lagos",
    repaymentSchedule: [
      { label: "Down payment", date: "Paid 4 Aug", amount: 91400, status: "paid" },
      { label: "Instalment 1", date: "Paid 6 Sep", amount: 39200, status: "paid" },
      { label: "Instalment 2", date: "Due 6 Oct", amount: 39200, status: "due" },
      { label: "Instalment 3", date: "6 Nov", amount: 39200, status: "upcoming" },
      { label: "Instalment 4", date: "6 Dec", amount: 39200, status: "upcoming" },
      { label: "Instalment 5", date: "6 Jan", amount: 39200, status: "upcoming" },
      { label: "Instalment 6", date: "6 Feb", amount: 39200, status: "upcoming" },
    ],
    subOrders: [
      {
        code: "NC-88214-A",
        merchantSlug: "adeyemi-power",
        merchantName: "Adeyemi Power",
        itemsLabel: "1 item",
        amount: 186000,
        status: "delivered",
        deliveryNote: "Usually delivered in 2–3 days",
        events: [
          { label: "Created", date: "4 Aug", done: true },
          { label: "Accepted", date: "4 Aug", done: true },
          { label: "Dispatched", date: "5 Aug", done: true },
          { label: "Delivered", date: "6 Aug", done: true },
        ],
      },
      {
        code: "NC-88214-B",
        merchantSlug: "ikeja-gadget-hub",
        merchantName: "Ikeja Gadget Hub",
        itemsLabel: "2 items",
        amount: 69000,
        status: "on-the-way",
        deliveryNote: "Delivery time varies by seller",
        trackingCode: "NPX-449120",
        events: [
          { label: "Created", date: "4 Aug", done: true },
          { label: "Accepted", date: "4 Aug", done: true },
          { label: "Dispatched", date: "7 Aug", done: true },
          { label: "Expected 9 Aug", date: "Delivered", done: false },
        ],
      },
      {
        code: "NC-88214-C",
        merchantSlug: "yaba-home-store",
        merchantName: "Yaba Home Store",
        itemsLabel: "1 item",
        amount: 28400,
        status: "cancelled",
        deliveryNote: "Cancelled 5 Aug. Removed from your plan — nothing to pay for this part.",
        events: [
          { label: "Created", date: "4 Aug", done: true },
          { label: "Cancelled by seller", date: "5 Aug", done: true },
        ],
      },
    ],
  },
  {
    id: "NC-87740",
    placedDate: "12 July",
    status: "delivered",
    planMonths: 6,
    payToday: 14200,
    monthlyAmount: 21300,
    totalRepayable: 142000,
    deliveryAddress: "Chidi Okafor — 14 Adeola Odeku Street, Victoria Island, Lagos",
    repaymentSchedule: [
      { label: "Down payment", date: "Paid 12 Jul", amount: 14200, status: "paid" },
      { label: "Instalment 1", date: "Paid 12 Aug", amount: 21300, status: "paid" },
      { label: "Instalment 2", date: "Paid 12 Sep", amount: 21300, status: "paid" },
      { label: "Instalment 3", date: "Paid 12 Oct", amount: 21300, status: "paid" },
      { label: "Instalment 4", date: "Due 12 Nov", amount: 21300, status: "due" },
      { label: "Instalment 5", date: "12 Dec", amount: 21300, status: "upcoming" },
      { label: "Instalment 6", date: "12 Jan", amount: 21300, status: "upcoming" },
    ],
    subOrders: [
      {
        code: "NC-87740-A",
        merchantSlug: "oja-mobile",
        merchantName: "Oja Mobile",
        itemsLabel: "1 item",
        amount: 142000,
        status: "delivered",
        deliveryNote: "Usually delivered in 1–2 days",
        events: [
          { label: "Created", date: "12 Jul", done: true },
          { label: "Accepted", date: "12 Jul", done: true },
          { label: "Dispatched", date: "13 Jul", done: true },
          { label: "Delivered", date: "15 Jul", done: true },
        ],
      },
    ],
  },
  {
    id: "NC-86102",
    placedDate: "3 March",
    closedDate: "2 June",
    status: "repaid",
    planMonths: 6,
    payToday: 7600,
    monthlyAmount: 10800,
    totalRepayable: 72400,
    deliveryAddress: "Chidi Okafor — 14 Adeola Odeku Street, Victoria Island, Lagos",
    repaymentSchedule: [
      { label: "Down payment", date: "Paid 3 Mar", amount: 7600, status: "paid" },
      { label: "Instalment 1", date: "Paid 3 Apr", amount: 10800, status: "paid" },
      { label: "Instalment 2", date: "Paid 3 May", amount: 10800, status: "paid" },
      { label: "Instalment 3", date: "Paid 3 Jun", amount: 10800, status: "paid" },
      { label: "Instalment 4", date: "Paid 3 Jun", amount: 10800, status: "paid" },
      { label: "Instalment 5", date: "Paid 2 Jun", amount: 10800, status: "paid" },
      { label: "Instalment 6", date: "Paid 2 Jun", amount: 10800, status: "paid" },
    ],
    subOrders: [
      {
        code: "NC-86102-A",
        merchantSlug: "kitchen-republic",
        merchantName: "Kitchen Republic",
        itemsLabel: "1 item",
        amount: 44000,
        status: "delivered",
        deliveryNote: "Usually delivered in 3–4 days",
        events: [
          { label: "Created", date: "3 Mar", done: true },
          { label: "Accepted", date: "3 Mar", done: true },
          { label: "Dispatched", date: "4 Mar", done: true },
          { label: "Delivered", date: "6 Mar", done: true },
        ],
      },
      {
        code: "NC-86102-B",
        merchantSlug: "yaba-home-store",
        merchantName: "Yaba Home Store",
        itemsLabel: "1 item",
        amount: 28400,
        status: "delivered",
        deliveryNote: "Usually delivered in 5–7 days",
        events: [
          { label: "Created", date: "3 Mar", done: true },
          { label: "Accepted", date: "3 Mar", done: true },
          { label: "Dispatched", date: "6 Mar", done: true },
          { label: "Delivered", date: "10 Mar", done: true },
        ],
      },
    ],
  },
];
