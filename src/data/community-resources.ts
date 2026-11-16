import content from "./resources.json";
import { publishedResources } from "@/lib/resourceSchema";

// Filter drafts on the server before passing content to interactive components.
export const communityResources = publishedResources(content);
