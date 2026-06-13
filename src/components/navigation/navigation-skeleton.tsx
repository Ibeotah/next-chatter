export function NavigationSkeleton() {
  return (
    <div className='flex min-h-screen w-full bg-slate-50' aria-hidden='true'>
      {/* Desktop Sidebar Skeleton */}
      <div className='hidden md:flex flex-col shrink-0 sticky top-0 h-screen bg-slate-900 md:w-20 lg:w-64 border-r border-slate-800 p-4 justify-between animate-pulse'>
        <div className='space-y-6'>
          {/* Logo Placeholder */}
          <div className='h-8 w-8 lg:w-32 bg-slate-800 rounded-lg mx-auto lg:mx-0' />
          {/* Nav Items Placeholders */}
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-10 w-full bg-slate-800 rounded-lg' />
            ))}
          </div>
        </div>
        {/* Footer/Signout Placeholder */}
        <div className='h-10 w-full bg-slate-800 rounded-lg' />
      </div>

      {/* Main Content Area Wrapper */}
      <div className='flex-1 flex flex-col min-w-0'>
        {/* Mobile Header Skeleton (Hidden on Desktop) */}
        <div className='md:hidden sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-4 py-3 h-[57px] flex items-center justify-between'>
          <div className='h-6 w-24 bg-slate-200 rounded animate-pulse' />
          <div className='h-8 w-8 bg-slate-200 rounded-full animate-pulse' />
        </div>

        {/* Desktop Topbar Skeleton */}
        <div className='hidden md:flex h-20 bg-white border-b border-slate-200/80 items-center px-8 justify-between animate-pulse'>
          <div className='h-10 w-64 bg-slate-100 rounded-lg' />
          <div className='h-8 w-8 bg-slate-200 rounded-full' />
        </div>

        {/* Content Body Canvas Skeleton */}
        <div className='flex-1 p-4 md:p-8 space-y-6 animate-pulse'>
          <div className='h-8 w-1/4 bg-slate-200 rounded' />
          <div className='space-y-3'>
            <div className='h-4 w-full bg-slate-200 rounded' />
            <div className='h-4 w-5/6 bg-slate-200 rounded' />
            <div className='h-4 w-4/5 bg-slate-200 rounded' />
          </div>
          <div className='h-48 w-full bg-slate-200 rounded-xl' />
        </div>
      </div>
    </div>
  );
}
