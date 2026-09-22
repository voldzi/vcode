# VCode

**Technologie, na které je spoleh.**

[![Web](https://img.shields.io/badge/web-vcode.zeleznalady.cz-00B4FF)](https://vcode.zeleznalady.cz/)
[![CI](https://github.com/voldzi/vcode/actions/workflows/ci.yml/badge.svg)](https://github.com/voldzi/vcode/actions/workflows/ci.yml)
[![Node.js 24+](https://img.shields.io/badge/Node.js-24%2B-0B2D5B)](https://nodejs.org/)
[![Astro 7](https://img.shields.io/badge/Astro-7-0B2D5B)](https://astro.build/)

[English version](README.en.md)

VCode je česká značka digitálních produktů pro mobilitu, bezpečnost, zdraví a řízení organizací. Tento repozitář obsahuje veřejný dvojjazyčný web, centrum nápovědy a řízený technologický blog na [vcode.zeleznalady.cz](https://vcode.zeleznalady.cz/).

## Produkty

| Produkt | Oblast | Dostupnost |
| --- | --- | --- |
| **PAS** | Ošetřovatelská péče, klinický kontext a strukturované záznamy | Soukromé nasazení v ÚVN |
| **Jízda** | Evidence jízd, navigace, vozidla, cestující a komunikace | Připravujeme pro App Store |
| **COP Mobile** | Mobilní situační přehled, hlášení a bezpečná komunikace | Připravujeme |
| **[COP](https://cop.zeleznalady.cz/)** | Veřejná situační mapa, doprava, výstrahy a trasy | Webová aplikace |
| **NEST** | Tahová strategická hra pro iPhone a iPad | Připravujeme vydání v App Store |
| **[Masáže Železná Lady](https://masaze.zeleznalady.cz/)** | Služby, termíny a rezervace | V provozu |
| **[Studio Balance](https://studio-balance.cz/)** | Lekce, rozvrh, rezervace a klientská samoobsluha | V provozu |
| **[STRATOS](https://stratos.zeleznalady.cz/)** | Strategie, projekty, finance, rizika a řízené znalosti | Soukromé nasazení |
| **[Kalorické tabulky](https://kaloricketabulky.zeleznalady.cz/)** | Jídelní deník, recepty a výživový kontext | PWA |

## Co repozitář obsahuje

- statický web v Astro s českou a anglickou verzí;
- produktový katalog, právní stránky a přístupné centrum nápovědy;
- malou serverovou službu pro blog a moderované komentáře;
- řízenou publikační pipeline s jasným původem zdrojů a pevnými AI rozpočty;
- Docker obrazy, zdravotní kontroly a veřejné provozní šablony;
- OpenAPI kontrakt pro jediný veřejný zapisovací endpoint.

Interní síťová topologie, přihlašovací údaje, tajné klíče a produkční inventář v tomto veřejném repozitáři záměrně nejsou. Nasazení používá privátní konfiguraci předanou prostředím a soubory tajemství.

## Rychlý start

Požadavky: Node.js 24+, pnpm 11+.

```bash
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Web poběží na adrese, kterou vypíše Astro. Blog potřebuje PostgreSQL a tajné soubory popsané v [.env.example](.env.example); volitelná Telegram integrace má vlastní oddělené klíče. Bez nich lze plně vyvíjet a sestavit statickou část.

## Kontrola kvality

```bash
pnpm check
pnpm test
pnpm build
```

Stejné kroky spouští veřejná CI. Obsah nápovědy navíc prochází kontrolou metadat, klasifikace a nechtěných tajných údajů.

## Architektura

```text
prohlížeč
   │
   ├── statický Astro web ── produktové stránky a nápověda
   │
   └── blog služba ───────── články a moderované komentáře
              │
              └── PostgreSQL
```

Portfolio zůstává dostupné i při výpadku blogu nebo databáze. Prohlížeč nikdy nedostává přístup k databázi, AI rozhraní ani interním znalostním službám. Podrobnosti jsou v [architektuře](docs/architecture.md), [bezpečnostním návrhu](docs/security.md) a [ADR](docs/adr/).

## Struktura

| Cesta | Účel |
| --- | --- |
| `src/` | Astro stránky, komponenty a styly |
| `content/guides/` | veřejné návody s řízenými metadaty |
| `services/blog/` | blog, sběr veřejných feedů a moderace |
| `openapi/` | veřejný API kontrakt |
| `deploy/` | přenositelné konfigurační šablony |
| `docs/` | architektura, bezpečnost, provoz a rozhodnutí |

## Bezpečnost a soukromí

Bezpečnostní chyby neposílejte do veřejných issues. Postup odpovědného oznámení je v [SECURITY.md](SECURITY.md). Zásady práce s daty jsou popsány přímo na [webu VCode](https://vcode.zeleznalady.cz/soukromi/).

## Přispívání a licence

Pravidla pro návrhy a pull requesty jsou v [CONTRIBUTING.md](CONTRIBUTING.md). Zdrojový kód je veřejný kvůli transparentnosti a důvěře, ne jako obecná open-source licence. Podmínky použití jsou v [LICENSE](LICENSE).
