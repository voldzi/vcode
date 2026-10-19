# AI v práci: návrh návštěvnosti a souhrnných milníků

Stav: revize 2 **schválená, nasazená a aktivní od 2026-10-19T17:57:03.474092+00:00**. Navazuje na upřesnění v chatu cvičebny dne 19. 10. 2026. Čtyři schválené prokliky zůstávají zapnuté; tento návrh nezakládá novou registraci ani neopravňuje k rozšíření sběru.

## Stejná registrace, oddělená data zahájení

- Website ID `724a2354-e5dd-49c8-add0-c2105491ef65`, název po aktivaci **AI v práci**.
- Veřejný origin `https://games.zeleznalady.cz`, endpoint `/prezentaceAI/analytics/v2/events`, tělo pouze `{website,name,path}` a vždy `path:'/prezentaceAI/'`.
- Dosavadní čtyři `portfolio-…-click` a jejich začátek **2026-10-19T17:30:20.513187+00:00** zachovat.
- Návštěvnost a aktivita mají vlastní skutečné datum spuštění: `pageviewsCollectionStartedAt` a `practiceUsageCollectionStartedAt`. Historii nedopočítávat a staré kliky nevydávat za návštěvy.
- Označení samostatného rozsahu `practiceUsageMetricsRequired:true` a nový datovaný souhlas `practiceUsageMetricsApprovedAt`; bez něj server odmítá všech pět nových událostí. Samotné přidání názvů do seznamu nestačí; milníky vyžadují i platné `practiceUsageCollectionStartedAt`, návštěvnost své `pageviewsCollectionStartedAt`. Pageview lze povolit jen současně s publikovaným schváleným rozšířením a výslovným `pageviewsEnabled:true`.
- `captureSources:false`; nezasílat `source` ani referrer. Čtyři portfolio kliky mají nadále vlastní schválení a vlastní runtime.

## Pět souhrnných událostí

| Jméno | Skutečný okamžik | Omezení |
| --- | --- | --- |
| `practice-start` | Otevření nebo výslovné pokračování cvičení | Jednou na otevřený pokus v paměti |
| `practice-answer-viewed` | První nově dokončené přehrání libovolné připravené odpovědi, včetně doplňující | Bez vlastního textu; obnovené hotové odpovědi nepočítat zpětně |
| `practice-source-opened` | První skutečné otevření konkrétní citované pasáže odpovědi | Nové kliknutí na konkrétní citaci, i po obnově; ne obecný seznam nebo obnovený stav |
| `practice-complete` | Nově dosažené dokončení podle zvoleného režimu, viz definice níže | Počet závisí na příběhu/režimu; bonusy nevyžadovat |
| `practice-reset` | Výslovně potvrzený restart pokusu | Ne při načtení, obnovení nebo běžném návratu |

První čtyři události nejvýše jednou v daném otevřeném pokusu. Potvrzený reset odešle reset starého pokusu a smaže jeho paměťové příznaky. V této aplikaci potvrzení zároveň skutečně otevře nový prázdný pokus, a proto následuje právě jeden nový start. Samotné načtení, obnova nebo mount reset ani tento nový start nespouštějí. Událost se považuje za spotřebovanou i při potlačení DNT/GPC/offline nebo chybě sítě; žádné pozdější dohnání. Nové načtení stránky může vytvořit nový paměťový pokus, proto počty neznamenají jedinečné lidi ani jedinečné uložené práce.

Režimy nemají shodný počet hlavních kroků. Nepoužívat univerzální step1–3, skóre ani počet všech odpovědí jako náhražku dokončení. Obnovený již dokončený pokus nevytváří zpětně answer/source/complete. Při obnovení částečně hotového pokusu počítat až skutečné nové akce; dokončení pouze při novém splnění příslušné podmínky režimu. Nové kliknutí na konkrétní citaci po obnově se může započítat jako source-opened; pouhé obnovení otevřené citace nikoli. Samotný mount nevyvolává answer/source/complete.

