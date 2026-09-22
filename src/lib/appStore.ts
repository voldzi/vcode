import { products, type Product } from "./products";

export type AppStoreProduct = Product & {
  storeSlug: string;
  privacyCs: string;
  privacyEn: string;
  supportCs: string;
  supportEn: string;
};

const byId = (id: string) => {
  const product = products.find(item => item.id === id);
  if (!product) throw new Error(`Missing product ${id}`);
  return product;
};

export const appStoreProducts: AppStoreProduct[] = [
  {
    ...byId("jizda"),
    storeSlug: "jizda",
    privacyCs: "/jizda/privacy/",
    privacyEn: "/en/jizda/privacy/",
    supportCs: "/podpora/jizda/",
    supportEn: "/en/support/jizda/"
  },
  {
    ...byId("cop-mobile"),
    storeSlug: "cop-mobile",
    privacyCs: "/cop-mobile/privacy/",
    privacyEn: "/en/cop-mobile/privacy/",
    supportCs: "/podpora/cop-mobile/",
    supportEn: "/en/support/cop-mobile/"
  }
];

