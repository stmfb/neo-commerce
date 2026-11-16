import type { AddressInput, ApiValidatedAddress } from "~/models/checkout_model";
import { readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** Saves the address and says whether we deliver there. The API names any missing field. */
export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<AddressInput>>(event);
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const address: AddressInput = {
    label: str(body?.label, 60),
    line1: str(body?.line1, 200),
    line2: str(body?.line2, 200),
    city: str(body?.city, 100),
    state: str(body?.state, 100),
    phone: str(body?.phone, 20),
  };
  return useApiFetch<ApiValidatedAddress>(event, "/addresses/validate", { method: "POST", body: address, requireToken: true });
});
