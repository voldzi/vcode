# Patičkové odkazy: Městem hrou, Moje porce, Masáže a Myslopis

## Stav a odpovědnost — 9. října 2026

Revize `portfolio-2` pro Městem hrou, Moje porce a Masáže je připravená a
synteticky otestovaná. Při tomto předání ještě není centrálně nasazená ani
aktivovaná pro tyto tři weby. Myslopis používá již nasazenou centrální podporu
`portfolio-1`, protože potřebuje pouze její původní tři cíle; jeho konkrétní
patičkové měření stále vyžaduje vlastní převzetí a aktivaci. Příprava klienta,
lokální konfigurační příznak nebo existence textu v repozitáři nejsou důkazem
produkční aktivace. Dokončení každého webu vyžaduje samostatné převzetí níže.

Vlastník výslovně zadal propojení portfolia a rozlišení kliknutí. Koordinátor
VCode ověřil lidské zadání ve zdrojových vláknech. Konkrétní doplnění informace
o soukromí přesto musí být v každém projektu zkontrolované vlastníkem,
zaznamenané v místních podkladech a zveřejněné ve veřejných jazykových verzích
aplikace před aktivací. Myslopis nyní zveřejňuje češtinu; připravený anglický
protějšek sám není požadavkem na novou veřejnou anglickou aplikaci.
Níže uvedené odstavce jsou konkrétní návrhy pro toto převzetí, nikoli potvrzení
jejich schválení nebo zveřejnění.

Studio Balance používá nezávislou revizi `portfolio-1`. Jeho samostatná aktivace
byla koordinátorem dokončena 9. října 2026 v 13:03:50 UTC
(15:03:50 Europe/Prague); navazující automatický monitor v 13:08 UTC potvrdil
funkční propojení. Tento dokument ji nemění a nepožaduje migraci Studia
na revizi 2. Přijetí Studia a jeho tří původních cílů má vlastní záznam v
[studio-balance-footer-analytics.md](studio-balance-footer-analytics.md).

## Neměnný klient a přenos

| Položka | Hodnota |
| --- | --- |
| Kanonický zdroj | `services/analytics/public-v2-portfolio-2.js` |
| `contractVersion` | `vcode-public-v2` |
| `runtimeRevision` | `portfolio-2` |
| Distribuční cesta kolektoru | `/v2/tracker-portfolio-2.js` |
| SRI | `sha384-X7PYkHsq/VMthl17JMrooPLPjIuIbvATaO4BTzzYARDac6rPfVlTNG1ScD/iyGD3` |

Použít přesnou lokální statickou kopii, zachovat ji v repozitáři aplikace a
ověřit SRI zdroje, sestaveného souboru i veřejně servírovaných bajtů. Soubor
nebude měněn na místě; další změna vyžaduje jinou neměnnou revizi a koordinaci.

| Web | Lokální statický soubor / veřejná cesta | Přijímací cesta vlastní domény |
| --- | --- | --- |
| Městem hrou | `public/assets/vcode-analytics-portfolio-v2.js` → `/mestem-hrou/assets/vcode-analytics-portfolio-v2.js` | `/mestem-hrou/analytics/v2/events` |
| Moje porce | Doporučené předání: `public/vcode-analytics-portfolio-2.js` → `/vcode-analytics-portfolio-2.js`; finální cesta se potvrdí převzetím | `/analytics/v2/events` |
| Masáže | `apps/web/public/vcode-analytics-portfolio-2.js` → `/vcode-analytics-portfolio-2.js` | `/analytics/v2/events` |
| Myslopis (`portfolio-1`) | Doporučené předání: `public/vcode-analytics-portfolio-v1.js` → `/vcode-analytics-portfolio-v1.js`; finální cesta se potvrdí převzetím | `/analytics/public/v2/events` |

Myslopis dostane přesnou kopii `services/analytics/public-v2-portfolio.js`,
`runtimeRevision: portfolio-1`, `contractVersion: vcode-public-v2`, SRI
`sha384-zkZSzDImQVzQLiRsYnPvb7exdTP5bDp+cGuBD0J+Tb40PGH8ffG+b4qQGqfrP6lf`.
Distribuční cesta je `/v2/tracker-portfolio.js`. Tato centrální podpora je již
nasazená; Myslopis nemusí čekat na nasazení `portfolio-2`. Jeho případná pozdější
migrace na revizi 2 je volitelná a vyžaduje nové ověření lokální kopie/pinu.

