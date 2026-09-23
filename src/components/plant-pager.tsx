import Link from "next/link";
import { cn } from "@/lib/utils";

type Neighbor = { id: string; code: string };

const arrowBtn =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg font-medium text-[#c45c4a] transition hover:bg-stone-100 active:scale-95";

export function PlantPager({
  prev,
  next,
  currentCode,
}: {
  prev: Neighbor | null;
  next: Neighbor | null;
  currentCode: string;
}) {
  return (
    <nav
      className="inline-flex items-center gap-2 rounded-2xl border border-stone-200/80 bg-white/70 px-2 py-1 shadow-sm backdrop-blur-sm"
      aria-label="Navegar entre plantas"
    >
      {prev ? (
        <Link
          href={`/plantas/${prev.id}`}
          className={arrowBtn}
          aria-label="Planta anterior"
        >
          &lt;
        </Link>
      ) : (
        <span
          className={cn(
            arrowBtn,
            "cursor-not-allowed text-stone-300 hover:bg-transparent",
          )}
          aria-hidden
        >
          &lt;
        </span>
      )}

      <span
        className="min-w-[4.5rem] text-center font-mono text-sm font-semibold tabular-nums tracking-wide text-[#3d2c29] sm:text-base"
        aria-current="page"
      >
        {currentCode}
      </span>

      {next ? (
        <Link
          href={`/plantas/${next.id}`}
          className={arrowBtn}
          aria-label="Próxima planta"
        >
          &gt;
        </Link>
      ) : (
        <span
          className={cn(
            arrowBtn,
            "cursor-not-allowed text-stone-300 hover:bg-transparent",
          )}
          aria-hidden
        >
          &gt;
        </span>
      )}
    </nav>
  );
}
