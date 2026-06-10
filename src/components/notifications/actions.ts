
"use server";

import { createClient } from "@/lib/supabase/server";

// ─────────────────────────────────────────────────────────────────────────────
// Mark ALL unread notifications as read for a given user.
// Called when the bell is opened (bulk optimistic reset in the bell component).
// RLS: "Authenticated Users can update their own notifications" — UPDATE policy
// ─────────────────────────────────────────────────────────────────────────────
export async function markNotificationsAsRead(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId) // RLS also enforces this, but we send it anyway
    .eq("is_read", false); // Only touch rows that are actually unread

  if (error) {
    throw new Error(`markNotificationsAsRead: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark a SINGLE notification as read by its primary key.
// Called when the user clicks an individual notification row in the dropdown.
// RLS: UPDATE policy guards this — the user can only update their own rows.
// ─────────────────────────────────────────────────────────────────────────────
export async function markSingleNotificationAsRead(
  notificationId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);
  // RLS automatically restricts this to the authenticated user's own rows

  if (error) {
    throw new Error(`markSingleNotificationAsRead: ${error.message}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch the 20 most recent notifications for a user.
//
// JOIN strategy (using confirmed FK constraint names from Supabase):
//   sender  → profiles via  notifications_sender_id_fkey
//   post    → posts    via  notifications_post_id_fkey
//
// RLS: "Authenticated Users can view their own notifications" — SELECT policy
// ─────────────────────────────────────────────────────────────────────────────
export async function fetchNotifications(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notifications")
    .select(
      `
      id,
      created_at,
      user_id,
      sender_id,
      post_id,
      type,
      is_read,
      sender:profiles!notifications_sender_id_fkey (
        name,
        username,
        avatar_url
      ),
      post:posts!notifications_post_id_fkey (
        title
      )
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`fetchNotifications: ${error.message}`);
  }

  // `data` is typed by Supabase as the raw join result.
  // We cast it to our clean NotificationItem[] in the hook layer.
  return data;
}