Přesná definice `practice-complete`:

- **Guided:** všechny hlavní položky skutečného `guidedPromptIds`, bez bonusů; při chybějícím seznamu použít stejný fallback jako samotné UI.
- **Case:** všechny hlavní odpovědi lekce, bez bonusů.
- **Skill:** první nově hotová připravená odpověď ke zvolené dovednosti; tento krátký režim nemá pevnou vícekrokovou posloupnost.

Tyto aplikační seznamy a režimy slouží jen k rozhodnutí v lokálním handleru. Jejich názvy, hodnoty a identifikátory se neposílají analytice. `practice-answer-viewed` naopak není omezené na hlavní odpovědi: započítá první nově hotovou připravenou odpověď i z doplňujících možností, nikdy však vlastní napsaný text.

## Veřejný vstup a SPA

Nový usage runtime ověří jen HTTPS, přesný host a `pathname === '/prezentaceAI/'`. **Search, hash, href, title a referrer vůbec nečte.** Tím pokryje i veřejné hluboké vstupy a běžný tréninkový stav po SPA změně, ale všechny požadavky mají stejnou konstantní cestu. Ve zdroji ověřeno: administrace se směruje podle jiné cesty `/admin`, nikoli podle parametrů (`src/App.tsx`). Admin, instruktor, API a jiné cesty jsou vždy vyloučené; analytika nečte účastnický účet ani jeho práci.

Pageview nejvýše jednou v životě dokumentu, ne při React remountu, změně příběhu nebo návratu z chatu. Milníky pouze z výslovných aplikačních handlerů; žádné globální click listenery nebo automatická detekce obrazovek. Do handlerů nesmí vstupovat URL, scenario, participant, cohort, variant ani return code. Izolované testy nastaví getter search/hash/href/title/referrer tak, aby vyhodil chybu při jakémkoli přístupu. Stávající footer runtime zůstává byte-exact se svými dosavadními pravidly; oprávnění nového usage klienta jeho původní rozsah nerozšiřuje.

Nový usage runtime `/prezentaceAI/vcode-ai-usage-v1.js` (zdroj `public/vcode-ai-usage-v1.js`), namespace `vcodeAiPracticeUsage`, revize `ai-usage-1`, má pouze explicitní rozhraní `pageview()` / `event(name)`. Dodané místní bajty mají SRI `sha384-OfkMTUtuoV6C0ihpkUglvNBgZaQvTjPsOSC8f35lQ71dHY5xAvX/YRXFyuXmtNxh`; veřejné bajty a aplikační přejímka byly ověřeny při aktivaci níže. Monitor tento samostatný runtime ověřuje navíc k původnímu footer runtime. Samotný název runtime není doklad přejímky.

Nový usage runtime oddělit od stávajícího footer runtime. Oba musí být idempotentní; usage nesmí znovu emitovat footer kliky a footer nesmí emitovat pageview. Dodavatel má předat veřejný samostatný JS do 10 KiB, SRI, skutečně použité HTML/CSP, izolované testy a veřejné doklady. Žádný automatický export existujících privátních backendových událostí. Nedotýkat se jejich schématu ani účastnických záznamů.

## Soukromí, přenos a soukromý Přehled

Bez participant/session/cohort ID, přezdívky, kódu, názvu cvičení, výsledku, chatů, textu odpovědí, poznámek, formulářů nebo URL. Ani tyto hodnoty nehashovat jako obcházení zákazu. Žádné dodatečné parametry. Pouze běžné technické spojení zpracované současným VCode/Umami; denní odvozený identifikátor není účet účastníka a nesmí se používat pro individuální výukovou cestu.

DNT `1`/`yes`, GPC, offline a zakázaná veřejná plocha potlačují sběr při inicializaci i při každé akci. `credentials:omit`, `referrerPolicy:no-referrer`, `cache:no-store`, `redirect:error`; bez cookies analytiky, lokálního úložiště, fronty a retry. Zpracování nejvýše 180 dní včetně záloh; bez odvozené geolokace. Žádné syntetické platné produkční eventy.

