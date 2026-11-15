import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Join the community",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = { args: { variant: "destructive" } };
