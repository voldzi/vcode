# Jednotné připojení veřejných webů k analytice VCode

Doplnění 15. 10. 2026 v 19:42 Europe/Prague: VCode má v původní integraci navíc
úzce schválené `outbound-click` pouze pro určené tlačítko Rajčatové sklizně na
českém a anglickém detailu. Samostatný verzovaný SRI runtime neposílá pageview;
brána `tomatoPlayClicks` vyžaduje zveřejněné CZ/EN notice, přesné dvě cesty a vlastní
skutečný začátek sběru. Ostatní původní měření ani osm dalších registrací se nemění.
Nezobecňovat tuto výjimku na další odkazy nebo aplikace. Viz
`tomato-play-clicks-release.md` pro kontrakt, schválení, testy a přejímku.

Stav 7. 10. 2026: společný přehled obsahuje osm webů včetně Myslopisu a Eventu. Všech osm má měření zapnuté. Event má konkrétní schválený a zveřejněný CZ/EN text v `event-analytics-privacy-review.md`, ověřené propojení a měří pouze nepřihlášený úvod a obecné zdroje příchodu; viz `event-integration.md`. Myslopis má vlastní konkrétní schválení a zveřejněný text v `myslopis-analytics-privacy-review.md`. Konkrétní CS/EN doplňky včetně rozšíření o obecné zdroje příchodů a skutečná veřejná kliknutí byly schváleny, zveřejněny a centrální aktivace dokončena. Sedm zapnutých webů používá v2; VCode zachovává původní schválenou integraci. Soukromé části zůstávají vyloučené.

Doplnění 15. 10. 2026: Election analyst je devátá registrace v Přehledu a **měření je aktivní od 16:51:12 Europe/Prague**. Dosavadních osm aktivních registrací se nezměnilo. Vlastník schválil konkrétní CZ/EN text i aktivaci: pouze otevření veřejného atlasu `/ea/` a obecný zdroj příchodu; žádná práce s volebními výběry, mapou nebo ostatními aplikacemi stejné domény. Schválené texty jsou zveřejněné, úzká analytická integrace převzatá a propojení potvrzené monitorem. Schválení zaznamenává `election-analyst-analytics-privacy-review.md`; zveřejnění, přesné meze přejímky a aktivaci vlastní `election-analyst-analytics-integration.md`.

## Trvalé uspořádání

VCode spravuje jeden server Umami, neveřejnou databázi, přihlašování, dobu uchování a společný přehled. Každý veřejný web má vlastní identifikátor, schválené veřejné cesty a malou integraci na své doméně. Sdílený tracker a přijímací adaptér mají jednu verzovanou implementaci s automatickými kontrolami; aplikace dodávají konfiguraci, nikoliv kopie analytické logiky. Aktualizace se nasazují po ověření kompatibility, ne slepě při změně sdíleného souboru.

Oddělený přijímač vcode-public-v2 používá schválený origin a přesné veřejné cesty každého webu. Soukromý přehled zůstává v jiném procesu. Runtime je verzovaný a integrační bridge jej ověřuje pomocí SRI. Při změně jeho bajtů aktualizujte každou aplikaci i její runtimeIntegrity v neveřejném registru; jednostranná výměna souboru může zastavit měření. Původní VCode tracker je samostatná starší integrace. V2 přidává pouze schválenou obecnou kategorii zdroje a výslovně napojené události `app-store-click`, `contact-click` nebo `outbound-click`; konkrétní události musí odpovídat skutečným veřejným odkazům aplikace. Původní URL zdroje, cílová URL, adresa kontaktu a text odkazu se nepřenášejí. Podrobnosti a konkrétní schválení jsou v `analytics-expanded-metrics-integration.md` a `analytics-expanded-metrics-review.md`. V1 zůstává zachována pro kompatibilitu při postupné migraci.

### Oddělení kontaktního vstupu Moje porce od analytiky

Každá proxy lokace Moje porce mimo přesné kontaktní cesty musí výslovně obsahovat `proxy_set_header X-Mojeporce-Contact-Ingress "";`. Platí to pro generované analytické lokace v1 i v2, tracker i přijímač událostí, současnou doménu `mojeporce.cz` i známou historickou doménu `kaloricketabulky.zeleznalady.cz`. Zachovejte `proxy_pass_request_headers off` a dosavadní přesný seznam analytických hlaviček. Toto odstranění kontaktní hlavičky nemění měřené cesty, události, klíče, runtime ani schválení soukromí.

