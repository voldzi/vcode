import { readFile, readdir } from "node:fs/promises";
const root = new URL("../content/guides/", import.meta.url);
const files = (await readdir(root)).filter((file) => file.endsWith(".md"));
const required = ["title", "summary", "application_id", "external_ref", "translation_key", "language", "classification", "status", "document_type", "documentation_profile", "document_revision", "reviewed_on", "slug", "order"];
const externalRefs = new Set();
const slugs = new Set();
const translations = new Map();
const errors = [];

for (const file of files) {
  const text = await readFile(new URL(file, root), "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) { errors.push(`${file}: missing front matter`); continue; }
  const values = Object.fromEntries(match[1].split("\n").map((line) => {
    const index = line.indexOf(":");
    return index < 0 ? [line, ""] : [line.slice(0,index).trim(), line.slice(index+1).trim().replace(/^"|"$/g, "")];
  }));
  for (const key of required) if (!values[key]) errors.push(`${file}: missing ${key}`);
  if (values.classification !== "public") errors.push(`${file}: website guides must be public`);
  if (values.documentation_profile !== "akb-application-docs-1") errors.push(`${file}: invalid documentation profile`);
  if (externalRefs.has(values.external_ref)) errors.push(`${file}: duplicate external_ref`); else externalRefs.add(values.external_ref);
  const slugKey = `${values.language}:${values.slug}`;
  if (slugs.has(slugKey)) errors.push(`${file}: duplicate language/slug`); else slugs.add(slugKey);
  const languages = translations.get(values.translation_key) ?? new Set();
  languages.add(values.language);
  translations.set(values.translation_key, languages);
  if (/password|heslo|token\s*[:=]|secret\s*[:=]/i.test(text.replace(match[0], ""))) errors.push(`${file}: possible secret-like instruction`);
}

for (const [key, languages] of translations) {
  if (!languages.has("cs") || !languages.has("en")) errors.push(`${key}: missing Czech or English translation`);
}

if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${files.length} AKB-compatible guide sources.`);
