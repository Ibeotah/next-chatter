import { CornerDownRight, Heart, MessageSquare } from "lucide-react";
import { NotificationItem } from "@/types";

const successMessages = {
  draft: "Draft saved successfully!",
  published: "Post published successfully!",
  archived: "Post archived successfully!",
};

export { successMessages };

export const PREDEFINED_TAGS = [
  "Technology",
  "Productivity",
  "Life Lessons",
  "Programming",
  "Design",
  "Entrepreneurship",
  "Writing",
  "Personal Growth",
] as const;

export const SITE_NAME = "Chatter";

/**
 * Absolute base URL — no trailing slash, ever.
 * Falls back to localhost during development.
 * Swap NEXT_PUBLIC_SITE_URL in .env for production.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

export const SITE_DESCRIPTION =
  "A professional publishing network for long-form content creators. " +
  "Read, write, and discover ideas that matter.";


 export const TYPE_META = {
  like: {
    Icon: Heart,
    label: "liked your post",
    iconClass: "text-rose-500",
  },
  comment: {
    Icon: MessageSquare,
    label: "commented on your post",
    iconClass: "text-brand-primary",
  },
  reply: {
    Icon: CornerDownRight,
    label: "replied to your comment",
    iconClass: "text-violet-500",
  },
} as const satisfies Record<
  NotificationItem["type"],
  { Icon: React.ElementType; label: string; iconClass: string }
>;