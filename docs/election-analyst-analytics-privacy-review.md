# Election analyst: informace o návštěvnosti ke schválení

Stav 15. 10. 2026: **SCHVÁLENO VLASTNÍKEM VČETNĚ AKTIVACE.** Vlastník přímo ve VCode chatu uvedl: „Schvaluji CZ/EN text soukromí i aktivaci měření Election analyst. Dokonči napojení s vývojářem a zapni ho v produkci.“ Schválení se vztahuje na níže uvedené konkrétní české a anglické znění a přesný rozsah. Souhlas byl zaznamenán 15. 10. 2026 v 00:56:54 UTC (02:56:54 Europe/Prague). Zapnutí následuje až po zveřejnění obou textů a přejímce integrace; samotné schválení není důkazem aktivního sběru. Schválené odstavce se tímto záznamem nemění.

## Konkrétní rozsah

- Aplikace: Election analyst / Volební atlas, `https://stratos.zeleznalady.cz/ea/`.
- Pouze jedno otevření čisté vstupní adresy `/ea/` za načtení dokumentu; žádné další události při práci v atlasu.
- Přenáší se pevná cesta `/ea/`, druh `pageview` a případně obecná kategorie veřejného zdroje příchodu. Adresa s parametrem či fragmentem měření nespouští.
- Kliknutí, hledání, mapy, volby, kandidatury, území a exporty se neměří. Veřejná aplikace nyní nemá odpovídající kontaktní odkazy pro schválené měření kliknutí.
- Připravovaná stránka této informace `/ea/privacy/analytics/` se neměří. Stejně tak žádná jiná cesta ani další aplikace na společné doméně STRATOS.
- Zachovají se DNT/GPC, vypnutí offline, oddělený veřejný přijímač, oprávnění Přehledu a nejvýše 180 dní včetně záloh. Žádné analytické cookies ani identita návštěvníka.

## České znění

### Návštěvnost Volebního atlasu

Na vstupní stránce aplikace Election analyst (Volební atlas) používáme společnou službu VCode/Umami v naší infrastruktuře pro přehled návštěvnosti. Zaznamenáváme pouze otevření základní adresy atlasu a obecný zdroj příchodu z vybraných veřejných služeb. Rozlišujeme Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, TikTok, LinkedIn, OpenAI včetně ChatGPT, Claude a Perplexity, pokud prohlížeč předá rozpoznatelný zdroj. Neznámý nebo nepředaný zdroj zůstává neurčený.

Neměříme kliknutí ani vaši práci s atlasem. Do analytiky neposíláme hledané výrazy, vybrané volby, obce, kandidáty či kandidátky, mapové souřadnice, filtry, otevřené podrobnosti, poznámky, soubory ani exporty. Neposíláme původní adresu zdroje příchodu, parametry a fragmenty adres, názvy stránek ani obsah odkazů. Otevření adresy s parametrem nebo fragmentem se neměří. Tuto stránku ani jiné aplikace rodiny STRATOS tímto měřením nesledujeme. Statistiky nevytvářejí profil vašich politických zájmů nebo názorů.

Nepoužíváme analytické cookies ani záznam obrazovky. Při přijetí měřicího požadavku server zpracuje technické údaje spojení, zejména IP adresu a údaje o typu prohlížeče a zařízení. IP se do analytické databáze neukládá v čitelné podobě. Pro odhad návštěvníků se používá odvozený identifikátor, který se mění každý den; nejde o identitu účtu. Odvozenou zeměpisnou polohu do analytické databáze neukládáme. Provozní a bezpečnostní serverové záznamy jsou od analytiky oddělené.

Respektujeme signály Do Not Track a Global Privacy Control. Při jejich zapnutí měření vypneme. V režimu offline nic neodesíláme ani neukládáme k pozdějšímu odeslání. Statistiky jsou přístupné pouze oprávněným osobám po přihlášení. Analytické záznamy uchováváme včetně provozních záloh nejdéle 180 dní. Provozovatelem je VCode; kontakt pro dotazy je podpora@zeleznalady.cz.

## English text

### Election atlas traffic

On the entry page of Election analyst (the election atlas), we use the shared VCode/Umami service within our infrastructure to understand page traffic. We record only openings of the atlas's base address and a general traffic-source category from selected public services. We distinguish Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, TikTok, LinkedIn, OpenAI including ChatGPT, Claude and Perplexity when the browser provides a recognizable source. Unknown or unavailable sources remain unspecified.

We do not measure clicks or your activity within the atlas. We do not send search terms, selected elections, municipalities, candidates or candidate lists, map coordinates, filters, opened details, notes, files or exports to analytics. We do not send the original referral address, URL parameters or fragments, page titles or link contents. Addresses containing a query string or fragment are not measured. This page and other STRATOS applications are excluded from this measurement. Statistics do not create a profile of your political interests or opinions.

We do not use analytics cookies or screen recording. When a measurement request arrives, the server processes technical connection information, particularly the IP address and browser and device type. The IP address is not stored in readable form in the analytics database. A derived identifier that changes daily is used to estimate visitors; it is not an account identity. We do not store inferred geographic location in the analytics database. Operational and security server logs are separate from analytics.

We respect Do Not Track and Global Privacy Control signals. Measurement is disabled when either is enabled. While offline, we do not send measurements or queue them for later transmission. Statistics are accessible only to authorized people after sign-in. Analytics records are retained for no more than 180 days, including operational backups. The operator is VCode; contact podpora@zeleznalady.cz with questions.

## Podmínky zveřejnění a zapnutí

Vlastník schválí obě konkrétní znění a tento rozsah. Vývojář aplikace zveřejní text s dostupným odkazem a provede izolované kontroly bridge, CSP, PWA a výluk. VCode ověří zveřejněný text a omezenou proxy a teprve potom nastaví schválení a aktivaci jediné registrace. Nepřidávají se syntetické návštěvy do skutečného webu. Přidání kliknutí nebo dalších cest vyžaduje samostatné posouzení a schválení textu.
