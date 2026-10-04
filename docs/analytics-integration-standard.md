# Jednotné připojení veřejných webů k analytice VCode

Stav: provozní standard a seznam připojení. Společný přehled běží; z níže uvedených webů je připojen pouze VCode. Tento dokument sám další měření nezapíná.

## Trvalé uspořádání

VCode spravuje jeden server Umami, neveřejnou databázi, přihlašování, dobu uchování a společný přehled. Každý veřejný web má vlastní identifikátor, schválené veřejné cesty a malou integraci na své doméně. Sdílený tracker a přijímací adaptér mají mít jednu verzovanou implementaci s automatickými kontrolami; aplikace dodávají konfiguraci, nikoliv kopie analytické logiky. Aktualizace se nasazují po ověření kompatibility, ne slepě při změně sdíleného souboru.

Současný přijímač je omezen na doménu a veřejné cesty VCode. Před dalším připojením je potřeba oddělit veřejný přijímač od soukromého přehledu a zavést konfiguraci veřejných cest pro každý web. Pouhé vložení aktuálního skriptu do jiné aplikace není dokončená integrace.

## Pokyn pro repozitář každé veřejné webové aplikace

Do místního AGENTS.md se při připojení vloží následující pravidlo:

> Tato aplikace používá společnou analytiku VCode podle verzovaného integračního standardu. Zachovejte její připojení v hlavním veřejném rozložení, konfiguraci domény, povolených veřejných cest a kontrolu při vydání. Používejte sdílený tracker a přijímač přes vlastní doménu; analytické klíče a interní adresy patří výhradně na server. Měřte jen schválené veřejné stránky a pojmenované události. Nesbírejte obsah formulářů, účtů, komentářů, mapové souřadnice, zdravotní údaje, rezervace ani jiné osobní informace. Respektujte DNT/GPC; bez cookies, identifikace přihlášených lidí a záznamu obrazovky. Změna rozsahu vyžaduje revizi informace o soukromí. Při změně hlavního rozložení, navigace, CSP nebo nasazení ověřte, že měření dál funguje. Soukromé cesty nesmějí vytvářet analytické události.

## Připojení a převzetí

1. Ověřit repozitář, skutečné produkční nasazení a místní AGENTS.md.
2. Stanovit povolené veřejné cesty a události; dynamické identifikátory a citlivé parametry odstranit před odesláním. U jednostránkových aplikací měřit změny veřejných tras bez dvojitého započtení.
3. Připravit informaci o měření a získat její schválení pro daný web. Dosavadní schválení se týká VCode, nikoliv automaticky dalších aplikací.
4. Zaregistrovat samostatný web v Umami a neveřejném registru VCode. Nevytvářet veřejné odkazy na statistiky.
5. Nasadit sdílenou integraci, potřebné CSP a serverový adaptér. Ověřit důvěryhodný původ adresy klienta; nepřijímat její podvržení z prohlížeče. Veřejný adaptér nesmí zpřístupnit přehled ani administrační API.
6. Provést izolovaný test zkušebního webu: zobrazení stránky, schválené kliknutí, odmítnutí soukromé cesty, cizího původu a neznámé události; DNT/GPC nic neodesílá. Zkušební data nesmějí navyšovat reálné statistiky.
7. Ověřit přihlášený přehled, uvést datum zahájení měření a integrační verzi. Spustit kontroly daného projektu a ověřit produkci.
8. Zapsat pravidlo do místního AGENTS.md a přidat kontrolu integrace do procesu vydání.

## Průběžná kontrola

Trvalé řešení musí kontrolovat dostupnost trackeru a přijímače, správnou doménu/verzi a serverovou dostupnost dat. Rozlišuje stav „ověřeno bez návštěv“, „nespárováno“, „měření vypnuto“ a „porucha“; nulová návštěvnost sama neznamená chybu. Testy příjmu se vedou na odděleném zkušebním webu. Upozornění na poruchu a obnovu lze po zapojení provozní kontroly posílat do již schváleného Telegram kanálu. Tento monitor zatím není implementován.

Pravidelné zálohy a ověřená obnova patří do provozního plánu vedle denního mazání záznamů po 180 dnech. Jednorázová záloha nenahrazuje plán záloh.

## Seznam z katalogu VCode

Seznam vychází ze src/lib/products.ts; není úplným soupisem všech serverových domén.

| Web | Stav | Rozsah před připojením |
| --- | --- | --- |
| vcode.zeleznalady.cz | Připojeno | Veřejné portfolio, blog a návody |
| mestemhrou.cz | Příprava připojení zadána 2026-10-04 | Veřejné stránky; bez polohy hráče a osobního postupu |
| masaze.zeleznalady.cz | Nepřipojeno | Nabídka a veřejné stránky; bez rezervací a klientské samoobsluhy |
| studio-balance.cz | Nepřipojeno | Veřejná nabídka a rozvrh; bez účtů a osobních rezervací |
| cop.zeleznalady.cz | Nepřipojeno | Samostatně vymezit veřejné stránky; bez poloh, hlášení a komunikace |
| kaloricketabulky.zeleznalady.cz | Nepřipojeno | Pouze veřejná prezentace; bez jídelního deníku a zdravotních údajů |
| STRATOS a AKB | Vyloučeno | Soukromé nasazení |

NEST a Šibenice mají již měřené produktové stránky na VCode. Nativní používání a instalace z App Storu jsou jiné metriky a vyžadují samostatnou integraci.
