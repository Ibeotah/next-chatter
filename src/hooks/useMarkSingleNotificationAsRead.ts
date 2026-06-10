// hooks/useMarkSingleNotificationAsRead.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markSingleNotificationAsRead } from "@/components/notifications/actions";
import { toast } from "sonner";
import type { NotificationItem } from "@/types";

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
