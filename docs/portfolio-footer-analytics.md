# Patičkové odkazy: Městem hrou, Moje porce, Masáže a Myslopis

## Stav a odpovědnost — 9. října 2026

Revize `portfolio-2` je centrálně nasazená a přijatá. Městem hrou bylo po
samostatném veřejném převzetí aktivováno **2026-10-09T13:38:23.356941Z**
(15:38 Europe/Prague); čerstvý automatický monitor potvrdil propojení.
Moje porce a Masáže zatím nemají nové patičkové měření aktivované.
Myslopis používá kompatibilní `portfolio-1`, protože potřebuje pouze její
původní tři cíle. Po samostatném převzetí byl aktivován
**2026-10-09T13:43:13.942869Z** (15:43 Europe/Prague); čerstvý automatický
monitor potvrdil propojení. Příprava klienta, lokální konfigurační příznak nebo existence textu
v repozitáři nejsou důkazem produkční aktivace. Dokončení každého webu
vyžaduje samostatné převzetí níže.

Vlastník výslovně zadal propojení portfolia a rozlišení kliknutí. Koordinátor
VCode ověřil lidské zadání ve zdrojových vláknech. Konkrétní doplnění informace
o soukromí přesto musí být v každém projektu zkontrolované vlastníkem,
zaznamenané v místních podkladech a zveřejněné ve veřejných jazykových verzích
aplikace před aktivací. Myslopis nyní zveřejňuje češtinu; připravený anglický
protějšek sám není požadavkem na novou veřejnou anglickou aplikaci.
Níže uvedené odstavce jsou konkrétní předávací návrhy. Stav skutečného
schválení, zveřejnění a aktivace se dokládá samostatně pro každý web;
Městem hrou zveřejnilo přesné znění v obou jazycích a bylo převzato níže.

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
| Moje porce | Zdrojový kandidát `public/vcode-analytics-portfolio-v2.js` → `/vcode-analytics-portfolio-v2.js`; veřejná publikace ještě čeká | `/analytics/v2/events` |
| Masáže | `apps/web/public/vcode-analytics-portfolio-2.js` → `/vcode-analytics-portfolio-2.js` | `/analytics/v2/events` |
| Myslopis (`portfolio-1`) | Převzaté `public/vcode-analytics-portfolio-v1.js` → `/vcode-analytics-portfolio-v1.js` | `/analytics/public/v2/events` |

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
| Myslopis | `portfolio-vcode-click`, `portfolio-mestem-hrou-click`, `portfolio-moje-porce-click` | `contact-click`, `outbound-click` | Tři původní veřejné kategorie |

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

Aktuální zdrojový kandidát `4ecf26a` byl předán z worktree
`mojeporce-domain/KalorickéTabulky`. Předání potvrzuje vlastní runtime cestu
`/vcode-analytics-portfolio-v2.js`, přesné P2 bajty a kontrolu skutečně
anonymního veřejného kontextu včetně session/attempt cookies a změny relace.
Soukromá nabídka i nativní profil zůstávají bez měření. Lokální testy jsou
hotové; veřejné CS/EN znění a frontend dosud nejsou publikované.
Centrální nový portfolio gate proto zůstává zavřený do produkčního receiptu.

### Masáže

Šest cest: `/`, `/o-mne`, `/prvni-navsteva`, `/kontakt`, `/galerie`,
`/zkusenosti`. Zachovat původní `contact-click` a `outbound-click` pro již
schválené veřejné odkazy. Rezervace, klientská samoobsluha, účty a administrace
jsou vyloučené. Odkaz „Vytvořilo VCode“ je podle výslovného upřesnění Masáží
běžný odkaz bez měření: neodesílá ani `portfolio-vcode-click`, ani obecný
`outbound-click`. Aktivní portfolio allowlist Masáží bude obsahovat přesně tři
cíle této tabulky, vedle původního kontaktu a určených odchozích odkazů.

Předání Masáží `118d211c9636ae70ec73ce0de6d01dfff6b66261` bylo převzato jako
lokálně připravené a otestované. Nejde o produkční receipt. Konkrétní
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
collector/expanded/portfolio testy. Tento původní výsledek potvrzuje přípravu
kontraktu; následné produkční převzetí je zaznamenané níže.

## Přijetí centrální revize 2 — 9. října 2026

- Zdroj `d3eb50c`; `pnpm check`: 0 chyb, 0 varování, 15 původních hints.
- `pnpm test`: 122/122 (33 blog, 57 analytika, 32 distribuce).
- Přesný analytický kandidát Node 24 prošel 21 novými a kompatibilitními
  testy izolovaně bez sítě a produkčních dat.
- Analytický obraz: `sha256:62c0399eddeee981c2a681a78beea687d55e857b63bc91600e8d59a9f5f5cad4`.
- Oba předepsané web/blog obrazy sestaveny; web build vytvořil 156 stránek.
  Jejich bajty zůstaly shodné s předchozími přijatými obrazy. Předepsaná
  kontrola Nginx potvrdila CSP, anonymní ochranu, kontakt a rozsahy stahování.
