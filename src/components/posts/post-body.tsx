import { collectHeadings } from "@/lib/markdown/toc";

/**
 * The body HTML was sanitised once at submit time, so this component only adds
 * layout: a sticky contents rail on desktop and a disclosure on mobile. The
 * heading ids come from the same rendered HTML, so every link resolves.
 */
export function PostBody({ html }: { html: string }) {
  const headings = collectHeadings(html).filter((heading) => heading.level === 2 || heading.level === 3);

  return (
    <div className="gap-12 lg:grid lg:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0">
        {headings.length > 2 && (
          <details className="mb-6 rounded-lg border bg-muted/40 p-4 lg:hidden">
            <summary className="cursor-pointer text-sm font-medium">On this page</summary>
            <ul className="mt-3 space-y-2 text-sm">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                  <a className="underline underline-offset-4" href={`#${heading.id}`}>
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div
          className="post-body max-w-[68ch]"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>

      {headings.length > 2 && (
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              On this page
            </p>
            <ul className="space-y-2 border-l pl-4 text-sm">
              {headings.map((heading) => (
                <li key={heading.id} className={heading.level === 3 ? "pl-3 text-muted-foreground" : ""}>
                  <a
                    className="underline-offset-4 hover:underline"
                    href={`#${heading.id}`}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}
    </div>
  );
}
