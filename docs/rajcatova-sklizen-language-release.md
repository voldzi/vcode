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

`pnpm check`, 201 testů a sestavení 188 statických stránek prošly. Nasazení vyžaduje
navazující kontrolu browseru, sestavení obou Docker obrazů a veřejnou přejímku;
samotný tento záznam ještě není potvrzení produkční aktivace.
