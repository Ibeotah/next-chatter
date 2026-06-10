import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";


export function ProfilePageSkeleton() {
  return (
    <div
      className='max-w-4xl mx-auto space-y-6'
      aria-busy='true'
      aria-label='Loading profile'
      role='status'
    >
      <Card className='bg-white border-slate-200 shadow-sm overflow-hidden'>
        {/* Banner skeleton */}
        <Skeleton
          className='h-32 w-full rounded-none'
          aria-hidden='true'
        />

        <CardContent className='p-6'>
          <div className='flex items-end justify-between -mt-20 mb-6'>
            {/* Avatar skeleton */}
            <Skeleton
              className='h-24 w-24 rounded-full border-4 border-white'
              aria-hidden='true'
            />
            {/* Edit button skeleton */}
            <Skeleton
              className='h-9 w-28 rounded-md'
              aria-hidden='true'
            />
          </div>

          <div className='space-y-3'>
            {/* Name */}
            <Skeleton
              className='h-7 w-48'
              aria-hidden='true'
            />
            {/* Username */}
            <Skeleton
              className='h-4 w-32'
              aria-hidden='true'
            />
            {/* Bio line 1 */}
            <Skeleton
              className='h-4 w-full max-w-sm'
              aria-hidden='true'
            />
            {/* Bio line 2 */}
            <Skeleton
              className='h-4 w-full max-w-xs'
              aria-hidden='true'
            />
            {/* Stats row */}
            <div className='flex gap-4 pt-1' aria-hidden='true'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-24' />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}