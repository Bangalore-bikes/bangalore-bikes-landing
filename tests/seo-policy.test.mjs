import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

for (const context of ["production", "deploy-preview", "branch-deploy"]) {
  test(context + " has the intended indexing policy", () => {
    const moduleUrl = new URL("../src/lib/siteMetadata.ts", import.meta.url)
      .href;
    const result = spawnSync(
      process.execPath,
      [
        "--experimental-strip-types",
        "--input-type=module",
        "-e",
        `const {createPageMetadata, isPreviewDeployment} = await import(${JSON.stringify(moduleUrl)});
       console.log(JSON.stringify({preview: isPreviewDeployment, robots: createPageMetadata("/wiki").robots}));`,
      ],
      { env: { ...process.env, CONTEXT: context }, encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    const policy = JSON.parse(result.stdout);
    assert.equal(policy.preview, context !== "production");
    assert.equal(policy.robots.index, context === "production");
    assert.equal(policy.robots.follow, true);
  });
}
