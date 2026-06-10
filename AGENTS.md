# Chatter - Project Specifications & Rules

## Project Overview

Multi-functional publishing platform for writers and readers (Alternative to Medium/Hashnode). Text-first content focus, social engagement, personalized discovery, and creator analytics.

## Tech Stack

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend/Database: Supabase (Postgres, Realtime, Storage, Edge Functions)

---

## 1. Core Engineering & Feature Requirements

### Registration & Authentication

- Supabase Auth: Email/password + Google & GitHub OAuth.
- Guarded Routes: Enforce Next.js Middleware/Auth Context route protection.
- Database Security: Strict Row Level Security (RLS) policies on all Supabase tables to enforce data ownership.
- User Profiles: Avatar image uploads (Supabase Storage), bios, social link matrices, and follower counts.
- Password Resets: Built-in magic link flow via Supabase.

### Content Creation & Editor

- Editor Workspace: Rich Markdown editor using Tiptap or react-md-editor with full text formatting toolbar.
- Media Handling: Direct image uploads from editor to Supabase Storage with active progress indicator tracking.
- Database State: Save posts as raw Markdown; render sanitized HTML in reader view.
- Autosave Pipeline: Automatically background-save drafts to Supabase every 30 seconds with a visible "Saving..." / "Saved" UI feedback indicator.
- Post States: Strict state machine transitions: `Draft` ➔ `Published` ➔ `Archived`.
- Taxonomy: Max 5 tags per post from a predefined global taxonomy list.
- Metadata metrics: Display calculated reading time on post cards and header nodes based on word count.

### Content Discovery & Feed

- Algorithmic Feed: Personalized chronology ranked by user's followed tags and authors.
- Global Search: Full-text search using Supabase `pg_trgm` extension over Title, Body, and Tags.
- Feed Navigation: Infinite scroll or cursor-based pagination for timeline feeds without page reloads.
- Sidebar: "Trending Posts" column displaying top articles ranked by views over a rolling 24-hour window.

### Social Features & Real-time Engagement

- Interactivity: Action bar for Likes, Bookmarks, and Follow/Unfollow toggles.
- Comments Matrix: 2-Level deeply nested comment trees (Parent ➔ Sub-reply). Max depth capped strictly at 2 levels.
- Real-time Sync: Use Supabase Realtime channels to append new comments instantly without page refreshes.
- Global Notifications: High-contrast notification bell icon tracking unread counts for new likes, replies, or follows.

### Creator Analytics Dashboard

- Metric Matrix: KPI blocks tracking Views, Unique Readers, Likes, Comments, and Bookmarks.
- Tracking Pipeline: Views captured via background Supabase Edge Function calls.
- Visualization: Interactive Recharts line and bar graph layouts mapping metric trends.
- Comparative Lookbacks: High-level dashboard tracking must display comparative performance shifts: "Last 7 days vs Previous 7 days".

---

## 2. Accessibility, Design & SEO Constraints

- Layout Blueprint: Follow a strict clean grid style optimized for high readability.
- Accessibility: Fully compliant with WCAG 2.1 AA contrast standards and complete keyboard tab-navigation focus control.
- Semantic Markup: Enforce strict semantic tags throughout components (`<article>`, `<aside>`, `<nav>`, `<section>`).
- SEO Management: Dynamic Open Graph (OG) and Twitter Card metadata tags injected dynamically per post route.
