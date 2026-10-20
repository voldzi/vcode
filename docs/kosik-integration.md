# Živý Košík — schválené měření veřejných přehledů

Samostatná registrace Košíku používá veřejný identifikátor `44d46e58-a29f-45c7-aa2e-7243efdf7adc` a doménu `games.zeleznalady.cz`. Vznikla běžným přihlášením vlastníka a Umami API; nemá veřejný odkaz ke statistikám. Registrace sama není souhlasem k měření.

Konkrétní text a rozsah vlastník výslovně schválil dne 20. 10. 2026 odpovědí „Schválit měření i přenos klíče“. Přesný čas této odpovědi není doložen. Schválený text byl zveřejněn a jeho viditelné znění ověřeno v aplikaci. Centrální registrace byla poté aktivována v `2026-10-20T20:33:58.269Z`: `collectionEnabled:true`, `captureSources:false`, `allowedEvents:[]`. Hodnoty `approvedAt`, `metricsApprovedAt`, `collectionStartedAt` a `metricsCollectionStartedAt` zaznamenávají tento čas aplikování schválení a zahájení sběru, nikoli domnělý čas uživatelovy odpovědi.

Schválený kontrakt v2 používá runtime `/kosik/vcode-public-v2.js`, otisk `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5` a přijímač `/kosik/metrics/collect` na stejné doméně. Přesné veřejné cesty jsou:

- `/kosik/`
- `/kosik/pro-obcany`
- `/kosik/aktualne`
- `/kosik/akce`
- `/kosik/urad`
- `/kosik/kontakty`
- `/kosik/zapojte-se`
- `/kosik/uredni-deska`

Administrace, přihlášení, podněty, jejich sledování, přílohy, formuláře, odběry a potvrzení, vyhledávání, stránka soukromí, konkrétní dokumenty, URL parametry a fragmenty jsou vyloučené. Kliknutí a zdroje příchodu se nesbírají. Přijetí provozních zpráv v aplikaci není analytickou konverzí. Klient respektuje DNT/GPC a bez připojení události zahazuje; izolované kontroly používají pouze falešný přenos a zkušební identifikátor.

Doménu sdílí další nezávislá aplikace. Monitor proto vrací `siteId` i přesné cesty a přehled páruje stav podle identifikátoru registrace. Starý stav založený pouze na doméně se použije jen tehdy, pokud na ní registr dokládá právě jediný web. Cizí stav se nepřebírá jako potvrzení připojení Košíku.

## Ověření aktivace

Veřejný text na `/kosik/stranka/ochrana-osobnich-udaju` má SHA256 `0092e70d649cdd81868c0cadbdd8bf13df7682e0334ae123c986408691e5ebd3`. Přesné znění potvrdil koordinátor v zobrazeném DOM i snímku a nezávislá kontrola našla stejné bajty v nasazeném balíčku. Veřejná konfigurace obsahuje pouze tento identifikátor, uvedených osm cest a shodný runtime/SRI. Adaptér odmítl prázdný obsah stavem 400, cizí původ 403 a GET 405; odpovědi neměly cookies ani neveřejné hlavičky a obsahovaly jediný `no-store`, `no-referrer` a `nosniff`.

Aktivační nástroj měnil pouze pět uvedených příznaků/časů Košíku. Původních deset registrací zůstalo shodných, stejně jako inode a oprávnění `0600` souboru. Kolektor přímo v běžícím kontejneru potvrdil načtení aktivní registrace přes existující bind-mount. Samostatný monitor Košíku i druhé aplikace na téže doméně potvrdil připojení; původní web a jeho registrace zůstaly zachovány. Soukromý edge klíč zůstal pouze v neveřejných souborech s oprávněním `0600`; není součástí zdroje ani tohoto dokladu.

Ve zdrojovém projektu Košíku jsou sanitizované doklady `docs/analytics-approval-20261020.json`, `deploy/evidence/analytics-public-notice-20261020.json`, `deploy/evidence/analytics-negative-20261020.json` a `deploy/evidence/analytics-activation-20261020.json`. Guardovaný nástroj `deploy/activate-analytics.py` odmítá chybějící schválení, změněné veřejné bajty, nesprávný rozsah nebo neověřené připojení. Soukromá záloha a provozní doklad zůstávají na serveru.

Kontroly nepoužily skutečné návštěvnické záznamy a neposlaly žádnou platnou zkušební událost do produkce. Dokládají schválení, zveřejnění, nastavení a propojení; nejsou důkazem skutečné návštěvnosti ani přesného počtu lidí.
