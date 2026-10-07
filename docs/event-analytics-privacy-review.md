# Event: veřejná analytika – text ke schválení

Stav 7. 10. 2026: připraveno ke kontrole vlastníkem. Před zveřejněním tohoto textu a aktivací měření je vyžadováno konkrétní schválení podle AGENTS.md. Souhlas pro jiné weby jej nenahrazuje.

## Rozsah

Měří se pouze úvodní stránka `https://events.zeleznalady.cz/`, až po ověření nepřihlášeného stavu. Přenáší se pevná cesta `/`, druh události `pageview` a případně obecná kategorie zdroje podle sdíleného runtime. Nezaznamenávají se kliknutí; veřejná úvodní stránka nyní nemá vhodné odkazy do App Storu, na kontakt ani ven z webu. Stránka s touto informací `/privacy/analytics` se neměří.

Vyloučeny jsou přihlášení, callback, účty, administrace, platforma, účastnická část, všechny neznámé cesty a adresy s parametry nebo fragmentem. Přihlášené používání se neměří. Po vstupu do vyloučené části se měření pozastaví po zbytek otevření aplikace. Registrace, účast, akce, organizace, seznamy lidí a obsah formulářů nevstupují do statistiky.

## České znění pro `/privacy/analytics`

### Návštěvnost veřejné stránky

Na veřejné úvodní stránce Event používáme společnou službu VCode/Umami v naší infrastruktuře pro přehled návštěvnosti. Měření zaznamenává otevření této stránky nepřihlášeným návštěvníkem a obecný zdroj příchodu z vybraných veřejných služeb. Rozlišujeme Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, TikTok, LinkedIn, OpenAI včetně ChatGPT, Claude a Perplexity, pokud prohlížeč předá rozpoznatelný zdroj. Neznámý nebo nepředaný zdroj zůstává neurčený. Kliknutí nyní neměříme.

Nepoužíváme analytické cookies ani záznam obrazovky. Neposíláme původní ani cílové adresy odkazů, parametry či fragmenty adres, názvy stránek ani obsah odkazů. Neměříme přihlášení, účty, administraci, organizace, účastnické části, přihlášky, docházku, osobní údaje ani obsah formulářů. Přihlášené používání a tuto stránku neměříme. Statistiky nespojujeme s účtem. Po vstupu do soukromé nebo jiné vyloučené části se měření pozastaví po zbytek aktuálního otevření aplikace.

Při přijetí měřicího požadavku server zpracuje technické údaje spojení, zejména IP adresu a údaje o typu prohlížeče a zařízení. IP se do analytické databáze neukládá v čitelné podobě. Pro odhad návštěvníků se používá odvozený identifikátor, který se mění každý den; nejde o identitu účtu. Odvozenou zeměpisnou polohu do analytické databáze neukládáme. Provozní a bezpečnostní serverové záznamy jsou od analytiky oddělené.

Respektujeme signály Do Not Track a Global Privacy Control. Při jejich zapnutí měření vypneme. V režimu offline nic neodesíláme ani neukládáme k pozdějšímu odeslání. Statistiky jsou přístupné pouze oprávněným osobám po přihlášení. Analytické záznamy uchováváme včetně provozních záloh nejdéle 180 dní. Provozovatelem je VCode; kontakt pro dotazy je podpora@zeleznalady.cz.

## English text for `/privacy/analytics`

### Public page traffic

On Event's public home page, we use the shared VCode/Umami service within our infrastructure to understand page traffic. Measurement records views of this page by signed-out visitors and a general traffic-source category from selected public services. We distinguish Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, TikTok, LinkedIn, OpenAI including ChatGPT, Claude and Perplexity when the browser provides a recognizable source. Unknown or unavailable sources remain unspecified. We do not currently measure clicks.

We do not use analytics cookies or screen recording. We do not send original or destination link addresses, URL parameters or fragments, page titles or link contents. We do not measure sign-in, accounts, administration, organizations, attendee areas, registrations, attendance, personal information or form contents. We do not measure signed-in use or this page. Statistics are not linked to an account. After you enter a private or other excluded area, measurement is suspended for the remainder of the current application opening.

When a measurement request arrives, the server processes technical connection information, particularly the IP address and browser and device type. The IP address is not stored in readable form in the analytics database. A derived identifier that changes daily is used to estimate visitors; it is not an account identity. We do not store inferred geographic location in the analytics database. Operational and security server logs are separate from analytics.

We respect Do Not Track and Global Privacy Control signals. Measurement is disabled when either is enabled. While offline, we do not send measurements or queue them for later transmission. Statistics are accessible only to authorized people after sign-in. Analytics records are retained for no more than 180 days, including operational backups. The operator is VCode; contact podpora@zeleznalady.cz with questions.

## Převzetí

Text se zveřejní v obou jazycích s odkazem v patičce. Aktivace následuje až po schválení a ověření produkční stránky, přesných výluk, otisku sdíleného runtime a odděleného veřejného přijímače. Syntetické kontroly nesmějí navyšovat skutečnou návštěvnost. Rozšíření o kliknutí nebo další cesty vyžaduje samostatnou revizi textu a konfigurace.
