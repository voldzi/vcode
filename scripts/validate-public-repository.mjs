import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const ignoredDirectories = new Set([".git", ".astro", ".chroma-state", ".secrets", "dist", "node_modules"]);
const ignoredFiles = new Set(["scripts/validate-public-repository.mjs", "pnpm-lock.yaml", "public/vcode-social.png"]);
const textExtensions = new Set(["", ".astro", ".css", ".env", ".example", ".html", ".js", ".json", ".md", ".mjs", ".sh", ".svg", ".ts", ".txt", ".yaml", ".yml"]);
const rules = [
  ["private DNS suffix", new RegExp(["home", "cz"].join("\\."), "i")],
  ["private IPv4 address", /\b(?:10\.(?:\d{1,3}\.){2}\d{1,3}|192\.168\.(?:\d{1,3}\.)\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3}\.)\d{1,3})\b/],
  ["private deployment path", new RegExp(["", "srv", "vcode"].join("\\/"), "i")],
  ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ["OpenAI-style secret", /\bsk-[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token", /\bgh[opusr]_[A-Za-z0-9]{20,}\b/]
];

const failures = [];
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { await visit(path); continue; }
    const name = relative(root, path);
    if (ignoredFiles.has(name) || !textExtensions.has(extname(path))) continue;
    const value = await readFile(path, "utf8");
    for (const [label, pattern] of rules) if (pattern.test(value)) failures.push(`${name}: ${label}`);
  }
}

await visit(root);
if (failures.length) {
  console.error(`Public repository validation failed:\n${failures.map((item) => `- ${item}`).join("\n")}`);
  process.exit(1);
}
console.log("Public repository boundary validated.");
