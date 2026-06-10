import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";
import { Profile } from "@/types";

export const useProfile = () => {
  const { user, profile, refreshProfile } = useAuth(); // Grab data from context

  const updateMutation = useMutation({
    mutationFn: async (updatedData: Profile) => {
      const { id, created_at, ...dataToUpdate } = updatedData;
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          id: user!.id, // Ensure the row is linked to this Auth user ID
          ...dataToUpdate, // Spread the form fields
        })
        .eq("id", user!.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await refreshProfile();
    },
  });

  return {
    profile,
    isLoading: !profile && !!user,
    updateProfile: updateMutation.mutateAsync,
  };
};
