import type { ApiCart } from "~/models/cart_model";
import { useApiFetch } from "~~/server/utils/api";

/** Re-checks prices and stock; any changes come back in `revalidation`. */
export default defineEventHandler((event) =>
  useApiFetch<ApiCart>(event, "/cart/revalidate", { method: "POST", requireToken: true }),
);
