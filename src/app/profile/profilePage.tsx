"use client";

import { lazy, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Edit3, LinkIcon, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { formatName, getInitials } from "@/lib/utils";
import { useProfileStats } from "@/hooks/useFollows";
import { ProfilePageSkeleton } from "@/components/profile/profile-page-skeleton";
import { ProfilePageError } from "@/components/profile/profile-page-error";

const EditProfileForm = lazy(() =>
  import("@/components/forms/EditProfileForm").then((m) => ({
    default: m.EditProfileForm,
  })),
);

export default function UserProfilePage() {
  const { profile, isLoading, updateProfile } = useProfile();
  const { data: stats, isLoading: isStatsLoading } = useProfileStats(
    profile?.id,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const editParam = searchParams.get("edit") === "true";
    if (isModalOpen !== editParam) {
      setIsModalOpen(editParam);
    }
  }, [searchParams]);

  const handleOpenChange = (open: boolean) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (open) {
      newParams.set("edit", "true");
    } else {
      newParams.delete("edit");
    }
    router.push(`?${newParams.toString()}`);
  };

  const handleUpdate = async (data: any) => {
    try {
      await updateProfile(data);
      toast.success("Profile updated successfully!");
      handleOpenChange(false);
    } catch {
      toast.error("Failed to update profile. Please try again.");
      setHasError(true);
    }
  };

  if (isLoading) return <ProfilePageSkeleton />;
  if (hasError) {
    return <ProfilePageError onRetry={() => setHasError(false)} />;
  }

  const displayName = formatName(profile?.name) || "New User";
  const avatarUrl = profile?.avatar_url?.trim() || undefined;

  return (
    <article
      className='max-w-4xl mx-auto space-y-6'
      aria-label={`${displayName}'s profile`}>
      <Card className='bg-white border-slate-200 shadow-sm overflow-hidden'>
        <div
          className='h-32 bg-gradient-to-r from-brand-primary to-blue-800 w-full'
          aria-hidden='true'
        />

        <CardContent className='p-6 relative'>
          <div className='flex items-end justify-between -mt-20 mb-6'>
            <Avatar className='h-24 w-24 border-4 border-white bg-white rounded-full shadow-sm'>
              <AvatarImage
                src={avatarUrl}
                alt={`${displayName}'s profile picture`}
              />
              <AvatarFallback className='text-lg font-bold bg-slate-100 text-slate-700'>
                 {profile?.name ? getInitials(profile.name) : "N/A"}
              </AvatarFallback>
            </Avatar>

            <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
              <Button
                variant='outline'
                size='sm'
                className='
                  border-slate-400 text-slate-700
                  hover:bg-slate-50 hover:border-slate-500
                  cursor-pointer
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-brand-primary
                  focus-visible:ring-offset-2
                  transition-colors
                '
                onClick={() => handleOpenChange(true)}
                aria-haspopup='dialog'
                aria-expanded={isModalOpen}>
                <Edit3 className='h-4 w-4 mr-2' aria-hidden='true' />
                Edit Profile
              </Button>

              <DialogContent className='flex flex-col max-h-[90vh] overflow-hidden'>
                <DialogHeader>
                  <DialogTitle className='text-slate-800 font-bold'>
                    Edit Profile
                  </DialogTitle>
                  <DialogDescription className='text-sm text-text-muted-accessible'>
                    Update your public profile information. Changes are visible
                    to all Chatter users.
                  </DialogDescription>
                </DialogHeader>

                <div className='overflow-y-auto pr-2 mt-2'>
                  <Suspense
                    fallback={
                      <div
                        className='space-y-4 py-4'
                        aria-busy='true'
                        aria-label='Loading edit form'
                        role='status'>
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-10 w-full' />
                        <Skeleton className='h-24 w-full' />
                        <Skeleton className='h-10 w-full' />
                      </div>
                    }>
                    <EditProfileForm
                      profile={profile}
                      onUpdate={handleUpdate}
                      onClose={() => handleOpenChange(false)}
                    />
                  </Suspense>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <section aria-label='Profile information' className='space-y-3'>
            <div>
              <h1 className='text-2xl font-black text-slate-800'>
                {displayName}
              </h1>
              {profile?.username && (
                <p className='text-sm text-text-muted-accessible mt-0.5'>
                  @{profile.username}
                </p>
              )}
            </div>

            <p className='text-sm text-slate-600 leading-relaxed'>
              {profile?.bio || (
                <span className='italic text-text-muted-accessible'>
                  No bio yet. Edit your profile to add one.
                </span>
              )}
            </p>

            <div className='flex flex-wrap items-center gap-x-6 gap-y-3 pt-1'>
              {profile?.location && (
                <div className='flex items-center gap-1.5'>
                  <MapPin
                    className='h-3.5 w-3.5 text-text-muted-accessible shrink-0'
                    aria-hidden='true'
                  />
                  <span className='text-xs text-text-muted-accessible'>
                    {profile.location}
                  </span>
                </div>
              )}

              {profile?.social_links && (
                <address className='not-italic'>
                  <a
                    href={
                      profile.social_links.startsWith("http")
                        ? profile.social_links
                        : `https://${profile.social_links}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                    className='
                      flex items-center gap-1.5
                      text-xs text-brand-primary font-medium
                      hover:underline
                      focus-visible:outline-none
                      focus-visible:ring-2 focus-visible:ring-brand-primary
                      focus-visible:ring-offset-1
                      rounded-sm
                    '
                    aria-label={`Visit social profile: ${profile.social_links}`}>
                    <LinkIcon
                      className='h-3.5 w-3.5 shrink-0'
                      aria-hidden='true'
                    />
                    Social Links
                  </a>
                </address>
              )}

              <dl className='flex gap-5'>
                <div className='flex items-center gap-1.5'>
                  <Users
                    className='h-3.5 w-3.5 text-text-muted-accessible'
                    aria-hidden='true'
                  />
                  <dt className='sr-only'>Followers</dt>
                  <dd className='text-sm font-bold text-slate-800'>
                    {isStatsLoading ? (
                      <Skeleton className='h-4 w-8 inline-block' />
                    ) : (
                      (stats?.followers ?? 0)
                    )}
                    <span className='text-xs font-normal text-text-muted-accessible ml-1'>
                      Followers
                    </span>
                  </dd>
                </div>

                <div className='flex items-center gap-1.5'>
                  <dt className='sr-only'>Following</dt>
                  <dd className='text-sm font-bold text-slate-800'>
                    {isStatsLoading ? (
                      <Skeleton className='h-4 w-8 inline-block' />
                    ) : (
                      (stats?.following ?? 0)
                    )}
                    <span className='text-xs font-normal text-text-muted-accessible ml-1'>
                      Following
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </section>
        </CardContent>
      </Card>
    </article>
  );
}
