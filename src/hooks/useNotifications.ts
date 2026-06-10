// hooks/useNotifications.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/components/notifications/actions";
import type { NotificationItem, RawNotificationItem, NotificationType } from "@/types";

// ─── Normaliser ───────────────────────────────────────────────────────────────

/**
 * Supabase returns joined relations as arrays even for single-object FKs.
 * This function picks the first element (or null) to give us the clean
 * NotificationItem shape the UI expects.
 *
 * Also validates `type` against the known NotificationType union so we
 * never render an unknown type in the bell dropdown.
 */
const VALID_TYPES: NotificationType[] = ["comment", "like", "reply"];

function normaliseNotification(raw: RawNotificationItem): NotificationItem {
  return {
    id: raw.id,
    created_at: raw.created_at,
    user_id: raw.user_id,
    sender_id: raw.sender_id,
    post_id: raw.post_id,
    // Validate type — fall back to "like" if DB has an unexpected value
    type: VALID_TYPES.includes(raw.type as NotificationType)
      ? (raw.type as NotificationType)
      : "like",
    is_read: raw.is_read,
    // Pick first element of the array Supabase returns, or null
    sender: Array.isArray(raw.sender) ? (raw.sender[0] ?? null) : raw.sender,
    post: Array.isArray(raw.post) ? (raw.post[0] ?? null) : raw.post,
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Fetches the 20 most recent notifications for `userId`.
 *
 * - Only runs when `userId` is a non-empty string.
 * - staleTime 30s — Supabase Realtime in useNotificationSubscription
 *   handles live INSERT signals so we don't need aggressive polling.
 * - Invalidated by useMarkNotificationsAsRead and
 *   useMarkSingleNotificationAsRead on success/settle.
 */
export function useNotifications(userId: string) {
  return useQuery<NotificationItem[], Error>({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const raw = await fetchNotifications(userId);
      if (!raw) return [];
      // Cast to RawNotificationItem[] — Supabase return is `any`-typed here
      return (raw as unknown as RawNotificationItem[]).map(normaliseNotification);
    },
    enabled: !!userId,
    staleTime: 30_000,    // 30 seconds
    gcTime: 5 * 60_000,   // keep in cache for 5 minutes
  });
}