Odlišný název lokální kopie nemění revizi ani její pin. Cesty Městem hrou pod
`/mestem-hrou/` jsou záměrně zachované analytické cesty, přestože veřejná hra
již používá kořen domény. Nevyžaduje se změna důvěryhodného edge nebo wire
kontraktu. Staré klienty mohou dál používat jejich původní runtime a cesty.

Přenos kliknutí obsahuje jen `website`, `name` a schválenou veřejnou `path`.
Pouze `pageview` může navíc obsahovat již schválenou konečnou kategorii `source`.
Nepřidávat cílovou URL, text odkazu, původní referrer, query, fragment, kampaň,
další kontextové atributy, účet, zdraví, rezervaci, polohu nebo postup hráče.
Žádná identita se nesdílí mezi weby; nepárují se kliknutí s konverzemi nebo
používáním cílové aplikace.

## Konečné události a přesný rozsah webů

| Veřejný cíl | Pevná událost |
| --- | --- |
| VCode | `portfolio-vcode-click` |
| Moje porce | `portfolio-moje-porce-click` |
| Městem hrou | `portfolio-mestem-hrou-click` |
| Myslopis | `portfolio-myslopis-click` |

Runtime `portfolio-2` podporuje čtyři názvy, ale jednotlivý web používá pouze své konkrétní
schválené tři cíle. Dostupnost názvu v runtime sama sběr nepovoluje.
Myslopis na `portfolio-1` používá její tři původní názvy a nepotřebuje
`portfolio-myslopis-click`. Ostatní tři weby potřebují revizi 2 právě pro tento
nový cíl Myslopis.

| Zdrojový web | Nové povolené události | Zachované původní události | Zachované veřejné cesty |
| --- | --- | --- | --- |
| Městem hrou | `portfolio-vcode-click`, `portfolio-moje-porce-click`, `portfolio-myslopis-click` | `outbound-click` | Osm původních obecných kategorií |
| Moje porce | `portfolio-vcode-click`, `portfolio-mestem-hrou-click`, `portfolio-myslopis-click` | `contact-click` | Jedenáct původních veřejných kategorií |
| Masáže | `portfolio-moje-porce-click`, `portfolio-mestem-hrou-click`, `portfolio-myslopis-click` | `contact-click`, `outbound-click` | Šest původních veřejných cest |
| Myslopis | `portfolio-vcode-click`, `portfolio-mestem-hrou-click`, `portfolio-moje-porce-click` | Dosavadní schválené veřejné události; finální seznam potvrdí VCode z registru | Tři původní veřejné kategorie |

### Městem hrou

Osm přenášených kategorií: `/mestem-hrou/`, `/mestem-hrou/en/`,
`/mestem-hrou/mista/:misto/`, `/mestem-hrou/en/places/:place/`,
`/mestem-hrou/vylety/:vylet/`, `/mestem-hrou/en/trails/:trail/`,
`/mestem-hrou/pro-partnery/`, `/mestem-hrou/zdroje/`. Zachovat stávající
normalizaci skutečných kořenových URL bez identifikátorů a parametrů. Ostatní
odchozí odkazy již schválené jako `outbound-click` zůstávají stejné. Herní
úkoly, odpovědi, dokončení, pas, účet, nastavení, správa, platby, formuláře,
soukromí a polohy se neměří.

### Moje porce

Jedenáct cest: `/o-aplikaci`, `/premium`, `/podpora`, `/provozovatel`,
`/podminky`, `/ochrana-soukromi`, `/pruvodce`, `/pruvodce/kaloricky-denik`,
`/pruvodce/ceske-potraviny-a-jidla`, `/pruvodce/recepty-nakupy-a-zasoby`,
`/pruvodce/fotografie-jidla-a-uctenky`. Nepřidávat úvod soukromé aplikace,
jídelní deník, účty, fotografie, recepty, zásoby, nákupy nebo zdravotní údaje.
Odkazy v soukromé nabídce „Více“ zůstávají bez měření, i když vedou na stejné
veřejné cíle. Zachovat původní schválené `contact-click`.

### Masáže

Šest cest: `/`, `/o-mne`, `/prvni-navsteva`, `/kontakt`, `/galerie`,
`/zkusenosti`. Zachovat původní `contact-click` a `outbound-click` pro již
schválené veřejné odkazy. Rezervace, klientská samoobsluha, účty a administrace
jsou vyloučené. Odkaz „Vytvořilo VCode“ je podle výslovného upřesnění Masáží
běžný odkaz bez měření: neodesílá ani `portfolio-vcode-click`, ani obecný
`outbound-click`. Aktivní portfolio allowlist Masáží bude obsahovat přesně tři
cíle této tabulky, vedle původního kontaktu a určených odchozích odkazů.

