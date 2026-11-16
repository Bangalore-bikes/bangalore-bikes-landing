import type { CommunityResource } from "@/lib/resourceSchema";
import { resourceCorrectionUrl } from "@/lib/community";

export function CommunityResources({
  resources,
}: {
  resources: readonly CommunityResource[];
}) {
  return (
    <ul className="divide-y divide-border">
      {resources.map((resource) => (
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
          <p className="mt-2 text-sm text-muted-foreground">
            Source checked{" "}
            <time dateTime={resource.sourceCheckedOn}>
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeZone: "Asia/Kolkata",
              }).format(new Date(resource.sourceCheckedOn + "T00:00:00Z"))}
            </time>
          </p>
          <a
            className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4"
            href={resourceCorrectionUrl(resource.title, resource.url)}
            aria-label={"Suggest a correction for " + resource.title}
          >
            Suggest a correction via modmail
          </a>
        </li>
      ))}
    </ul>
  );
}
