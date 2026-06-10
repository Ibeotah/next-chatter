import {
  ChartComparisonData,
  Comment,
  CommentNode,
  DailyAnalytics,
} from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatName = (name: string | null | undefined) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// this function is used to identify which comment/(s) are replies to a particular comment. Its entire job is to look at the parent_id of every comment. If it sees that Comment B has a parent_id that matches the id of Comment A, the function knows Comment B is a reply. It then literally picks up Comment B and places it inside Comment A's replies array.
/**
 * Transforms flat comments array into a nested tree structure (2 levels max)
 * @param flatComments - Array of comments from database (with optional parent_id)
 * @returns Array of root comments with nested replies
 */
export function buildCommentTree(flatComments: Comment[]): CommentNode[] {
  // Use Record<string, CommentNode> so TS knows this object uses strings for keys and CommentNodes for values
  const commentMap: Record<string, CommentNode> = {};

  // Explicitly type the array so it's not any[]
  const rootComments: CommentNode[] = [];

  // Step 1: Put all comments in a map by their ID and add a 'replies' array
  flatComments.forEach((comment) => {
    commentMap[comment.id] = { ...comment, replies: [] };
  });

  // Step 2: Loop through again to assign replies to their parents
  flatComments.forEach((comment) => {
    if (comment.parent_id) {
      // If it has a parent_id, push it into the parent's replies array
      if (commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
      }
    } else {
      // If no parent_id, it's a top-level comment
      rootComments.push(commentMap[comment.id]);
    }
  });

  return rootComments;
}

/**
 * Splits 14 days of data into last 7 and previous 7 days
 */
export function splitTimeRanges(data: DailyAnalytics[]): {
  last7Days: DailyAnalytics[];
  previous7Days: DailyAnalytics[];
} {
  if (data.length !== 14) {
    console.warn(`Expected 14 days, got ${data.length}`);
  }

  return {
    previous7Days: data.slice(0, 7),
    last7Days: data.slice(7, 14),
  };
}

/**
 * Aggregates data for comparison bar chart
 */
export function aggregateForComparison(
  data: DailyAnalytics[],
): ChartComparisonData[] {
  const { last7Days, previous7Days } = splitTimeRanges(data);

  const sumMetric = (
    days: DailyAnalytics[],
    key: keyof DailyAnalytics,
  ): number => {
    return days.reduce((sum, day) => {
      const value = day[key];
      return sum + (typeof value === "number" ? value : 0);
    }, 0);
  };

  return [
    {
      metric: "Views",
      current: sumMetric(last7Days, "views_count"),
      previous: sumMetric(previous7Days, "views_count"),
    },
    {
      metric: "Unique Readers",
      current: sumMetric(last7Days, "unique_readers_count"),
      previous: sumMetric(previous7Days, "unique_readers_count"),
    },
    {
      metric: "Likes",
      current: sumMetric(last7Days, "likes_count"),
      previous: sumMetric(previous7Days, "likes_count"),
    },
    {
      metric: "Comments",
      current: sumMetric(last7Days, "comments_count"),
      previous: sumMetric(previous7Days, "comments_count"),
    },
    {
      metric: "Bookmarks",
      current: sumMetric(last7Days, "bookmarks_count"),
      previous: sumMetric(previous7Days, "bookmarks_count"),
    },
  ];
}

/**
 * Formats date for chart display
 */
export function formatChartDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/**
 * Checks if analytics data has any engagement
 */
export function hasAnyEngagement(data: DailyAnalytics[]): boolean {
  return data.some(
    (day) =>
      day.views_count > 0 ||
      day.likes_count > 0 ||
      day.comments_count > 0 ||
      day.bookmarks_count > 0,
  );
}
