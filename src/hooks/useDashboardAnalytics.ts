import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase/client';
import { PostAnalytics } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner'; 

// We accept the user object directly, or pass a boolean check
export function useDashboardAnalytics(userExist: boolean) {
   
  return useQuery<PostAnalytics[], Error>({
    queryKey: ['dashboardAnalytics'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_creator_analytics');

      if (error) {
        toast.error(`Analytics Error: ${error.message}`);
        throw new Error(error.message);
      }

      return data || [];
    },
    // The query will only fire if userExist resolves to true (!!user)
    enabled: userExist,
    meta: {
      onError: (err: any) => {
        toast.error(err.message || 'Failed to load analytics data.');
      },
    },
  });
}