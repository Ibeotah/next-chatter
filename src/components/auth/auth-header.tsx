import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const AuthHeader = () => (
  <CardHeader className='space-y-1.5 text-center bg-slate-50/50 border-b border-slate-100 p-6'>
    <header className='flex flex-col items-center space-y-1.5'>
      <span
        aria-hidden='true'
        className='inline-flex items-center justify-center bg-brand-primary text-white font-black text-xl h-10 w-10 rounded-xl mb-2 shadow-sm'>
        C
      </span>

      <CardTitle className='text-xl font-black tracking-tight text-slate-800'>
        <h1>Welcome to Chatter</h1>
      </CardTitle>

      <CardDescription className='text-xs font-medium text-text-muted-accessible'>
        Join a global community of creators and readers.
      </CardDescription>
    </header>
  </CardHeader>
);
