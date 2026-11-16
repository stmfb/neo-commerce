import type { ApiOrders } from "~/models/orders_model";
import { getQuery } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** The shopper's orders, newest first, 20 a page. */
export default defineEventHandler((event) => {
  const { cursor } = getQuery(event);
  return useApiFetch<ApiOrders>(event, "/orders", {
    params: { cursor: typeof cursor === "string" && cursor ? cursor : undefined },
    requireToken: true,
  });
});
