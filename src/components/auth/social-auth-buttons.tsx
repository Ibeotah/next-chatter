import { Button } from "@/components/ui/button";

export const SocialAuthButtons = ({
  onSocialLogin,
  disabled,
}: {
  onSocialLogin: (p: "github") => void;
  disabled: boolean;
}) => (
  <div
    className='grid grid-cols-1 gap-3 w-full'
    role='group'
    aria-label='Social authentication options'>
    <Button
      type='button'
      variant='outline'
      onClick={() => onSocialLogin("github")}
      disabled={disabled}
      aria-label='Continue with GitHub'
      className='
        w-full flex items-center justify-center gap-2
        h-10 rounded-xl
        border-slate-400
        text-slate-700 font-bold text-xs
        bg-white hover:bg-slate-50
        shadow-sm cursor-pointer
        transition-all
        focus-visible:ring-2 focus-visible:ring-brand-primary
        focus-visible:ring-offset-1
      '>
      <svg
        className='h-4 w-4 fill-current text-slate-800'
        viewBox='0 0 16 16'
        aria-hidden='true'
        focusable='false'>
        <path
          fillRule='evenodd'
          d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
             0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
             -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
             .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15
             -.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0
             1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56
             .82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0
             1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'
        />
      </svg>
      <span>GitHub</span>
    </Button>
  </div>
);
