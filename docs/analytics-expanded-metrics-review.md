# Rozšíření veřejné analytiky: zdroje a kliknutí

Stav: vlastník ve VCode dne 4. 10. 2026 výslovně schválil níže uvedené konkrétní české a anglické znění i aktivaci odpovědí „Schvaluji toto znění i aktivaci“. Schválený obsah je revize 6dc4dd3. Níže je schválená náhrada popisu rozsahu. Dosavadní veřejné cesty, vyloučení soukromých částí, DNT/GPC, uchování a ostatní ustanovení zůstávají platné.

## Přesný rozsah nové integrace

- Návštěvnost dosavadních schválených veřejných stránek.
- Obecný zdroj příchodu z veřejných služeb Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, LinkedIn, OpenAI, Claude a Perplexity. Zdroj se normalizuje na název služby. Žádná původní URL, cesta, parametry, fragment ani soukromá doména se neodesílá. Ostatní zdroje zůstanou neurčené.
- Jen pojmenované kliknutí na odkaz do App Storu, na kontakt a odkaz ven z webu, pokud má konkrétní web takový veřejný prvek. Neposílá se cílová URL, adresa kontaktu ani obsah odkazu. Tato metrika není počet instalací, rezervací ani odeslaných zpráv.
- Žádné obecné automatické sledování všech kliknutí. Každý web přiřadí měření ke konkrétním schváleným veřejným odkazům.

## Česká náhrada dotčeného odstavce

Měření používá společnou službu VCode/Umami v naší infrastruktuře bez analytických cookies a bez záznamu obrazovky. Zaznamenává otevření předem vybraných veřejných stránek, obecný zdroj příchodu z vybraných veřejných služeb a kliknutí na určené veřejné odkazy do App Storu, na kontakt nebo mimo web. Neposíláme původní ani cílové adresy odkazů, parametry adres, fragmenty, názvy stránek či obsah odkazů. Nesledujeme obsah formulářů, údaje o účtu, rezervace, polohu, zprávy, zdravotní údaje, odpovědi ani herní postup a nespojujeme statistiky s vaším účtem. Kliknutí neznamená instalaci, rezervaci ani odeslání zprávy.

## English replacement for the affected paragraph

Measurement uses the shared VCode/Umami service within our infrastructure without analytics cookies or screen recording. It records views of selected public pages, general traffic sources from selected public services, and clicks on designated public links to the App Store, contact options or external websites. We do not send original or destination link addresses, URL parameters, fragments, page titles or link contents. We do not track form contents, account information, bookings, location, messages, health data, answers or game progress, and statistics are not linked to your account. A click does not mean an installation, booking or sent message.

## Publikace

Tento odstavec nahrazuje dosavadní odstavec výslovně vylučující kliknutí a odkazující stránku. Česká a anglická úvodní věta konkrétní aplikace a zbývající schválené odstavce z revize ef5cbf7 se zachovají. Změna se zveřejní a začne měřit až po owner review a technickém převzetí konkrétního webu. Verze v1 zůstane během převodu podporovaná; samotné nasazení nové podpory neaktivuje další sběr.
