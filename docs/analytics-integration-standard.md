# Jednotné připojení veřejných webů k analytice VCode

Stav 4. 10. 2026: společný přehled obsahuje šest webů. Všech šest veřejných webů má měření zapnuté. Konkrétní CS/EN doplňky byly schváleny, zveřejněny a centrální aktivace dokončena. Soukromé části zůstávají vyloučené.

## Trvalé uspořádání

VCode spravuje jeden server Umami, neveřejnou databázi, přihlašování, dobu uchování a společný přehled. Každý veřejný web má vlastní identifikátor, schválené veřejné cesty a malou integraci na své doméně. Sdílený tracker a přijímací adaptér mají jednu verzovanou implementaci s automatickými kontrolami; aplikace dodávají konfiguraci, nikoliv kopie analytické logiky. Aktualizace se nasazují po ověření kompatibility, ne slepě při změně sdíleného souboru.

Oddělený přijímač vcode-public-v2 používá schválený origin a přesné veřejné cesty každého webu. Soukromý přehled zůstává v jiném procesu. Runtime je verzovaný a integrační bridge jej ověřuje pomocí SRI. Při změně jeho bajtů aktualizujte každou aplikaci i její runtimeIntegrity v neveřejném registru; jednostranná výměna souboru může zastavit měření. Původní VCode tracker je samostatná starší integrace. V2 přidává pouze schválenou obecnou kategorii zdroje a výslovně napojené události `app-store-click`, `contact-click` nebo `outbound-click`; konkrétní události musí odpovídat skutečným veřejným odkazům aplikace. Původní URL zdroje, cílová URL, adresa kontaktu a text odkazu se nepřenášejí. Podrobnosti a konkrétní schválení jsou v `analytics-expanded-metrics-integration.md` a `analytics-expanded-metrics-review.md`. V1 zůstává zachována pro kompatibilitu při postupné migraci.

## Pokyn pro repozitář každé veřejné webové aplikace

Do místního AGENTS.md se při připojení vloží následující pravidlo:

> Tato aplikace používá společnou analytiku VCode podle verzovaného integračního standardu. Zachovejte její připojení v hlavním veřejném rozložení, konfiguraci domény, povolených veřejných cest a kontrolu při vydání. Používejte sdílený tracker a přijímač přes vlastní doménu; analytické klíče a interní adresy patří výhradně na server. Měřte jen schválené veřejné stránky a pojmenované události. Nesbírejte obsah formulářů, účtů, komentářů, mapové souřadnice, zdravotní údaje, rezervace ani jiné osobní informace. Respektujte DNT/GPC; bez cookies, identifikace přihlášených lidí a záznamu obrazovky. Změna rozsahu vyžaduje revizi informace o soukromí. Při změně hlavního rozložení, navigace, CSP nebo nasazení ověřte, že měření dál funguje. Soukromé cesty nesmějí vytvářet analytické události.

## Připojení a převzetí

1. Ověřit repozitář, skutečné produkční nasazení a místní AGENTS.md.
2. Stanovit povolené veřejné cesty a události; dynamické identifikátory a citlivé parametry odstranit před odesláním. U jednostránkových aplikací měřit změny veřejných tras bez dvojitého započtení.
3. Připravit informaci o měření a získat její schválení pro daný web. Nové weby vyžadují vlastní přezkoumání konkrétního rozsahu a textu. Schválení šesti zde uvedených veřejných webů neplatí automaticky pro jiné domény nebo soukromé aplikace.
4. Zaregistrovat samostatný web v Umami a neveřejném registru VCode. Nevytvářet veřejné odkazy na statistiky.
5. Nasadit sdílenou integraci, potřebné CSP a serverový adaptér. Ověřit důvěryhodný původ adresy klienta; nepřijímat její podvržení z prohlížeče. Veřejný adaptér nesmí zpřístupnit přehled ani administrační API.
6. Provést izolovaný test zkušebního webu: zobrazení stránky, schválené kliknutí, odmítnutí soukromé cesty, cizího původu a neznámé události; DNT/GPC nic neodesílá. Zkušební data nesmějí navyšovat reálné statistiky.
7. Ověřit přihlášený přehled, uvést datum zahájení měření a integrační verzi. Spustit kontroly daného projektu a ověřit produkci.
8. Zapsat pravidlo do místního AGENTS.md a přidat kontrolu integrace do procesu vydání.

## Průběžná kontrola

Trvalé řešení musí kontrolovat dostupnost trackeru a přijímače, správnou doménu/verzi a serverovou dostupnost dat. Rozlišuje stav „ověřeno bez návštěv“, „nespárováno“, „měření vypnuto“ a „porucha“; nulová návštěvnost sama neznamená chybu. Testy příjmu se vedou na odděleném zkušebním webu. Upozornění na poruchu a obnovu lze po zapojení provozní kontroly posílat do již schváleného Telegram kanálu. Monitor propojení je implementován a výsledky jsou v přihlášeném přehledu. Telegram upozornění zatím není aktivované.

Denní zálohy s týdenní rotací jsou implementované; obnova do oddělené databáze prošla. Aktivní záznamy se mažou s rezervou po 170 dnech, aby denní rotace i zálohy dodržely schválené maximum 180 dní.

## Seznam z katalogu VCode

Seznam vychází ze src/lib/products.ts; není úplným soupisem všech serverových domén.

| Web | Stav | Rozsah před připojením |
| --- | --- | --- |
| vcode.zeleznalady.cz | Připojeno | Veřejné portfolio, blog a návody |
| mestemhrou.cz | Proxy ověřena; schválený doplněk zveřejněn, měření zapnuté | Veřejné stránky; bez polohy hráče a osobního postupu |
| masaze.zeleznalady.cz | Proxy ověřena; schválený doplněk zveřejněn, měření zapnuté | Nabídka a veřejné stránky; bez rezervací a klientské samoobsluhy |
| studio-balance.cz | Proxy ověřena; schválený doplněk zveřejněn, měření zapnuté | Veřejná nabídka a rozvrh; bez účtů a osobních rezervací |
| cop.zeleznalady.cz | Proxy ověřena; schválený doplněk zveřejněn, měření zapnuté | Pouze syntetická ukázka /demo/flood-central-bohemia; bez poloh, hlášení a komunikace |
| kaloricketabulky.zeleznalady.cz | Proxy ověřena; schválený doplněk zveřejněn, měření zapnuté | Pouze veřejná prezentace; bez jídelního deníku a zdravotních údajů |
| STRATOS a AKB | Vyloučeno | Soukromé nasazení |

NEST a Šibenice mají již měřené produktové stránky na VCode. Nativní používání a instalace z App Storu jsou jiné metriky a vyžadují samostatnou integraci.
