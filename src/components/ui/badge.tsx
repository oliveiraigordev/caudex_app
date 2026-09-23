import { cn } from "@/lib/utils";

const styles = {
  default: "bg-[#f3e0d8] text-[#7a3d32]",
  success: "bg-emerald-100 text-emerald-900",
  warning: "bg-amber-100 text-amber-900",
  muted: "bg-stone-100 text-stone-600",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof styles;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        styles[variant],
        className,
      )}
      {...props}
    />
  );
}
