/* Route-level Suspense boundary. Server component — zero JS shipped. */
export default function NewPostLoading() {
  return (
    <div
      className='max-w-4xl mx-auto space-y-6 px-4 sm:px-6 lg:px-0'
      aria-busy='true'>
      {/* EditorHeader skeleton */}
      <div className='h-16 bg-slate-100 animate-pulse rounded-xl' />

      {/* Editor + sidebar skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
        <div className='lg:col-span-2 h-[420px] bg-slate-100 animate-pulse rounded-xl' />
        <div className='h-72 bg-slate-100 animate-pulse rounded-xl' />
      </div>

      {/* Management skeleton */}
      <div className='border-t border-slate-200 pt-12 space-y-6'>
        <div className='h-8 w-64 bg-slate-200 animate-pulse rounded-md' />
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className='h-64 bg-slate-100 animate-pulse rounded-xl'
            />
          ))}
        </div>
      </div>

      <p className='sr-only' role='status'>
        Loading the post workspace, please wait…
      </p>
    </div>
  );
}
