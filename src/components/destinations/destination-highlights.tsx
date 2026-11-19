import { Reveal } from "@/components/motion/reveal";
import { MONTH_NAMES } from "@/lib/destinations";

const FAR = 350; // km, the right edge of the gauge

/** Distance gauge and season strip. Both are drawn from the 2010 record, nothing else. */
export function DestinationHighlights({
  km,
  days,
  season,
}: {
  km: number | null;
  days: string;
  season: boolean[] | null;
}) {
  return (
    <Reveal className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_1.4fr]">
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Distance
        </p>
        <p className="mt-2 text-3xl font-bold tabular-nums">
          {km === null ? "Not recorded" : <>{km}<span className="ml-1 text-base font-medium text-muted-foreground">km</span></>}
        </p>
        {km !== null && (
          <div
            role="img"
            aria-label={`${km} kilometres on a scale to ${FAR}`}
            className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
          >
            <div
              className="bar-fill h-full rounded-full bg-dixie"
              style={{ width: `${Math.min(100, (km / FAR) * 100)}%` }}
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Trip length
        </p>
        <p className="mt-2 text-3xl font-bold">{days}</p>
        <p className="mt-4 text-sm text-muted-foreground">As the 2010 record states it.</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Best months in the record
        </p>
        {season ? (
          <ol className="mt-4 grid grid-cols-12 gap-1" aria-label="Months recommended in the source">
            {MONTH_NAMES.map((name, index) => (
              <li
                key={name}
                aria-label={`${name}: ${season[index] ? "recommended" : "not recommended"}`}
                className={`rounded-md py-2 text-center text-[10px] font-medium sm:text-xs ${
                  season[index] ? "bg-dixie text-black" : "bg-muted text-muted-foreground"
                }`}
              >
                {name.slice(0, 1)}
                <span className="sr-only">{name.slice(1)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">The record gives no months.</p>
        )}
      </div>
    </Reveal>
  );
}
