# Formulář v aplikaci, centrální správa — 9. října 2026

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

## Centrální instalace — ověřený stav

Dokončena **9. října 2026 v 19:07:33 UTC**. Zdroj kandidáta vznikl z aktuální produkční kopie a pouze 21 vlastněných změn; zachoval již nasazené stránky Rinklet. Proběhla obě sestavení, kontrola zdrojů bez chyb, **171/171 testů** (blog 60, analytika 79, distribuce 32), skutečná Nginx akceptace a celá izolovaná relay akceptace na konečném blog obrazu. Webový kandidát má stejný obraz jako běžící web a nebyl znovu nasazen.

Nasazený blog: `sha256:5e175b0ced4cc817c7ab10e5146b5b5810189fb9a3d9e1fedda1f66cb1e004ed`. Nová soukromá TLS brána: `sha256:6e01bfae6f7971512a5765fe2f52ca4267a4773c7f8b357a2d39e5300787cece`, bez host portu, pouze na ověřené původní centrální a herní webové síti.

Efektivní konfigurace zachovala všechny původní hodnoty prostředí, tajné mounty, sítě, uživatele, omezení, zabezpečení a kontrolu zdraví blogu; přidala jen adaptér a jeho read-only vstup. Web, Přehled, collector, databáze, Umami, monitor, retence, záloha, distribuce, blog worker a původní Moje porce brána mají stejné container ID. Soukromá evidence obsahuje porovnání identit a konfigurace a kontrolovaný návrat včetně metadat provozních příkazů.

Všech **21 veřejných kontrol** prošlo: zdraví webu/blogu, oba jazyky úvodní stránky, hry, jejího návodu, blogu a spolupráce, veřejný shell Přehledu, odmítnutí anonymního přístupu k soukromým datům a nedostupnost interních cest na veřejném hostu. Původní kontaktní challenge je aktivní s původní verzí soukromí; Telegram je nakonfigurovaný. Žádná skutečná poptávka, návštěvní záznam nebo skutečná Telegram zpráva nebyla použita jako test.

**Instalace není aktivace hry.** Položka `mestem-hrou` zůstává vypnutá s prázdnými údaji o schválení a publikaci. Zdrojová aplikace obdržela zmrazený kontrakt, chráněné mount paths a pouze veřejné otisky certifikátů. Její nové konkrétní CZ/EN znění, zveřejnění, důvěryhodný vstup a vlastní webové nasazení ještě vyžadují skutečný doklad. Připravený list má platnost do 9. října 2027 19:05:56 UTC a musí se obnovit nejpozději 9. září 2027.

Doklady jsou v chráněném vydání `contact-relay-20261009`: `gates.json`, `relay-acceptance.json`, `runtime-preflight.json` a `deployment.json`. Podpisová CA, nové aplikační pověření a provozní konfigurace jsou výhradně na serveru; jejich hodnoty nejsou součástí repozitáře ani této dokumentace.

### Přizpůsobení chráněného mountu ve zdrojové hře

Neveřejná kontrola herního kandidáta zjistila, že jeho původní `/var/run` tmpfs přes symlink překrývá `/run`. Zdrojový správce zachovává tuto konfiguraci a mění jen aplikační read-only cíl na `/etc/nginx/contact-relay-auth`. Chráněný host source, UID 101, oprávnění a vlastní pověření/veřejná CA se nemění. VCode nezávisle porovnal deklarované otisky: `app-common.conf` odpovídá přesně dvěma náhradám prefixu a má SHA-256 `a78dd400b689e4b4b1858b759a6e51df5bf89be935879df0bf5109d070f65252`; HTTP guard odpovídá ověřenému úzkému ověřenému rozsahu `/32`, ostatní šablony jsou beze změny. Samotný otisk nenahrazuje `nginx -t` a skutečný test zdrojového kandidáta. Centrální registry/brána zůstávají beze změny a příjem vypnutý do schválení a zveřejnění notice.
