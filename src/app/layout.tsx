import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import MainNavigation from "@/components/navigation/main-navigation";
import { Toaster } from "sonner";
import QueryProvider from "./providers";
import { NotificationProvider } from "@/context/NotificationContext";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/constants";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  // metadataBase makes all relative image paths absolute
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME} — Where Great Writing Lives`,
  },

  description: SITE_DESCRIPTION,

  // Canonical authors reference
  authors: [{ name: SITE_NAME, url: SITE_URL }],

  // Controls how search engines crawl and index by default.
  // Private pages (dashboard, profile) override this with noindex.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },

  // Open Graph defaults — pages override title/description
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
  },

  // Twitter Card defaults
  twitter: {
    card: "summary",
    site: SITE_NAME,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <NotificationProvider>
               <Suspense fallback={<div>Loading...</div>}>
              <MainNavigation>{children}</MainNavigation>
              </Suspense>
            </NotificationProvider>
            <Toaster position='top-right' />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
