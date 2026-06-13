"use client";

import { supabase } from "@/lib/supabase/client";
import { useTransition, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRoute } from "@/lib/routes";
import { AuthHeader } from "@/components/auth/auth-header";
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons";
import { AuthFeedback } from "@/components/auth/auth-feedback";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import {
  handleSignInAction,
  handleSignUpAction,
} from "@/components/auth/action";

interface ActionState {
  success: boolean;
  error?: string;
}

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");

  const [signInState, setSignInState] = useState<ActionState | null>(null);
  const [signUpState, setSignUpState] = useState<ActionState | null>(null);
  const [isSignInPending, startSignInTransition] = useTransition();
  const [isSignUpPending, startSignUpTransition] = useTransition();

  const [showSignInSuccess, setShowSignInSuccess] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);

  const [errorKey, setErrorKey] = useState(0);

  const loginPanelRef = useRef<HTMLDivElement>(null);
  const registerPanelRef = useRef<HTMLDivElement>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clears the auto-dismiss timer to prevent stale closures from
  // hiding feedback that was just made visible by a new event
  const resetFeedbackTimer = () => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setIsFeedbackVisible(true);
    feedbackTimerRef.current = setTimeout(() => {
      setIsFeedbackVisible(false);
    }, 5000);
  };

  // Sign in dispatch — manually calls server action and updates local state
  const dispatchSignIn = (formData: FormData) => {
    startSignInTransition(async () => {
      const result = await handleSignInAction(null, formData);
      setSignInState(result);
      if (result.error) {
        setErrorKey((k) => k + 1);
      }
    });
  };

  // Sign up dispatch — manually calls server action and updates local state
  const dispatchSignUp = (formData: FormData) => {
    startSignUpTransition(async () => {
      const result = await handleSignUpAction(null, formData);
      setSignUpState(result);
      if (result.error) {
        setErrorKey((k) => k + 1);
      }
    });
  };

  // OAuth social login
  const handleSocialLogin = async (provider: "github") => {
    try {
      setSocialLoading(true);
      setSocialError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      setSocialError(error.message || `${provider} authentication failed.`);
      setSocialLoading(false);
    }
  };

  // Success redirect
  useEffect(() => {
    if (signInState?.success) {
      setShowSignInSuccess(true);
      const redirectTimer = setTimeout(() => {
        window.location.href = getRoute("dashboard");
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [signInState]);

  // Tab-scoped error — only the active tab's error is ever surfaced.
  // Since we now control state manually, we can also hard-reset the
  // other tab's state on switch, so this is a true clean slate.
  const activeError =
    activeTab === "login"
      ? socialError || signInState?.error || null
      : signUpState?.error || null;

  // Feedback visibility — errorKey ensures re-runs on identical error strings
  useEffect(() => {
    if (signUpState?.success || showSignInSuccess || activeError) {
      resetFeedbackTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signUpState?.success, showSignInSuccess, activeError, errorKey]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsFeedbackVisible(false);
    setSocialError(null);

    // This is now possible because we own the state directly.
    // Completely wipe the state of the tab we are leaving
    // so it can never bleed into the newly active tab.
    if (value === "register") {
      setSignInState(null);
    } else {
      setSignUpState(null);
    }

    requestAnimationFrame(() => {
      if (value === "login") {
        loginPanelRef.current?.focus();
      } else {
        registerPanelRef.current?.focus();
      }
    });
  };

  const anyPending =
    isSignInPending || isSignUpPending || showSignInSuccess || socialLoading;

  return (
    <>
      <a
        href='#auth-form'
        className='
          sr-only focus:not-sr-only
          focus:fixed focus:top-4 focus:left-4 focus:z-50
          focus:px-4 focus:py-2 focus:rounded-lg
          focus:bg-brand-primary focus:text-white
          focus:text-sm focus:font-bold
          focus:shadow-lg focus:outline-none
          focus-visible:ring-2 focus-visible:ring-white
        '>
        Skip to sign in form
      </a>

      <main
        className='min-h-[80vh] flex items-center justify-center px-4'
        aria-label='Authentication'>
        <Card className='w-full max-w-md bg-white border-slate-200/80 shadow-md overflow-hidden max-h-[90vh]'>
          <AuthHeader />

          <CardContent
            id='auth-form'
            className='p-6 space-y-4 overflow-y-auto'
            tabIndex={-1}>
            {activeTab === "login" && (
              <div className='space-y-4'>
                <SocialAuthButtons
                  onSocialLogin={handleSocialLogin}
                  disabled={anyPending}
                />
                <div
                  className='relative flex items-center justify-center my-2'
                  role='separator'
                  aria-hidden='true'>
                  <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t border-slate-200' />
                  </div>
                  <span className='relative bg-white px-3 text-xs font-bold tracking-wider uppercase text-text-muted-accessible'>
                    Or continue with
                  </span>
                </div>
              </div>
            )}

            <Tabs
              defaultValue='login'
              onValueChange={handleTabChange}
              className='w-full space-y-4'>
              <TabsList
                className='grid grid-cols-2 
                bg-slate-100
                 rounded-xl border border-slate-200/40 pb-8'
                aria-label='Authentication options'>
                <TabsTrigger
                  value='login'
                  className='
                    rounded-lg text-xs font-bold py-2
                    data-[state=active]:bg-white
                    data-[state=active]:text-brand-primary
                    data-[state=active]:shadow-sm
                    focus-visible:ring-2 focus-visible:ring-brand-primary
                    focus-visible:ring-offset-1
                 '>
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value='register'
                  className='
                    rounded-lg text-xs font-bold py-2
                    data-[state=active]:bg-white
                    data-[state=active]:text-brand-primary
                    data-[state=active]:shadow-sm
                    focus-visible:ring-2 focus-visible:ring-brand-primary
                    focus-visible:ring-offset-1
                  '>
                  Create Account
                </TabsTrigger>
              </TabsList>

              <AuthFeedback
                activeError={activeError}
                showSignInSuccess={showSignInSuccess}
                signUpSuccess={signUpState?.success}
                isVisible={isFeedbackVisible}
              />

              <TabsContent value='login'>
                <div ref={loginPanelRef} tabIndex={-1} className='outline-none'>
                  <SignInForm
                    dispatch={dispatchSignIn}
                    pending={anyPending}
                    showSuccess={showSignInSuccess}
                    isPending={isSignInPending}
                    onForgot={() => router.push("/forgot-password")}
                  />
                </div>
              </TabsContent>

              <TabsContent value='register'>
                <div
                  ref={registerPanelRef}
                  tabIndex={-1}
                  className='outline-none'>
                  <SignUpForm
                    dispatch={dispatchSignUp}
                    pending={anyPending}
                    isPending={isSignUpPending}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
