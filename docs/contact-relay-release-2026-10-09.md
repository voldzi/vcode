# Formulář v aplikaci, centrální správa — 9. října 2026

## Aktuální stav — 10. října 2026

**Městem hrou je nasazené a jeho centrální příjem je aktivní od 10:24:46 Europe/Prague.** Formulář zůstává v aplikaci na `https://mestemhrou.cz/?zobrazit=partneri#poptavka`; zprávy spravuje existující soukromá schránka VCode. Konkrétní schválené české a anglické informace o soukromí jsou zveřejněné. Dostupnost byla ověřena přes veřejný herní endpoint a skutečnou privátní TLS bránu, bez vytvoření produkční poptávky.

Telegram je nakonfigurovaný pro obecná upozornění bez kontaktů a obsahu zprávy. Živé odeslání poptávky nebo Telegram upozornění nebylo použito jako akceptační test. Ostatní aplikace, samostatný příjem partnerů Moje porce a převod do evidence partnerů tímto vydáním nejsou aktivovány. Následující datované části zachycují i historický stav přípravy před schválením; závěrečný doklad aktivace je na konci.

## Zadání a hranice

Vlastník v chatu Městem hrou výslovně opravil první verzi: „uživatel má být v aplikaci a pouze má být centrální správa“. VCode ověřil tuto lidskou zprávu přímo ve zdrojovém chatu. Návštěvník zůstane ve formuláři a vzhledu hry; existující VCode schránka a outbox zajistí soukromou správu, 90denní výmaz a obecný Telegram.

Kontrakt a opakovatelné šablony jsou v `contact-relay-integration.md`. Nezveřejňovaný interní OpenAPI je `services/blog/contact-relay-openapi.json`; veřejný kontrakt VCode neobsahuje interní cesty ani pověření.

Nezavádí se nový inbox, databáze, tabulka, analytická událost nebo uložený původ. Serverové pověření odvozuje `mestem-hrou` a `partnership`; formulář tyto vlastnosti neposílá. Příjem a propagace partnerů Moje porce zůstávají vypnuté, samostatná soukromá brána beze změny. Blogový plán, rozpočet, schvalování, analytics collector a distribuce se nemění.

## Aktivace

Centrální adaptér lze instalovat s vypnutou položkou aplikace. Aktivace vyžaduje vlastníkovu kontrolu konkrétního nového CZ/EN textu přímo ve hře, jeho zveřejnění, schválenou privátní síť a aktuální důkaz přesného důvěryhodného vstupu s přepisováním IP a odmítnutím přímého podvrženého požadavku. Původní souhlas se zněním VCode se neopakuje; nový text hry nesmí být považován za automaticky zkontrolovaný.

Nové aplikační pověření a samostatná TLS CA/leaf se vytvářejí pouze v chráněné instalaci. Nevyhledávají se ani nerecyklují jiné klíče. CA podpisový klíč zůstane mimo runtime; blog uvidí jen svoji privátní registry/key složku, source web jen vlastní header include a veřejnou CA, brána jen tři TLS soubory. Žádné host ports ani společná široká síť.

## Ověření

Izolovaná akceptace `scripts/verify-contact-relay.mjs` vede přes skutečný aplikační Nginx a privátní TLS do aktuální `createContactService` a PostgreSQL s pouze původní migrací `002_contacts.sql`. Pokrývá delayed/address/app/origin challenge, stejné a souběžné UUID, 409 při změně obsahu, prošlý token pouze pro aktivní identický receipt, zákaz obnovy smazaného záznamu tímto prošlým tokenem, atomický rollback při chybě outbox, autorizaci schránky, obecné oznámení a přesnou 90denní hranici.

Nevytváří se tombstone ani trvalý receipt po výmazu. Tvrzení o zákazu obnovy se týká právě prošlého tokenu a `lookupOnly`; nemění existující kontaktní datový model. Testy používají pouze nově generované syntetické klíče, certifikáty a kontakty, nikdy produkční pověření, skutečné návštěvy nebo skutečný Telegram.

Nginx testuje konečné cesty/metody/query, velikost a MIME, ověřené TLS, původní trusted TCPpeer, header allowlist, no CORS, API-only CSP a absenci kontaktu/query v logu i při chybové větvi, zatímco běžné herní logování zůstává funkční.

Před vydáním proběhnou projektové `pnpm check`, `pnpm test`, `pnpm build`, oba Docker obrazy a finální izolovaná akceptace konkrétního blog obrazu. Nasadí se pouze nezbytná centrální služba a nová privátní brána s návratem k původnímu obrazu při selhání; ostatní přesné image/runtime identity zůstanou zachované. Herní web nasazuje svůj vlastník samostatně, bez dotyku herního API/databáze.

## Centrální instalace — stav 9. října 2026

Dokončena **9. října 2026 v 19:07:33 UTC**. Zdroj kandidáta vznikl z aktuální produkční kopie a pouze 21 vlastněných změn; zachoval již nasazené stránky Rinklet. Proběhla obě sestavení, kontrola zdrojů bez chyb, **171/171 testů** (blog 60, analytika 79, distribuce 32), skutečná Nginx akceptace a celá izolovaná relay akceptace na konečném blog obrazu. Webový kandidát má stejný obraz jako běžící web a nebyl znovu nasazen.

