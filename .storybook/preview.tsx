import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Preview theme",
      toolbar: {
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, context) => (
      <div className={context.globals.theme === "dark" ? "dark" : ""}>
        <div className="min-h-screen bg-background p-6 text-foreground">
          <Story />
        </div>
      </div>
    ),
  ],
  parameters: {
    nextjs: { appDirectory: true },
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
