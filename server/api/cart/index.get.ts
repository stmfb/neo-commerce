import type { ApiCart } from "~/models/cart_model";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler((event) => useApiFetch<ApiCart>(event, "/cart", { requireToken: true }));