Pravidlo musí být uvnitř každé proxy lokace. Nginx nedědí serverové `proxy_set_header`, pokud lokace definuje vlastní hlavičky. Kontaktní guard smí vložit pouze chráněný include ve dvou přesných kontaktních lokacích `GET /api/partner-contact/challenge` a `POST /api/partner-contact`; analytika nesmí tento guard, centrální kontaktní credential ani jiná přístupová pověření přijímat či předávat.

Kanonický `deploy/analytics/build-edge-config.py` přidává odstranění do obou lokací v1 pouze pro identitu `kaloricke-tabulky` nebo obě přesně uvedené domény. `site.id` může být identifikátor webu Umami, proto musí být zachovaná i přesná kontrola domény bez wildcardů. Neveřejné generátory v2 a zdrojový DMZ installer musí stejné pravidlo zachovat v každém svém analytickém proxy kontextu; tato úprava generátoru v1 sama nedokládá změnu již nasazených v2 include souborů.

Před instalací musí zdrojový installer bezpečně ověřit všechny vlastní proxy kontexty včetně generovaných include souborů a při chybějícím odstranění hlavičky skončit před změnou konfigurace. Ověření nesmí vypisovat neveřejné klíče, seznamy povolených hlaviček ani interní upstream adresy. Nepoužívejte `nginx -T`; syntaxi ověřte pomocí `nginx -t` a změnu doložte omezenými kontrolami, počty a otisky. Testujte syntetický registr a izolovanou proxy, bez skutečných záznamů návštěvníků nebo kontaktních zpráv. Generování ostatních webů musí zůstat beze změny.

## Pokyn pro repozitář každé veřejné webové aplikace

Do místního AGENTS.md se při připojení vloží následující pravidlo:

> Tato aplikace používá společnou analytiku VCode podle verzovaného integračního standardu. Zachovejte její připojení v hlavním veřejném rozložení, konfiguraci domény, povolených veřejných cest a kontrolu při vydání. Používejte sdílený tracker a přijímač přes vlastní doménu; analytické klíče a interní adresy patří výhradně na server. Měřte jen schválené veřejné stránky a pojmenované události. Nesbírejte obsah formulářů, účtů, komentářů, mapové souřadnice, zdravotní údaje, rezervace ani jiné osobní informace. Respektujte DNT/GPC; bez cookies, identifikace přihlášených lidí a záznamu obrazovky. Změna rozsahu vyžaduje revizi informace o soukromí. Při změně hlavního rozložení, navigace, CSP nebo nasazení ověřte, že měření dál funguje. Soukromé cesty nesmějí vytvářet analytické události.

## Připojení a převzetí

1. Ověřit repozitář, skutečné produkční nasazení a místní AGENTS.md.
2. Stanovit povolené veřejné cesty a události; dynamické identifikátory a citlivé parametry odstranit před odesláním. U jednostránkových aplikací měřit změny veřejných tras bez dvojitého započtení.
3. Připravit informaci o měření a získat její schválení pro daný web. Nové weby vyžadují vlastní přezkoumání konkrétního rozsahu a textu. Schválení již připojených veřejných webů neplatí automaticky pro jiné domény nebo soukromé aplikace.
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
| mojeporce.cz (Moje porce) | Proxy ověřena; schválený doplněk zveřejněn, měření zapnuté | Pouze veřejná prezentace; bez jídelního deníku a zdravotních údajů |
| myslopis.cz | Schválený text zveřejněn, měření zapnuté a propojení ověřené | Jen úvod, katalog a metodika; kontakt a určené veřejné odkazy. Bez dotazníků, odpovědí, výsledků, PDF, účtů a osobního průchodu |
| events.zeleznalady.cz (Event) | Schválený CZ/EN text zveřejněn, měření zapnuté a propojení ověřené | Pouze nepřihlášený úvod `/` a obecný zdroj. Bez kliknutí, přihlášek, účastníků, docházky, účtů a administrace |
| stratos.zeleznalady.cz/ea/ (Election analyst) | Schválený CZ/EN text zveřejněn, analytická integrace převzata, sběr zapnutý a propojení ověřené | Jen čistý vstup `/ea/` a obecný zdroj; žádná kliknutí, hledání, kandidáti, obce nebo pohyby mapy |
| Ostatní STRATOS a AKB | Vyloučeno | Soukromé nasazení; registrace veřejného atlasu jejich měření nepovoluje |

