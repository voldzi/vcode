import { products, type Product } from "./products";

export type AppStoreProduct = Product & {
  storeSlug: string;
  appStoreUrl?: string;
  storePlatformsCs?: string;
  storePlatformsEn?: string;
  operatingSystem?: string;
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
    ...byId("millora"), storeSlug: "millora",
    storePlatformsCs: "Hra pro iPhone a iPad", storePlatformsEn: "Game for iPhone and iPad",
    operatingSystem: "iOS",
    privacyCs: "/millora/privacy/", privacyEn: "/en/millora/privacy/",
    supportCs: "/podpora/millora/", supportEn: "/en/support/millora/"
  },
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
  },
  {
    ...byId("nest"),
    storeSlug: "nest",
    appStoreUrl: "https://apps.apple.com/cz/app/nest-the-game/id1336678493",
    storePlatformsCs: "Hra pro iPhone, iPad a Apple TV",
    storePlatformsEn: "Game for iPhone, iPad and Apple TV",
    operatingSystem: "iOS, tvOS",
    privacyCs: "/nest/privacy/",
    privacyEn: "/en/nest/privacy/",
    supportCs: "/podpora/nest/",
    supportEn: "/en/support/nest/"
  },
  {
    ...byId("sibenice"),
    storeSlug: "sibenice",
    appStoreUrl: "https://apps.apple.com/cz/app/%C5%A1ibenice-origin%C3%A1l/id1436866698",
    storePlatformsCs: "Hra pro iPhone a iPad",
    storePlatformsEn: "Game for iPhone and iPad",
    operatingSystem: "iOS",
    privacyCs: "/sibenice/privacy/",
    privacyEn: "/en/sibenice/privacy/",
    supportCs: "/podpora/sibenice/",
    supportEn: "/en/support/sibenice/"
  }
];
