import { communityResources } from "@/data/community-resources";

export function CommunityResources() {
  return (
    <ul className="divide-y divide-border">
      {communityResources.map((resource) => (
        <li key={resource.id} className="py-6 first:pt-0">
          <h3 className="text-xl font-semibold">
            <a
              className="underline decoration-border underline-offset-4 hover:decoration-current"
              href={resource.url}
            >
              {resource.title}
            </a>
          </h3>
          <p className="mt-3 max-w-prose leading-relaxed text-muted-foreground">
            {resource.summary}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {resource.category} · {resource.sourceLabel}
          </p>
        </li>
      ))}
    </ul>
  );
}
