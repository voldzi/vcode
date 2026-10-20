# Živý Košík — připravená, vypnutá analytika

Samostatná registrace Košíku používá veřejný identifikátor `44d46e58-a29f-45c7-aa2e-7243efdf7adc` a doménu `games.zeleznalady.cz`. Vznikla běžným přihlášením vlastníka a Umami API; nemá veřejný odkaz ke statistikám. Registrace sama není souhlasem k měření.

Sběr musí zůstat vypnutý: `collectionEnabled:false`, `approvedAt:null`, `metricsApprovedAt:null`, `captureSources:false`, `allowedEvents:[]`. Datum zahájení sběru není vyplněné. Před aktivací musí vlastník schválit konkrétní informaci a rozsah, text se zveřejní v aplikaci a projdou izolované kontroly podle integračního standardu. Tento dokument žádnou aktivaci neschvaluje.

Připravený kontrakt v2 používá runtime `/kosik/vcode-public-v2.js`, otisk `sha384-JpAOJexapVVtAZAFpz3dwp4AHY8PLbao7cLk7Mg7VFIDy2g0/bOUl0zb/HO1qbX5` a přijímač `/kosik/metrics/collect` na stejné doméně. Navržené přesné veřejné cesty jsou:

- `/kosik/`
- `/kosik/pro-obcany`
- `/kosik/aktualne`
- `/kosik/akce`
- `/kosik/urad`
- `/kosik/kontakty`
- `/kosik/zapojte-se`
- `/kosik/uredni-deska`

Administrace, přihlášení, podněty, jejich sledování, přílohy, formuláře, odběry a potvrzení, vyhledávání, stránka soukromí, konkrétní dokumenty, URL parametry a fragmenty jsou vyloučené. Kliknutí a zdroje příchodu nejsou součástí návrhu. Přijetí provozních zpráv v aplikaci není analytickou konverzí.

Doménu sdílí další nezávislá aplikace. Monitor proto vrací `siteId` i přesné cesty a přehled páruje stav podle identifikátoru registrace. Starý stav založený pouze na doméně se použije jen tehdy, pokud na ní registr dokládá právě jediný web. Cizí stav se nepřebírá jako potvrzení připojení Košíku.

Příprava se ověřuje metadaty registrace, vypnutými příznaky, shodou runtime a běžným negativním monitorovým požadavkem. Nevytváří zkušební návštěvy v ostrých statistikách a nevyžaduje čtení návštěvnických záznamů. Stav připojení může být neověřený, dokud není nasazen připravený runtime a adaptér; vypnutý sběr je samostatný stav.
