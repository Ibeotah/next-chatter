import React from "react";
import { PostAnalytics } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableProps {
  analytics: PostAnalytics[];
}

export function PostMetricsTable({ analytics }: TableProps) {
  if (!analytics || analytics.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 py-16 px-4 text-center'>
        <p className='text-sm font-medium text-zinc-700'>
          No published articles found
        </p>
        <p className='text-xs text-zinc-500 mt-1'>
          Your dashboard performance data will appear here once you publish
          content.
        </p>
      </div>
    );
  }

  return (
    <div className='w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs'>
      <Table className='min-w-[800px]'>
        <TableHeader className='bg-zinc-50/75'>
          <TableRow>
            <TableHead className='font-medium text-zinc-600 uppercase text-xs tracking-wider max-w-xs sm:max-w-md'>
              Post Title
            </TableHead>
            <TableHead className='font-medium text-zinc-600 uppercase text-xs tracking-wider text-right'>
              Views
            </TableHead>
            <TableHead className='font-medium text-zinc-600 uppercase text-xs tracking-wider text-right'>
              Unique Readers
            </TableHead>
            <TableHead className='font-medium text-zinc-600 uppercase text-xs tracking-wider text-right'>
              Likes
            </TableHead>
            <TableHead className='font-medium text-zinc-600 uppercase text-xs tracking-wider text-right'>
              Comments
            </TableHead>
            <TableHead className='font-medium text-zinc-600 uppercase text-xs tracking-wider text-right'>
              Bookmarks
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-zinc-700'>
          {analytics.map((post) => (
            <TableRow
              key={post.post_id}
              className='hover:bg-zinc-50/75 transition-colors'>
              <TableCell className='font-medium text-zinc-900 max-w-xs sm:max-w-md truncate'>
                {post.title || "Untitled Article"}
              </TableCell>
              <TableCell className='text-right tabular-nums text-zinc-600'>
                {(post.views_count || 0).toLocaleString()}
              </TableCell>
              <TableCell className='text-right tabular-nums text-zinc-600'>
                {(post.unique_readers_count || 0).toLocaleString()}
              </TableCell>
              <TableCell className='text-right tabular-nums text-zinc-600'>
                {(post.likes_count || 0).toLocaleString()}
              </TableCell>
              <TableCell className='text-right tabular-nums text-zinc-600'>
                {(post.comments_count || 0).toLocaleString()}
              </TableCell>
              <TableCell className='text-right tabular-nums text-zinc-600'>
                {(post.bookmarks_count || 0).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