Předání Masáží bylo převzato jako lokálně připravené a otestované. Konkrétní
kontrola nového textu vlastníkem, jeho publikace a produkční receipt jsou
zatím pending. Centrální kontrola potvrdila původních šest cest a pouze
`contact-click`/`outbound-click`; nový portfolio gate zůstává zavřený.

### Myslopis

Tři přenášené kategorie: `/`, `/tests`, `/methodology`. Stávající veřejný alias
`/test` se přenáší jako `/tests`; nevzniká čtvrtá kategorie. Dosavadní bridge
používá `contact-click` a `outbound-click` pro předem určené veřejné odkazy;
přesný produkční allowlist ověří a zachová koordinátor z neveřejného registru.
Footer kliknutí nesmí zároveň navýšit stávající obecný VCode outbound.

Měření začíná až po vyřešení relace jako `guest`. Neznámý/loading/error stav
měření zakazuje; private stav je vyloučený. Zachovat vyloučení soukromí,
stránky souhlasu, dotazníků, odpovědí, výsledků, PDF a účtů. Zachovat dosavadní
ochranu skrytého dokumentu, asynchronní kontrolu aktuální trasy a trvalé
zastavení instance po soukromé/vyloučené navigaci. Bridge nesmí číst obsah
odpovědí, úložiště výsledků nebo DOM. Ověření footeru je výhradně syntetické;
nevytváří dotazníky ani výsledky pro skutečné návštěvníky.

## Cílové odkazy a ikony

| Značka | Český veřejný cíl | Anglický veřejný cíl |
| --- | --- | --- |
| VCode | `https://vcode.zeleznalady.cz/` | `https://vcode.zeleznalady.cz/en/` |
| Moje porce | `https://mojeporce.cz/o-aplikaci` | `https://vcode.zeleznalady.cz/en/apps/kaloricke-tabulky/` |
| Městem hrou | `https://mestemhrou.cz/` | `https://vcode.zeleznalady.cz/en/apps/mestem-hrou/` |
| Myslopis | `https://myslopis.cz/` | `https://vcode.zeleznalady.cz/en/apps/myslopis/` |

Anglické portfolio stránky ostatních aplikací jsou záměrně na VCode. Moje porce
má v kanonickém katalogu stále slug `kaloricke-tabulky`; nevytvářet neověřenou
adresu `/en/apps/moje-porce/`. Cílové adresy jsou jen konfigurace odkazů v UI,
nikoli vlastnosti odesílané v analytických payloads. Žádné sledovací parametry.

Kanonické lokální assety VCode: `public/favicon.svg`,
`public/apps/mojeporce-b244faa9e68a.svg`, `public/apps/mestem-hrou.png`,
`public/apps/myslopis.svg`. Převzít jako vlastní statické soubory aplikace,
zachovat barvy/proporce. Vedle viditelného názvu může mít ikona prázdný alt;
samotný odkaz musí mít srozumitelný dostupný název a viditelný keyboard focus.

## Ochrany v bridge

1. Runtime i kliknutí napojit jen ve schváleném veřejném kontextu. Anonymní
   stav musí být potvrzený. Neznámá nebo přihlášená relace měření zakáže,
   včetně návštěvy veřejné cesty s přihlášeným účtem. Identita zůstává mimo
   analytiku; ověření relace používá existující vlastní aplikační rozhraní.
2. Soukromý kontext má vždy přednost před veřejnou cestou. Nepřevádět smíšené,
   neznámé nebo soukromé URL na obecný veřejný pageview. Zachovat všechny
   dosavadní místní výluky a deduplikaci veřejných pageviews.
3. Použít explicitní handlery právě určených footer odkazů. Žádný plošný
   document-wide click listener nebo zachytávání libovolných odkazů. Na jednom
   kliknutí vyvolat pouze jeden konkrétní portfolio event, nikdy zároveň
   obecný `outbound-click` či jiný event. Ostatní povolené kliky zachovat.
4. Před každým měřením znovu ověřit cestu, anonymitu, DNT/GPC a online stav.
   `credentials: omit`, `referrerPolicy: no-referrer`, automatické měření
   vypnuté. Offline události zahodit, neukládat a po návratu nepřehrávat.
