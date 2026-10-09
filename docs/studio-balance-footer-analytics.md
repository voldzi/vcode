# Studio Balance: tři odkazy v patičce

## Účel a schválený rozsah

Vlastník ve vlákně Studio Balance požádal o footer „Od stejného týmu také
aplikace Moje porce a Městem hrou“ a měřitelná kliknutí pro sledování účinnosti
ve VCode. Následně výslovně zadal „Realizuj a dohodni úpravu i s vcode“.
Původní návrh předložený vlastníkovi uváděl oddělené počty tří odkazů,
veřejnou zdrojovou stránku a vybrané období, bez účtů, cookies a osobních
údajů, s DNT/GPC a vyloučením soukromých částí. Příslušná lidská autorizace
byla před koordinací přímo ověřena ve zdrojovém vlákně.

Konkrétní CZ/EN doplnění musí být v souladu s tímto schváleným rozsahem,
redakčně zkontrolováno a zveřejněno před aktivací. Jeho review a důkaz publikace
spravuje Studio Balance. Centrální podpora sama sběr nových událostí nezapíná.

## Klient a veřejný kontrakt

- Kanonický soubor: `services/analytics/public-v2-portfolio.js`.
- Lokální kopie Studio Balance: `/vcode-analytics-portfolio-v1.js`.
- `contractVersion`: `vcode-public-v2`; `runtimeRevision`: `portfolio-1`.
- SRI: `sha384-zkZSzDImQVzQLiRsYnPvb7exdTP5bDp+cGuBD0J+Tb40PGH8ffG+b4qQGqfrP6lf`.
- Odesílání: stávající `/analytics/v2/events` na vlastní doméně.
- Žádná automatická měření; bridge volá konkrétní událost při vědomém kliknutí.

| Cíl v patičce | Pevný název události |
| --- | --- |
| VCode | `portfolio-vcode-click` |
| Moje porce | `portfolio-moje-porce-click` |
| Městem hrou | `portfolio-mestem-hrou-click` |

Posílají se pouze `website`, `name`, `path`. Žádná cílová URL, jméno, obsah
odkazu, formuláře, identita ani parametry URL. `source` zůstává jen u pageview.
Patičkové odkazy nevytvářejí zároveň obecný `outbound-click`. Původní událost
zůstává pro ostatní schválené odchozí odkazy. Bridge potlačí veškerý sběr při
identifikovaném/přihlášeném kontextu; runtime navíc respektuje DNT/GPC a offline
discard. Beze změny zůstávají všechny soukromé výluky a původní runtime bajty.

Osm veřejných cest se nemění: `/`, `/o-studiu`, `/lekce`, `/rozvrh`, `/cenik`,
`/galerie`, `/recenze`, `/balance-flow`. Žádné rezervace, účty nebo administrace.

## Oficiální ikony

Studio Balance vendorizuje přesné kopie kanonických souborů:

| Značka | Soubor VCode | SHA256 |
| --- | --- | --- |
| VCode | `public/favicon.svg` | `af0610b52c2376cba8d27d46ac8a09e0e3f5be779f170a2fcbbd4340308f715a` |
| Moje porce | `public/apps/mojeporce-b244faa9e68a.svg` | `b244faa9e68ad8c723abd72029098cc8fd726bc65d4120f84ec4acb9ea9750c5` |
| Městem hrou | `public/apps/mestem-hrou.png` | `e40bec4cb7307ac72fee93bfadb556ccbcc2c098883440d1e99ac29f0b07aad2` |

Zachovat barvy a proporce, velikost 32–40 px; vedle viditelného názvu značky
použít dekorativní obrázek s prázdným alt. Použít veřejné doménové cíle dodané
vlastníkem. Ikony ani klient nesmí hotlinkovat neveřejné prostředky.

## Převzetí a nasazení

1. Ověřit konkrétní zveřejněné CZ/EN doplnění soukromí a záznam owner review.
2. Ověřit přesné bajty veřejné klientské kopie, SRI, nasazený bridge a CSP.
3. Nasadit centrální collector/dashboard se zachováním sessions, konfigurace,
   ostatních procesů a pinů starých klientů. Žádná databázová migrace.
4. Zálohovat privátní registr a změnit pouze položku Studio Balance: runtime
   cesta/otisk, doplnit tři názvy do `allowedEvents`, platný activation timestamp
   `portfolioMetricsApprovedAt` a skutečný začátek rozlišení. Přesné cesty a
   staré události zachovat. Aktualizace v místě kvůli existujícímu bind mountu.
5. Synteticky otestovat collector → náhradní Umami a autentizovaný Přehled;
   testovací události neposílat do skutečných statistik. Aplikační test musí
   prokázat tři různá kliknutí bez dvojitého outbound, soukromé části nula,
   DNT/GPC/offline nula. Veřejný monitor ověří skutečný pin.
6. Přehled zobrazí samostatnou sekci „Odkazy v patičce“ s počty za vybrané
   období a začátkem rozlišení. Kliknutí není počet lidí ani cílová konverze.

Stav tohoto dokumentu: příprava podpory a izolované testy; produkční přijetí
a aktivaci zaznamenat až po skutečném společném ověření.
