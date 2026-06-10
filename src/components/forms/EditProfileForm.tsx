'use client'

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this Shadcn component
import { ImagePlus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Profile } from "@/types";
import { toast } from "sonner";
export const EditProfileForm = ({ profile, onUpdate, onClose }: any) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: profile });

  const avatarUrl =
    watch("avatar_url") ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile?.name || "User")}`;

  const onSubmit = async (data: Profile) => {
    // 1. Create a payload containing only the fields
    const payload: Profile = {
      name: data.name,
      username: data.username,
      bio: data.bio,
      avatar_url: data.avatar_url,
      phone: data.phone,
      location: data.location,
      social_links: data.social_links,
    };

    // 2. Prevent duplicate information:
    // Check if every field in the payload matches the existing profile data
    const isUnchanged = Object.keys(payload).every(
      (key) => payload[key as keyof Profile] === profile[key as keyof Profile],
    );

    if (isUnchanged) {
      toast.info("No changes detected.");
      onClose(); 
      return;
    }

    // 3. Submit to Supabase
    // If onUpdate fails, it will throw, which the parent will catch.
    await onUpdate(payload);

    // Only reached if onUpdate succeeds
    reset();
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`; // Unique name

      // 1. Upload
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);

      // 3. Update Form
      setValue("avatar_url", data.publicUrl);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      {/* Full Name */}
      <div className='space-y-1.5'>
        <Label htmlFor='name' className='text-xs font-bold text-slate-700'>
          Full Name *
        </Label>
        <Input
          id='name'
          {...register("name", { required: "Full name is required" })}
          placeholder='Isa Muhammad'
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className='text-xs text-red-500'>
            {errors.name.message as string}
          </p>
        )}
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='username' className='text-xs font-bold text-slate-700'>
          Username
        </Label>
        <Input
          id='username'
          {...register("username")}
          placeholder='IMuhammed'
        />
      </div>

      {/* Phone Number */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='edit-phone'
          className='text-xs font-bold text-slate-700'>
          Phone Number
        </Label>
        <Input
          id='edit-phone'
          {...register("phone")}
          placeholder='+234 801 234 5678'
        />
      </div>

      {/* Location */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='edit-location'
          className='text-xs font-bold text-slate-700'>
          Location
        </Label>
        <Input
          id='edit-location'
          {...register("location")}
          placeholder='Lagos, Nigeria'
        />
      </div>

      {/* Social Links */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='edit-social'
          className='text-xs font-bold text-slate-700'>
          Social Links *
        </Label>
        <Input
          id='edit-social'
          {...register("social_links", { required: "Social link is required" })}
          placeholder='https://twitter.com/...'
          className={errors.social_links ? "border-red-500" : ""}
        />
        {errors.social_links && (
          <p className='text-xs text-red-500'>
            {errors.social_links.message as string}
          </p>
        )}
      </div>

      {/* Bio */}
      <div className='space-y-1.5'>
        <Label htmlFor='edit-bio' className='text-xs font-bold text-slate-700'>
          About yourself
        </Label>
        <Textarea
          id='edit-bio'
          {...register("bio")}
          placeholder='Tell us a little bit about yourself...'
          className='min-h-[100px]'
        />
      </div>

      {/* Avatar Section */}
      <div className='flex items-center gap-4'>
        <img
          src={avatarUrl}
          alt='Profile'
          className='h-16 w-16 rounded-full border'
        />
        <div className='flex flex-col'>
          <Label
            htmlFor='avatar'
            className='cursor-pointer text-sm font-bold text-blue-600 flex items-center gap-1'>
            <ImagePlus className='h-4 w-4' /> Change Photo
          </Label>
          <Input
            id='avatar'
            type='file'
            className='hidden'
            onChange={handleFileChange}
            accept='image/*'
          />
        </div>
      </div>

      <Button
        type='submit'
        className='w-full cursor-pointer'
        disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Saving...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
};
