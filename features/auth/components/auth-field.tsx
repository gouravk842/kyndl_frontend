import * as React from "react";

import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  action?: React.ReactNode;
}

export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, action, className, id, ...props }, ref) {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={id}
            className="text-[13px] font-medium text-[#7A6258]"
          >
            {label}
          </label>
          {action}
        </div>
        <input
          id={id}
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={cn(
            "mt-1 h-10 w-full rounded-2xl border border-[#F2DACE] bg-[#FFF7F1] px-3.5 text-[15px] text-[#3A2A25] placeholder:text-[#bcab99] transition-colors",
            "outline-none focus-visible:border-[#FF7A59]/50 focus-visible:ring-2 focus-visible:ring-[#F2596F]/25",
            "aria-invalid:border-[#d7263d] aria-invalid:ring-2 aria-invalid:ring-[#d7263d]/15",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1.5 text-[12.5px] text-[#d7263d]">{error}</p>
        ) : null}
      </div>
    );
  },
);
