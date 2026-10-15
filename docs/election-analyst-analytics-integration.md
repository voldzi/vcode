# Election analyst ve společném Přehledu

## Aktuální stav — 15. 10. 2026

Prezentace a návody CS/EN jsou nasazené; viz `election-analyst-showcase.md`. Election analyst je samostatný devátý záznam pro stávajícího analytického vlastníka. **Měření je aktivní od 15. 10. 2026 16:51:12 Europe/Prague.** Konkrétní CZ/EN znění i aktivaci vlastník schválil přímo ve VCode chatu. Oba texty jsou zveřejněné a přesná frontendová analytická integrace prošla přejímkou. Předání vývojáři i dokončení nasazení uživatel výslovně povolil.

Dosavadních osm registrací zůstalo beze změny. Přidání nevyžadovalo přestavbu ani restart Přehledu: při obnovení dat načítá aktuální serverový registr a ověřuje oprávnění přes Umami. Nebyly čteny návštěvnické záznamy ani odesílány zkušební návštěvy. Novému webu nebylo povoleno veřejné sdílení.

## Veřejný kontrakt pro vývojáře

| Položka | Hodnota |
| --- | --- |
| Název | Election analyst |
| Doména / izolovaný rozsah | `stratos.zeleznalady.cz`, pouze `/ea/` |
| Veřejné ID webu | `5f112d6d-13e8-40ee-9d9c-20065b835743` |
| Verze | `vcode-public-v2` |
| Runtime v aplikaci | `/ea/assets/vcode-analytics-tiktok.js` |
| Zdroj runtime | `services/analytics/public-v2-tiktok.js` v repozitáři VCode |
| SRI | `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5` |
| Přijímač stejného původu | `/ea/analytics/v2/events` |
| Jediná povolená cesta v payloadu | `/ea/` |
| Schválený aktivní rozsah | `pageview`, volitelná normalizovaná kategorie zdroje; žádná kliknutí |
| Neměřená informace o soukromí | `/ea/privacy/analytics/`, CS/EN |

Registry, skutečný edge klíč a vygenerovaná proxy zůstávají pouze na serveru. ID webu a SRI jsou veřejné. `approvedAt` a `metricsApprovedAt` odkazují na souhlas zaznamenaný v `2026-10-15T00:56:54Z`; skutečný začátek obou rozsahů je `2026-10-15T14:51:12.428947+00:00`. `collectionEnabled` a `captureSources` jsou `true`, `allowedEvents` zůstává prázdné pole. Doložení souhlasu nesmí být nahrazeno datem registrace.

## Bridge a oddělení společné domény

Před i po asynchronním načtení runtime ověřit přesný origin, čistou cestu `/ea/`, nepřítomnost query/fragmentu, DNT/GPC a stav online. Nejvýše jedno pevné zobrazení na otevření dokumentu; žádný automatický sběr, klikání nebo sledování routeru. Nečíst aplikaci, její store, výběry nebo lokální poznámky. Zachovat `autoPageview: false`, `autoClick: false`, `captureTitle: false`, `captureReferrer: false`, `credentials: 'omit'`, `offline: 'discard'`. `captureSources: true` lze připravit, aktivovat až po schválení tohoto rozsahu.

Adresy `/ea` mohou nejprve přesměrovat na `/ea/`; jinou cestu normalizací nepřevádět na měřenou stránku. Vstup s parametrem či fragmentem se neměří ani po jejich odstranění během téhož otevření. Změny výběru, hledání a pohyby mapy nesmějí vyvolat další zobrazení nebo událost. Stránka soukromí runtime nenačítá. Service worker nesmí cacheovat analytické POSTy, jejich odpovědi či soukromé údaje, rozšířit scope nebo zasáhnout další STRATOS aplikace.

Příjem potřebuje pouze dvě přesné veřejné cesty podle dohody s vývojářem. Přijímač smí vést pouze do izolovaného analytického kolektoru, ne do Umami administračního API nebo Přehledu. Proxy odstraňuje query, cookies, Authorization a klientem podvržené interní hlavičky; sama nastaví ověřenou IP a neveřejný klíč jediného webu. Nezmění se ochrany ani routování ostatních částí společné domény. Do přístupových logů se měřicí požadavky nezapisují.

## Přejímka a aktivace

