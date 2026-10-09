# Předvolení veřejného formuláře spolupráce

## Odkazy pro Městem hrou

- Česky: `https://vcode.zeleznalady.cz/spoluprace/?app=mestem-hrou&area=partnership#poptavka`
- Anglicky: `https://vcode.zeleznalady.cz/en/work-with-us/?app=mestem-hrou&area=partnership#poptavka`

Odkazy nabídnou aplikaci **Městem hrou** a oblast **Partnerství** v existujícím veřejném formuláři. Návštěvník volby vidí a může změnit. Zpráva se odešle až jeho vlastním odesláním do stávající schránky poptávek; platí schválené znění `contact-20261009`, 90denní uchování a obecné upozornění na Telegram.

## Konečný veřejný kontrakt

Pouze parametry `app` a `area`, každý nejvýše jednou. Hodnoty musí přesně odpovídat neprázdným, povoleným možnostem ve vykresleném formuláři. `app` vybírá existující veřejné ID aplikace z `src/lib/products.ts`. `area` má hodnoty `development`, `partnership`, `private-deployment` nebo `other`. Dotaz má nejvýše 512 znaků.

Neznámý klíč, duplicitní klíč, prázdná nebo nepovolená hodnota či nadměrná délka odmítne celé předvolení. Formulář funguje dál bez předvoleb. Jméno, e-mail, organizace, text zprávy, údaje ze hry nebo lokace do odkazu nikdy nepatří. Ani tyto údaje, ani předvolby se nepřebírají do analytiky.

Předvolení běží jednou, pouze v prázdných polích. Nemění výchozí hodnoty, neodesílá formulář, nepřesouvá fokus a neukládá nic do browser storage. Po úspěšném odeslání se formulář vyprázdní. Při nejistém výsledku zůstává původní zpráva a její identifikátor zachovaný podle existující ochrany proti duplicitám.

## Oddělení analytiky a schránek

Tracker očistí adresu stránky před odesláním: zachová jen stávající povolené `utm_source`, `utm_medium` a `utm_campaign`; odstraní všechny ostatní parametry a fragment. Ze zdroje příchodu posílá pouze HTTPS origin bez přihlašovacích údajů. Samotný požadavek ani načtení trackeru nenesou adresu formuláře v hlavičce Referer. Stávající počítadla, DNT/GPC a serverová kontrola zůstávají zachované.

Vybraná aplikace není ověřeným původem návštěvy. Samostatný deklarovaný původ nemá aktuální API ani databáze; jeho případný rozsah je pouze neaktivní návrh v `contact-source-privacy-review.md`.

Propojení nepoužívá nový soukromý příjem nabídek Partnerství pro Moje porce. Nemění jeho zapnutí, schválení, registry, retenci ani samostatnou soukromou TLS bránu.

## Ověření a nasazení

Izolované testy používají syntetické kontakty: obě jazykové verze, konečné předvolby, ruční změnu, odmítnutí cizích parametrů, zachování zprávy při opakování, vyprázdnění po úspěchu a očištění těla i hlavičky analytiky. Validátor sestavení vyžaduje předem schválený tracker a jeho `no-referrer` politiku.

Před nasazením: `pnpm check`, `pnpm test`, `pnpm build`, webový i blogový Docker obraz, obraz dashboardu a izolované ověření Nginx. Nasazují se pouze web a dashboard; blog, worker, sběr analytiky, databáze, soukromá brána a stahování si ponechají svou identitu a konfiguraci. Zkontrolovat aktuální produkční zdroje a konfiguraci, připravit návrat ke starým obrazům, zachovat existující relace a připojené soubory. Poté ověřit obě jazykové verze, zdroje skriptů, zdraví a anonymní zákaz přístupu k neveřejným API. Produkční přijetí nepoužívá skutečné návštěvnické záznamy ani neposílá zkušební poptávku do živé schránky.

## Produkční potvrzení — 9. října 2026

Nasazeno a ověřeno v **19:57 Europe/Prague (17:57 UTC)**. Oba odkazy výše jsou veřejně dostupné. Předepsané kontroly a všech **163 testů** (52 blog, 79 analytika, 32 distribuce) prošly. Sestavení proběhlo z aktuálních produkčních zdrojů s pouze vybranou změnou; existující vydání Rinklet a ostatní stránky zůstaly součástí kandidáta.

- Web: `sha256:427817c562b42ad38fc12a8d7702822943a7bfb7a2c869ab9fce4e2ad80f9792`.
- Dashboard: `sha256:5ac55c8c11946daef31460ffe4bcaa800c4abec52914c3d614ddfe26874bae06`.
- `/contact.js?v=20261009-2`: SHA-256 `7092543fdfa4a80656fe7915cebb10985790604358200a86a8e75db2a7df35d7`.
- Šablona `/analytics/tracker.js`: SHA-256 `b4017023529afa4386cab83c78f6cc200ef2e054e897b0f2178b883cef246534`; veřejné bajty se při čtení přesně shodovaly s touto testovanou šablonou po vložení stávajícího veřejného ID webu.

Živé kontroly ověřily zdraví, domovské/product/návodové/blogové stránky v obou jazycích, obě předvolené stránky, přesné skripty, dostupnost formuláře s verzí `contact-20261009` a anonymní zákaz neveřejných API. Konfigurace upozornění na Telegram je připravená; skutečná zkušební zpráva ani upozornění nebyly odeslány. Schválené soukromí, API, kontaktní backend, ostatní kontejnery i vypnutý příjem nabídek Moje porce zůstaly zachované. Zkontrolovány byly i skutečné prostředí a připojené soubory nových kontejnerů včetně relací dashboardu.

První pokus o kontrolu dostupnosti formuláře chybně vynechal povinný údaj `Sec-Fetch-Site: same-origin`; služba jej správně odmítla 403. Automatický návrat obnovil staré obrazy, prostředí a připojené soubory, což bylo ověřeno před opakováním. Opravena byla pouze kontrola, aby odpovídala požadavku prohlížeče; ochrana se neoslabovala. Druhé nasazení prošlo všemi závěrečnými kontrolami.

Privátní provozní potvrzení: vydání `contact-prefill-20261009`, soubory `gates.json`, `preflight.json`, `deployment.json`, `first-attempt-restored.json` a per-gate logy. Aktuální omezené příkazy instalace a návratu jsou uloženy v chráněné konfiguraci operátora. Samostatný původ zůstává neaktivním návrhem; Městem hrou jej pro toto propojení nepožaduje.
