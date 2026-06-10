// 'use client';

// import { markNotificationsAsRead } from '@/components/notifications/actions';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { toast } from 'sonner';

// export const useMarkNotificationsAsRead = (userId: string, onRollback: (previousCount: number) => void) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: () => markNotificationsAsRead(userId),

//     // onError now receives the context passed from the component
//     onError: (_err, _variables, context: any) => {
//       onRollback(context?.previousCount || 0);
//       toast.error("Failed to update notifications");
//     },

//     onSuccess: () => {
//       toast.success("Notifications marked as read");
//       queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
//     }
//   });
// };

// hooks/useMarkNotificationsAsRead.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationsAsRead } from "@/components/notifications/actions";
import { toast } from "sonner";

/**
 * Bulk mutation: marks ALL unread notifications as read for `userId`.
 *
 * onRollback is called with the previous unread count so the bell
 * component can restore the badge if the server call fails.
 *
 * On success we intentionally do NOT show a toast — the bell badge
 * clearing is feedback enough.
 */
export function useMarkNotificationsAsRead(
  userId: string,
  onRollback: (previousCount: number) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markNotificationsAsRead(userId),

    onError: (_err, _variables, context: any) => {
      // Restore the badge count via the callback
      onRollback(context?.previousCount ?? 0);
      toast.error("Failed to update notifications. Please try again.");
    },

    onSuccess: () => {
      // Sync the notifications list cache so is_read flags update in the UI
      queryClient.invalidateQueries({
        queryKey: ["notifications", userId],
      });
    },
  });
}