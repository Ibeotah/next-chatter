import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalyticsOverview } from "@/components/dashboard/analyticsOverview";
import { PostAnalytics } from "@/types";

describe("AnalyticsOverview", () => {
  it("aggregates views, readers, and likes across multiple posts", () => {
    const analytics: PostAnalytics[] = [
      {
        post_id: "p1",
        title: "A",
        created_at: "2024-01-01",
        views_count: 120,
        unique_readers_count: 80,
        likes_count: 15,
        comments_count: 0,
        bookmarks_count: 0,
      },
      {
        post_id: "p2",
        title: "B",
        created_at: "2024-01-02",
        views_count: 380,
        unique_readers_count: 220,
        likes_count: 45,
        comments_count: 0,
        bookmarks_count: 0,
      },
    ];

    render(<AnalyticsOverview analytics={analytics} />);

    expect(screen.getByText("500")).toBeInTheDocument(); // views
    expect(screen.getByText("300")).toBeInTheDocument(); // readers
    expect(screen.getByText("60")).toBeInTheDocument(); // likes
  });

  it("formats large numbers with toLocaleString", () => {
    const analytics: PostAnalytics[] = [
      {
        post_id: "p1",
        title: "A",
        created_at: "",
        views_count: 1250,
        unique_readers_count: 0,
        likes_count: 0,
        comments_count: 0,
        bookmarks_count: 0,
      },
    ];

    render(<AnalyticsOverview analytics={analytics} />);
    expect(screen.getByText("1,250")).toBeInTheDocument();
  });

  it("coerces undefined or null counts to zero safely", () => {
    const analytics = [
      {
        post_id: "p1",
        title: "A",
        created_at: "",
        views_count: undefined,
        unique_readers_count: null,
        likes_count: 7,
        comments_count: 0,
        bookmarks_count: 0,
      },
    ] as any;

    render(<AnalyticsOverview analytics={analytics} />);

    const viewsCard = screen.getByText("Total Views").parentElement!;
    const readersCard = screen.getByText("Unique Readers").parentElement!;
    const likesCard = screen.getByText("Total Engagement Likes").parentElement!;

    expect(viewsCard).toHaveTextContent("0");
    expect(readersCard).toHaveTextContent("0");
    expect(likesCard).toHaveTextContent("7");
  });

  it("renders all zeros when the analytics array is empty", () => {
    render(<AnalyticsOverview analytics={[]} />);

    const viewsCard = screen.getByText("Total Views").parentElement!;
    const readersCard = screen.getByText("Unique Readers").parentElement!;
    const likesCard = screen.getByText("Total Engagement Likes").parentElement!;

    expect(viewsCard).toHaveTextContent("0");
    expect(readersCard).toHaveTextContent("0");
    expect(likesCard).toHaveTextContent("0");
  });

  it("renders accessible section with correct stat labels", () => {
    const analytics: PostAnalytics[] = [
      {
        post_id: "p1",
        title: "A",
        created_at: "",
        views_count: 9,
        unique_readers_count: 8,
        likes_count: 7,
        comments_count: 0,
        bookmarks_count: 0,
      },
    ];

    render(<AnalyticsOverview analytics={analytics} />);

    expect(
      screen.getByRole("region", {
        name: /Overall Platform Performance Summary/,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Total Views")).toBeInTheDocument();
    expect(screen.getByText("Unique Readers")).toBeInTheDocument();
    expect(screen.getByText("Total Engagement Likes")).toBeInTheDocument();
  });
});