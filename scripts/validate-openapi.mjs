import { readFile } from "node:fs/promises";

const document = JSON.parse(await readFile(new URL("../openapi/openapi.json", import.meta.url), "utf8"));
if (!String(document.openapi ?? "").startsWith("3.")) throw new Error("OpenAPI 3.x document required");
if (!document.info?.title || !document.info?.version) throw new Error("OpenAPI info.title and info.version are required");
if (!document.paths?.["/health/blog"]?.get) throw new Error("GET /health/blog is missing from OpenAPI");
if (!document.paths?.["/api/blog/{slug}/comments"]?.post) throw new Error("POST /api/blog/{slug}/comments is missing from OpenAPI");

const resolvePointer = (pointer) => pointer.slice(2).split("/").reduce((value, segment) => value?.[segment.replaceAll("~1", "/").replaceAll("~0", "~")], document);
const visit = (value) => {
  if (!value || typeof value !== "object") return;
  if (typeof value.$ref === "string" && value.$ref.startsWith("#/") && !resolvePointer(value.$ref)) throw new Error(`Unresolved OpenAPI reference: ${value.$ref}`);
  for (const child of Object.values(value)) visit(child);
};
visit(document);
console.log("OpenAPI contract validated.");