- Nasazeny pouze collector a dashboard. Web, blog, worker, downloads, monitor,
  Umami a databáze zachovaly identitu, obraz a datum spuštění. Neveřejný registr
  se při nasazení podpory neměnil; jednotlivé aktivace mají vlastní zálohy.
- Veřejné health/blog health, oba jazyky, reprezentativní produkty/návody
  a oba blogy prošly; aktualizovaná veřejná prezentace zůstala správná.
- Všech pět servírovaných runtime (v1, v2, TikTok, portfolio-1, portfolio-2)
  odpovídá přesně kanonickým bajtům a pinům. Revize 2 automaticky nerozšiřuje
  původní tři cíle Studia ani allowlist dalších webů.
- Vratný soukromý release `portfolio2-20261009` obsahuje zdrojový snapshot,
  manifest, původní soubory, obrazy, konfiguraci a protokoly přijetí.
  Tajné údaje a úplné soukromé registry zůstávají pouze na serveru.

## Aktivace Městem hrou — 9. října 2026

Hra předala verzi `v100r2-related-apps` a obraz
`sha256:42ddcfa036207e5b5deb0faf2e67130ed868ab0417c460f3ce87b384f98c8a08`.
VCode nezávisle ověřilo skutečný obraz a jeho zdraví i veřejnou publikaci:
pět přesných CZ a pět EN odstavců soukromí odpovídá místnímu review
`e3bcc0938d0ee9b49255241d09cec677611f7f89152b08cab33de4b082114589`.
Interaktivní patička v obou jazycích a statická česká stránka `/pro-partnery/`
mají správné tři cíle a ikony; veřejný klient je přesná kopie portfolio-2.
Veřejné privacy adresy jsou `https://mestemhrou.cz/?zobrazit=soukromi` a
`https://mestemhrou.cz/?lang=en&zobrazit=soukromi`.

Aktivace **2026-10-09T13:38:23.356941Z** změnila pouze položku Městem hrou:
cestu/pin runtime, tři uvedené portfolio názvy a oba samostatné časové údaje.
Osm původních obecných cest, `outbound-click`, ostatní nastavení a všechny
ostatní weby zůstaly stejné; žádný kontejner se při aktivaci neměnil.

Běžící collector i dashboard načetly přesně schválené tři cíle. Čistá
validace v paměti na syntetickém identifikátoru přijala tyto názvy a odmítla
soukromou cestu, neznámý cíl, raw údaje i zavřený gate. Žádný přijatý
testovací event neodešel do skutečných statistik. Anonymní summary zůstává
401; veřejný runtime odpovídá pinu a prázdný collector požadavek je 400.
Automatický monitor **2026-10-09T13:38:41.916Z** potvrdil `connected: true`
po skutečné aktivaci. Záznam přijetí: soukromý release
`portfolio2-20261009/mestem-activation/activation.json`.

## Aktivace Myslopisu — 9. října 2026

Myslopis předal zdroj `a6d070a522795277fe3f437a0f65f5f00135b1e4`, verzi
`0.5.3` a obraz `sha256:3c5dcf8d6cb78d9779eef9c2babb945e101240dc4bc1070f26aeab734a44c248`.
VCode nezávisle ověřilo na `devapps` tento běžící zdravý obraz a SHA256 jeho
bridge `/assets/index-D3vghhnL.js` i P1 runtime proti skutečným veřejným bajtům.
Veřejné `/privacy` obsahuje přesné čtyři skutečně zobrazené odstavce z místního
review `57967b0b1a3615302465f4d9679163e7a3e843cf8f7cf58aac59f1d62c2bb9be`.
Tři patičkové odkazy směřují na VCode, kořen Městem hrou a kořen Moje porce;
mají vlastní ikony a bezpečné otevření nové karty bez referreru.
Kontrolní privacy stránka vůbec nenačetla analytický runtime; obě karty jsou
uzavřené a nevytvořily měřené návštěvy.

Izolované vykonání skutečných veřejně servírovaných controller bajtů
prokázalo resolved-guest podmínku, tři samostatné clicky bez outbound duplicity,
trvalé zastavení po private/excluded navigaci, asynchronní kontrolu trasy,
DNT/GPC/offline/hidden potlačení a zahození událostí bez replay. Nahrazený
transport a syntetický identifikátor zůstaly jen v paměti testu. Předání
Myslopisu navíc uvádí 287 plných a 41 cílených analytics/privacy testů.

Aktivace **2026-10-09T13:43:13.942869Z** změnila pouze položku Myslopisu:
cestu/pin P1 klienta, tři uvedené nové názvy a samostatné approval/start časy.
Původní tři cesty, `contact-click`/`outbound-click`, všechny ostatní položky
a weby zůstaly stejné. Nic neměnilo soukromé testy, výsledky, účty či PDF.
Collector i dashboard načetly přesně tyto tři cíle, anonymní summary je 401,
veřejný klient odpovídá pinu a prázdný collector payload je 400.
Automatický monitor **2026-10-09T13:43:42.225Z** potvrdil `connected: true`
po skutečné aktivaci. Záznam přijetí: soukromý release
`portfolio2-20261009/myslopis-activation/activation.json`. Žádné skutečné
návštěvnické záznamy nebyly použity pro převzetí.
