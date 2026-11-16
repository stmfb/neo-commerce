import type { ApiNotifications } from "~/models/inbox_model";
import { createError, readBody } from "h3";
import { useApiFetch } from "~~/server/utils/api";

const MAX_IDS = 100;

/**
 * Marks inbox updates read: the given `ids`, or all of them when there are none.
 * Returns the first page of the inbox, with the new unread count.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ ids?: unknown }>(event).catch(() => null);
  const raw: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
  const ids = raw.filter((id): id is string => typeof id === "string" && id.length > 0).slice(0, MAX_IDS);
  // Empty `ids` upstream means "mark everything", so junk ids must not quietly become that.
  if (raw.length && !ids.length) throw createError({ statusCode: 400, statusMessage: "Invalid notification ids" });
  return useApiFetch<ApiNotifications>(event, "/me/notifications/read", {
    method: "POST",
    body: { ids },
    requireToken: true,
  });
});
