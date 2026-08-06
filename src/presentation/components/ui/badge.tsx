import * as React from "react";
import { cn } from "@/core/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "submitted"
    | "actively_filling_in"
    | "filling"
    | "inactive";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantClasses = {
      default: "border-transparent bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 shadow-sm",
      secondary: "border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
      destructive: "border-transparent bg-red-500 text-slate-50 dark:bg-red-900 dark:text-slate-50 shadow-sm",
      outline: "text-slate-950 dark:text-slate-50 border-slate-300 dark:border-slate-700",
      submitted: "border-emerald-300 dark:border-emerald-800 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-semibold shadow-sm",
      actively_filling_in: "border-blue-300 dark:border-blue-800 bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-semibold shadow-sm",
      filling: "border-blue-300 dark:border-blue-800 bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 font-semibold shadow-sm",
      inactive: "border-slate-300 dark:border-slate-700 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 font-medium",
    }[variant];

    const isFilling = variant === "actively_filling_in" || variant === "filling";

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 select-none",
          variantClasses,
          className
        )}
        {...props}
      >
        {isFilling && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
        {children}
      </div>
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
