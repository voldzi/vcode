# AI v práci: návrh návštěvnosti a souhrnných milníků

Stav: návrh k připomínkám a schválení vlastníkem, **není aktivní**. Navazuje na upřesnění v chatu cvičebny dne 19. 10. 2026. Čtyři schválené prokliky zůstávají zapnuté; tento návrh nezakládá novou registraci ani neopravňuje k rozšíření sběru.

## Stejná registrace, oddělená data zahájení

- Website ID `724a2354-e5dd-49c8-add0-c2105491ef65`, název po aktivaci **AI v práci**.
- Veřejný origin `https://games.zeleznalady.cz`, endpoint `/prezentaceAI/analytics/v2/events`, tělo pouze `{website,name,path}` a vždy `path:'/prezentaceAI/'`.
- Dosavadní čtyři `portfolio-…-click` a jejich začátek **2026-10-19T17:30:20.513187+00:00** zachovat.
- Návštěvnost a aktivita mají vlastní skutečné datum spuštění: `pageviewsCollectionStartedAt` a `practiceUsageCollectionStartedAt`. Historii nedopočítávat a staré kliky nevydávat za návštěvy.
- Nový samostatný datovaný souhlas `practiceUsageMetricsApprovedAt`; bez něj server odmítá všech pět nových událostí. Samotné přidání názvů do seznamu nestačí. Pageview lze povolit jen současně s publikovaným schváleným rozšířením a výslovným `pageviewsEnabled:true`.
- `captureSources:false`; nezasílat `source` ani referrer. Čtyři portfolio kliky mají nadále vlastní schválení a vlastní runtime.

## Pět souhrnných událostí

| Jméno | Skutečný okamžik | Omezení |
| --- | --- | --- |
| `practice-start` | Otevření nebo výslovné pokračování cvičení | Jednou na otevřený pokus v paměti |
| `practice-answer-viewed` | První nově dokončené přehrání připravené hlavní odpovědi | Obnovené hotové odpovědi nepočítat zpětně |
| `practice-source-opened` | První skutečné otevření konkrétní citované pasáže odpovědi | Není to otevření obecného seznamu zdrojů |
| `practice-complete` | Nově dosažené dokončení všech hlavních odpovědí zvoleného režimu | Počet závisí na příběhu/režimu; bonusy nevyžadovat |
| `practice-reset` | Výslovně potvrzený restart pokusu | Ne při načtení, obnovení nebo běžném návratu |

První čtyři události nejvýše jednou v daném otevřeném pokusu. Potvrzený reset odešle reset starého pokusu a smaže jeho paměťové příznaky. Nový start nastane až při skutečném zahájení nového pokusu. Událost se považuje za spotřebovanou i při potlačení DNT/GPC/offline nebo chybě sítě; žádné pozdější dohnání. Nové načtení stránky může vytvořit nový paměťový pokus, proto počty neznamenají jedinečné lidi ani jedinečné uložené práce.

Režimy nemají shodný počet hlavních kroků. Nepoužívat univerzální step1–3, skóre ani počet všech odpovědí jako náhražku dokončení. Obnovený již dokončený pokus nevytváří zpětně answer/source/complete. Při obnovení částečně hotového pokusu počítat až skutečné nové akce; dokončení pouze při novém přechodu do splněných hlavních odpovědí.

## Veřejný vstup a SPA

Nový usage runtime ověří jen HTTPS, přesný host a `pathname === '/prezentaceAI/'`. **Search, hash, href, title a referrer vůbec nečte.** Tím pokryje i veřejné hluboké vstupy a běžný tréninkový stav po SPA změně, ale všechny požadavky mají stejnou konstantní cestu. Ve zdroji ověřeno: administrace se směruje podle jiné cesty `/admin`, nikoli podle parametrů (`src/App.tsx`). Admin, instruktor, API a jiné cesty jsou vždy vyloučené; analytika nečte účastnický účet ani jeho práci.

Pageview nejvýše jednou v životě dokumentu, ne při React remountu, změně příběhu nebo návratu z chatu. Milníky pouze z výslovných aplikačních handlerů; žádné globální click listenery nebo automatická detekce obrazovek. Do handlerů nesmí vstupovat URL, scenario, participant, cohort, variant ani return code. Izolované testy nastaví getter search/hash/href/title/referrer tak, aby vyhodil chybu při jakémkoli přístupu. Stávající footer runtime zůstává byte-exact se svými dosavadními pravidly; oprávnění nového usage klienta jeho původní rozsah nerozšiřuje.

Nový usage runtime oddělit od stávajícího footer runtime. Oba musí být idempotentní; usage nesmí znovu emitovat footer kliky a footer nesmí emitovat pageview. Dodavatel má předat veřejný samostatný JS do 10 KiB, SRI, skutečně použité HTML/CSP, izolované testy a veřejné doklady. Žádný automatický export existujících privátních backendových událostí. Nedotýkat se jejich schématu ani účastnických záznamů.

## Soukromí, přenos a soukromý Přehled

Bez participant/session/cohort ID, přezdívky, kódu, názvu cvičení, výsledku, chatů, textu odpovědí, poznámek, formulářů nebo URL. Ani tyto hodnoty nehashovat jako obcházení zákazu. Žádné dodatečné parametry. Pouze běžné technické spojení zpracované současným VCode/Umami; denní odvozený identifikátor není účet účastníka a nesmí se používat pro individuální výukovou cestu.

DNT `1`/`yes`, GPC, offline a zakázaná veřejná plocha potlačují sběr při inicializaci i při každé akci. `credentials:omit`, `referrerPolicy:no-referrer`, `cache:no-store`, `redirect:error`; bez cookies analytiky, lokálního úložiště, fronty a retry. Zpracování nejvýše 180 dní včetně záloh; bez odvozené geolokace. Žádné syntetické platné produkční eventy.

Přehled: návštěvnost od vlastního data; **Souhrnná aktivita ve cvičebně** s pěti pojmenovanými počty a samostatným datem; čtyři portfolio prokliky odděleně. Nepočítat individuální funnel, konverzní procenta nebo míru správnosti. Milníky nemusejí být monotónní (obnovení, opakování, DNT, zdroj není povinný); vysvětlit to. Nezobrazovat období před zapnutím jako naměřenou nulu. Zatím žádné dělení podle příběhů nebo účastníků.

## Přesné CZ/EN znění k revizi

Nové konkrétní sekce: `docs/integrations/footer-portfolio-20261019/ai-practice-usage.cs.html` a `.en.html`. Zamýšlená náhrada dosavadních portfolio sekcí ve stejné veřejné stránce soukromí, protože původní výslovně vylučují návštěvnost a průchod. Nejprve potvrdit implementovatelnost významu událostí s vývojářem, poté vlastník schválí přesné obě jazykové verze. Souhlas s dřívějšími čtyřmi kliky sám tuto změnu nepovoluje.

## Nasazení a návrat

1. Před implementací sladit skutečné handlery a režimy v aplikaci. Nevyčítat živé události účastníků.
2. Připravit collector gate a dashboard; izolovaně ověřit pět nových názvů, pageview, ochrany, neduplikaci, obnovení, reset a oba jazyky. Nové registry gates zůstanou vypnuté.
3. Po schválení zveřejnit přesné notice a nový klient s dosud zakázanou novou centrální větví.
4. Nezávislý veřejný readback, SRI, negativní collector probe, teprve poté datovaná aktivace návštěvnosti/aktivity při zachování starých kliků a původního začátku.
5. Návrat vypne pouze nové pageviews a pět milníků. Čtyři schválené kliky pokračují; zveřejněný text o již proběhlém sběru se nemaže.