Přehled: návštěvnost od vlastního data; **Souhrnná aktivita ve cvičebně** s pěti pojmenovanými počty a samostatným datem; čtyři portfolio prokliky odděleně. Nepočítat individuální funnel, konverzní procenta nebo míru správnosti. Milníky nemusejí být monotónní (obnovení, opakování, DNT, zdroj není povinný); vysvětlit to. Nezobrazovat období před zapnutím jako naměřenou nulu. Zatím žádné dělení podle příběhů nebo účastníků.

## Přesné CZ/EN znění k revizi

Nové konkrétní sekce: `docs/integrations/footer-portfolio-20261019/ai-practice-usage.cs.html` a `.en.html`. Zamýšlená náhrada dosavadních portfolio sekcí ve stejné veřejné stránce soukromí, protože původní výslovně vylučují návštěvnost a průchod. Definice režimů byly zpřesněny podle předání vývojáře. Vlastník obě jazykové verze revize 2 schválil 19. 10. 2026 v původním chatu cvičebny odpovědí „Schvaluji znění i opravené měření“. VCode ověřil přímo lidskou zprávu i konkrétní otázku. Technická přejímka skutečného klienta, veřejné r2 stránky a aktivace jsou doloženy níže. Souhlas s dřívějšími čtyřmi kliky sám tuto změnu nepovoluje.

## Nasazení a návrat

1. Před implementací sladit skutečné handlery a režimy v aplikaci. Nevyčítat živé události účastníků.
2. Připravit collector gate a dashboard; izolovaně ověřit pět nových názvů, pageview, ochrany, neduplikaci, obnovení, reset a oba jazyky. Nové registry gates zůstanou vypnuté.
3. Po schválení zveřejnit přesné notice a nový klient s dosud zakázanou novou centrální větví.
4. Nezávislý veřejný readback, SRI, negativní collector probe, teprve poté datovaná aktivace návštěvnosti/aktivity při zachování starých kliků a původního začátku.
5. Návrat vypne pouze nové pageviews a pět milníků. Čtyři schválené kliky pokračují; zveřejněný text o již proběhlém sběru se nemaže.

## Identita textu k předložení vlastníku

Verze notice: `ai-practice-usage-2026-10-19-r2`. SHA-256 úplných souborů včetně koncového nového řádku:

- CS: `c7e89732acd69cac6f5c4fafc90d2e9d52773ae80fa67d614c0d06cddf6153e2`
- EN: `30b10460de82b33a810a777aa98a0ab3241b97a9c1e891c016347ab06af285f8`

## Kontrola textů revize 2 před implementací

Při původní kontrole textů byly změněny pouze tři dokumenty, žádná produkční konfigurace nebo klient. `pnpm check`: 0 chyb, 0 varování. `pnpm test`: 227/227 (62 blog, 133 analytika, 32 stahování); testy potřebovaly povolit pouze lokální testovací port. Veřejná hranice a kontrola diffu prošly. `pnpm build` se po generování webu zastavil na požadovaném soukromém podepsaném dokladu Recall a jeho důvěryhodném klíči, které nejsou v lokálním prostředí dostupné. Doklad nebyl kopírován a publikační ochrana nebyla vypnuta. Tento lokální běh není úplný úspěšný build ani přejímka nového měření.

## Připravená centrální implementace

Sběrač má samostatnou podmínku pro pět milníků a pro návštěvnost, oba druhy vyžadují vlastní datum zahájení; čtyři footer události zůstávají nezávislé. Přehled zobrazuje pět souhrnných počtů, ne individuální funnel nebo konverzní procenta. Dotazy návštěvnosti začínají nejdříve novým datem, staré prokliky zachovávají historii. Období před zahájením má chybějící pokrytí místo naměřené nuly; srovnání s neměřeným předchozím obdobím se nezobrazuje. Monitor ověřuje samostatný usage asset/SRI navíc ke stávajícímu footer runtime.

