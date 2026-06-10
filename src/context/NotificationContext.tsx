"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNotificationSubscription } from "@/hooks/useNotificationSubscription";
import { useAuth } from "./auth-context";

// ─── Context shape ────────────────────────────────────────────────────────────

interface NotificationContextValue {
  /** Number of unread notifications — drives the bell badge. */
  unreadCount: number;
  /**
   * Setter exposed so the bell component can do an optimistic reset
   * (set to 0) when the panel opens, and roll back if the server call fails.
   */
  setUnreadCount: (value: number | ((prev: number) => number)) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const NotificationContext = createContext<NotificationContextValue>({
  unreadCount: 0,
  setUnreadCount: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // userId falls back to empty string — useNotificationSubscription
  // guards against empty userId and skips the subscription safely.
  const { unreadCount, setUnreadCount } = useNotificationSubscription(
    user?.id ?? "",
  );

  // Memoised to prevent unnecessary re-renders of every consumer
  const value = useMemo<NotificationContextValue>(
    () => ({ unreadCount, setUnreadCount }),
    [unreadCount, setUnreadCount],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useNotification(): NotificationContextValue {
  return useContext(NotificationContext);
}
