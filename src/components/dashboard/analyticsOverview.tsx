import { PostAnalytics } from "@/types";

interface OverviewProps {
  analytics: PostAnalytics[];
}

export function AnalyticsOverview({ analytics }: OverviewProps) {
  // Aggregate totals across all posts safely using numeric conversion
  const totals = analytics.reduce(
    (acc, item) => {
      acc.views += Number(item.views_count || 0);
      acc.readers += Number(item.unique_readers_count || 0);
      acc.likes += Number(item.likes_count || 0);
      return acc;
    },
    { views: 0, readers: 0, likes: 0 },
  );

  const statCards = [
    { id: "total-views", label: "Total Views", value: totals.views },
    { id: "unique-readers", label: "Unique Readers", value: totals.readers },
    { id: "total-likes", label: "Total Engagement Likes", value: totals.likes },
  ];

  return (
    <section
      className='grid grid-cols-1 gap-5 sm:grid-cols-3'
      aria-label='Overall Platform Performance Summary'>
      {statCards.map((card) => (
        <div
          key={card.id}
          className='rounded-xl border border-zinc-200 bg-white p-6 shadow-xs transition-shadow hover:shadow-md'>
          <p className='text-sm font-medium text-zinc-500'>{card.label}</p>
          <p className='mt-2 text-3xl font-bold tracking-tight text-zinc-900 tabular-nums'>
            {card.value.toLocaleString()}
          </p>
        </div>
      ))}
    </section>
  );
}