5. SRI nebo session chyba musí ponechat hru, navigaci i footer funkční bez
   měření. Zachovat SW vyloučení analytiky; offline shell neobsahuje soukromé
   statistiky, identitu nebo analytickou frontu. Uchování nejvýše 180 dní.

## Konkrétní doplnění informace o soukromí

Následující znění rozšiřuje existující schválený text pouze o výše uvedené
footer cíle. Před zveřejněním musí aplikace zaznamenat kontrolu tohoto přesného
CZ/EN znění vlastníkem. Celý dosavadní text o měření, provozovateli a kontaktu
zůstává dostupný. Rozsah se nesmí zkrátit na neurčité „měříme odchozí odkazy“.

### Městem hrou — CZ

Na veřejných stránkách také samostatně počítáme kliknutí na odkazy VCode,
Moje porce a Myslopis v patičce. Zaznamenáme pouze, na kterou z těchto tří
aplikací odkaz vede, a obecnou veřejnou stránku, na které bylo kliknuto.
Neposíláme cílovou adresu ani text odkazu. Kliknutí nespojujeme s totožností
návštěvníka ani s používáním cílové aplikace. Měření je bez analytických
cookies, respektuje Do Not Track a Global Privacy Control a nevztahuje se na
přihlášené návštěvníky ani soukromé části hry. Offline kliknutí se neukládají
a záznamy uchováváme nejvýše 180 dní.

### Městem hrou — EN

On public pages, we also count clicks on the VCode, Moje porce and Myslopis
links in the footer separately. We record only which of these three apps the
link leads to and the general public page where it was clicked. We do not send
the destination address or link text. We do not connect clicks to a visitor's
identity or their use of the destination app. Measurement uses no analytics
cookies, respects Do Not Track and Global Privacy Control, and excludes signed-in
visitors and private parts of the game. Offline clicks are discarded, and
records are kept for no more than 180 days.

### Moje porce — CZ

Na veřejných stránkách také samostatně počítáme kliknutí na odkazy VCode,
Městem hrou a Myslopis v patičce. Zaznamenáme pouze, na kterou z těchto tří
aplikací odkaz vede, a obecnou veřejnou stránku, na které bylo kliknuto.
Neposíláme cílovou adresu ani text odkazu. Kliknutí nespojujeme s totožností
návštěvníka ani s používáním cílové aplikace. Měření je bez analytických
cookies, respektuje Do Not Track a Global Privacy Control a nevztahuje se na
přihlášené návštěvníky, soukromé části aplikace ani odkazy v soukromé nabídce
„Více“. Offline kliknutí se neukládají a záznamy uchováváme nejvýše 180 dní.

### Moje porce — EN

On public pages, we also count clicks on the VCode, Městem hrou and Myslopis
links in the footer separately. We record only which of these three apps the
link leads to and the general public page where it was clicked. We do not send
the destination address or link text. We do not connect clicks to a visitor's
identity or their use of the destination app. Measurement uses no analytics
cookies, respects Do Not Track and Global Privacy Control, and excludes signed-in
visitors, private parts of the app and links in the private “More” menu.
Offline clicks are discarded, and records are kept for no more than 180 days.

### Myslopis — CZ

Na veřejných stránkách také samostatně počítáme kliknutí na odkazy VCode,
Městem hrou a Moje porce v patičce. Zaznamenáme pouze, na kterou z těchto tří
aplikací odkaz vede, a obecnou veřejnou stránku, na které bylo kliknuto.
Neposíláme cílovou adresu ani text odkazu. Kliknutí nespojujeme s totožností
návštěvníka ani s používáním cílové aplikace. Měření je bez analytických
cookies, respektuje Do Not Track a Global Privacy Control a spouští se až po
potvrzení nepřihlášeného stavu. Nevztahuje se na účty, soukromé stránky,
stránku souhlasu, dotazníky, odpovědi, výsledky ani PDF. Offline kliknutí se
neukládají a záznamy uchováváme nejvýše 180 dní.

### Myslopis — EN

On public pages, we also count clicks on the VCode, Městem hrou and Moje porce
links in the footer separately. We record only which of these three apps the
link leads to and the general public page where it was clicked. We do not send
the destination address or link text. We do not connect clicks to a visitor's
identity or their use of the destination app. Measurement uses no analytics
cookies, respects Do Not Track and Global Privacy Control, and starts only
after guest status has been confirmed. It excludes accounts, private pages,
the consent page, questionnaires, answers, results and PDFs. Offline clicks
are discarded, and records are kept for no more than 180 days.

### Masáže — CZ

