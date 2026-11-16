import type { Meta, StoryObj } from "@storybook/react";
import { ResourceDirectory } from "./resource-directory";

const meta = {
  title: "Community/Resource directory",
  component: ResourceDirectory,
  tags: ["autodocs"],
  args: {
    entries: [
      {
        id: "example-community",
        title: "Example community notice",
        category: "Community",
        summary:
          "Sample content for exercising search and category filters. Not a published recommendation.",
        url: "https://www.reddit.com/r/bangalorebikes/",
        sourceLabel: "Community notice on r/BangaloreBikes",
        sourceCheckedOn: "2026-11-16",
        status: "published",
      },
      {
        id: "example-maintenance",
        title: "Example workshop discussion",
        category: "Maintenance",
        summary:
          "Sample maintenance discussion for the component preview only.",
        url: "https://www.reddit.com/r/bangalorebikes/",
        sourceLabel: "Member discussion on r/BangaloreBikes",
        sourceCheckedOn: "2026-11-16",
        status: "published",
      },
    ],
  },
} satisfies Meta<typeof ResourceDirectory>;

export default meta;
type Story = StoryObj<typeof meta>;
export const SearchAndCategories: Story = {};
export const NoPublishedResources: Story = { args: { entries: [] } };
