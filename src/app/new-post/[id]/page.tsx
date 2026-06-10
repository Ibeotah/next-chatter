import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById } from "./actions";
import CommentSection from "@/components/comments/commentSection";
import TrackPostView from "@/components/analytics/trackPostView";
import { buildPostMeta, buildPostJsonLd } from "@/lib/metadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);

  console.log("Generating metadata for post:", post?.title); // Should appear in terminal

  if (!post) {
    return {
      title: "Post Not Found",
      description: "This post could not be found on Chatter.",
    };
  }

  const meta = buildPostMeta(post);
  console.log("Built metadata:", meta.openGraph?.title); // Should show the title

  return meta;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <main className='max-w-4xl mx-auto px-4 py-10'>
      {/*
        JSON-LD structured data — tells Google this is an Article,
        who wrote it, and when it was published.
        dangerouslySetInnerHTML is the correct pattern here:
        JSON-LD must be a raw <script> tag, not escaped JSX text.
      */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: buildPostJsonLd(post) }}
      />

      <TrackPostView postId={post.id} />

      <Link
        href='/discovery'
        className='text-blue-600 hover:underline text-sm font-medium mb-6 inline-block'>
        &larr; Back to Discovery
      </Link>

      <article className='bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-12'>
        <div className='flex items-center gap-3 mb-6'>
          {post.profiles?.avatar_url ? (
            <img
              src={post.profiles.avatar_url}
              alt={`${post.profiles.name || "Anonymous"}'s avatar`}
              className='w-9 h-9 rounded-full object-cover'
            />
          ) : (
            <div className='w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold uppercase text-xs'>
              {post.profiles?.name?.[0] || "A"}
            </div>
          )}

          <div>
            <h3 className='font-semibold text-gray-900 leading-none mb-1'>
              {post.profiles?.name || "Anonymous"}
            </h3>
            <p className='text-xs text-gray-500'>
              @{post.profiles?.username || "user"}
            </p>
          </div>
        </div>

        <h1 className='text-3xl font-bold text-gray-900 tracking-tight mb-4'>
          {post.title}
        </h1>

        <div className='flex flex-wrap gap-2 mb-8'>
          {post.tags?.map((tag) => (
            <span
              key={tag}
              className='px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium'>
              #{tag}
            </span>
          ))}
        </div>

        <div className='prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap'>
          {post.content}
        </div>
      </article>

      <section className='max-w-4xl mx-auto px-4'>
        <h2 className='text-2xl font-bold text-gray-900 mb-6'>Comments</h2>
        <CommentSection postId={post.id} />
      </section>
    </main>
  );
}
