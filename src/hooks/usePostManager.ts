"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Editor } from "@tiptap/react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { AutosaveStatus, PostStatus } from "@/types";
import { successMessages } from "@/constants";
import { useAuth } from "@/context/auth-context";

export const usePostManager = (
  editor?: Editor | null,
  title?: string,
  setTitle?: React.Dispatch<React.SetStateAction<string>>,
  setSelectedTags?: React.Dispatch<React.SetStateAction<string[]>>,
  isEditing: boolean = false,
) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>("idle");
  const { user } = useAuth();

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!editor) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Please upload an image smaller than 5MB.");
        return;
      }
      setUploading(true);
      setProgress(20);

      try {
        const fileName = `${crypto.randomUUID()}.${file.name.split(".").pop()}`;
        setProgress(50);

        const { error } = await supabase.storage
          .from("posts")
          .upload(`uploads/${fileName}`, file);
        if (error) throw error;

        const { data } = supabase.storage
          .from("posts")
          .getPublicUrl(`uploads/${fileName}`);
        editor.chain().focus().setImage({ src: data.publicUrl }).run();
        setProgress(100);
      } catch {
        toast.error("Image upload failed. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  const resetEditor = useCallback(() => {
    if (!editor) return;
    editor.commands.setContent("");
  }, [editor]);

  const lastSavedContent = useRef<string>("");

  const savePost = useCallback(
    async (
      currentTitle: string,
      isManual = false,
      status: PostStatus,
      tags: string[],
    ) => {
      if (!editor) return;

      const content = (editor.storage as any).markdown?.getMarkdown?.() || "";

      if (!content.trim()) return;

      setAutosaveStatus("saving");

      try {
        if (!user) {
          toast.error("You must be logged in to save.");
          setAutosaveStatus("idle");
          return;
        }

        const { error: dbError } = await supabase.from("posts").insert({
          title: currentTitle,
          content,
          author_id: user.id,
          status,
          tags,
        });

        if (dbError) throw dbError;

        lastSavedContent.current = content;
        setAutosaveStatus("saved");

        localStorage.removeItem("chatter_draft_title");
        localStorage.removeItem("chatter_draft_content");

        if (isManual) {
          setTitle?.("");
          resetEditor();
          setSelectedTags?.([]);
          toast.success(
            successMessages[status] || "Action completed successfully!",
          );
        }

        setTimeout(() => setAutosaveStatus("idle"), 3000);
      } catch (err: any) {
        setAutosaveStatus("error");

        if (err?.code === "23503") {
          toast.warning(
            "Almost ready! Please finish setting up your profile (add your name) before you can publish your first post.",
            { duration: 6000 },
          );
          return;
        }

        // All other failures — toast only, no console in production.
        toast.error(
          err?.message || "An unexpected error occurred while saving.",
        );
      }
    },
    [editor, resetEditor, user],
  );

  useEffect(() => {
    if (!editor || isEditing) return;

    const savedTitle = localStorage.getItem("chatter_draft_title");
    const savedContent = localStorage.getItem("chatter_draft_content");

    if (savedTitle) setTitle?.(savedTitle);
    if (savedContent) editor.commands.setContent(savedContent);
  }, [editor, isEditing]);

  // Persist draft to localStorage on every change.
  // Skipped when editing an existing post.
  useEffect(() => {
    if (!editor || isEditing) return;

    const handleUpdate = () => {
      const content = (editor.storage as any).markdown.getMarkdown();
      localStorage.setItem("chatter_draft_title", title ?? "");
      localStorage.setItem("chatter_draft_content", content);
    };

    editor.on("update", handleUpdate);
    handleUpdate();

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, title, isEditing]);

  return {
    uploading,
    progress,
    handleImageUpload,
    savePost,
    autosaveStatus,
  };
};
