import { getTrendingPosts } from "@/components/discovery/actions";
import { toast } from "sonner";
import { useInfiniteQuery } from "@tanstack/react-query";


export function useTrendingPosts(searchQuery: string, activeTag: string) {
  return useInfiniteQuery({
    queryKey: ["posts", "trending", searchQuery, activeTag],
    queryFn: ({ pageParam }) => getTrendingPosts(searchQuery, activeTag, pageParam),
    initialPageParam: null as string | null,
    // 💡 This tells React Query which property to use as the next cursor
    getNextPageParam: (lastPage) => 
      lastPage.length > 0 ? lastPage[lastPage.length - 1].created_at : null,
  });
}
