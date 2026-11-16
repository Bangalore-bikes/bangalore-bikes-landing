import type { Meta, StoryObj } from "@storybook/react";

function Foundations() {
  const colors = [
    ["Background", "bg-background text-foreground"],
    ["Foreground", "bg-foreground text-background"],
    ["Muted", "bg-muted text-muted-foreground"],
    ["Accent", "bg-accent text-accent-foreground"],
    ["Card", "bg-card text-card-foreground"],
  ];
  return (
    <div className="max-w-3xl space-y-10">
      <section aria-labelledby="type-title" className="space-y-4">
        <h1 id="type-title" className="text-4xl font-bold tracking-tight">
          Community typography
        </h1>
        <h2 className="text-2xl font-semibold">
          Rides, resources, and good company
        </h2>
        <p className="max-w-prose leading-relaxed">
          Body text stays readable on small screens. Resources link back to
          their original Reddit discussions and keep context with the author.
        </p>
        <p className="text-sm text-muted-foreground">
          Source labels and dates use supporting text without replacing the main
          description.
        </p>
        <a href="#colors-title" className="underline underline-offset-4">
          Inspect theme colors
        </a>
      </section>
      <section aria-labelledby="colors-title">
        <h2 id="colors-title" className="mb-4 text-2xl font-semibold">
          Theme colors
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {colors.map(([label, className]) => (
            <li
              key={label}
              className={"rounded-lg border border-border p-6 " + className}
            >
              {label}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

const meta = {
  title: "Design/Foundations",
  component: Foundations,
  tags: ["autodocs"],
} satisfies Meta<typeof Foundations>;
export default meta;
type Story = StoryObj<typeof meta>;
export const TypographyAndPalette: Story = {};