Nasazený blog: `sha256:5e175b0ced4cc817c7ab10e5146b5b5810189fb9a3d9e1fedda1f66cb1e004ed`. Nová soukromá TLS brána: `sha256:6e01bfae6f7971512a5765fe2f52ca4267a4773c7f8b357a2d39e5300787cece`, bez host portu, pouze na ověřené původní centrální a herní webové síti.

Efektivní konfigurace zachovala všechny původní hodnoty prostředí, tajné mounty, sítě, uživatele, omezení, zabezpečení a kontrolu zdraví blogu; přidala jen adaptér a jeho read-only vstup. Web, Přehled, collector, databáze, Umami, monitor, retence, záloha, distribuce, blog worker a původní Moje porce brána mají stejné container ID. Soukromá evidence obsahuje porovnání identit a konfigurace a kontrolovaný návrat včetně metadat provozních příkazů.

Všech **21 veřejných kontrol** prošlo: zdraví webu/blogu, oba jazyky úvodní stránky, hry, jejího návodu, blogu a spolupráce, veřejný shell Přehledu, odmítnutí anonymního přístupu k soukromým datům a nedostupnost interních cest na veřejném hostu. Původní kontaktní challenge je aktivní s původní verzí soukromí; Telegram je nakonfigurovaný. Žádná skutečná poptávka, návštěvní záznam nebo skutečná Telegram zpráva nebyla použita jako test.

**Instalace není aktivace hry.** Položka `mestem-hrou` zůstává vypnutá s prázdnými údaji o schválení a publikaci. Zdrojová aplikace obdržela zmrazený kontrakt, chráněné mount paths a pouze veřejné otisky certifikátů. Důvěryhodný vstup a technická příprava jsou doloženy níže; její nové konkrétní CZ/EN znění čeká na vlastníka a následné veřejné vydání s readbackem. Připravený list má platnost do 9. října 2027 19:05:56 UTC a musí se obnovit nejpozději 9. září 2027.

Doklady jsou v chráněném vydání `contact-relay-20261009`: `gates.json`, `relay-acceptance.json`, `runtime-preflight.json` a `deployment.json`. Podpisová CA, nové aplikační pověření a provozní konfigurace jsou výhradně na serveru; jejich hodnoty nejsou součástí repozitáře ani této dokumentace.

### Přizpůsobení chráněného mountu ve zdrojové hře

Neveřejná kontrola herního kandidáta zjistila, že jeho původní `/var/run` tmpfs přes symlink překrývá `/run`. Zdrojový správce zachovává tuto konfiguraci a mění jen aplikační read-only cíl na `/etc/nginx/contact-relay-auth`. Chráněný host source, UID 101, oprávnění a vlastní pověření/veřejná CA se nemění. VCode nezávisle porovnal deklarované otisky: `app-common.conf` odpovídá přesně dvěma náhradám prefixu a má SHA-256 `a78dd400b689e4b4b1858b759a6e51df5bf89be935879df0bf5109d070f65252`; HTTP guard odpovídá úzkému ověřenému rozsahu `/32`, ostatní šablony jsou beze změny. Samotný otisk nenahrazuje `nginx -t` a skutečný test zdrojového kandidáta. Centrální registry/brána zůstávají beze změny a příjem vypnutý do schválení a zveřejnění notice.

### Zdrojová příprava — stav před schválením 9. října 2026

VCode přečetl a porovnal skutečné `release.md`, `acceptance.json` a `prepared-production.json` zdrojového vydání `2026-10-09-v102`. Doklad připravený **9. října 2026 v 21:19 Europe/Prague** potvrzuje finální Linux kandidát `sha256:db6474bb03ab53083697ce26f1b23a5e816384d238c5be7aac2ff8ebaa6b1a1e`, serverový `nginx -t` s vlastními chráněnými soubory a původními tmpfs a změnu pouze webového obrazu a dvou read-only mountů. Všechny čtyři původní herní/statistické/legacy identity před přípravou a po ní jsou přesně stejné. Veřejný herní web stále běží na v101r2.

Zdroj doložil plnou kontrolu s **1 089 frontendovými a 77 serverovými testy**, finální Chromium a WebKit po 21 scénářích, přesné runtime/SRI a skutečný service worker v offline režimu. Kontaktní obsah se neukládá ani neřadí k pozdějšímu odeslání; herní stav se zachovává. Testy blokovaly produkční zápisy a nevytvořily skutečnou poptávku ani Telegram upozornění. Fyzický iPhone není těmito prohlížečovými kontrolami ověřený.

