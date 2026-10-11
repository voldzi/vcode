import type { Product } from "./products";
import { appStoreProducts } from "./appStore";

export type CatalogAvailability = "available" | "upcoming" | "private";
export type CatalogPlatform = "web" | "ios" | "watchos" | "tvos" | "macos" | "unspecified";
export type CatalogTarget = { platform: CatalogPlatform; availability: CatalogAvailability };

export const catalogPlatformLabels = {
  web: { cs: "Web", en: "Web" },
  ios: { cs: "iPhone / iPad", en: "iPhone / iPad" },
  watchos: { cs: "Apple Watch", en: "Apple Watch" },
  tvos: { cs: "Apple TV", en: "Apple TV" },
  macos: { cs: "Mac", en: "Mac" }
} as const;

/** Keep platform availability together, so a live web never implies a released iOS app. */
export function getCatalogTargets(product: Product): CatalogTarget[] {
  const targets: CatalogTarget[] = [];
  const add = (platform: CatalogPlatform, availability: CatalogAvailability) => {
    if (!targets.some(target => target.platform === platform && target.availability === availability)) {
      targets.push({ platform, availability });
    }
  };
  const availability = `${product.availabilityCs} ${product.availabilityEn}`;
  const privateDeployment = /soukrom|private|řízené zdravotnické|controlled healthcare/i.test(availability);
  const platformCopy = `${product.summaryCs} ${product.summaryEn} ${availability}`;
  const describedPlatforms: CatalogPlatform[] = [];
  if (/\biOS\b|\biPhone\b|\biPad\b/i.test(platformCopy)) describedPlatforms.push("ios");
  if (/Apple Watch|\bwatchOS\b/i.test(platformCopy)) describedPlatforms.push("watchos");
  if (/Apple TV|\btvOS\b/i.test(platformCopy)) describedPlatforms.push("tvos");
  if (/\bmacOS\b|\bMacu\b|\bMac\b/i.test(platformCopy)) describedPlatforms.push("macos");

  if (privateDeployment) {
    if (product.externalUrl) add("web", "private");
    // A family overview mentions Voice; that does not make every STRATOS product an iOS app.
    if (!product.family) describedPlatforms.forEach(platform => add(platform, "private"));
    if (!targets.length) add("unspecified", "private");
    return targets;
  }

  const storeProduct = appStoreProducts.find(item => item.id === product.id);
  if (storeProduct?.appStoreUrl) {
    if (/iOS/i.test(storeProduct.operatingSystem ?? "")) add("ios", "available");
    if (/tvOS/i.test(storeProduct.operatingSystem ?? "")) add("tvos", "available");
    if (/watchOS/i.test(storeProduct.operatingSystem ?? "")) add("watchos", "available");
  }
  if (product.externalUrl && !product.inDevelopment) add("web", "available");
  if (describedPlatforms.includes("macos") && /zdarma|free|dostupn|available/i.test(availability) && !product.inDevelopment) {
    add("macos", "available");
  }
  describedPlatforms.forEach(platform => {
    if (!targets.some(target => target.platform === platform)) add(platform, "upcoming");
  });
  if (targets.length && !describedPlatforms.length && /připravujeme|in preparation/i.test(availability)) add("unspecified", "upcoming");
  if (!targets.length) add("unspecified", "upcoming");
  return targets;
}

export function getCatalogSearchText(product: Product, lang: "cs" | "en"): string {
  return [
    product.name, product.nameEn ?? "", product.family ?? "", product.kind === "game" ? (lang === "cs" ? "hra hry" : "game games") : "",
    lang === "cs" ? product.categoryCs : product.categoryEn,
    lang === "cs" ? product.summaryCs : product.summaryEn,
    lang === "cs" ? product.headlineCs : product.headlineEn,
    lang === "cs" ? product.availabilityCs : product.availabilityEn,
    ...(lang === "cs" ? product.capabilitiesCs : product.capabilitiesEn)
  ].join(" ");
}
