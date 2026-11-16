interface SearchableResource {
  title: string;
  summary: string;
  category: string;
}

export function filterResources<T extends SearchableResource>(
  resources: readonly T[],
  query: string,
  category: string,
): T[] {
  const terms = query
    .trim()
    .toLocaleLowerCase("en")
    .split(/\s+/)
    .filter(Boolean);
  return resources.filter((resource) => {
    const text = [resource.title, resource.summary, resource.category]
      .join(" ")
      .toLocaleLowerCase("en");
    return (
      (category === "All" || resource.category === category) &&
      terms.every((term) => text.includes(term))
    );
  });
}
