import { readFileSync, existsSync } from "node:fs";

// "v0.3.0" for a tag, "release/v0.3.0" for a branch. Anything else isn't a release.
const ref = process.env.GITHUB_REF_NAME ?? "";
const match = ref.match(/^(?:release\/)?v(\d+\.\d+\.\d+)$/);
if (!match) {
  console.log(`${ref || "(no ref)"} is not a release; skipping.`);
  process.exit(0);
}

const version = match[1];
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const errors = [];
if (pkg.version !== version) errors.push(`package.json has ${pkg.version}, expected ${version}`);
if (!existsSync(`release-notes/v${version}.md`)) errors.push(`release-notes/v${version}.md is missing`);

for (const e of errors) console.error(`::error::${e}`);   // shows as a red annotation in GitHub
process.exit(errors.length ? 1 : 0);
