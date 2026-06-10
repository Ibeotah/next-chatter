
// hooks/useMarkNotificationsAsRead.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationsAsRead } from "@/components/notifications/actions";
import { toast } from "sonner";

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
