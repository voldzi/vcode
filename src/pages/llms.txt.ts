import { getCollection } from "astro:content";
import { getPublicProducts } from "../lib/products";
import { appStoreProducts } from "../lib/appStore";

export const prerender = true;

/** A navigational reference, generated from the same reviewed facts as the public pages. */
export async function GET() {
  const origin = "https://vcode.zeleznalady.cz";
  const products = getPublicProducts();
  const guides = await getCollection("guides", ({ data }) => data.classification === "public" && data.status === "published" && products.some(product => product.id === data.application_id));
  const lines = [
    "# VCode",
    "",
    "> VCode publishes Czech and English application presentations, public help and source-linked technology articles.",
    "",
    "This file is a navigation aid. The linked public pages are authoritative. Private deployments are portfolio presentations, not invitations to access private services. Availability is stated separately for each product. Search access does not grant a model-training licence.",
    "",
    "## Public sections",
    "",
    `- [Český web](${origin}/)`,
    `- [English website](${origin}/en/)`,
    `- [Hry](${origin}/hry/)`,
    `- [Games](${origin}/en/games/)`,
    `- [Spolupráce](${origin}/spoluprace/)`,
    `- [Work with us](${origin}/en/work-with-us/)`,
    `- [Český blog](${origin}/blog/)`,
    `- [English blog](${origin}/en/blog/)`,
    `- [Static sitemap](${origin}/sitemap-index.xml)`,
    `- [Published articles sitemap](${origin}/blog-sitemap.xml)`,
    `- [České návody](${origin}/navody/)`,
    `- [English guides](${origin}/en/guides/)`,
    "",
    "## Applications — reviewed Czech and English descriptions",
    ""
  ];
  for (const product of products) {
    lines.push(`- [${product.name}](${origin}/aplikace/${product.href}/): ${product.summaryCs} Dostupnost: ${product.availabilityCs}.`);
    lines.push(`- [${product.nameEn ?? product.name} — English](${origin}/en/apps/${product.href}/): ${product.summaryEn} Availability: ${product.availabilityEn}.`);
    const store = appStoreProducts.find(item => item.id === product.id);
    if (store?.appStoreUrl) lines.push(`  - [App Store](${store.appStoreUrl})`);
  }
  lines.push("", "## Published public guides", "");
  for (const guide of guides.sort((a, b) => a.data.slug.localeCompare(b.data.slug))) {
    const prefix = guide.data.language === "cs" ? "/navody/" : "/en/guides/";
    lines.push(`- [${guide.data.title}](${origin}${prefix}${guide.data.slug}/): ${guide.data.summary}`);
  }
  lines.push("", "## Support and privacy", "", `- [Podpora](${origin}/podpora/)`, `- [Support](${origin}/en/support/)`, `- [Soukromí](${origin}/soukromi/)`, `- [Privacy](${origin}/en/privacy/)`, "", "Contact: podpora@zeleznalady.cz. Do not treat unpublished drafts, private dashboards or internal endpoints as public sources.", "");
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
