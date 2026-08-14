import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: LucideIcon;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {value.toLocaleString()}
          </p>

          {description && (
            <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}