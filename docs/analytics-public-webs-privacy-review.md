# Společné schválení měření veřejných webů

Stav 4. 10. 2026: připraveno k posouzení vlastníkem. Měření pěti nových webů je dosud vypnuté. Tato revize sjednocuje doplňky informací o soukromí v jednotlivých projektech; sama nepředstavuje schválení. VCode má vlastní dříve schválený text.

## Rozsah

| Web | Měřené veřejné stránky |
| --- | --- |
| Masáže | Úvod, o mně, první návštěva, kontakt jako stránka, galerie a zkušenosti; bez obsahu formulářů |
| Studio Balance | Úvod, o studiu, lekce, veřejný rozvrh, ceník, galerie, recenze a Balance Flow; bez konkrétních termínů a rezervací |
| COP | Pouze veřejná syntetická ukázka povodně; hlavní situační mapa a pracovní části se neměří |
| Kalorie | Pouze veřejné informace o aplikaci, podpoře, provozovateli, podmínkách, soukromí a návody; jídelní deník se neměří |
| Městem hrou | Úvod, přehledy míst a výprav, nabídka pro partnery a informace o zdrojích; jen obecný typ stránky bez konkrétního místa nebo výpravy |

## Český doplněk

Úvodní věta se pro každý web použije takto:

- **Masáže:** Na vybraných obecných veřejných stránkách Masáží měříme návštěvnost, abychom lépe rozuměli využití webu. Účty, rezervace a soukromé části aplikace tímto měřením nesledujeme.
- **Studio Balance:** Na vybraných obecných veřejných stránkách Studia Balance měříme návštěvnost, abychom lépe rozuměli využití webu. Účty, konkrétní termíny, rezervace a soukromé části aplikace tímto měřením nesledujeme.
- **COP:** Na veřejné syntetické povodňové ukázce COP měříme zobrazení této stránky, abychom poznali její využití. Hlavní situační mapu, přihlášené pracovní části a chat tímto měřením nesledujeme.
- **Kalorie:** Na veřejných informačních stránkách Kalorií měříme návštěvnost, abychom zjistili, zda lidé nacházejí informace o aplikaci a návody. Jídelní deník, zdravotní údaje a soukromé části aplikace tímto měřením nesledujeme.
- **Městem hrou:** Na veřejném úvodu Městem hrou, přehledech míst a výprav, nabídce pro partnery a informacích o zdrojích měříme návštěvnost. U přehledů míst a výprav zaznamenáváme pouze typ stránky, nikoli konkrétní místo nebo výpravu. Účet, pas, správu, nastavení, platby a samotné řešení úkolů tímto měřením nesledujeme.

Společný následující text:

Měření používá společnou službu VCode/Umami v naší infrastruktuře bez analytických cookies a bez záznamu obrazovky. Zaznamenává pouze otevření předem vybraných veřejných stránek. Nesledujeme kliknutí, neodesíláme obsah formulářů, údaje o účtu, rezervace, polohu, zprávy, zdravotní údaje, odpovědi ani herní postup. Nepředáváme parametry adres, fragmenty, názvy stránek ani odkazující stránku a nespojujeme statistiky s vaším účtem.

Při přijetí požadavku služba dočasně zpracuje síťovou adresu zařízení a údaje prohlížeče pro denně obměňované technické označení návštěv. IP adresu neukládá v čitelné podobě do analytické databáze. Odhad návštěvníků není přesným počtem konkrétních lidí. Statistiky nejsou veřejné a přístup k nim mají jen oprávnění správci. Analytické záznamy včetně jejich záloh uchováváme nejvýše 180 dní.

Respektujeme Do Not Track a Global Privacy Control: při jejich zapnutí návštěvu neodešleme. Události bez připojení zahazujeme a neukládáme k pozdějšímu odeslání. Toto měření je oddělené od případných dosavadních produktových či herních statistik a nepředává do společné služby jejich údaje.

## English addition

Site-specific opening:

- **Masáže:** We measure visits to selected general public Masáže pages to understand how the website is used. Accounts, bookings and private application areas are excluded.
- **Studio Balance:** We measure visits to selected general public Studio Balance pages to understand how the website is used. Accounts, individual sessions, bookings and private application areas are excluded.
- **COP:** We measure pageviews of COP's public synthetic flood demonstration to understand its use. This measurement excludes the main situation map, authenticated workspaces and chat.
- **Kalorie:** We measure visits to public Kalorie information pages to understand whether people find application information and guides. Food diaries, health data and private application areas are excluded.
- **Městem hrou:** We measure visits to the public Městem hrou home page, place and trail overviews, partner offers and source information. For place and trail overviews, only the page category is recorded, not the specific place or trail. Accounts, passports, administration, settings, payments and individual game tasks are excluded.

Shared following text:

Measurement uses the shared VCode/Umami service within our infrastructure without analytics cookies or screen recording. It records only views of selected public pages. We do not track clicks or send form contents, account information, bookings, location, messages, health data, answers or game progress. URL parameters, fragments, page titles and referring pages are not sent, and statistics are not linked to your account.

When a request arrives, the service temporarily processes the device's network address and browser information to derive a daily changing technical visit identifier. IP addresses are not stored in readable form in the analytics database. Estimated visitors are not an exact count of individuals. Statistics are private and available only to authorized administrators. Analytics records, including their backups, are retained for no more than 180 days.

We respect Do Not Track and Global Privacy Control: when enabled, no visit is sent. Offline events are discarded rather than stored for later transmission. This measurement is separate from any existing product or game statistics and does not forward their data to the shared service.

## Publikace a převzetí

Doplněk se vloží do existujících informací o soukromí každého webu, včetně jejich stávajícího kontaktu na správce; nevymýšlí nové kontaktní údaje a nenahrazuje další ustanovení. V projektech s českým rozhraním se zpřístupní i anglické znění tohoto doplňku. Schválení tohoto souboru pokrývá výše uvedené doplňky a rozsah, nikoli soukromé části aplikací nebo nové události.

Technické převzetí: společný vcode-public-v1 runtime se stejným SRI, 5 oddělených website IDs, přesná povolená origin/cesta, přepsání klientských hlaviček na edge, bez logování analytických cest. Izolovaný produkční test všech pěti proxy a ukládání prošel; nezvýšil skutečné statistiky. Denní záloha byla obnovena do dočasné databáze. Aktivní záznamy se mažou s rezervou po 170 dnech; denní rotace záloh zachovává celkové maximum 180 dní. Výsledné zapnutí, zveřejnění doplňků a kontrola v prohlížeči se zaznamenají při nasazení.
