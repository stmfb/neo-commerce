import type { ApiDirectory } from "~/models/marketplace_model";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler((event) => useApiFetch<ApiDirectory>(event, "/merchants", { method: "GET" }));
