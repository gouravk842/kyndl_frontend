import * as React from "react";

import { cn } from "@/lib/utils";

interface AuthFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  /** Optional element rendered on the label row's right side (e.g. a link). */
  action?: React.ReactNode;
}

/**
 * Underline-only field for the letter-sheet auth forms — a warm ink line that
 * deepens on focus, matching the vintage-stationery look. Works with
 * react-hook-form via `{...register(name)}` (ref + name flow through).
 */
export const AuthField = React.forwardRef<HTMLInputElement, AuthFieldProps>(
  function AuthField({ label, error, action, className, id, ...props }, ref) {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <label
            htmlFor={id}
            className="text-[13px] font-medium tracking-wide text-[#6f5c51]"
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
            "kyndl-input-underline mt-1.5 w-full pb-1.5 text-[15px] text-[#3A2A25] placeholder:text-[#bcab99]",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-[12.5px] text-[#c0392b]">{error}</p>
        )}
      </div>
    );
  },
);
