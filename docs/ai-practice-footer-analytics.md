# AI v práci — přesné měření čtyř odkazů v patičce

**Aktuální stav:** od 19. 10. 2026 19:57 CEST má stejná registrace vedle čtyř původních prokliků také návštěvnost a pět souhrnných milníků. Aktuální schválený text, samostatné podmínky a přejímka: `docs/ai-practice-usage-analytics.md`. Níže uvedené omezení na čtyři prokliky popisuje původní převzetí a samotný nezměněný footer runtime; historii a jeho původní datum zachováváme.


## Aktuální stav

Příprava: 19. října 2026. Prokliky jsou centrálně **vypnuté** do konkrétního schválení nového textu, ověření jeho zveřejnění a přijetí aplikace. Lidské zadání ke koordinaci, implementaci a nasazení je ověřené; pravidlo AGENTS.md navíc vyžaduje kontrolu konkrétního právního znění. Centrální kód se připravuje. Samostatná registrace Umami skutečně vytvořena 19. 10. 2026 v 16:55:44 UTC. Sběr je vypnutý, sdílení a replay nejsou zapnuté. Exact proxy je nasazená a prošla Nginx testem/reloadem. Centrální zákaz pageviews a správné zobrazení event-only režimu v Přehledu jsou implementované a probíhá jejich přejímka; ještě nejsou nasazené. Proto sběr zůstává vypnutý.

## Kontrakt

- Veřejné ID: `724a2354-e5dd-49c8-add0-c2105491ef65`. Skutečně registrované samostatné ID; neplést s měřením prezentace VCode.
- Origin: `https://games.zeleznalady.cz`.
- Jediná zdrojová cesta: `/prezentaceAI/`.
- Jediný same-origin přijímač: `/prezentaceAI/analytics/v2/events`, pouze POST JSON.
- Wire formát `vcode-public-v2`: právě `website`, `name`, `path`. Žádný `source`, URL, title, referrer, cílová adresa, dynamický identifikátor ani další vlastnosti.
- Žádné automatické pageviews, obecné click listenery, odložené odesílání nebo úložiště pro tyto prokliky.
- Pouze výslovná obsluha čtyř veřejných odkazů z patičky; ověřit skutečný href proti pevné mapě. Linky zůstávají nativní, bez preventDefault a čekání.
- HTTPS, přesný původ a cesta; počáteční i současná adresa musí být přesný kanonický veřejný vstup bez parametrů/fragmentu. Pokud začala soukromě, pozdější odstranění parametrů sběr nezapne.
- Při DNT (`1`, `yes`, včetně starších podporovaných forem), GPC nebo offline odesílání skončí bez fronty a opakování. Kontrola při inicializaci i těsně před odesláním.
- Fetch `credentials:'omit'`, `referrerPolicy:'no-referrer'`, `keepalive:true`, `cache:'no-store'`; odmítnutí sítě nesmí narušit navigaci.

| Pevná událost | Jediný odpovídající odkaz |
| --- | --- |
| `portfolio-moje-porce-click` | https://mojeporce.cz/o-aplikaci |
| `portfolio-mestem-hrou-click` | https://mestemhrou.cz/ |
| `portfolio-myslopis-click` | https://myslopis.cz/ |
| `portfolio-vcode-click` | https://vcode.zeleznalady.cz/ |

Příklad: `{"website":"724a2354-e5dd-49c8-add0-c2105491ef65","name":"portfolio-myslopis-click","path":"/prezentaceAI/"}`.

## Proxy a CSP

`connect-src 'self'` se zachová. Veřejný POST končí na přesné edge lokaci spravované VCode. Neproxyovat celou analytiku, Přehled, Umami API ani cizí cíle. Backend aplikace ani jeho přístupová data se nemění. Privátní upstream, klientská důvěryhodná adresa a oddělený serverový klíč se doplní pouze v neveřejné konfiguraci edge.

Edge: limit 2 KiB, jen POST, bez query, bez access logu pro tuto lokaci; odebrat původní hlavičky. Předat pouze Content-Type, ověřovaný Origin, Sec-Fetch-Site, DNT, Sec-GPC, omezený User-Agent a edge důvěryhodnou klientskou IP. Vynutit vlastní X-VCode-Collector-Key a X-VCode-Client-IP; žádné cookies, Authorization, X-Forwarded-* od klienta nebo uživatelské klíče. Collector používá jen vlastní `/v2/events` a existující schválenou síťovou hranici. Přesnou lokaci a návrat ověří vlastník VCode před reloadem Nginx. Aplikace neobdrží klíč, interní upstream ani síťové oprávnění.

## Soukromí a handoff

Konkrétní bajty CS/EN jsou v `docs/integrations/footer-portfolio-20261019/ai-practice.cs.html` a `.en.html`. Přehled ke schválení: `docs/footer-portfolio-privacy-review-2026-10-19.md`. Zveřejnit obě sekce, zpřístupnit od patičky a následně dodat skutečné URL, otisky HTML, asset/bridge otisky, release a přejímku. Veřejné texty musí odpovídat schváleným bajtům; jejich vzhled může používat vlastní shell aplikace.

Pro tuto novou registraci budou pageviews zakázané i na serveru. Žádné měření příběhů, administrace, chatů, přezdívek, návratových kódů ani průchodu. Dosavadní měření návštěv a tlačítka na prezentaci VCode zůstává oddělené.

