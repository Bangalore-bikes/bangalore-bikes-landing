import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CommunityCard: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <CardTitle>Weekend ride</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          A shared visual language for Bangalore Bikes content.
        </p>
      </CardContent>
    </Card>
  ),
};
