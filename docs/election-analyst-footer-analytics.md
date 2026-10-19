# Volební atlas — přesné měření čtyř odkazů v patičce

## Aktuální stav

Příprava: 19. října 2026. Prokliky jsou centrálně **vypnuté** do ověření zveřejnění a přijetí aplikace. Konkrétní text i aktivaci vlastník již schválil v původním chatu; skutečná otázka a lidská odpověď byly ověřeny čtením historie. Lidské zadání ke koordinaci, implementaci a nasazení je ověřené; pravidlo AGENTS.md navíc vyžaduje kontrolu konkrétního právního znění. Centrální kód se připravuje. Stav registrace bude doplněn po skutečném vytvoření; samotný identifikátor není dokladem zapnutí.

## Kontrakt

- Veřejné ID: `5f112d6d-13e8-40ee-9d9c-20065b835743`. Stávající registrace, její souhlas a clean-entry návštěvnost se zachovají.
- Origin: `https://stratos.zeleznalady.cz`.
- Jediná zdrojová cesta: `/ea/`.
- Jediný same-origin přijímač: `/ea/analytics/v2/events`, pouze POST JSON.
- Wire formát `vcode-public-v2`: právě `website`, `name`, `path`. Žádný `source`, URL, title, referrer, cílová adresa, dynamický identifikátor ani další vlastnosti.
- Žádné automatické pageviews, obecné click listenery, odložené odesílání nebo úložiště pro tyto prokliky.
- Pouze výslovná obsluha čtyř veřejných odkazů z patičky; ověřit skutečný href proti pevné mapě. Linky zůstávají nativní, bez preventDefault a čekání.
- HTTPS a přesný původ; kliknutí pouze z výslovně označené patičky veřejného atlasu a jeho zveřejněných statických přehledů. Po SPA výběru může mít adresa query/fragment: bridge tyto hodnoty vůbec nečte a do požadavku vždy vloží konstantu `/ea/`. Na stránce soukromí, API, správě ani soukromých pracovních plochách se bridge nenačítá a neváže. Existující clean-entry pravidla pro pageview zůstávají oddělená a nezměněná.
- Při DNT (`1`, `yes`, včetně starších podporovaných forem), GPC nebo offline odesílání skončí bez fronty a opakování. Kontrola při inicializaci i těsně před odesláním.
- Fetch `credentials:'omit'`, `referrerPolicy:'no-referrer'`, `keepalive:true`, `cache:'no-store'`; odmítnutí sítě nesmí narušit navigaci.

| Pevná událost | Jediný odpovídající odkaz |
| --- | --- |
| `portfolio-moje-porce-click` | https://mojeporce.cz/o-aplikaci |
| `portfolio-mestem-hrou-click` | https://mestemhrou.cz/ |
| `portfolio-myslopis-click` | https://myslopis.cz/ |
| `portfolio-vcode-click` | https://vcode.zeleznalady.cz/ |

Příklad: `{"website":"5f112d6d-13e8-40ee-9d9c-20065b835743","name":"portfolio-myslopis-click","path":"/ea/"}`.

## Proxy a CSP

`connect-src 'self'` se zachová. Veřejný POST končí na přesné edge lokaci spravované VCode. Neproxyovat celou analytiku, Přehled, Umami API ani cizí cíle. Backend aplikace ani jeho přístupová data se nemění. Privátní upstream, klientská důvěryhodná adresa a oddělený serverový klíč se doplní pouze v neveřejné konfiguraci edge.

Edge: limit 2 KiB, jen POST, bez query, bez access logu pro tuto lokaci; odebrat původní hlavičky. Předat pouze Content-Type, ověřovaný Origin, Sec-Fetch-Site, DNT, Sec-GPC, omezený User-Agent a edge důvěryhodnou klientskou IP. Vynutit vlastní X-VCode-Collector-Key a X-VCode-Client-IP; žádné cookies, Authorization, X-Forwarded-* od klienta nebo uživatelské klíče. Collector používá jen vlastní `/v2/events` a existující schválenou síťovou hranici. Přesnou lokaci a návrat ověří vlastník VCode před reloadem Nginx. Aplikace neobdrží klíč, interní upstream ani síťové oprávnění.

## Soukromí a handoff

