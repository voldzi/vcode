# Rajčatová sklizeň: česká a anglická hra

15. 10. 2026. Navazující prezentační vydání po potvrzení veřejného dvojjazyčného
herního sestavení vývojářem v oprávněném chatu Rajčatové sklizně.

## Rozsah

- České CTA a návod otevírají `/tomato/?lang=cs`, anglické `/tomato/?lang=en`.
- Produkt, herní prezentace, katalogy a generovaný llms.txt již neuvádějí, že je
  samotná hra pouze česky. Oba veřejné návody v revizi 1.1 popisují změnu jazyka
  během partie bez nového začátku. Anglický návod používá skutečné `Play now`.
- Původní skutečný snímek a jeho bajty zůstávají zachované. Jeho alternativní
  popis přesně rozlišuje vyobrazené české rozhraní od podporovaných jazyků hry.
- Šablona sdílí volitelnou anglickou adresu ke hraní; ostatní hry bez ní se
  nezmění. Rozložení, CSS, CSP a právní texty se nemění.
- Nové měření prokliků se neaktivuje; audit a potřebné další kroky jsou v
  `tomato-traffic-discovery-audit-2026-10-15.md`.
- Blog neobsahuje publikovaný článek o Rajčatové sklizni ani zdrojovou zmínku
  o jejím pouze českém rozhraní. Nový článek se automaticky nevytváří.

`pnpm check`, 201 testů a sestavení 188 statických stránek prošly. Navazující
kontrola browseru, sestavení obou Docker obrazů a veřejná přejímka jsou doložené níže.

## Produkční přejímka

**Nasazeno a ověřeno 15. 10. 2026 v 18:18:11 Europe/Prague**
(`2026-10-15T16:18:11.355352+00:00`). Zdroj: `f3d8d5f`.

- Webový obraz: `sha256:6cabed79c89e0839f302ebb62d23be810f059938c445e05a44232a22938ce90e`.
- Oba Docker obrazy se sestavily. Kompletní blogový kandidát je
  `sha256:4d72ba4f1b3dd80621760d533b0b6d528961944df2d7ade6792787fdcccf1903`;
  neaktivoval se. Běžící blog zůstal na původním úzce přijatém runtime obrazu
  `sha256:da133e46dd68a0bb549e0adb4c657c282334e87884a81fe4c34e45e5cd354edc`.
- Všech 188 HTML a šest vybraných assetů v obrazu odpovídá lokálnímu sestavení.
  Změnilo se pouze devět souvisejících HTML; dalších 179 zůstalo bajtově shodných.
- Skutečný IAB ověřil oba detaily při 390/1280 px, obrázek, přepnutí jazyků
  oběma směry a skutečné otevření odpovídajícího jazyka hry klávesou Enter.
  Oba detaily i návody při 390 px prošly s lokálním testovacím zvětšením kořenového
  písma z 16 na 32 px bez vodorovného přetékání. Toto zvětšení nebylo součástí
  produkčního výstupu; fyzický telefon ani úplná shoda s WCAG se netvrdí.
- Prošlo 33 veřejných kontrol včetně obou blogů, zdraví, návodů, katalogů,
  mediálních výluk a anonymních 401 na soukromých API. Izolovaná Nginx kontrola
  potvrdila CSP a kontaktní/distribuční hranice. Další veřejné čtení potvrdilo
  aktualizovaný llms.txt a jazykové odkazy/texty obou návodů a anglického detailu.
- Původní konfigurace, prostředí, svazky a ochrany webu i identita a provoz
  ostatních devíti služeb zůstaly zachované. Veřejný analytický skript je bajtově
  shodný; nový sběr, skutečná poptávka, herní skóre ani Telegram zpráva se neodeslaly.

Neveřejný doklad a návratový obraz jsou v
chráněném serverovém adresáři vydání `tomato-languages-20261015`. Snímky a bezpečné přejímkové
výsledky jsou v archivu `tomato-languages-20261015` tohoto chatu. Tento pozdější
dokumentační doplněk nemění přijatý runtime ani jeho zmrazený zdrojový balík.
