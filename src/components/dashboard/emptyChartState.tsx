import { TrendingUp } from 'lucide-react';

interface EmptyChartStateProps {
  message: string;
  description?: string;
}

export function EmptyChartState({ message, description }: EmptyChartStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-zinc-200 rounded-xl bg-white">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
        <TrendingUp className="w-6 h-6 text-zinc-400" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900">{message}</h3>
      {description && (
        <p className="text-sm text-zinc-500 mt-2 max-w-sm text-center">{description}</p>
      )}
    </div>
  );
}