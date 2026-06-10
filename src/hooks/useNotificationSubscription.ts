"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client"; // Import your singleton

// useNotificationSubscription checks how many unread notifications in the supabase server
// Realtime Subscription is used to get signals about a new like from the supabase server without refreshing your page to see the updates
export const useNotificationSubscription = (userId: string) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return; // Prevent subscription if no user

    const fetchInitialCount = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (!error) setUnreadCount(count || 0);
    };

    fetchInitialCount();

    // 1. Give the channel a unique name per user
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => setUnreadCount((prev) => prev + 1),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
        }
      });

    // 2. Ensure cleanup removes the specific channel
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { unreadCount, setUnreadCount };
};
