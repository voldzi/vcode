# MILLORA — samostatná příprava tematických odkazů, 12. října 2026

## Stav a přesný základ

**Příprava zdroje; sestavení a nasazení nejsou součástí tohoto záznamu.**
Výchozí zdroj je přesný commit Rinkletu
`22f675e4370b00b105c994b4d7f6a0389a06069b`.
Návazné vydání má vlastní rozsah MILLORY. Před aktivací musí být samostatné
vydání Rinkletu přijato a skutečná produkční základna znovu přečtena.
Identita zdroje sama nedokazuje aktuální obraz ani produkční přijetí.

## Přímé pověření vlastníka

V původním chatu **Mlýn** (`01a10163-c8da-7240-acb4-d7a4aabe2ff9`) byla přímo
přečtena lidská zpráva `01a125f4-cd7d-7741-a3c0-d2e5c27de17e`:
„Realizuj a v koordinaci se správcem VCode dokonči.“ Navazuje na konkrétní
návrh tematických Custom Product Pages pro hru ve dvou a trénink a směrování
návštěvníků z odpovídajících částí VCode na vlastní odkazy těchto stránek.
Schválení je tedy doloženo původní lidskou zprávou, nikoli pouze pověřením
odeslaným jiným agentem.

Vlastník dále předal Apple notice v lidské zprávě
`01a12e73-99ba-70c2-a5d0-a0c9df1126c7`: dvě položky podání
`6d06df7f-0572-4190-a973-f0c3903172b8` mají dokončené posouzení a jsou způsobilé
k distribuci. Přesné veřejné cíle byly ověřeny odděleně; podklad je v
[millora-cpp-only-public-evidence-2026-10-12.md](millora-cpp-only-public-evidence-2026-10-12.md).

## Dva cílené odkazy v obou jazycích

Do původních karet se za existující odstavec přidají tyto vedlejší odkazy:

| Karta CZ / EN | Odkaz CZ / EN | Custom Product Page |
| --- | --- | --- |
| Soupeř ve vašem zařízení / An opponent on your device | Trénink strategie v App Storu / Strategy practice on the App Store | Train Your Strategy |
| Ve dvou naproti sobě / Share the board | Hra ve dvou v App Storu / Two-player game on the App Store | Play Together |

Cíle i popisky se přenášejí přesně z dříve ověřeného datového souboru v commitu
`cfa63d30ef76132999c6069e4f11650ca3a588cd`. Souhlasí také s konkrétním doporučením
týmu MILLORY `vcode-cpp-cta-recommendation.json` a čtyřmi MILLORA záznamy
VCode v `vcode-game-cpp-public-urls-20261012.json`.

Sdílená komponenta a typ již existují ve výchozím commitu Rinkletu a další
změnu nepotřebují. Výsledkem jsou dva odkazy na každé ze čtyř stávajících
stránek:

- `/aplikace/millora/`
- `/en/apps/millora/`
- `/app-store/millora/`
- `/en/app-store/millora/`

Popisky označují otevření App Storu. Neslibují automatické spuštění konkrétního
režimu ve hře. Hlavní badge i `downloadUrl` ponechávají obecný odkaz
`https://apps.apple.com/cz/app/vcode-millora-morris/id6821033229`.

## Hranice změny

Přesně tři změněné soubory proti výchozímu commitu:

1. `src/lib/game-showcases/millora.ts` — pouze dva `storeLink` bloky.
2. Tento interní přípravný dokument.
3. Interní dokument veřejných důkazů pro MILLORU.

Obsah karet, galerii, pravidla, média a právní texty změna nepřepisuje. Rinklet,
Foldlight a ostatní produktová data i sdílená komponenta zůstávají výchozími
bajty. Stávající `app-store-click` stačí; tracker ani jeho povolený rozsah se
nemění a identifikátor CPP či cílová URL se do analytiky nepřidává.
Apple TV zůstává **Waiting for Review**; schválení CPP nedokazuje schválení
tvOS. Tato příprava neaktivuje PPO, reklamu, app deep links ani monitor.

## Předepsané dokončení koordinátorem

Před vydáním spustit `pnpm check`, `pnpm test` a `pnpm build`, ověřit dvě
správné karty, přesné CS/EN cíle, viditelný klávesnicový fokus, nejméně 44px
dotykový cíl, mobilní zalamování a 200% text. Ověřit hlavní badge/schema,
původní odstavec každé karty, všechny galerie a zachování ostatních her.

Sestavit oba Docker obrazy a použít původní bezpečnostní a publikační brány
včetně čitelnosti veřejných souborů, health endpointů, obou jazyků, blogu,
produktů a návodů. Produkční artefakt vychází z čerstvě přijatého samostatného
vydání Rinkletu; nepoužít dřívější kombinovaný archiv. Uchovat přesnou
konfiguraci, obraz pro návrat, CSP, autentizaci, analytickou integraci a
související provozní služby. Přesná veřejná HTML musí odpovídat kandidátu.

Přijetí produkce a skutečné prokliky budou doloženy samostatným záznamem.
Při této přípravě se neprovádělo sestavení, SSH, nasazení, odesílání formulářů
ani čtení skutečných návštěvnických či poptávkových záznamů.
