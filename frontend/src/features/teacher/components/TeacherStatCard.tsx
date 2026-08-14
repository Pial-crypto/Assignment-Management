import type { LucideIcon } from "lucide-react";

interface TeacherStatCardProps {
  title: string;
  value: number;
  description?: string;
  icon?: LucideIcon;
}

export function TeacherStatCard({
  title,
  value,
  description,
  icon: Icon,
}: TeacherStatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-slate-200/60 sm:p-6">
      {/* Decorative Accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-500 opacity-80" />

      <div className="flex items-start justify-between gap-4">
        {/* Content */}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {value.toLocaleString()}
          </p>

          {description && (
            <p className="mt-2 max-w-[220px] text-xs leading-5 text-slate-500 sm:text-sm">
              {description}
            </p>
          )}
        </div>

        {/* Icon */}
        {Icon && (
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-all duration-200 group-hover:scale-105 group-hover:bg-indigo-100 group-hover:text-indigo-700 sm:h-12 sm:w-12">
            <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />

            <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-indigo-600/10" />
          </div>
        )}
      </div>

      {/* Bottom Indicator */}
      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

        <span className="text-[11px] font-medium text-slate-400 sm:text-xs">
          Current overview
        </span>
      </div>
    </div>
  );
}