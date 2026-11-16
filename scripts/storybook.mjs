import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// Storybook 8 and this Next.js version must share the installed webpack.
// Keep this setting scoped to Storybook; do not change Next app builds.
const cli = fileURLToPath(
  new URL("../node_modules/storybook/bin/index.cjs", import.meta.url),
);
const child = spawn(process.execPath, [cli, ...process.argv.slice(2)], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PRIVATE_LOCAL_WEBPACK: "true" },
});
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
