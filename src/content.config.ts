import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";
import { products } from "./lib/products";

const productIds = new Set(products.map(({ id }) => id));

const guides = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/guides" }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    application_id: z.string().refine((id) => productIds.has(id), "Unknown product ID"),
    external_ref: z.string(),
    translation_key: z.string(),
    language: z.enum(["cs", "en"]),
    classification: z.literal("public"),
    status: z.enum(["draft", "review", "published"]),
    document_type: z.enum(["manual", "knowledge_base_article"]),
    documentation_profile: z.literal("akb-application-docs-1"),
    document_revision: z.string(),
    reviewed_on: z.coerce.date(),
    slug: z.string(),
    order: z.number().int().nonnegative()
  })
});

export const collections = { guides };