1. Konkrétní schválení `election-analyst-analytics-privacy-review.md` a zveřejnění shodného CS/EN textu; veřejný odkaz musí být použitelný na telefonu i klávesnicí.
2. Vývojář doloží vlastní zdrojové změny, runtime/SRI, CSP a testy bridge s umělými daty. Nezaměňovat atlasovou `src/lib/analytics.js` s návštěvnickou analytikou.
3. Izolovaný test sběru: jediná cesta a zdrojové kategorie; odmítnutí mapových/kandidátních údajů, parametrů, dalších aplikací, všech kliknutí, cizího origin a chybného klíče. Samostatně DNT/GPC/offline, načítací závod, opakovaná inicializace a neměřená stránka soukromí.
4. Proxy: kontrola konfigurace bez vypisování klíčů, pouze dohodnuté přesné cesty. Neplatné tělo je bezpečná kontrola dostupnosti, nikoli zkušební návštěva. Chybný klíč se nikdy neopravuje vypnutím kontroly.
5. Aktualizace registru se zálohou a kontrolou souběžných změn. Zapnout pouze tuto registraci a schválené kategorie, uložit skutečné časy schválení a zahájení. Zachovat všechny ostatní záznamy a bind mounty.
6. Oprávněný účet vidí devět metadat registrací; nepřihlášené API zůstává 401. Běžný monitor potvrdí otisk a odmítnutí neplatného payloadu bez vytvoření návštěvy. Ověřit veřejné zdraví a reprezentativní CS/EN stránky.

## Údržba a návrat

Vývojář přidá pravidlo zachování integrace do projektových instrukcí a runbooku. Změna layoutu, routeru, CSP, service workeru nebo nasazení vyžaduje kontrolu bridge; rozšíření cest a událostí vyžaduje novou konkrétní revizi soukromí. Vypnutí vrátí jen `collectionEnabled` této registrace na `false`, nesmaže jiné weby ani jejich historii. Nezveřejňovat registry, edge klíče a interní proxy.

Neveřejný provozní archiv registrace: `election-analyst-analytics-20261014`; konečnou přejímku a aktivaci uchovává `election-analyst-analytics-20261015`. Záloha registru a potvrzení jsou na serveru s omezeným přístupem. Zdrojový dokument neobsahuje klíč ani návštěvnická data. Dokud není konkrétní web přijatý a aktivovaný, stav „Měření vypnuté“ je správný a nesmí se měnit pouze úpravou popisku.

Původní příprava uchovala `ea-collector.conf.pending` (0600). Obsahuje jedinou přesnou lokaci `/ea/analytics/v2/events`, existující ověřený upstream a klíč této registrace. Při této přípravě ještě nebyl zapojený. Finální instalace stejného ověřeného obsahu proběhla 15. 10. 2026 v 16:20:49 Europe/Prague; kontrola konfigurace a reload prošly a všechny původní STRATOS konfigurace zůstaly shodné. Runtime je statický asset atlasu, nikoli druhá neveřejná proxy.

## Ověření přípravy — historický stav před aktivací

`pnpm check` prošlo bez chyb a varování (31 stávajících doporučení). `pnpm test` má 201 úspěšných testů: 62 blog, 107 analytika, 32 stahování. Dva nové testy používají jen syntetické registrace na společném originu a ověřují oddělení klíčů, přesnou atlasovou cestu, odmítnutí politických výběrů i všech kliknutí a nezávislost registrace na souhlasu se sběrem. `pnpm build` ověřilo 182 veřejných stránek a 26 produktů v obou jazycích.

Metadata oprávněného účtu potvrdila novou samostatnou registraci bez veřejného sdílení. Registry přímo v běžícím Přehledu, kolektoru i monitoru obsahují devět položek a novou položku skutečně vypnutou, bez schválení a s jedinou cestou `/ea/`. Nebyla volána souhrnná metrická API původních webů. Neměnily se obrazy ani kontejnery, takže tato příprava nepředstavuje nové vydání webu či blogu nebo důkaz fungujícího frontendového sběru.

## První pokus po schválení — 15. 10. 2026

Souhlas vlastníka je zaznamenaný v připojeném dokumentu soukromí; české i anglické schválené odstavce zůstaly shodné s `b93af41`. Vývojář chatu **Volební atlas** dostal výslovný pokyn dokončit a nasadit tento rozsah a zveřejnit text. Schválení nevyžaduje další opakované potvrzení.

