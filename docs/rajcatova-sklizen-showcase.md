# Rajčatová sklizeň — prezentace VCode

Stav 15. 10. 2026: **NASAZENO A OVĚŘENO**, přejímka v 16:18:17 Europe/Prague. Přímý souhlas uživatele s přidáním, skutečným snímkem a ověřeným nasazením byl ověřen v chatu Rajčatové sklizně. Prezentace VCode je samostatné vydání; nemění provoz ani data hry.

## Rozsah

- Produkt `rajcatova-sklizen`, český název Rajčatová sklizeň a anglický Tomato Harvest.
- Karta mezi hrami na úvodu a v obou herních katalozích.
- Detaily `/aplikace/rajcatova-sklizen/` a `/en/apps/rajcatova-sklizen/`.
- Přímé tlačítko Hrát zdarma / Play for free na `https://games.zeleznalady.cz/tomato/`.
- Bezplatná retro arkáda: čtyři pozice, tři chyby, denní výzva, dobrovolný žebříček a offline hraní po prvním online načtení a uložení souborů.
- Anglický detail i návod výslovně uvádějí české rozhraní samotné hry. Žádný App Store badge ani tvrzení o fyzicky ověřeném telefonu.
- Dva veřejné návody s pravidly a podmínkami offline hraní; produktový výběr v kontaktním formuláři je synchronizovaný.
- Stávající portfolio analytika zůstává beze změny. Žádná registrace hry v analytice, nový collector, nový právní text nebo aktivace měření hry.

## Skutečné obrazové podklady

Zdroj: produkční hra, ověřená vývojářem v in-app prohlížeči 15. 10. 2026. Originál `35-production-new-catch.jpg`, 1280 × 720. Vývojářem připravený výřez přístroje má rozměr 343 × 694, pozici levého horního rohu 313,10 a neobsahuje přikreslení.

Výřez je převzat beze změny jako `public/showcases/rajcatova-sklizen/gameplay.webp`, SHA-256 `352baa1bf46079930421aa8578b413f6d114d13f3e67450efa87607b6feb0099`. Hero zachovává celý přístroj včetně ovladačů pomocí `object-fit: contain`. Jediný snímek se neopakuje v prázdné galerii; vedle tlačítka ke hraní je přímý odkaz na pravidla.

Ikona `public/apps/rajcatova-sklizen.png` je původní `favicon_512.png` hry. Zdrojovým dokladem skutečné funkčnosti hry je její `docs/archive/2026-10-15-in-app-validation-and-deploy.md`. Tento doklad sám nepotvrzuje nasazení prezentace VCode.

## Ověření a vydání

Vyžaduje se kontrola obou jazyků a herních katalogů na desktopu a mobilu, skutečný snímek a přímé CTA, standardní kontroly VCode a potvrzení nezměněných integračních hranic. Soukromé potvrzení nasazení uchovává skutečný zdrojový základ, obrazy, návrat a veřejné výsledky. Dokud tato přejímka neproběhne, stav tohoto dokumentu se nesmí zaměnit za nasazeno.

### Přijatý výsledek

Nasazený zdrojový commit je `645c4e13db9cebbef9001bf77830e2a33bbfcabc`. Kontrola, 201 testů i sestavení prošly; 188 HTML a šest vybraných assetů se bajtově shodovaly se sestaveným webovým obrazem. Osm vlastních skutečných IAB kontrol pokrylo detail i katalog v CS/EN při šířkách 390 a 1280 px, načtené původní obrázky, obousměrnou změnu jazyka a absenci vodorovného přetékání. Fyzický telefon ani 200% textové zvětšení tímto protokolem nejsou potvrzené. První mylná zmínka o volbě běžného režimu byla opravena před finální přejímkou; hra nabízí denní výzvu.

Veřejných 33 HTTP kontrol zahrnulo oba jazyky, návody, katalog, zdraví webu a blogu, chráněné dashboardové cesty a zachované mediální výluky. Skutečný veřejný IAB potvrdil detail, načtené obrázky a přímé CTA. Aktivní web je `sha256:6ed19c38acce7a4bee8e03f30bfaf222a0f93322c5af4893e4c0eb1ba71a95e1`. Blog používá úzkou vrstvu dvou kontaktních JSON nad předchozím skutečným runtime, obraz `sha256:da133e46dd68a0bb549e0adb4c657c282334e87884a81fe4c34e45e5cd354edc`; kompletní zdrojový blog kandidát se nenasazoval. Osm dalších služeb, původní procesní konfigurace, svazky, sítě a ochrany byly zachované. Neodeslala se skutečná poptávka, skóre ani Telegram zpráva.

Tento závěrečný dokumentační doplněk nemění přijatý runtime ani jeho historický zdrojový balík. Potvrzení a produkční snímek jsou v neveřejném archivu `tomato-showcase-20261015`.
