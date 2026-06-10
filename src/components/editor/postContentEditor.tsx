import {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
  useId,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown } from "tiptap-markdown";
import { usePostManager } from "@/hooks/usePostManager";
import { useEditPost } from "@/components/editor/posts/usePostActions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading1,
  Heading2,
  Code,
  List,
  ListOrdered,
  Image as ImageIcon,
  CloudUpload,
  LucideIcon,
  Save,
  FileText,
  Archive,
  X,
} from "lucide-react";
import {
  AutosaveStatus,
  EditingPost,
  PostStatus,
  UseTagsReturn,
} from "@/types";

type PostContentEditorProps = Omit<UseTagsReturn, "toggleTag"> & {
  onContentChange: (text: string) => void;
  onStatusChange: (status: AutosaveStatus) => void;
  editingPost: EditingPost;
  onEditComplete: () => void;
};

export const PostContentEditor = ({
  selectedTags,
  setSelectedTags,
  onContentChange,
  onStatusChange,
  editingPost,
  onEditComplete,
}: PostContentEditorProps) => {
  const [title, setTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleLabelId = useId();
  const isEditMode = !!editingPost;

  const editor = useEditor({
    extensions: [StarterKit, Image, Markdown],
    content: "", // ✅ no fake placeholder content — was triggering false autosaves
    immediatelyRender: false,
    onCreate: ({ editor }) => onContentChange(editor.getText()),
    onUpdate: ({ editor }) => onContentChange(editor.getText()),
  });

  // ── Load post into editor when entering edit mode / reset on exit ──
  useEffect(() => {
    if (!editor) return;

    if (editingPost) {
      setTitle(editingPost.title);
      editor.commands.setContent(editingPost.content);
      onContentChange(editor.getText());
    } else {
      setTitle("");
      editor.commands.setContent("");
      onContentChange("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingPost, editor]);

  // Pass isEditMode so usePostManager skips localStorage draft logic while editing
  const { uploading, progress, handleImageUpload, savePost, autosaveStatus } =
    usePostManager(editor, title, setTitle, setSelectedTags, isEditMode);

  const { editPost, isUpdating } = useEditPost();

  useEffect(() => {
    if (autosaveStatus) onStatusChange(autosaveStatus as AutosaveStatus);
  }, [autosaveStatus, onStatusChange]);

  // ── Single save handler: UPDATE in edit mode, INSERT otherwise ──
  const handleSave = useCallback(
    (status: PostStatus) => {
      if (isEditMode && editingPost) {
        const content =
          (editor?.storage as any)?.markdown?.getMarkdown?.() || "";
        if (!content.trim() || !title.trim()) return;

        editPost(
          {
            postId: editingPost.id,
            title,
            content,
            tags: selectedTags,
            status,
          },
          { onSuccess: () => onEditComplete() },
        );
      } else {
        savePost(title, true, status, selectedTags);
      }
    },
    [
      isEditMode,
      editingPost,
      editor,
      title,
      selectedTags,
      editPost,
      savePost,
      onEditComplete,
    ],
  );

  const TOOLBAR_ITEMS = useMemo(() => {
    if (!editor) return [];
    return [
      {
        icon: Bold,
        label: "Bold",
        action: () => editor.chain().focus().toggleBold().run(),
        active: editor.isActive("bold"),
      },
      {
        icon: Italic,
        label: "Italic",
        action: () => editor.chain().focus().toggleItalic().run(),
        active: editor.isActive("italic"),
      },
      {
        icon: UnderlineIcon,
        label: "Underline",
        action: () => editor.chain().focus().toggleMark("underline").run(),
        active: editor.isActive("underline"),
      },
      { type: "divider" as const },
      {
        icon: Heading1,
        label: "Heading 1",
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
      },
      {
        icon: Heading2,
        label: "Heading 2",
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
      },
      { type: "divider" as const },
      {
        icon: Code,
        label: "Inline code",
        action: () => editor.chain().focus().toggleCode().run(),
        active: editor.isActive("code"),
      },
      {
        icon: List,
        label: "Bullet list",
        action: () => editor.chain().focus().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        icon: ListOrdered,
        label: "Numbered list",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
    ];
  }, [editor]);

  if (!editor) return null;

  const isBusy = isUpdating;

  return (
    <Card className='bg-white border-slate-200/80 shadow-sm overflow-hidden'>
      <CardContent className='p-4 sm:p-6 space-y-4'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4'>
          <label id={titleLabelId} className='sr-only'>
            Post title
          </label>
          <Input
            id='post-title-input' /* focus target from page.tsx */
            aria-labelledby={titleLabelId}
            aria-required='true'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter your story title here...'
            className='border-none px-0 text-2xl font-black placeholder:text-slate-400'
            /* placeholder slate-400 → 3.07:1; ≥18px text → 3:1 large-text rule ✅ */
          />
          <span
            role='status'
            aria-live='polite'
            className='shrink-0 text-xs font-semibold uppercase text-text-muted-accessible'>
            {autosaveStatus === "saving" && "Saving…"}
            {autosaveStatus === "saved" && "Saved"}
            {autosaveStatus === "error" && "Autosave failed"}
          </span>
        </div>

        <div className='border border-slate-300 rounded-lg overflow-hidden bg-slate-50/50'>
          <div
            role='toolbar'
            aria-label='Text formatting and post actions'
            className='bg-slate-50 border-b border-slate-300 p-1.5 flex flex-wrap items-center justify-between gap-1'>
            <div className='flex items-center gap-1 flex-wrap'>
              {TOOLBAR_ITEMS.map((item, idx) => {
                if (item.type === "divider") {
                  return (
                    <div
                      key={`div-${idx}`}
                      role='separator'
                      aria-orientation='vertical'
                      className='h-4 w-px bg-slate-300 mx-1'
                    />
                  );
                }
                const Icon = item.icon as LucideIcon;
                return (
                  <Button
                    key={item.label}
                    variant='ghost'
                    size='icon'
                    aria-label={item.label}
                    aria-pressed={item.active}
                    className={`h-8 w-8 focus-visible:ring-2 focus-visible:ring-brand-primary ${
                      item.active
                        ? "bg-slate-200 text-slate-900"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={item.action}>
                    <Icon className='h-4 w-4' aria-hidden='true' />
                  </Button>
                );
              })}
              <input
                type='file'
                accept='image/*'
                ref={fileInputRef}
                onChange={(e) =>
                  e.target.files && handleImageUpload(e.target.files[0])
                }
                className='hidden'
                tabIndex={-1}
                aria-hidden='true'
              />
              <Button
                variant='ghost'
                size='icon'
                aria-label='Upload an image'
                onClick={() => fileInputRef.current?.click()}
                className='focus-visible:ring-2 focus-visible:ring-brand-primary'>
                <ImageIcon
                  className='h-4 w-4 text-brand-primary'
                  aria-hidden='true'
                />
              </Button>
            </div>

            <div
              className='flex items-center gap-2 flex-wrap w-full sm:w-auto'
              role='group'
              aria-label='Save actions'>
              {isEditMode && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={onEditComplete}
                  aria-label='Cancel editing'
                  className='text-slate-700 hover:bg-slate-100 cursor-pointer'>
                  {/* slate-700 → 10.3:1 ✅ */}
                  <X className='mr-2 h-4 w-4' aria-hidden='true' /> Cancel
                </Button>
              )}
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleSave("draft")}
                disabled={isBusy}
                className='border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary'>
                <FileText className='mr-2 h-4 w-4' aria-hidden='true' />
                {isEditMode ? "Update Draft" : "Save Draft"}
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleSave("archived")}
                disabled={isBusy}
                className='border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-amber-600'>
                <Archive className='mr-2 h-4 w-4' aria-hidden='true' /> Archive
              </Button>
              <Button
                onClick={() => handleSave("published")}
                disabled={isBusy}
                size='sm'
                aria-busy={isBusy}
                className='bg-brand-primary hover:bg-brand-primary-hover text-white cursor-pointer focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2'>
                <Save className='mr-2 h-4 w-4' aria-hidden='true' />
                {isUpdating
                  ? "Updating…"
                  : isEditMode
                    ? "Update & Publish"
                    : "Publish"}
              </Button>
            </div>
          </div>

          {uploading && (
            <div
              role='status'
              aria-live='polite'
              className='bg-blue-50/50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between'>
              <span className='text-xs font-semibold text-brand-primary flex items-center gap-2'>
                <CloudUpload className='h-3.5 w-3.5' aria-hidden='true' />{" "}
                Uploading…
              </span>
              <Progress
                value={progress}
                className='w-32'
                aria-label={`Upload ${progress}% complete`}
              />
            </div>
          )}

          <EditorContent
            editor={editor}
            aria-label='Post content'
            className='prose max-w-none p-4 min-h-[200px]'
          />
        </div>
      </CardContent>
    </Card>
  );
};
