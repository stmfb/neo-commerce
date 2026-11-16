import type { AcknowledgeBody } from "~/models/checkout_model";
import { createError, getRouterParam, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody<Partial<AcknowledgeBody>>(event);
  const acks = Array.isArray(body?.acknowledgements) ? body.acknowledgements : [];
  if (!id || typeof body?.planCode !== "string" || !body.planCode || typeof body.addressId !== "string" || !body.addressId || !acks.length) {
    throw createError({ statusCode: 400, statusMessage: "A plan, an address and the acknowledgements are required" });
  }
  await useApiFetch(event, `/checkout/${encodeURIComponent(id)}/acknowledgements`, {
    method: "POST",
    body: {
      planCode: body.planCode,
      addressId: body.addressId,
      acknowledgements: acks.map((a) => ({
        disclosureId: String(a?.disclosureId ?? ""),
        version: String(a?.version ?? ""),
        acceptedAt: a?.acceptedAt,
      })),
    },
    requireToken: true,
  });
  // Upstream answers 204. h3 sends 204 for null; undefined would fall through to a 404.
  return null;
});