Čerstvý serverový předběžný stav potvrdil devět registrací, atlas stále vypnutý, předchozí provozní obrazy a nulové restarty. Během následné přípravy přestalo fungovat soukromé spojení: SSH na Docker host skončilo timeoutem i na jeho již ověřené adrese; překlad DMZ selhal a spojení na jeho ověřenou adresu také skončilo timeoutem. Nebyla změněna VPN, DNS, firewall ani ověřování klíčů. Vlastník byl požádán o obnovu připojení. Neproběhla instalace collector include, reload proxy, aktivace registru ani přepnutí produkčních obrazů.

Místní `pnpm check`, 201 testů a `pnpm build` (182 stránek, 26 produktů) opět prošly. Sestavily se také oba předepsané obrazy pro `linux/amd64`; tato místní sestavení nenahrazují produkční web/blog a nejsou důkazem nasazení. Po obnově spojení je nutné znovu načíst aktuální serverový stav a dokončit všechny kroky přejímky výše. Před zapnutím ověřit skutečné zveřejnění CS/EN znění, frontendové testy a obraz atlasu, přesnou proxy lokaci a oddělený syntetický sběr. Žádná skutečná ani zkušební návštěva produkčního atlasu nebyla tímto pokusem zapsána.

## Přijatá analytická integrace a produkční aktivace

Dokončeno 15. 10. 2026 v 16:51:12 Europe/Prague; následné stavové ověření proběhlo v 16:53:03. Registrovaných a nakonfigurovaných jako aktivní je devět webů. Původních osm registrací je strukturálně shodných s chráněnou zálohou před aktivací. Úprava zachovala inode a oprávnění registru, takže ji načetly existující bind mounty Přehledu, kolektoru i monitoru bez restartů.

Přijatý frontend atlasu je `0.16.1-20261015-traffic1`, obraz `sha256:a8ed0a389dafaacc984f24823322cdd1dd3a702a756dcc871299219707821eb5`. Vývojář doložil 1023 místních testů a 410 interních produkčních kontrol. VCode nezávisle porovnal všech osm zveřejněných schválených odstavců, nulový počet skriptů na informaci o soukromí, přesný runtime SRI, bridge shodný s aktuálním zdrojem, jediné vložení bridge a zachovanou CSP. Skutečný IAB ověřil 390px zobrazení, oba jazyky a přechod přímo z načtené aplikace na informaci o soukromí.

Celá proxy a skutečný kolektor prošly 28 izolovanými kontrolami se syntetickým registrem, bez vnější sítě a databáze. Ověřily přepsání podvržené IP a edge klíče, odstranění cookies a Authorization, odmítnutí cizího webu na stejném originu, volebních údajů, neznámých cest a všech kliknutí, potlačení DNT/GPC, odstranění query a správné bajty runtime. Dvě počáteční chyby spuštění testovacího Nginx byly uchované a konkrétní práva jeho dočasného paměťového adresáře opravena. Neměnila se oprávnění produkce.

Veřejná collector cesta odmítla prázdné tělo kódem 400 a s DNT/GPC vrátila 204 bez analytického zápisu. První samostatné ověření dokumentace během startu nové aplikace vrátilo 502; zůstalo jako neúspěšný předběžný záznam. Nové ověření po doložené připravenosti prošlo. Nevytvářely se syntetické návštěvy produkčního atlasu a přejímka nečetla skutečné návštěvnické statistiky ani schránku. Přístup vlastníka, soukromá stavová kontrola, odhlášení a revokace relace prošly 200/200/200/401. Běžný monitor potvrdil čerstvé úspěšné propojení. VCode web, blog i atlas byly následně healthy bez restartů po přejímce.

Toto přijetí je výslovně omezené na návštěvnickou frontendovou integraci. Netvrdí dokončení širší přejímky volebních dat: při předání bylo 313 dalších veřejných kontrol úspěšných a pět původních sad zastavených chybějícími místními referenčními soubory; jejich původní výsledky jsou uchované a dokončení spravuje vývojář atlasu odděleně. Zachované podkladové vrstvy a původní volební data se měřením nemění. Případný návrat atlasu musí zachovat tuto integraci nebo koordinovaně vypnout pouze její registraci.
