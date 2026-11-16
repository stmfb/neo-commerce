import type { ApiNotifications } from "~/models/inbox_model";
import { getQuery } from "h3";
import { useApiFetch } from "~~/server/utils/api";

/** The shopper's inbox, newest first, 20 a page, with the unread count. */
export default defineEventHandler((event) => {
  const { cursor } = getQuery(event);
  return useApiFetch<ApiNotifications>(event, "/me/notifications", {
    params: { cursor: typeof cursor === "string" && cursor ? cursor : undefined },
    requireToken: true,
  });
});
