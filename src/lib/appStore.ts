import { getPublicProducts, type Product } from "./products";

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
  const product = getPublicProducts().find(item => item.id === id);
  if (!product) throw new Error(`Missing product ${id}`);
  return product;
};

export const appStoreProducts: AppStoreProduct[] = [
  {
    ...byId("rinklet"), storeSlug: "rinklet",
    appStoreUrl: "https://apps.apple.com/app/rinklet/id6821032563",
    storePlatformsCs: "Hra pro iPhone a iPad", storePlatformsEn: "Game for iPhone and iPad",
    operatingSystem: "iOS",
    privacyCs: "/rinklet/privacy/", privacyEn: "/en/rinklet/privacy/",
    supportCs: "/podpora/rinklet/", supportEn: "/en/support/rinklet/"
  },
  {
    ...byId("foldlight"), storeSlug: "foldlight",
    appStoreUrl: "https://apps.apple.com/app/foldlight-by-vcode/id6821035786",
    storePlatformsCs: "Hra pro iPhone a iPad", storePlatformsEn: "Game for iPhone and iPad",
    operatingSystem: "iOS",
    privacyCs: "/foldlight/privacy/", privacyEn: "/en/foldlight/privacy/",
    supportCs: "/podpora/foldlight/", supportEn: "/en/support/foldlight/"
  },
  {
    ...byId("millora"), storeSlug: "millora",
    appStoreUrl: "https://apps.apple.com/cz/app/vcode-millora-morris/id6821033229",
    storePlatformsCs: "Hra pro iPhone a iPad", storePlatformsEn: "Game for iPhone and iPad",
    operatingSystem: "iOS",
    privacyCs: "/millora/privacy/", privacyEn: "/en/millora/privacy/",
    supportCs: "/podpora/millora/", supportEn: "/en/support/millora/"
  },
  {
    ...byId("jizda"),
    storeSlug: "jizda",
    appStoreUrl: "https://apps.apple.com/cz/app/j%C3%ADzda/id6744852413",
    storePlatformsCs: "Aplikace pro iPhone, iPad a Apple Watch",
    storePlatformsEn: "App for iPhone, iPad and Apple Watch",
    operatingSystem: "iOS, watchOS",
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