Na veřejných stránkách také samostatně počítáme kliknutí na odkazy Moje porce,
Městem hrou a Myslopis v patičce. Zaznamenáme pouze, na kterou z těchto tří
aplikací odkaz vede, a obecnou veřejnou stránku, na které bylo kliknuto.
Neposíláme cílovou adresu ani text odkazu. Kliknutí nespojujeme s totožností
návštěvníka ani s používáním cílové aplikace. Měření je bez analytických
cookies, respektuje Do Not Track a Global Privacy Control a nevztahuje se na
přihlášené návštěvníky, rezervace, klientskou samoobsluhu ani administraci.
Offline kliknutí se neukládají a záznamy uchováváme nejvýše 180 dní.

### Masáže — EN

On public pages, we also count clicks on the Moje porce, Městem hrou and
Myslopis links in the footer separately. We record only which of these three
apps the link leads to and the general public page where it was clicked.
We do not send the destination address or link text. We do not connect clicks
to a visitor's identity or their use of the destination app. Measurement uses
no analytics cookies, respects Do Not Track and Global Privacy Control, and
excludes signed-in visitors, bookings, customer self-service and administration.
Offline clicks are discarded, and records are kept for no more than 180 days.

## Převzetí a centrální aktivace jednotlivého webu

1. Aplikace předá konkrétní záznam kontroly vlastníkem a přesné CZ/EN znění
   místního dokumentu o soukromí. Obecné zadání k implementaci samo není důkazem
   zveřejnění konkrétního textu. VCode ověří jeho veřejně dostupnou publikaci.
2. Aplikace předá zdrojovou revizi/identitu nasazení, veřejnou runtime cestu,
   přesný SRI, finální collector cestu a nasazený bridge. Veřejně servírovaný
   asset musí být přesná kopie; SRI i CSP musí projít v produkčním buildu.
3. Lokální syntetické testy prokáží tři různé kliky bez dvojitého outbound,
   zachování původních eventů a veřejných cest, nulové měření při neznámé či
   přihlášené relaci, soukromém kontextu, DNT/GPC a offline. Obnovení připojení
   nesmí přehrát zahozené kliky. Mobilní/PWA ověření zachová funkčnost odkazů.
4. VCode nasadí a převezme centrální collector/dashboard podporující revizi 2
   se zachováním všech starých klientů pro Městem hrou, Moje porce a Masáže.
   Myslopis používá již nasazenou revizi 1 a na tento release nečeká. Není
   potřeba databázová migrace.
5. Jen koordinátor VCode zálohuje neveřejný registr a upraví v místě konkrétní
   položku webu. Zachová identifikátory, edge klíče, původní schválení, cestové
   allowlisty a začátky předchozího měření. Doplní přesnou runtime cestu/SRI,
   pouze tři nové eventy dle tabulky a platné `portfolioMetricsApprovedAt`.
   `portfolioMetricsCollectionStartedAt` zaznamená skutečnou aktivaci, nikoli
   datum přípravy. `collectionEnabled`, `approvedAt`, `metricsApprovedAt` a
   odpovídající `allowedEvents`/`allowedPaths` musí také povolovat příjem.
6. Ověření příjmu se provede na izolovaném syntetickém testovacím webu,
   vyloučeném ze skutečného souhrnu; nikdy na genuine visitor records nebo
   skutečném produkčním identifikátoru. Přehled ověří počty a schválené cíle
   na syntetických datech. Veřejný monitor následně ověří skutečný runtime pin
   a neplatný prázdný collector payload bez uložení testovací návštěvy.
7. Dokončení se zapíše samostatně pro každý web včetně skutečného času začátku.
   Před gate kolektor nové eventy odmítá a Přehled je nevykazuje jako aktivní
   rozsah. Samotný frontend release toto přijetí nenahrazuje. Souhrnné počty
   kliknutí nejsou počty lidí, instalací, zpráv ani konverzí cílové aplikace.

Příprava revize 2 prošla 19 cílenými novými a kompatibilitními testy,
včetně místního collector → náhradní Umami a ověření všech čtyř neměnných
pinů (v2, TikTok, portfolio-1, portfolio-2). Přesná sada je v
`services/analytics/test/portfolio-2-metrics.test.mjs` a
`services/analytics/test/portfolio-2-collector-http.test.mjs`, spolu se staršími
collector/expanded/portfolio testy. Tento výsledek potvrzuje přípravu kontraktu,
nikoli dosud neprovedené nasazení nebo aktivaci jednotlivých webů.
