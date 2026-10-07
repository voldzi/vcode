# Event ve společném Přehledu VCode

Stav 7. 10. 2026: Event je zaregistrovaný jako osmý web. **Měření je zatím vypnuté** do schválení konkrétního textu vlastníkem a ověření jeho zveřejnění. Připravený text je v `event-analytics-privacy-review.md`.

## Kontrakt

- Doména: `events.zeleznalady.cz`; název v Přehledu: **Event**.
- Veřejný identifikátor: `9026d80f-82a0-4801-b7bd-2e57b04f33f6`.
- Povolená cesta: pouze `/`, po potvrzení nepřihlášeného stavu relace.
- Obecné zdroje příchodu: zapnuté po schválení. Konkrétní URL, parametry a fragmenty se nepřenášejí.
- Kliknutí: prázdný seznam. Soukromé přihlášení není veřejná konverze.
- Runtime `/vcode-analytics-tiktok-v1.js`, kontrakt `vcode-public-v2`.
- Otisk `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5`.
- Přijímač: přesně `/analytics/public/v2/events` na stejné doméně.
- Neměřená informace: `/privacy/analytics`, česká a anglická verze podle přepínače jazyka.

Vyloučené jsou účty, organizace, akce, administrace, platforma, účastníci, přihlášky, docházka, přihlášení a callback. Neukládá se obsah formulářů ani soukromá ID. Vstup do vyloučené části měření pozastaví po zbytek dokumentu. DNT/GPC, offline, neznámý stav relace, cizí origin, query a hash měření blokují. Ochrany se kontrolují i po dokončení asynchronního načtení runtime. React StrictMode nevytváří další zobrazení.

## Trvalá údržba

Event uchovává bridge, testy, přesnou kopii sdíleného runtime, shodné pravidlo v AGENTS.md/CLAUDE.md a `docs/runbooks/11-public-analytics.md`. Rozšíření cest nebo událostí vyžaduje novou revizi rozsahu a konkrétní informace o měření. Změna layoutu, routeru, CSP nebo nasazení musí ověřit integraci.

Neveřejný registr a edge klíč zůstávají pouze na serveru. Veřejná proxy nepřeposílá browserem zadanou IP ani nepouští administrační API. Pravidelný monitor ověřuje přesný otisk runtime a odmítnutí neplatného měřicího požadavku. Při přejmenování produktu nebo změně domény je nutné upravit registr i bridge.

## Připravené kontroly

Izolovaná implementace vychází ze skutečně nasazeného Event commitu `8e4842125fd13ffd45a95e927d0c86ad2be4f825`; zachovává rozpracované soubory v hlavním Event checkoutu. Nezávislá kontrola AI kódu nenašla blokující problém. 36 cílených analytických testů prošlo; celková sada má 963 úspěšných testů a 70 již existujících přeskočených DB integrací. Kontroly skeletonu, lint, typů, sestavení, i18n a OpenAPI prošly. Audit produkčních závislostí nehlásí známé zranitelnosti; Gitleaks neodhalil tajné údaje.

Prověřená implementace je commit `a4f353f241bbe3bebd33bf171903cd936532a274`, návrh [Event PR #9](https://github.com/voldzi/Event/pull/9). Obraz `event-web:analytics-20261007-a4f353f-amd64` je připravený pro Linux/amd64, sestavení a kontrola Nginx prošly. Před schválením textu nenahrazuje běžící web. Neveřejný registr už web obsahuje se zakázaným sběrem; samostatná proxy přijímače byla zapojena po úspěšné kontrole a záloze Nginx konfigurace. Zdrojový archiv konkrétního commitu a záloha předchozího stavu jsou pouze na serveru.

Produkční aktivace vyžaduje schválení textu, ověření obou jazyků a mobilní stránky, shodu nasazeného runtime a bridge, bezpečnou proxy a kontrolu metadat v Přehledu. Přijímací testy používají syntetické konfigurace; nevytvářejí skutečné návštěvy ani nečtou návštěvnické záznamy. API, worker a databáze Event se tímto vydáním nemění.
