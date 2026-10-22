# Výběr aplikace v Přehledu — 22. října 2026

## Příčina a oprava

AI v práci a Živý košík jsou dvě samostatné registrace na stejné doméně. Přehled dříve používal doménu jako hodnotu položky i klíč detailu. Kliknutí na Živý košík proto vybralo první aplikaci se stejnou doménou, tedy AI v práci. Samotné statistiky zůstávaly oddělené na serveru.

Odpověď soukromého API nyní obsahuje `siteId` z registrace, ale nadále pouze pro aplikace povolené přihlášenému uživateli. Karty, srovnání, hlavní filtr, výběr detailu, zachování výběru a CSV používají toto ID. Doména zůstává popiskem, nikoliv identitou aplikace. Pro starší odpověď API bez ID zůstává přechodná kompatibilita.

V této větvi je zároveň zachována již dříve nasazená kontrola identity propojení z `connection-identity.mjs`. Tato část běžela v produkčním obrazu před opravou; monitor se znovu nenasazoval. Produkční JavaScript a server byly porovnány s aktuálním obrazem, aby oprava nepřepsala novější funkce Přehledu.

## Ověření

- Automatické testy výběru dvou aplikací se stejným hostname, návratu k jiné aplikaci, nezávislých hodnot obou nabídek, zachování výběru a odmítnutí neexistujícího ID.
- HTTP test skutečného API potvrzuje vrácení identifikátorů pro povolené registrace; autentizace a nezpřístupnění klíčů zůstávají ověřené.
- Izolovaná serverová regrese: 147 analytických, 62 blogových a 32 distribučních testů, všechny úspěšné, bez přístupu k produkčním datům a bez sítě kontejneru.
- Mobilní Chromium (390 × 844): kliknutí na kartu a řádek srovnání, oba filtry, samostatné cesty a hodnoty v detailu, CSV pouze vybrané aplikace, změna jazyka a obnovení. Bez chyb JavaScriptu. Scénář byl ověřen i se soubory staženými z produkce, vždy se syntetickými statistikami. Fyzický iPhone/PWA nebyl ověřen.

## Nasazení

Nasazena pouze služba Přehledu jako rozšíření přesného běžícího obrazu. Zachováno prostředí, úložiště, proces, oprávnění, limity, síťové členství a ostatních 13 služeb. Záloha obrazu i původních souborů a návratový overlay jsou uchovány v chráněném nasazení `site-selection-20261022`.

Veřejná kontrola potvrdila přesnou shodu JavaScriptu s opraveným zdrojem, obsahovou verzi skriptu pro PWA, HTTP 401 soukromého API bez přihlášení a HTTP 200 kontrol zdraví webu a blogu. Nastavení sběru, schválený rozsah měření a návštěvnické záznamy se neměnily.

Otevřený Přehled je potřeba obnovit. Pokud nainstalovaná PWA nabídne aktualizaci, uživatel ji potvrdí běžným tlačítkem Aktualizovat.
