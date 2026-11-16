import type { CommunityArticle } from "@/lib/articleSchema";

export function ArticleContent({ article }: { article: CommunityArticle }) {
  return (
    <div className="max-w-prose space-y-6 leading-relaxed">
      {article.blocks.map((block, index) => {
        if (block.type === "heading")
          return (
            <h2 key={index} className="pt-4 text-2xl font-semibold">
              {block.text}
            </h2>
          );
        if (block.type === "list")
          return (
            <ul key={index} className="list-disc space-y-2 pl-6">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        return (
          <p key={index} className="whitespace-pre-line">
            {block.text}
          </p>
        );
      })}
      {article.sources.length > 0 && (
        <section
          aria-labelledby="article-sources-title"
          className="border-t border-border pt-6"
        >
          <h2 id="article-sources-title" className="text-xl font-semibold">
            Sources and further reading
          </h2>
          <ul className="mt-4 space-y-3">
            {article.sources.map((source, index) => (
              <li key={index}>
                <a className="underline underline-offset-4" href={source.url}>
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
