# Myslopis: informace o veřejné analytice ke schválení

Stav 7. 10. 2026: **SCHVÁLENO VLASTNÍKEM.** Vlastník v chatu VCode výslovně odpověděl „Schvaluji znění i aktivaci“. České znění je zveřejněné v Myslopisu a měření bylo po technickém převzetí aktivováno 7. 10. 2026 v 15:52:44 Europe/Prague; viz `myslopis-integration.md`. Tento dokument je konkrétní podklad pro kontrolu vlastníkem před zveřejněním podle `AGENTS.md`. Dosavadní souhlas pro jiné weby nenahrazuje schválení Myslopisu. Níže uvedené české znění se po schválení použije v obou větvích `Privacy` v Myslopisu; anglické znění je vědomě připravený protějšek ke kontrole, nikoli požadavek na zavedení anglické verze Myslopisu.

## Přesný rozsah ke schválení

| Metrika | Povolený rozsah |
| --- | --- |
| Zobrazení veřejných stránek | Jen `/`, `/tests` a `/methodology`. Alias `/test` se normalizuje na `/tests`; nevytvoří další samostatnou stránku. |
| Obecný zdroj příchodu | Jen kategorie Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, TikTok, LinkedIn, OpenAI (včetně ChatGPT), Claude a Perplexity podle ověřeného sdíleného runtime. Neznámé zdroje zůstanou neurčené. |
| `contact-click` | Jen skutečný odkaz `mailto:podpora@zeleznalady.cz` v patičce, pokud je otevřená jedna z povolených veřejných stránek a měření není pozastavené. |
| `outbound-click` | Jen skutečný odkaz na `https://vcode.zeleznalady.cz` v patičce a konkrétní odkaz `https://ipip.ori.org/newBigFive5broadKey.htm` v popisu metod. Platí stejná omezení veřejné stránky a stavu. |

Žádné automatické měření všech odkazů. Kliknutí na test, balíček, soukromý výsledek, PDF či stránku soukromí se neměří. Neměří se souhlas, zahájení, průběh, odeslání ani dokončení dotazníku, odstranění výsledku či návrat k výsledku. Žádné měření App Storu: Myslopis nemá skutečný App Store odkaz.

Vyloučeny jsou `/privacy`, celý `/bundle/kratke-sebepoznani`, `/test/*`, `/results/*`, PDF, `/api/*`, přihlášení, účet, administrace a všechny neznámé cesty. Přihlášené používání ani stránka zobrazující osobní průchod či dostupnost soukromého výsledku se neměří, i když její cesta jinak patří do veřejného seznamu. Po vstupu do dotazníku nebo soukromé části se měření pozastaví po zbytek aktuálního otevření aplikace; návrat na veřejnou stránku sám měření neobnoví. Technický guard nepřenáší obsah dočasného úložiště.

Přenáší se pevná veřejná cesta, druh události a případně obecná kategorie zdroje. Neodesílá se původní ani cílová URL, query, fragment, UTM, obsah odkazu, e-mail, výsledkové nebo průchodové ID, přístupový klíč, odpovědi, skóry, PDF ani jiný osobní obsah. Kolektor zpracuje ověřenou IP a User-Agent na serveru; neschováváme tuto skutečnost za tvrzení o nulovém zpracování IP. Soukromý přehled je přístupný pouze oprávněným osobám.

## České znění: náhrada v režimu veřejného pilotu

V `GuestPrivacy`, v sekci **Co zpracováváme**, nahraďte celý dosavadní odstavec následujícím textem:

> Rozpracované odpovědi zůstávají v paměti stránky; obnovení stránky je zruší. Po tvém souhlasu odešleme odpovědi a verzi metody na server pro výpočet. Jednotlivé odpovědi neukládáme. Uchováváme vypočtené skóry, běžné shrnutí, údaje o metodě a čas vytvoření a vypršení výsledku. Nevytváříme účet ani nevyžadujeme jméno nebo e-mail. Nepoužíváme AI ani reklamní sledování. IP adresu používáme dočasně pro ochranu proti zahlcení; při měření vybraných veřejných stránek ji také zpracuje analytická služba popsaná níže.

Za tuto sekci vložte společnou sekci **Návštěvnost veřejných stránek** uvedenou níže. Ostatní odstavce o odpovědích, dočasném úložišti a výsledcích ponechte beze změny.

## České znění: náhrada v režimu uzavřeného pilotu

V `Privacy`, v postranním panelu **Vlastní účet. Přístup na pozvání.**, nahraďte dosavadní odstavec následujícím textem:

> Přihlašovací odkaz ověřuje tvůj e-mail. Používáme přihlašovací cookie pro přístup k účtu. Přihlášené používání ani soukromé části analyticky nesledujeme a nepoužíváme reklamní sledování. Omezené měření veřejných informačních stránek popisujeme níže; nepoužívá analytické cookies a nespojuje statistiky s tvým účtem.

Za sekci **Co zpracováváme** vložte tutéž společnou sekci **Návštěvnost veřejných stránek**. Ostatní odstavce o účtu, výsledcích, samostatném AI souhlasu, doručování a zálohách ponechte beze změny. Sedmidenní retence záloh výsledků není retenční lhůtou samostatné analytiky.

## České znění: společná nová sekce v obou režimech

### Návštěvnost veřejných stránek

