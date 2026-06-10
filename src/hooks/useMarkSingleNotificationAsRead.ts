// hooks/useMarkSingleNotificationAsRead.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markSingleNotificationAsRead } from "@/components/notifications/actions";
import { toast } from "sonner";
import type { NotificationItem } from "@/types";

/**
 * Marks a single notification as read by its `id`.
 *
 * Uses optimistic update:
 *   1. Immediately flips `is_read` to true in the React Query cache
 *      so the unread dot disappears instantly.
 *   2. Fires the server action in the background.
 *   3. Rolls back the cache entry if the server call fails.
 *   4. Invalidates the query on settle so the server state
 *      is the final source of truth.
 *
 * NOTE: This does NOT touch `unreadCount` in NotificationContext —
 * the bulk mark-all (triggered on bell open) already resets the badge.
 */
export function useMarkSingleNotificationAsRead(userId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) =>
            markSingleNotificationAsRead(notificationId),

        // ── Optimistic update ─────────────────────────────────────────────────
        onMutate: async (notificationId) => {
            // Cancel any in-flight refetches to avoid overwriting our optimistic data
            await queryClient.cancelQueries({
                queryKey: ["notifications", userId],
            });

            // Snapshot the current list so we can roll back
            const previousNotifications = queryClient.getQueryData<
                NotificationItem[]
            >(
                ["notifications", userId],
            );

            // Flip is_read for the target notification
            queryClient.setQueryData<NotificationItem[]>(
                ["notifications", userId],
                (old = []) =>
                    old.map((n) =>
                        n.id === notificationId ? { ...n, is_read: true } : n
                    ),
            );

            // Return snapshot as rollback context
            return { previousNotifications };
        },

        // ── Rollback on error ────────────────────────────────────────────────
        onError: (_err, _notificationId, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(
                    ["notifications", userId],
                    context.previousNotifications,
                );
            }
            toast.error(
                "Could not mark notification as read. Please try again.",
            );
        },

        // ── Sync with server on settle (success OR error) ────────────────────
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["notifications", userId],
            });
        },
    });
}
