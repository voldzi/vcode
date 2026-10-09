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

## Přijetí centrální podpory — 9. října 2026

- Zdroj `74e5555`; `pnpm check`: 0 chyb, 0 varování, 15 původních hints.
- `pnpm test`: 116/116 (33 blog, 51 analytika, 32 distribuce).
- Patnáct nových a kompatibilitních testů prošlo i v přesném izolovaném
  analytickém kandidátu Node 24 bez sítě a produkčních dat. Široký pokus
  spustit všechny analytické testy v tomto obrazu potřeboval veřejné soubory,
  které do jeho provozní hranice nepatří; úplná sada prošla ve zdrojovém stromu.
- Analytický obraz `sha256:f5617560dd04646f18877fc71a2b93af7babfaf09bc3a8e950716ed32729e819`.
- Oba předepsané web/blog obrazy sestaveny; `pnpm build` vytvořil 156 stránek.
  Jejich bajty zůstaly stejné jako předchozí přijaté obrazy. Nginx boundary
  prošla včetně CSP, anonymního 401, kontaktu a rozsahů stahování.
- Nasazeny pouze collector a dashboard. Web, blog, worker, downloads, monitor,
  Umami a databáze zachovaly identitu kontejneru, obraz a datum spuštění.
- První předběžné ověření Compose se zastavilo kvůli chybějícím odkazům na
  existující neveřejné konfigurační soubory. Zdroj byl vrácen, služby se
  nezměnily. Následné nasazení použilo přesné env-file nastavení běžících služeb.
- Veřejné health/blog health, oba jazyky, produkty/návody a oba blogy prošly.
  Privátní summary zůstává anonymně 401; původní veřejná prezentace beze změny.
- Všechny tři servírované v2 runtime mají přesné uvedené piny. Přehled veřejně
  servíruje přesně nový verzovaný script. Žádné reálné návštěvy nebyly čteny
  nebo vytvářeny pro převzetí.
- Neveřejný registr zůstal beze změny; tři nové události jsou dosud zavřené.
  Aktivace čeká na důkaz zveřejnění Studio Balance a ověřený bridge.

Vratný soukromý release obsahuje source snapshot, manifest, původní zdroje,
původní obrazové tagy, konfiguraci nasazení a přijetí. Tajné údaje ani soukromý
registr nejsou součástí veřejného předání nebo tohoto repozitáře.