Malý vlastní typovaný adaptér je přijatelný, pokud přijímá jen čtyři pevné názvy, emituje přesný kontrakt a projde izolovanými testy. Nevynucuje se kopie staršího pageview runtime. Pro trvalý dohled dodat samostatný veřejný JS asset do 10 KiB, skutečně použitý adaptérem, jeho stabilní cestu a SHA-384. Současný monitor pro takový asset ověřuje bajty a odmítnutí prázdného POST; nepoužívá validní produkční eventy. Velký obecný aplikační bundle není náhradou tohoto assetu. Podoba samostatného event-only runtime a další revize monitoru zůstává před aktivací k převzetí.

## Přejímka a aktivace

1. Izolované fixture: čtyři platné názvy, přesná cesta/host, žádný source ani další pole; DNT/GPC/offline, duplicita inicializace, chyba sítě, původní soukromá adresa, pozdější změna URL a neznámý odkaz. Pro AI také serverové odmítnutí pageview.
2. Build/SRI/CSP, veřejný adaptér mimo PWA cache, nativní navigace, čisté mobilní zobrazení. Bez čtení skutečných návštěv nebo syntetických produkčních zpráv.
3. Nasadit app část s centrálními prokliky vypnutými. Doložit zveřejněný schválený text a přesný asset.
4. VCode ověří veřejné bajty a bezpečný edge, potom samostatně doplní přesně čtyři allowedEvents a portfolioMetricsApprovedAt/portfolioMetricsCollectionStartedAt. Ostatní registry beze změny.
5. Report: samostatný web AI v práci → **Zájem o další aplikace** → čtyři cíle a datum zahájení. Čísla jsou prokliky, nikoli počet osob.
6. Návrat: nejdříve vypnout nové události, zachovat zveřejněnou informaci; u atlasu zachovat pageviews a jejich původní datum. Žádná automatická migrace ostatních webů.

## Převzatý klient 19. 10. 2026

Vývojář dodal samostatný event-only runtime `/prezentaceAI/vcode-ai-footer-v1.js`, namespace `window.vcodeAiFooterClicks`, contractVersion `vcode-public-v2`, runtimeRevision `ai-footer-1`. Veřejná metoda pouze `event(name,href)`. Původně uvažovaná portfolio-2 kopie není vyžadovaná.

SRI: `sha384-nm/lSOBg6KGdiCeaiiqTOPA6S+YCHYqZvgogmki08II9ooqDowr/dYIbzF9EBfXJ`. VCode přečetl skutečné dodané bajty; před zapnutím musí odpovídat i veřejnému assetu, HTML/SRI a příslušným testům. Soukromí je `/prezentaceAI/privacy/portfolio.html`.

## Aktuální proxy přejímka

Přidána pouze přesná analytická lokace. Předchozí tři lokace zůstávají beze změny. Aktuální SHA-256 vlastního snippetu: `ae8d00096febb4acf3e89f1f2d74a26cfeae761cf225bab6056ab07ed410c06f`; předchozí SHA-256 `ea7b7b70965b347fe9028bb695b0b2d1a46239a8152201913165ca36596f3ced`. Nginx test i reload úspěšné, privátní konfigurace má režim0600. Přesná privátní cesta zálohy je v provozním dokladu a commentary tohoto chatu; nepatří do veřejné aplikace. Aplikační web/API upstreamy beze změny.

## Produkční aktivace

Vlastník schválil přesné CZ/EN znění i aktivaci přímo v chatu VCode dne 19. 10. 2026. Registrace je aktivní od **2026-10-19T17:30:20.513187+00:00**. Živý sběrač nezávisle potvrdil přesně čtyři povolené portfolio události, `pageviewsEnabled:false` a `captureSources:false`. Serverové odmítnutí pageview bylo ověřeno čistou syntetickou funkcí v reálném obrazu, bez odesílání produkčních událostí. Ostatní registrace zachované.

Veřejný frontend převzat jako `20261019-clicks-aea8d4ee53c5`, manifest SHA-256 `7b0e6cd4d4682443b6b4d54be64feae88f6682ca032ab755596d46718be6cedc`. VCode znovu ověřil veřejné HTML, přesné schválené sekce soukromí a SRI skutečně použitého skriptu. Prázdný POST skončil 400; GET 405; dotaz s parametrem 404; DNT 204.

Centrální kód: `c7f7439436a5d15bd71c7e9d86824e71a738c5da`; 227 testů, kontrola a sestavení obou Docker obrazů. Veřejný statický výstup byte-exact, 194 HTML. Nasazeny pouze tři analytické služby, prostředí a ostatních jedenáct kontejnerů zachované. Veřejné smoke ověřilo zdraví webu/blogu, oba jazyky, prezentace, návody a blogy; API Přehledu bez přihlášení vrací 401. Souhrnné hodnoty návštěvníků nebyly pro přejímku čteny.

Čerstvý monitor **2026-10-19T17:31:19.295Z**: propojení ověřeno (veřejný runtime/SRI a neplatný POST →400). Závěrečná kontrola **17:31:38 UTC** potvrdila zachování ostatních služeb, prostředí a úložišť. Původní obrazy a oddělená záloha registrací jsou zachované pouze na serveru. Podrobný provozní doklad zůstává neveřejný.