Konkrétní bajty CS/EN jsou v `docs/integrations/footer-portfolio-20261019/election-analyst.cs.html` a `.en.html`. Přehled ke schválení: `docs/footer-portfolio-privacy-review-2026-10-19.md`. Zveřejnit obě sekce, zpřístupnit od patičky a následně dodat skutečné URL, otisky HTML, asset/bridge otisky, release a přejímku. Veřejné texty musí odpovídat schváleným bajtům; jejich vzhled může používat vlastní shell aplikace.

Stávající návštěvnost a původní runtime/SRI se nenahrazují. Samostatný adaptér pro kliknutí nesmí přepsat window.vcodePublicAnalytics ani znovu zavolat pageview. Ve stávajícím textu změnit pouze explicitní větu, která vylučovala veškeré klikání; připravené celé HTML níže ji nahrazuje a přidává oddělené sekce.

Malý vlastní typovaný adaptér je přijatelný, pokud přijímá jen čtyři pevné názvy, emituje přesný kontrakt a projde izolovanými testy. Nevynucuje se kopie staršího pageview runtime. Pro trvalý dohled dodat samostatný veřejný JS asset do 10 KiB, skutečně použitý adaptérem, jeho stabilní cestu a SHA-384. Současný monitor pro takový asset ověřuje bajty a odmítnutí prázdného POST; nepoužívá validní produkční eventy. Velký obecný aplikační bundle není náhradou tohoto assetu. Podoba samostatného event-only runtime a další revize monitoru zůstává před aktivací k převzetí.

## Přejímka a aktivace

1. Izolované fixture: čtyři platné názvy, přesná cesta/host, žádný source ani další pole; DNT/GPC/offline, duplicita inicializace, chyba sítě, query/fragment getters nesmějí být vůbec čtené, klik z veřejného SPA a statického přehledu mají konstantní path, soukromé a neoznačené plochy jsou vyloučené; neznámý odkaz. Pro AI také serverové odmítnutí pageview.
2. Build/SRI/CSP, veřejný adaptér mimo PWA cache, nativní navigace, čisté mobilní zobrazení. Bez čtení skutečných návštěv nebo syntetických produkčních zpráv.
3. Nasadit app část s centrálními prokliky vypnutými. Doložit zveřejněný schválený text a přesný asset.
4. VCode ověří veřejné bajty a bezpečný edge, potom samostatně doplní přesně čtyři allowedEvents a portfolioMetricsApprovedAt/portfolioMetricsCollectionStartedAt. Ostatní registry beze změny.
5. Report: samostatný web Volební atlas → **Zájem o další aplikace** → čtyři cíle a datum zahájení. Čísla jsou prokliky, nikoli počet osob.
6. Návrat: nejdříve vypnout nové události, zachovat zveřejněnou informaci; u atlasu zachovat pageviews a jejich původní datum. Žádná automatická migrace ostatních webů.

## Samostatný klikací runtime

Lze použít přesnou kopii `services/analytics/public-v2-portfolio-2.js` s `captureSources:false`, všemi auto flags false a čtyřmi explicitními eventy. Doporučená veřejná cesta `/ea/assets/vcode-analytics-portfolio-2.js`. Původní pageview runtime/SRI i bridge zůstávají beze změny. Klikací bridge si uchová vlastní vytvořenou instanci; pozdější načtení druhého runtime nesmí měnit její chování. Izolované testy musí pokrýt obě pořadí načtení a absenci druhého pageview.

## Finální klient od vývojáře

Zvolený vlastní event-only adaptér `/ea/assets/ea-portfolio-clicks.js` je samostatný a nemění globální pageview runtime ani jeho SRI/bridge. SHA-256 `3a5b741a4fe3cecdcd1ef3373ee63b359d07427974001a951fa9e7a0aa627a18`, SRI `sha384-E8XumpgdkYX3/eIF/ndlJMBKe8SWSENEP85pRbFwkR5hjw4DTcmTc1MzoEKhoCJx`. Doporučení portfolio-2 runtime výše je pouze možnost; tento dodaný adaptér je určen k aktuálnímu převzetí. Před zapnutím se ověří skutečné veřejné bajty a nová informace; původní návštěvnost zůstává zapnutá.
