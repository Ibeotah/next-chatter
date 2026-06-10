"use client";

import { useRouter } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatName, getInitials } from "@/lib/utils";
import { TYPE_META } from "@/constants";
import type { NotificationItem } from "@/types";

interface NotificationRowProps {
  notification: NotificationItem;
  onRead: (id: string) => void;
  onClose: () => void;
}

/**
 * Routing rules (confirmed by product):
 *
 *  like   → Mark as read ONLY. No navigation.
 *            Likes tell you someone appreciated your post — the
 *            post is already yours, navigating there adds no value.
 *
 *  comment → Mark as read + navigate to /posts/${post_id}
 *  reply   → Mark as read + navigate to /posts/${post_id}
 */
export function NotificationRow({
  notification,
  onRead,
  onClose,
}: NotificationRowProps) {
  const router = useRouter();

  const meta = TYPE_META[notification.type] ?? TYPE_META.like;
  const { Icon, label, iconClass } = meta;

  const sender = notification.sender;

  // formatName: "john doe" → "John Doe"
  const displayName = formatName(sender?.name) || "Someone";

  // getInitials: "John Doe" → "JD" — different utility, both needed
  const initials = getInitials(sender?.name);

  const postTitle = notification.post?.title?.trim() || "a post";

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  // ── Routing decision ────────────────────────────────────────────────────
  const isLike = notification.type === "like";

  /**
   * handleClick
   *
   * For LIKE:
   *   - Mark as read (if unread)
   *   - Do NOT navigate — close panel and stay on current page
   *
   * For COMMENT / REPLY:
   *   - Mark as read (if unread)
   *   - Navigate to the post
   *   - Close panel
   */
  const handleClick = () => {
    // Always mark as read when clicked (if not already read)
    if (!notification.is_read) {
      onRead(notification.id);
    }

    if (isLike) {
      // Like: close the panel, stay on page
      onClose();
      return;
    }

    // Comment / reply: navigate then close
    router.push(`/new-post/${notification.post_id}`);
    onClose();
  };

  // ── Accessible label ────────────────────────────────────────────────────
  const ariaLabel = isLike
    ? `${displayName} ${label}: "${postTitle}", ${timeAgo}${notification.is_read ? "" : " — unread"}. Click to mark as read.`
    : `${displayName} ${label}: "${postTitle}", ${timeAgo}${notification.is_read ? "" : " — unread"}. Click to view post.`;

  // ── Whether to show the external link affordance ────────────────────────
  // Only comment and reply navigate somewhere — likes do not
  const showExternalLinkIcon = !isLike;

  return (
    <li>
      <button
        type='button'
        onClick={handleClick}
        aria-label={ariaLabel}
        className={cn(
          // Full-width button so the entire row is clickable
          "w-full text-left",
          "flex items-start gap-3 px-4 py-3",
          "transition-colors duration-150",
          "hover:bg-slate-50",
          // WCAG 2.1 AA keyboard focus
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-primary",
          // Unread background tint
          !notification.is_read && "bg-blue-50/50",
        )}>
        {/* ── Unread dot
            brand-primary on white ≥ 3:1 ✅ (UI component threshold) */}
        <span
          aria-hidden='true'
          className={cn(
            "mt-2 h-2 w-2 shrink-0 rounded-full transition-colors",
            notification.is_read ? "bg-transparent" : "bg-brand-primary",
          )}
        />

        {/* ── Sender avatar ── */}
        <Avatar className='h-8 w-8 shrink-0'>
          <AvatarImage
            src={sender?.avatar_url ?? undefined}
            alt={displayName}
          />
          <AvatarFallback className='text-[10px] bg-slate-100 text-slate-700 font-bold'>
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* ── Text ── */}
        <div className='min-w-0 flex-1'>
          <p className='text-sm text-slate-800 leading-snug'>
            {/* slate-800 on white = 10.7:1 ✅ AAA */}
            <span className='font-semibold'>{displayName}</span>{" "}
            {/* slate-600 on white = 5.9:1 ✅ AA */}
            <span className='text-slate-600'>{label} </span>
            <span className='font-medium line-clamp-1'>
              &ldquo;{postTitle}&rdquo;
            </span>
          </p>

          <div className='mt-1 flex items-center gap-1.5'>
            <Icon
              className={cn("h-3 w-3 shrink-0", iconClass)}
              aria-hidden='true'
            />
            {/* text-text-muted-accessible token ≥ 4.5:1 ✅ AA */}
            <time
              dateTime={notification.created_at}
              className='text-xs text-text-muted-accessible'>
              {timeAgo}
            </time>
          </div>

          {/* Like-specific helper text so user knows no navigation happens */}
          {isLike && !notification.is_read && (
            <p className='mt-1 text-[10px] text-text-muted-accessible'>
              Tap to mark as read
            </p>
          )}
        </div>

        {/* External link icon — only for comment/reply */}
        {showExternalLinkIcon && (
          <ExternalLink
            className='h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5'
            aria-hidden='true'
          />
        )}
      </button>
    </li>
  );
}
