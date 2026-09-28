import { seedOrders } from "~/data/orders";
import type { Order, SubOrder } from "~/data/orders";
import type { CartMerchantGroup } from "~/stores/cart";
import type { PlanQuote } from "~/utils/quote";

let sequence = 88300;

export const useOrdersStore = defineStore(
  "orders",
  () => {
    // Only orders created at runtime (via checkout) are persisted. The seed catalog always
    // comes straight from code, so updates to it aren't masked by a stale localStorage copy.
    const createdOrders = ref<Order[]>([]);
    const orders = computed<Order[]>(() => [...createdOrders.value, ...seedOrders]);

    function getOrder(id: string): Order | undefined {
      return orders.value.find((order) => order.id === id);
    }

    function createOrderFromCart(groups: CartMerchantGroup[], plan: PlanQuote, deliveryAddress: string): Order {
      sequence += 1;
      const id = `NC-${sequence}`;
      const subOrders: SubOrder[] = groups.map((group, index) => ({
        code: `${id}-${String.fromCharCode(65 + index)}`,
        merchantSlug: group.merchantSlug,
        merchantName: group.merchantName,
        itemsLabel: `${group.items.reduce((sum, item) => sum + item.qty, 0)} item${group.items.reduce((sum, item) => sum + item.qty, 0) > 1 ? "s" : ""}`,
        amount: group.subtotal,
        status: "processing",
        deliveryNote: group.deliveryEta,
        events: [{ label: "Created", date: "Today", done: true }],
      }));

      const repaymentSchedule = [
        { label: "Down payment", date: "Paid today", amount: plan.payToday, status: "paid" as const },
        ...Array.from({ length: plan.months }, (_, index) => ({
          label: `Instalment ${index + 1}`,
          date: index === 0 ? "Due after delivery" : `In ${index + 1} months`,
          amount: plan.monthly,
          status: "upcoming" as const,
        })),
      ];

      const order: Order = {
        id,
        placedDate: "Today",
        status: "partly-delivered",
        planMonths: plan.months,
        payToday: plan.payToday,
        monthlyAmount: plan.monthly,
        totalRepayable: plan.totalRepayable,
        deliveryAddress,
        subOrders,
        repaymentSchedule,
      };

      createdOrders.value = [order, ...createdOrders.value];
      return order;
    }

    return { orders, createdOrders, getOrder, createOrderFromCart };
  },
  { persist: { pick: ["createdOrders"] } },
);
