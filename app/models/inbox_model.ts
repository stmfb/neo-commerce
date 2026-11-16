/** One update in the shopper's inbox: approval, dispatch, delivery, repayments starting… */
export interface ApiNotification {
  id: string;
  /** The order it's about, when there is one. */
  orderId?: string;
  title: string;
  /** Plain text; render as text, never HTML. */
  body: string;
  createdAt: string;
  read: boolean;
}

/** Raw `data` payload of GET /me/notifications (and of POST /me/notifications/read). Always 20 a page. */
export interface ApiNotifications {
  notifications: ApiNotification[];
  unreadCount: number;
  page: { total: number; cursor?: string; nextCursor?: string };
}
