/**
 * metadata.ts
 *
 * All Open Graph, Twitter Card, JSON-LD, and canonical URL
 * construction lives here. No UI logic. No side effects.
 * Pure functions that accept data and return metadata objects.
 */

import type { Metadata } from "next";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/constants";
import type { Post } from "@/types";

// ─────────────────────────────────────────────
// SECTION 1: URL Builders
// ─────────────────────────────────────────────

/**
 * Builds the absolute canonical URL for a post reading page.
 * SITE_URL already has no trailing slash (enforced in constants).
 */
export function buildPostCanonicalUrl(postId: string): string {
  return `${SITE_URL}/new-post/${postId}`;
}

/**
 * Builds the absolute canonical URL for the discovery page.
 */
export function buildDiscoveryCanonicalUrl(): string {
  return `${SITE_URL}/discovery`;
}

/**
 * Builds the absolute canonical URL for the profile page.
 */
export function buildProfileCanonicalUrl(): string {
  return `${SITE_URL}/profile`;
}

// ─────────────────────────────────────────────
// SECTION 2: Description Builder
// ─────────────────────────────────────────────

/**
 * Extracts a clean plain-text description from raw post content.
 *
 * Strips leading/trailing whitespace then truncates at the last
 * word boundary before maxLength so we never publish a half-word
 * in a social share preview.
 */
export function buildPostMetaDescription(
  content: string,
  maxLength = 160
): string {
  const source = content.trim();

  if (source.length <= maxLength) return source;

  return source.slice(0, maxLength).replace(/\s+\S*$/, "").concat("…");
}

// ─────────────────────────────────────────────
// SECTION 3: Page-Level Metadata Builders
// ─────────────────────────────────────────────

/**
 * Builds metadata for the homepage (auth/landing page).
 * Static — no data fetching required.
 */
export function buildHomepageMeta(): Metadata {
  const canonicalUrl = SITE_URL;

  return {
    title: `${SITE_NAME} — Where Great Writing Lives`,
    description: SITE_DESCRIPTION,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: `${SITE_NAME} — Where Great Writing Lives`,
      description: SITE_DESCRIPTION,
    },

    twitter: {
      card: "summary",
      title: `${SITE_NAME} — Where Great Writing Lives`,
      description: SITE_DESCRIPTION,
    },
  };
}

/**
 * Builds metadata for the discovery page.
 * Static — content is dynamic but the page identity is fixed.
 */
export function buildDiscoveryMeta(): Metadata {
  const title = `Discover Stories | ${SITE_NAME}`;
  const description =
    "Explore the latest stories, perspectives, and ideas from " +
    "creators everywhere. Find content tailored to your interests.";
  const canonicalUrl = buildDiscoveryCanonicalUrl();

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title,
      description,
    },

    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

/**
 * Builds metadata for the user profile page.
 *
 * Profile is behind authentication — we noindex it to prevent
 * Google from indexing a logged-out redirect or partial state.
 * When public author profiles ship, this will accept a Profile
 * argument and become indexable.
 */
export function buildProfileMeta(): Metadata {
  const title = `My Profile | ${SITE_NAME}`;
  const description = "Manage your Chatter profile, bio, and social links.";

  return {
    title,
    description,

    // Private page — keep out of search indexes
    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Builds metadata for the dashboard page.
 * Private — always noindex. Analytics data must never appear in search.
 */
export function buildDashboardMeta(): Metadata {
  return {
    title: `Creator Dashboard | ${SITE_NAME}`,
    description: "Track your post performance, views, and reader engagement.",

    robots: {
      index: false,
      follow: false,
    },
  };
}

/**
 * Builds the complete Open Graph and Twitter Card metadata object
 * for a single post reading page.
 *
 * Each field maps directly to a specific meta tag that social
 * platforms and search engines consume.
 */
export function buildPostMeta(post: Post): Metadata {
  const authorName = post.profiles?.name ?? "Anonymous";
  const canonicalUrl = buildPostCanonicalUrl(post.id);
  const description = buildPostMetaDescription(post.content);

  return {
    title: `${post.title} | ${SITE_NAME}`,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      type: "article",
      url: canonicalUrl,
      siteName: SITE_NAME,
      title: post.title,
      description,
      publishedTime: post.created_at,
      authors: [authorName],
      tags: post.tags ?? [],
    },

    twitter: {
      // "summary" — no cover image column on posts yet.
      // Upgrade to "summary_large_image" when cover images ship.
      card: "summary",
      title: post.title,
      description,
    },
  };
}

// ─────────────────────────────────────────────
// SECTION 4: JSON-LD Structured Data
// ─────────────────────────────────────────────

/**
 * Builds a JSON-LD Article schema object for a post page.
 *
 * Google uses this to render rich results (author, date, headline)
 * directly in search — higher click-through than plain blue links.
 *
 * Injected via <script type="application/ld+json"> in the page,
 * NOT via the Next.js Metadata API (which does not support JSON-LD).
 */
export function buildPostJsonLd(post: Post): string {
  const authorName = post.profiles?.name ?? "Anonymous";
  const canonicalUrl = buildPostCanonicalUrl(post.id);
  const description = buildPostMetaDescription(post.content);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    datePublished: post.created_at ?? new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    keywords: post.tags?.join(", ") ?? "",
  };

  // JSON.stringify with spacing — easier to inspect in DevTools
  return JSON.stringify(schema, null, 2);
}