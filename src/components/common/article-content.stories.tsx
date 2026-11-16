import type { Meta, StoryObj } from "@storybook/react";
import { ArticleContent } from "./article-content";

const meta = {
  title: "Community/Article content",
  component: ArticleContent,
  tags: ["autodocs"],
  args: {
    article: {
      slug: "preview-article",
      title: "Example story — preview only",
      summary: "Not a published article.",
      author: "Preview author",
      status: "draft",
      permissionConfirmed: false,
      updatedAt: "2026-11-16T00:00:00Z",
      blocks: [
        { type: "heading", text: "Example section" },
        {
          type: "paragraph",
          text: "Literal <b>text</b> stays text, not markup.",
        },
        { type: "list", items: ["First example item", "Second example item"] },
      ],
      sources: [
        {
          label: "Visit the community",
          url: "https://www.reddit.com/r/bangalorebikes/",
        },
      ],
    },
  },
} satisfies Meta<typeof ArticleContent>;
export default meta;
type Story = StoryObj<typeof meta>;
export const StructuredStory: Story = {};
