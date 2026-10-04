import * as React from "react"
import { cn } from "@/lib/utils"

function Label({
  className,
  requiredMark,
  children,
  ...props
}: React.ComponentProps<"label"> & { requiredMark?: boolean }) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {requiredMark ? (
        <span className="text-destructive" aria-hidden="true">
          *
        </span>
      ) : null}
    </label>
  )
}

export { Label }