SHA-256 přečtených dokladů: `acceptance.json` — `64e852f3f209a41f751f9f5e8d1cc76224ae2b1ae4b6d8fdd0d789dd8252ccbc`; `prepared-production.json` — `65acc88d17cd906a05d692a42f47ef14ed103628ee0d086fdd6f3a4502d35c8b`. Přesný nový CZ/EN text má zdrojový SHA-256 `86543db1660a7645ae206f942033ad9b972ba3241d5717f96dc5198886697f06`. Jeho konkrétní kontrola je již předána vlastníkovi; odpověď dosud není zaznamenána. Původní souhlas s účelem VCode schránky se neopakuje.

**Aplikační příjem zůstává vypnutý.** Po lidském schválení naváže vydání připraveného herního webu, skutečný veřejný readback schváleného textu a přesného kandidáta, aktivace pouze této registry položky a veřejná GET kontrola dostupnosti. Široké testy se bez konkrétní nové změny neopakují a skutečná kontaktní zpráva se pro akceptaci neposílá. Jiné aplikace se tímto postupem nezapnou.

## Rozhodnutí vlastníka — 10. října 2026

Vlastník ve VCode přímo odpověděl **„Schvaluji text pro Městem hrou“** dne 10. října 2026 v **10:08:10 Europe/Prague**. VCode ověřil tuto lidskou zprávu `01a124da-f08e-7c53-bf67-2e54418e32b2` přímo v chatu. Rozhodnutí se vztahuje k připravenému krátkému a celému CZ/EN textu `contact-20261009` se zdrojovým SHA-256 `86543db1660a7645ae206f942033ad9b972ba3241d5717f96dc5198886697f06`; aktuální zdroj stále odpovídá schválenému otisku. Tento text se znovu neschvaluje.

Schválení bylo předáno správci zdrojové hry. Navazuje zveřejnění připraveného vlastního formuláře s ověřením aktuálního produkčního základu a zachováním dalších vydaných změn. Před zapnutím centrální položky musí VCode nezávisle ověřit skutečně zveřejněný schválený text a přesný doklad zdrojového vydání. Toto rozhodnutí nepovoluje zapnutí jiné aplikace ani rozšíření analytiky nebo partner-record agendy.

## Zveřejnění a aktivace — ověřeno 10. října 2026

Zdrojový správce vydal připravený web **10. října v 08:12:37 UTC** s obrazem `sha256:db6474bb03ab53083697ce26f1b23a5e816384d238c5be7aac2ff8ebaa6b1a1e`. VCode nezávisle ověřil přesný zdravý runtime, veřejný balíček aplikace a doklady zdroje; herní API, statistické a legacy služby zůstaly zachované.

`publication-text-readback.json` z **08:20:28.941 UTC** má SHA-256 `94771f12a874c35da293ff92cd15b3d1f00b3830b26a941d7a4834abf9a6fd57` a potvrzuje přesnou shodu krátké informace a všech šesti českých i šesti anglických odstavců se schváleným zdrojem. Načítal skutečné veřejné HTML/JS/CSS, blokoval service worker, cizí původy a zápisy před sítí; kontroloval jazyk dokumentu i viditelnou sekci soukromí. VCode porovnal celý obsah s dokladem schválení i zdrojovým otiskem. Nezávislá kontrola metodiky nezjistila překážku.

Závěrečné prohlížečové kontroly veřejného webu prošly **21 scénáři Chromium a 21 scénáři WebKit bez chyby**, s mockovaným odesláním a blokovanými produkčními zápisy. Potvrzují mobilní rozměry a rozhraní; nepotvrzují fyzickou instalaci na iPhone ani skutečné doručení zprávy. Pro úzkou atomickou změnu registru navíc prošly čtyři izolované kontroly: úspěšná výměna, ochrana proti nezávislé změně, odmítnutí symlinku a nevyhovujících oprávnění. Tyto kontroly nepoužily produkční registr ani síť.

Aktivace proběhla **v 08:24:46.324 UTC** atomickou změnou pouze položky `mestem-hrou`: aktivní příjem, ověřený čas schválení a konzervativní čas veřejného readbacku. Kontrakt `contact-20261009`, aplikace, oblast, původ i pověření zůstaly stejné. Připravený návrat se při selhání veřejné dostupnosti vztahoval jen na tuto položku; nebyl potřebný. Veřejná GET kontrola vrátila aktivní challenge s předepsanou verzí, prodlevou a krátkou platností, bez cookies a CORS a s `no-store`. Challenge token se neukládá do dokladu.

Následná nezávislá kontrola potvrdila aktivní položku, nastavený Telegram, zdraví VCode webu/blogu a stejné zdravé identity zdrojového webu, centrální služby, nové brány, Přehledu i původní samostatné partnerské brány. Samostatný partner intake a propagace všech jeho položek zůstaly vypnuté. Aktivace nevyžadovala restart služeb. Záznamy skutečných kontaktů nebyly čtené, skutečná zpráva ani Telegram upozornění nebyly odeslané pro akceptaci.

Chráněné doklady vydání `contact-relay-20261009`: `source-activation-input.json`, `source-activation.json` a `post-activation-readback.json`. Obsahují ověřené schválení, otisky publikace a registru, výsledky dostupnosti a zachování runtime; neobsahují aplikační klíč, challenge token nebo obsah kontaktní zprávy.
