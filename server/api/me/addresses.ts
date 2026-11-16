import type { ApiAddress } from "~/models/checkout_model";
import { useApiFetch } from "~~/server/utils/api";

/** Saved addresses, then the profile address (id "profile"). */
export default defineEventHandler((event) => useApiFetch<ApiAddress[]>(event, "/me/addresses", { requireToken: true }));
