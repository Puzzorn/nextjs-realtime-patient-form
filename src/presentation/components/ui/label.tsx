import * as React from "react";
import { cn } from "@/core/utils/cn";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium text-slate-700 dark:text-slate-300 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none inline-flex items-center gap-1",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 font-bold ml-0.5">*</span>}
    </label>
  )
);
Label.displayName = "Label";

export { Label };
