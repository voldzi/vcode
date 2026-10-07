# Event ve společném Přehledu VCode

Stav 7. 10. 2026: Event je zaregistrovaný jako osmý web. **Měření je zapnuté a propojení ověřené.** Vlastník schválil konkrétní CZ/EN text i aktivaci odpovědí „Souhlasím“. Text je zveřejněný na `/privacy/analytics` a zachycený v `event-analytics-privacy-review.md`. Sběr začal 7. 10. 2026 v 21:43:21 Europe/Prague.

## Kontrakt

- Doména: `events.zeleznalady.cz`; název v Přehledu: **Event**.
- Veřejný identifikátor: `9026d80f-82a0-4801-b7bd-2e57b04f33f6`.
- Povolená cesta: pouze `/`, po potvrzení nepřihlášeného stavu relace.
- Obecné zdroje příchodu: zapnuté. Konkrétní URL, parametry a fragmenty se nepřenášejí.
- Kliknutí: prázdný seznam. Soukromé přihlášení není veřejná konverze.
- Runtime `/vcode-analytics-tiktok-v1.js`, kontrakt `vcode-public-v2`.
- Otisk `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5`.
- Přijímač: přesně `/analytics/public/v2/events` na stejné doméně.
- Neměřená informace: `/privacy/analytics`, česká a anglická verze podle přepínače jazyka.

Vyloučené jsou účty, organizace, akce, administrace, platforma, účastníci, přihlášky, docházka, přihlášení a callback. Neukládá se obsah formulářů ani soukromá ID. Vstup do vyloučené části měření pozastaví po zbytek dokumentu. DNT/GPC, offline, neznámý stav relace, cizí origin, query a hash měření blokují. Ochrany se kontrolují i po dokončení asynchronního načtení runtime. React StrictMode nevytváří další zobrazení.

## Trvalá údržba

Event uchovává bridge, testy, přesnou kopii sdíleného runtime, shodné pravidlo v AGENTS.md/CLAUDE.md a `docs/runbooks/11-public-analytics.md`. Rozšíření cest nebo událostí vyžaduje novou revizi rozsahu a konkrétní informace o měření. Změna layoutu, routeru, CSP nebo nasazení musí ověřit integraci.

Neveřejný registr a edge klíč zůstávají pouze na serveru. Veřejná proxy nepřeposílá browserem zadanou IP ani nepouští administrační API. Pravidelný monitor ověřuje přesný otisk runtime a odmítnutí neplatného měřicího požadavku. Při přejmenování produktu nebo změně domény je nutné upravit registr i bridge.

## Kontroly a nasazení

Izolovaná implementace vychází ze skutečně nasazeného Event commitu `8e4842125fd13ffd45a95e927d0c86ad2be4f825`; zachovává rozpracované soubory v hlavním Event checkoutu. Nezávislá kontrola AI kódu nenašla blokující problém. 36 cílených analytických testů prošlo; celková sada má 963 úspěšných testů a 70 již existujících přeskočených DB integrací. Kontroly skeletonu, lint, typů, sestavení, i18n a OpenAPI prošly. Audit produkčních závislostí nehlásí známé zranitelnosti; Gitleaks neodhalil tajné údaje.

Prověřená implementace je commit `a4f353f241bbe3bebd33bf171903cd936532a274`, sloučený přes [Event PR #9](https://github.com/voldzi/Event/pull/9), merge `015abd053ce50110e3484b1c036f7e3958d0cc1d`. Dokumentační konflikt byl vyřešen v `0878151` bez změny spustitelných zdrojů; nezávislá kontrola a 36 cílených testů znovu prošly. Nasazený obraz `event-web:analytics-20261007-a4f353f-amd64` má na produkčním Docker hostu ID `sha256:9b1155d12dece1b1c6d11dce8b96368e03a2cf4c0826dff34979bbabb8c31d99` a správnou revizi v OCI metadatech. Sestavení Linux/amd64 i kontrola Nginx prošly.

Produkce používá všechny čtyři stávající Compose soubory; změnil se pouze digest webového obrazu v `compose.managed-pilot.yml`. Web je healthy, `/healthz`, `/api/health`, `/api/readyz`, stránka informace i runtime vracejí 200. Neautorizované `/api/me` vrací 403. Identita kontejnerů API a workeru zůstala shodná s ověřeným stavem před vydáním; databáze ani soukromé nastavení se neměnily. Zdrojový archiv konkrétního commitu, chráněné zálohy předchozí konfigurace a registru i záznam předchozích obrazů jsou v neveřejném serverovém archivu vydání `event-analytics-20261007`; původní webový obraz zůstává dostupný pro návrat. Soukromé cesty archivu nepatří do veřejného repozitáře.

Po vykreslení českého i anglického zveřejněného textu byl aktivován pouze schválený záznam Eventu. Neměřená stránka nenačítá analytický runtime. Otisk veřejného assetu souhlasí; přijímač odmítl prázdné tělo, soukromou cestu, kliknutí a cizí origin kódem 400. DNT/GPC požadavky skončily 204 bez analytického zápisu. Jednorázová kontrola běžným monitorem potvrdila 7/7 v2 propojení, Event `connected: true` v `2026-10-07T19:44:26.516Z`. Osmým webem je původní VCode integrace. Ověření oprávnění používá jen metadata registrace; skutečné návštěvnické záznamy nebyly použity jako testovací data.

Mobilní náhled stránky byl ověřen při šířce 390 px bez vodorovného přetékání; patička má mezery a zalamování. Přijímací testy používají syntetické konfigurace, nevytvářejí skutečné návštěvy ani nečtou návštěvnické záznamy. Běžný monitor pokračuje v pětiminutové kontrole a Přehled čte registr při obnovení dat. Nulová návštěvnost po aktivaci neznamená poruchu; historii před zahájením sběru nedoplňujeme.
