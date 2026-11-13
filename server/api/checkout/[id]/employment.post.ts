import type { EmploymentBody } from "~/models/checkout_model";
import { createError, getRouterParam, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody<Partial<EmploymentBody>>(event);
  const str = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 200) : "");
  const employment: EmploymentBody = {
    employer: str(body?.employer),
    role: str(body?.role),
    monthlySalaryKobo: Number(body?.monthlySalaryKobo),
    officeAddress: str(body?.officeAddress),
    homeAddress: str(body?.homeAddress),
  };
  const { employer, role, monthlySalaryKobo, officeAddress, homeAddress } = employment;
  if (!id || !employer || !role || !officeAddress || !homeAddress || !Number.isInteger(monthlySalaryKobo) || monthlySalaryKobo <= 0) {
    throw createError({ statusCode: 400, statusMessage: "Fill in every field" });
  }
  await useApiFetch(event, `/checkout/${encodeURIComponent(id)}/employment`, {
    method: "POST",
    body: employment,
    requireToken: true,
  });
  // Upstream answers 204. h3 sends 204 for null; undefined would fall through to a 404.
  return null;
});