`pnpm check`: 0 chyb, 0 varování. `pnpm test`: 235/235 (62 blog, 141 analytika, 32 stahování). Nové HTTP fixture ověřují skutečný sběrač i chráněné API, aktivaci a vypnutí nového rozsahu, DNT/GPC, zachování footerů a správné časové hranice. Syntetická prohlížečová kontrola Přehledu prošla v šířkách 390 a 1440 px, bez JS chyb a bez přetečení při 200% textu. Tato místní přejímka předcházela následné serverové kvalifikaci a veřejné aktivaci doložené níže.

## Finální produkční převzetí 19. 10. 2026

- Stejná registrace `724a2354-e5dd-49c8-add0-c2105491ef65`, aktuální název **AI v práci**, `collectionEnabled:true`, `pageviewsEnabled:true`, `captureSources:false`.
- Návštěvnost i pět milníků od **2026-10-19T17:57:03.474092+00:00**; čtyři dosavadní prokliky a jejich začátek **2026-10-19T17:30:20.513187+00:00** zachované.
- Přesně devět kategorií: původní čtyři portfolio události a pět `practice-…` uvedených v tomto kontraktu. Živý sběrač potvrdil nové podmínky; čistá syntetická funkce v reálném obrazu ověřila i vypnutí nového rozsahu při zachování footerů. Žádné platné syntetické události do produkce.
- Veřejná frontendová verze `20261019-usage-13e53705599f`, manifest SHA-256 `51a63300b20c2e3f3f74d45986a6b4823cc39dcc26e7aadfc23d3be906af2854`. Nezávislý readback skutečné veřejné stránky ověřil obě přesné r2 sekce, nový usage SRI, nezměněný footer runtime/SRI i jejich použití v HTML. Plné HTML soukromí SHA-256 `12d77396c1ff224fb784761ef15f6245bd9960e9f9af52b5d230f7adb2c23b31`.
- Centrální přijatý zdroj `1dbede7f2c93853e00b12bbea08cf398dc32724f`. Na serveru prošly check, **235 testů**, sestavení obou Docker obrazů a izolované testy skutečných collector/dashboard obrazů včetně nového rozsahu. Statický veřejný web byte-exact, **194 HTML**; web/blog nebylo nutné přepínat.
- Nasazeny jen tři analytické služby, původní prostředí a úložiště zachované. Finální kontrola **17:58:11 UTC** potvrdila ostatních **9 registrací**, **11 kontejnerů** i skutečně dostupné původní obrazy pro návrat.
- Čerstvý monitor **2026-10-19T17:57:39.517Z**: propojení ověřeno, včetně samostatného usage skriptu/SRI a prázdného neplatného POST →400.
- Nový veřejný JS balíček Přehledu odpovídá přijatému zdroji; PWA worker připíná jeho novou obsahovou verzi. Soukromé API bez přihlášení vrací **401**. Produkční smoke ověřilo zdraví webu/blogu, oba jazyky, prezentace, návody a oba blogy.

Aktivní analytické obrazy:

- collector: `sha256:7d89af609ad25faa1d3b3d1fe9d4b670897fa5e5f6d948396b132cc5f8df3114`
- dashboard: `sha256:e8754aa0e542de2fb261dd76057c6f658aba6d69d838f5426d405570b099b89a`
- monitor: `sha256:ae62d51936d274fc61fb330fbeecb13a4fec1344fac6992da93c2a1b1fedb725`

Soukromé registry, klíče, provozní doklady a konfigurace návratu zůstávají na serveru. Návrat musí nejprve nastavit `pageviewsEnabled:false` a odebrat jen pět nových událostí z povoleného seznamu; původní čtyři kliky, všechna data zahájení a zveřejněná informace o již proběhlém měření zůstanou zachované. Teprve poté případně vrátit původní obrazy. Pro přejímku nebyly čteny skutečné návštěvnické záznamy.