NEST a Šibenice mají již měřené produktové stránky na VCode. Nativní používání a instalace z App Storu jsou jiné metriky a vyžadují samostatnou integraci.

## Neměnné revize runtime

Revize pro TikTok používá `services/analytics/public-v2-tiktok.js`, SHA384 `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5`. Původní `public-v2.js` a jeho adresu/otisk zachovávejte beze změn. Novou revizi lze dodat jako přesnou kopii statického assetu aplikace, ověřenou SRI; bridge mění pouze cestu runtime a otisk. Kolektor událostí, kontrakt v2, cestové a událostní allowlisty i soukromé výluky zůstávají stejné. Tím lze převádět weby postupně bez výpadku starých klientů a bez změny chráněného edge.

Zdrojovým místem vendorizovaného assetu zůstává VCode. Běžný release aplikace musí ověřit kopii proti tomuto otisku a zachovat ji v repozitáři; neprovádět automatickou neověřenou aktualizaci. Neveřejný registr přepne trackerPath/runtimeIntegrity až po ověření veřejného assetu a skutečně nasazeného bridge. Monitor pak ověřuje tuto konkrétní revizi.

### Samostatné odkazy v patičce

Revize `services/analytics/public-v2-portfolio.js` zachovává wire kontrakt
`vcode-public-v2` a přidává `runtimeRevision: portfolio-1`. SRI je
`sha384-zkZSzDImQVzQLiRsYnPvb7exdTP5bDp+cGuBD0J+Tb40PGH8ffG+b4qQGqfrP6lf`.
Původní v2 a TikTok revize zůstávají beze změny. Přijímací cesta veřejné
aplikace zůstává `/analytics/v2/events`; jde o stejný oddělený veřejný kolektor.

Tři pevné názvy `portfolio-vcode-click`, `portfolio-moje-porce-click` a
`portfolio-mestem-hrou-click` rozlišují výslovná kliknutí na odkazy dané patičky.
Payload obsahuje jen `website`, `name` a schválenou veřejnou `path`. Zdroj je
povolen pouze u pageview. Žádná cílová URL, text odkazu ani totožnost se nepřenáší.
Patičkové odkazy se v bridge vyloučí z obecného `outbound-click`, aby nevznikaly
dvě události za jedno kliknutí. Ostatní obecné odchozí odkazy zůstávají stejné.

Samotné `metricsApprovedAt` tento podrobnější rozsah nepovoluje. Konkrétní web
potřebuje zveřejněné doplnění soukromí v souladu se schválením vlastníka,
platné datum `portfolioMetricsApprovedAt` a výslovně povolené názvy v
`allowedEvents`. Schválené `allowedPaths` se nemění. Bez tohoto dodatečného
schválení kolektor nové události odmítá a Přehled je nenabízí. Volitelné
`portfolioMetricsCollectionStartedAt` označuje skutečný začátek rozlišení;
jinak Přehled použije datum aktivace schválení. Vypnutí sběru nadále zastavuje
příjem všech událostí. Historický schválený rozsah může zůstat viditelný.

Nasazení a konkrétní předání pro Studio Balance jsou popsány v
`studio-balance-footer-analytics.md`. Neveřejný registr a edge klíče zůstávají
výhradně na serveru. Testy používají izolovaný syntetický web.

Revize `services/analytics/public-v2-portfolio-2.js` přidává jediný konečný
název `portfolio-myslopis-click`, se stejným wire kontraktem, soukromými
výlukami a samostatným schválením konkrétního webu. `runtimeRevision` je
`portfolio-2`; SRI je
`sha384-X7PYkHsq/VMthl17JMrooPLPjIuIbvATaO4BTzzYARDac6rPfVlTNG1ScD/iyGD3`.
Revize portfolio-1 zůstává byte-exact a nadále obsluhuje Studio Balance;
Myslopis ji může použít pro stejné původní tři cíle. Dostupnost čtyř názvů v
novém klientovi sama žádný web nerozšiřuje: každý zachová svůj přesný schválený
allowlist. Předání dalších webů a jejich odlišné veřejné cesty jsou v
`portfolio-footer-analytics.md`; aktivace se přebírá samostatně.
