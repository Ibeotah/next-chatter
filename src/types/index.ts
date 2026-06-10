// types/notifications.ts



export type NotificationType = "comment" | "like" | "reply";

export interface RawNotificationItem {
  id: string;
  created_at: string;
  user_id: string;
  sender_id: string;
  post_id: string;
  type: string; 
  is_read: boolean;
  sender: {
    name: string;
    username: string;
    avatar_url: string | null;
  }[] | null;
  post: {
    title: string;
  }[] | null;
}


export interface NotificationItem {
  id: string;
  created_at: string;
  user_id: string;
  sender_id: string;
  post_id: string;
  type: NotificationType;
  is_read: boolean;
  sender: {
    name: string;
    username: string;
    avatar_url: string | null;
  } | null;
  post: {
    title: string;
  } | null;
}

export interface Profile {
  id?: string;
  name: string;
  username?: string;
  bio?: string;
  avatar_url?: string | null;
  phone?: string;
  location?: string;
  social_links: string;
  created_at?: string;
  updated_at?: string;
}

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";
export type PostStatus = "draft" | "published" | "archived";

export type Post = {
  id: string; // uuid
  author_id: string; // uuid
  title: string;
  content: string;
  status: PostStatus;
  created_at?: string;
  tags?: string[];
  profiles?: {
    name: string;
    username?: string;
    avatar_url?: string | null;
  };
};
export type EditingPost =
  | Pick<Post, "id" | "title" | "content" | "status" | "tags">
  | null;

// 💡 1. Explicitly type what the database actually returns from this select query
export interface RawPostData {
  id: string;
  title: string;
  content: string;
  status: PostStatus;
  created_at?: string;
  author_id: string;
  tags?: string[];
  profiles?: {
    name: string;
    username?: string;
    avatar_url?: string | null;
  }[] | null; // Supabase joins always return an array of objects
}
export interface UseTagsReturn {
  selectedTags: string[];
  toggleTag: (tagName: string) => void;
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}

// The shape of the raw comment from Supabase
export interface Comment {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  // Optional: Include the joined user data if you are fetching it
  profiles?: {
    name: string;
    username?: string;
    avatar_url: string;
  };
}

// The shape of the comment once we add the nested replies array
export interface CommentNode extends Comment {
  replies: CommentNode[];
}

export interface PostAnalytics {
  post_id: string;
  title: string;
  created_at: string;
  views_count: number;
  unique_readers_count: number;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
}

export interface DailyAnalytics {
  date: string;
  views_count: number;
  unique_readers_count: number;
  likes_count: number;
  comments_count: number;
  bookmarks_count: number;
}

// NEW: Add this type for chart data aggregation
export interface ChartComparisonData {
  metric: string;
  current: number;
  previous: number;
}





