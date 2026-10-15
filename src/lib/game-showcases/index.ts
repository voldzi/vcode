import { nestShowcase } from "./nest";
import { rinkletShowcase } from "./rinklet";
import { milloraShowcase } from "./millora";
import { foldlightShowcase } from "./foldlight";
import { sibeniceShowcase } from "./sibenice";
import { tomatoShowcase } from "./rajcatova-sklizen";

export type GameShowcase = {
  id: string;
  playUrl?: string;
  hideGallery?: boolean;
  titleCs: string; titleEn: string;
  taglineCs: string; taglineEn: string;
  introCs: string; introEn: string;
  features: {
    titleCs: string; titleEn: string; bodyCs: string; bodyEn: string;
    storeLink?: { hrefCs: string; hrefEn: string; labelCs: string; labelEn: string };
  }[];
  steps: { titleCs: string; titleEn: string; bodyCs: string; bodyEn: string }[];
  screenshots: {
    src: string; srcEn?: string; thumbnailSrc?: string; thumbnailSrcEn?: string;
    width: number; height: number; altCs: string; altEn: string;
    captionCs: string; captionEn: string;
  }[];
  heroSrc?: string; heroSrcEn?: string;
  heroThumbnailSrc?: string; heroThumbnailSrcEn?: string;
  heroAltCs?: string; heroAltEn?: string;
  heroWidth?: number; heroHeight?: number;
  galleryTitleCs?: string; galleryTitleEn?: string;
  galleryKickerCs?: string; galleryKickerEn?: string;
  video?: { src: string; poster: string; width: number; height: number; titleCs: string; titleEn: string; captionCs: string; captionEn: string };
  availabilityCs: string; availabilityEn: string;
};

const showcases: GameShowcase[] = [nestShowcase, rinkletShowcase, milloraShowcase, foldlightShowcase, sibeniceShowcase, tomatoShowcase];
export const getGameShowcase = (id: string) => showcases.find(item => item.id === id);

export function getShowcaseHero(showcase: GameShowcase, lang: "cs" | "en") {
  const first = showcase.screenshots[0];
  const en = lang === "en";
  return {
    src: (en ? showcase.heroThumbnailSrcEn ?? showcase.heroSrcEn : undefined)
      ?? showcase.heroThumbnailSrc ?? showcase.heroSrc
      ?? (en ? first.thumbnailSrcEn ?? first.srcEn : undefined) ?? first.thumbnailSrc ?? first.src,
    alt: (en ? showcase.heroAltEn : showcase.heroAltCs) ?? (en ? first.altEn : first.altCs),
    width: showcase.heroWidth ?? first.width,
    height: showcase.heroHeight ?? first.height
  };
}
