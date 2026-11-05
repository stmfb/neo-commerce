import type { ApiAffordability } from "~/models/marketplace_model";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  return useApiFetch<ApiAffordability>(event, "/me/affordability", { method: "GET" });
});
