import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-zinc-600">{description}</p>
      )}
    </div>
  );
}
