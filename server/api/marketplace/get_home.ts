import type { MarketplaceHome } from "~/models/marketplace_model";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  return useApiFetch<MarketplaceHome>(event, "/marketplace/home", {
    method: "GET",
  });
});
