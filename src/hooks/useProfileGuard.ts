"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";

export function useProfileGuard() {
    const { user, profile, loading } = useAuth();
    const router = useRouter();

    const isProfileComplete: boolean | null = loading
        ? null
        : !!user && !!profile?.name?.trim();

    const requireProfile = (): boolean => {
        if (loading) return false;

        if (!user) {
            toast.error("Please sign in to continue.");
            return false;
        }

        if (!profile?.name?.trim()) {
            toast.warning(
                "Complete your profile before interacting with content.",
                {
                    duration: 5000,
                    action: {
                        label: "Set up profile",
                        onClick: () => router.push(ROUTES.profile),
                    },
                },
            );
            return false;
        }

        return true;
    };

    return {
        requireProfile,
        isProfileComplete,
        isAuthLoading: loading,
    };
}