Na vybraných veřejných informačních stránkách Myslopisu používáme společnou službu VCode/Umami v naší infrastruktuře pro přehled návštěvnosti. Měření nepoužívá analytické cookies ani záznam obrazovky. Zaznamenává otevření úvodní stránky, veřejného katalogu testů a popisu metod a obecný zdroj příchodu z vybraných veřejných služeb. Zaznamenáváme také počet kliknutí na kontakt v patičce, odkaz na VCode v patičce a konkrétní odkaz na původní IPIP sestavu v popisu metod. Kliknutí neznamená odeslání zprávy ani jiný úkon na cílovém webu.

Neposíláme původní ani cílové adresy odkazů, parametry či fragmenty adres, názvy stránek, e-mailovou adresu ani obsah odkazů. Neměříme stránku soukromí, dotazníky, jejich zahájení ani dokončení, odpovědi, souhlasy, osobní průchod balíčkem, výsledky, skóry, přístupové klíče, PDF, účty ani jiné soukromé části a statistiky s nimi nespojujeme. Přihlášené používání a stránky s údaji o tvém osobním průchodu nebo soukromém výsledku neměříme. Po vstupu do dotazníku nebo soukromé části měření pozastavíme po zbytek aktuálního otevření aplikace.

Při přijetí měřicího požadavku server zpracuje technické údaje spojení, zejména IP adresu a údaje o typu prohlížeče a zařízení. IP se do analytické databáze neukládá v čitelné podobě. Pro odhad návštěvníků se používá odvozený identifikátor, který se mění každý den; nejde o identitu účtu. Odvozenou zeměpisnou polohu do analytické databáze neukládáme. Provozní a bezpečnostní serverové záznamy jsou od analytiky oddělené.

Respektujeme signály Do Not Track a Global Privacy Control. Při jejich zapnutí měření vypneme. V režimu offline nic neodesíláme ani neukládáme k pozdějšímu odeslání. Statistiky jsou přístupné pouze oprávněným osobám po přihlášení. Analytické záznamy uchováváme včetně provozních záloh nejdéle 180 dní. Tato lhůta nemění nejvýše sedmidenní platnost osobních výsledků ani pravidla jejich mazání. Provozovatelem Myslopisu je VCode; kontakt pro dotazy je podpora@zeleznalady.cz.

## English counterpart: public pilot replacement

For **What we process** in the public pilot:

> Answers in progress stay in the page's memory; reloading the page clears them. With your consent, we send your answers and the method version to the server for scoring. We do not store individual answers. We retain calculated scores, the standard summary, method information, and the result's creation and expiry times. We do not create an account or require your name or email address. We do not use AI or advertising tracking. We temporarily process IP addresses to protect against excessive requests; for selected public pages, the analytics service described below also processes them.

Add the shared section below. Keep the remaining provisions on answers, temporary browser storage and results unchanged.

## English counterpart: closed pilot replacement

For the account access sidebar:

> A sign-in link verifies your email address. We use a sign-in cookie to provide account access. We do not measure signed-in use or private areas through analytics, and we do not use advertising tracking. The limited measurement of public information pages is described below; it does not use analytics cookies or link statistics to your account.

Add the same shared section below. Keep the remaining account, result, separate AI consent, email delivery and backup provisions unchanged. The seven-day backup retention for results is distinct from analytics retention.

## English counterpart: shared new section

### Public page traffic

On selected public information pages of Myslopis, we use the shared VCode/Umami service within our infrastructure to understand page traffic. Measurement does not use analytics cookies or screen recording. It records views of the home page, the public test catalogue and the description of methods, together with a general traffic-source category from selected public services. We also count clicks on the footer contact link, the footer VCode link and the specific link to the original IPIP item set in the methods description. A click does not mean a message was sent or any other action took place on the destination website.

We do not send original or destination link addresses, URL parameters or fragments, page titles, the email address or link contents. We do not measure the privacy page, questionnaires, their start or completion, answers, consents, personal progress through a bundle, results, scores, access keys, PDFs, accounts or other private areas, and statistics are not linked to them. We do not measure signed-in use or pages showing information about your personal progress or private result. After you enter a questionnaire or private area, measurement is suspended for the remainder of the current application opening.

When a measurement request arrives, the server processes technical connection information, particularly the IP address and browser and device type. The IP address is not stored in readable form in the analytics database. A derived identifier that changes daily is used to estimate visitors; it is not an account identity. We do not store inferred geographic location in the analytics database. Operational and security server logs are separate from analytics.

We respect Do Not Track and Global Privacy Control signals. Measurement is disabled when either is enabled. While offline, we do not send measurements or queue them for later transmission. Statistics are accessible only to authorized people after sign-in. Analytics records are retained for no more than 180 days, including operational backups. This period does not change the maximum seven-day validity of personal results or their deletion rules. Myslopis is operated by VCode; contact podpora@zeleznalady.cz with questions.

## Publikace a technické převzetí

Po schválení vlastníkem se zveřejní přesně české náhrady a společná sekce v obou větvích stránky soukromí. Před aktivací musí ověření produkce potvrdit konkrétní povolené cesty a odkazy, serverové zpracování IP, retenci včetně záloh, soukromé výluky a nulové odesílání při DNT/GPC a offline. Přijímač, registrace a dashboard zůstávají oddělené; klíče a interní adresy nepatří do prohlížeče. Přijetí a testy se provedou na odděleném syntetickém webu, bez navýšení skutečných statistik.

Podklady: aktuální `src/App.tsx` a `docs/vcode-integration-readiness.md` v repozitáři Myslopis, `docs/analytics-integration-standard.md`, `docs/analytics-expanded-metrics-review.md` a `docs/analytics-privacy-review.md` ve VCode. Tento dokument nic nenasazuje, nezveřejňuje a neaktivuje.
