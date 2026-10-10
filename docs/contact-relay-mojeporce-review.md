# Moje porce — konkrétní příprava centrálního příjmu

## Aktuální stav 10. října 2026

**Moje porce je nasazená a její centrální příjem je aktivní.** Závěrečný skutečný veřejný GET 10. října v 11:44:19 UTC vrátil 200 a `enabled=true`. Před zapnutím prošel přesný veřejný text soukromí v obou jazycích, vlastní zdrojové vydání, skutečná DMZ i oddělená brána. Původní centrální služby a záznam Městem hrou jsou zachované. Zprávy míří do existující soukromé schránky VCode se stávajícím obecným Telegram outboxem; při akceptaci nebyl proveden skutečný POST ani odeslán skutečný Telegram.

Po počátečním odmítnutí automatickou kontrolou vlastník udělil přímé operátorské potvrzení v tomto vlákně: zpráva `01a12568-10e4-7581-8aca-2776d8bcd2a0`, otázka `call_5cf4615d13174fd1b665bff0983d4cfa`, odpověď „Schvaluji napojení a nasazení Moje porce“. Tím byly povolené konkrétní serverové kroky a předání pokynů zdrojovému chatu. Předchozí odmítnutí se neobcházelo; serverové akce pokračovaly až po tomto přímém potvrzení.

Konkrétní rozhodnutí vlastníka v chatu Moje porce bylo rovněž přečtené: zpráva `01a1255d-6310-7233-8f57-804c9672defc`, otázka `call_57816e1e4c3341dbb7d2991ca5c57214`, odpověď „Schválit tento konkrétní rozsah“. Zahrnuje vlastní registraci ve VCode, samostatné serverové klíče a omezenou zabezpečenou bránu, pouze dvě kontaktní cesty a aktivaci po izolovaném testu a publikaci schváleného textu.

## Přesná hranice

| Vlastnost | Hodnota |
| --- | --- |
| Katalogová aplikace a registry ID | `kaloricke-tabulky` |
| Název | Moje porce |
| Kanonický původ | `https://mojeporce.cz` |
| Oblast | `partnership` |
| Verze soukromí | `contact-20261009` |
| Přesný digest kanonického JSON 6 CS + 6 EN odstavců | `1b056b3aced8e5d222ffc644513e6b8942b1e1f48e26821e86f378eef6a47f09` |
| Výchozí položka | `enabled=false`, `approvedAt=null`, `publishedAt=null` |
| Vlastní veřejné kontaktní cesty | `GET /api/partner-contact/challenge`, `POST /api/partner-contact` |

Zpráva skončí pouze v existující soukromé kontaktní schránce VCode a jeho stávajícím outboxu. Platí současná 90denní retence a obecný Telegram bez kontaktů nebo obsahu zprávy. Kontaktní formulář se neposílá do analytiky. Účet, jídelníček, zdravotní údaje a další soukromý obsah aplikace se k poptávce nepřipojují. Nezavádí se druhá databáze, tabulka, inbox, analytická událost ani tombstone.

Vlastník také schválil konkrétní CS/EN návrh v lidské zprávě `01a12546-823e-7202-9a42-e059c11a6253`. Nezávislý skutečný veřejný readback na `https://mojeporce.cz/spoluprace/soukromi` 10. října v 11:43:31 UTC potvrdil všech šest českých a šest anglických odstavců a přesný schválený digest výše. Anglické znění je úmyslně dostupné v rozbalovací části téže české stránky. Původní schválení jiného partnerského rozhraní ani Městem hrou se nepřebírá.

## Připravené konkrétní soubory

- `deploy/contact-relays/mojeporce-node-ingress.conf.example`: pouze dvě přesné cesty v existujícím HTTPS vhostu, vlastní ingress guard, přepsaná skutečná adresa, konečný header allowlist, nested aplikační chyby, 16 KiB limit, no-store a no-CORS, potlačené kontaktní logy. Je nutné použít skutečný existující upstream a ověřenou topologii; jde o review šablonu, nikoli instalaci.
- `deploy/contact-relays/mojeporce-tls-gateway-compose.example.yml`: samostatná brána se samostatnou CA a leaf certifikátem, žádné host ports, UID 101, read-only a omezené zdroje. Pouze centrální síť a jedna nezávisle ověřená již existující aplikační síť Moje porce. Alias `vcode-contact-relay` pouze na Moje síti, unikátní `vcode-contact-relay-mojeporce` na centrální síti. Žádná třetí síť na původní bráně Městem hrou.
- `scripts/verify-mojeporce-contact-relay.mjs`: skutečné Moje porce route exporty a Node HTTPS transport přes DMZ a TLS do aktuální kontaktní služby, jednorázový PostgreSQL s pouze `002_contacts.sql` a mock Telegram. Žádné host ports, produkční spojení, skutečné kontakty nebo skutečná Telegram zpráva.

Ostatní proxy lokace musí vždy odstranit `X-Mojeporce-Contact-Ingress`; serverová direktiva se nedědí do lokace, která má vlastní `proxy_set_header`. DMZ získá jen vlastní guard. Node získá jen nový centrální credential, odlišný guard a veřejnou CA. CA signing key zůstává pouze operátorovi, mimo runtime. Žádný browser Authorization, cookie, forwarding chain, referrer nebo správcovské oprávnění se nepředává.

Statický Dockerfile Moje porce původně naznačoval UID/GID `1001:1001`; živý readback potvrdil **UID 1001 / GID 65533**. Nové Node materiály jsou připravené přesně pro tuto identitu a zdrojový read-only mount `/etc/mojeporce-contact`; skutečné mounty v novém vydání zůstávají zdrojovou bránou. Síťové názvy a ID byly ověřené před instalací vlastní brány. Nepoužil se odhad jména sítě, náhradní HTTP, vypnuté TLS ověřování nebo přístup k jiné databázové síti.

## Zdrojové opravy a ověření

Audit odhalil potřebu pevného `Host: vcode-contact-relay` v Node transportu; implicitní hlavička s portem `:8443` zmrazenou bránou správně neprojde. Zachovává se vlastní CA, URL, SNI a přesná kontrola hostu brány. Aktuální source již explicitní host obsahuje a místní síťový test používá skutečný transport.

Při nejistém odeslání se pro ověření používá původní token i po jeho expiraci, neměnné UUID a payload. Automatické obnovení a opakovaný POST by obcházely `lookupOnly` a mohly znovu vytvořit odstraněnou zprávu. Read-only kontrola aktuálního zdrojového klienta potvrzuje opravu této logiky (`partner-contact-client.ts`, SHA-256 `eefdebb30339b3a95ba7b083f7d895a118ad6c7feaad3589f169bdf067fb25d3`). Klientské testy zdrojové aplikace tímto read-only auditem spuštěné nebyly; centrální schéma, tombstones nebo retence se nerozšiřují.

Před vložením soukromého guard include musí zdrojový DMZ installer nahradit svůj úplný `nginx -T` bezpečnými cílenými kontrolami a `nginx -t`. Chráněný include, celý Compose config, klíče a challenge tokeny se nesmějí vypsat do logu.

### Doklad místní izolace

Finální zmrazená vstupní šablona prošla místní izolovanou zkouškou: **PASS**, pouze syntetická data, bez host ports a produkčních spojení, nula skutečných Telegram volání, bez změny systémové důvěry; všechny jednorázové zdroje byly odstraněné. Testuje skutečné Moje porce route exporty a Node HTTPS transport, nikoli produkční Next build nebo instalaci DMZ.

- Doklad: `/private/tmp/vcode-mojeporce-relay-frozen-dmz-20261010.json`, SHA-256 `029ce99537a24a4a281d26057d8dd2b6c05ad44c841b7718502fc9b79b3226cb`.
- Vstupní šablona: SHA-256 `3b0df5f3ccb3a731a494d88cbbfdcac1327bce8495ddbbfd97c7aba1c89b075e`.
- Akceptační skript: SHA-256 `71f9771e2a862d709687c0490f9b653b99c57c78980b1d1d9209c936bd22b3be`.
- Skutečný zdrojový Node transport: SHA-256 `955db16c2545e7d1737fe229e4a2e1b37fc42ed52e12bc7adc6bbd69c96d4cfa`.
- Místní centrální obraz: `sha256:cde81ac8ce90ebe6f286b44048bdd1bc7c3806dd3aef9e3668e84310a503a77c`; ověření přesného produkčního obrazu zůstává samostatnou bránou.

Ověřené hranice zahrnují nezávislé dvě registrace a vypnutí jen Moje porce, původní funkční Městem hrou, odmítnutí přímého bypassu a neplatné CA/hostname, původní TCP peer při přepsání real-IP, pevné chyby a jedinou bezpečnostní politiku hlaviček, idempotenci, expiraci a zákaz obnovy smazaného záznamu, soukromý inbox, 90denní retenci a Telegram pouze jako mock bez osobních údajů. Přesná produkční síť ani veřejná publikace soukromí nejsou tímto výsledkem doložené.

Projektové kontroly 10. října 2026: `pnpm check` (0 chyb, 0 varování, 15 existujících hints), `pnpm test`, syntaxe nového akceptačního skriptu a veřejná repository hranice prošly. Samostatné `pnpm build` nejprve správně odmítlo chybějící soukromý Recall build proof. Opakování s existujícím podepsaným dokladem a jeho public trust key jako místními vstupy prošlo včetně katalogu a kontaktních stránek obou jazyků; žádný doklad se nekopíroval do webu. Finální build log je `/private/tmp/vcode-mojeporce-preparation-build-20261010.log`. Docker obrazy pro tento krok ani produkční změny provedené nebyly.

### Finální produkční obraz a vlastní instalace

Následný přenositelný balíček prošel skutečnou izolovanou zkouškou proti **přesnému běžícímu obrazu** `sha256:5e175b0ced4cc817c7ab10e5146b5b5810189fb9a3d9e1fedda1f66cb1e004ed`: PASS, všechny jednotlivé výsledky true, nula skutečných Telegram volání a všechny jednorázové zdroje odstraněné. Místní kopie dokladu je `/private/tmp/vcode-mojeporce-contact-20261010/exact-image-evidence.json`, SHA-256 `692b0670ed99562cfa77200d2f847273352703e36117a0d336c2413985a618fe`. Balíček má SHA-256 `aaedb9c1a7847d6b036d509dfaedb52e57ea398ee7f9360fd6775a25a009617c` a obsahuje pouze deset předem povolených souborů.

Na serveru je adaptér ověřený povinnými externími SHA-256 (`f0f2130a04ca0462d246955e236417195877009cf5a770dc7577afe92fdb8934`, metadata `018f2468840b6e3f670e7259448517f20afc66beec5ac544a6435d7a1c4243b3`). Zdrojové soubory byly znovu ověřené při přípravě balíčku; na serveru není zdrojový checkout ani node_modules a doklad správně uvádí `clientSourceReverifiedAtRuntime=false`. Host Node 22.23.3 řídil izolaci po konkrétní syntax/import kontrole; skutečný adaptér a služba běžely v obrazu Node 24.20.0. Systémový Node nebyl měněný.

Provisioning nejprve skončil ještě před prvním zápisem kvůli nezahrnutému plnému SGID režimu existujících rodičů. Čtecí diagnostika prokázala, že do oprávněné skupiny patří pouze operátor UID 1000. Finální vlastní helper ověřil přesná plná oprávnění a členství, normalizoval pouze čerstvé adresáře přes jejich NOFOLLOW FD a atomicky přidal OFF/null/null položku. Existující rodiče ani jejich oprávnění se nezměnily. Výsledný registry SHA-256 je `eddc8663349d78f4222f1fd9abb33e1d5dc24d0853fe9e42e725a0298aacdfd6`; původní záznam Městem hrou je kanonicky totožný. Chráněné doklady a vlastní rollback jsou na serveru.

Předepsaná obě Docker sestavení ze stávajících produkčních zdrojů prošla pod oddělenými kontrolními tagy: web `sha256:427817c562b42ad38fc12a8d7702822943a7bfb7a2c869ab9fce4e2ad80f9792`, blog `sha256:19a356b0c405f220e70269ed48bc647242f003de2b727ab926a32b00d113852a`. Kontrolní blog obraz nebyl nasazen; finální izolace používá skutečný běžící obraz výše. Veřejné health, obě hlavní jazykové verze, Městem hrou produkt i návod a obě blogové verze vrátily 200.

## Připravený rollout a návrat

1. Po přímém potvrzení v tomto vlákně ověřit aktuální serverové identity a existující síť; uložit soukromé baseline/rollback doklady bez vypisování tajných hodnot.
2. Na serveru v oddělených chráněných složkách vytvořit nový aplikační credential, samostatný ingress guard, novou CA a leaf pro `vcode-contact-relay`. Nové materiály nekopírovat do Git, image, browseru ani Compose interpolace; nepoužívat žádný starý klíč.
3. Atomicky přidat pouze vypnutou vlastní registry položku s kontrolou původních bajtů, režimu 0600, UID/GID, zákazu symlinků a shodného stávajícího záznamu Městem hrou. Přesný digest návrhu evidovat v chráněném dokladu; strict registry nepřipouští dodatečnou digest property.
4. Ověřit a instalovat pouze vlastní bránu na dvě již ověřené existující sítě. Ostatní služby, původní brány, tajné mounty, keys a registry položky zachovat. Zdrojový tým provede vlastní app/DMZ vydání s guardem a public-only mounty; vlastní frontend/API/database hranice zůstávají zachované.
5. Spustit finální izolovanou zkoušku proti přesnému nasazenému centrálnímu obrazu a skutečné zmrazené vstupní šabloně. Místní obraz s odpovídajícími moduly nenahrazuje ověření přesného produkčního obrazu ani instalace skutečné DMZ.
6. Před aktivací přečíst schválený přesný text ve skutečné veřejné aplikaci, zaznamenat publikaci a schválení a ověřit zdrojový web/runtime i překládané zkušenosti v zamýšleném rozsahu. Aktivovat pouze vlastní položku a následně ověřit veřejnou GET dostupnost bez živého POST.
7. Při selhání obnovit pouze vlastní změnu registru nebo zastavit/odstranit prokazatelně vlastní novou bránu a vrátit vlastněné zdrojové soubory podle otisků. Neobnovovat starší celý registry přes novější nezávislou změnu. Kontaktní databáze, jiné aplikace a jejich původní klíče se nemažou ani nerestartují.

## Výsledek nasazení

- Vlastní app release `88c246150b1157de242cac237e540ff6f120b57b`, image `sha256:894bb6440de239aff0aed8a1fcd97d382d15828b0772edb9f0cb8099bb4e5018`, healthy CID `3955e6e7220df5872a5cdb127bd2e44e7cf0791bebd7daf82e281954e73aa924`. Skutečný read-only mount, UID 1001 / GID 65533, shoda vlastního credential a veřejné CA, odlišný guard i nepřítomnost operátorské složky v runtime byly ověřené. Vlastní app opt-in použil stejný immutable obraz, bez sestavení či migrace.
- Skutečná DMZ měla právě jeden vlastní include v kanonickém HTTPS vhostu; zmrazené veřejné soubory souhlasily a skutečný app guard odpovídal skutečnému DMZ guardu. Všech 77 běžných vlastních proxy kontextů a všechny čtyři vlastní analytické proxy kontexty explicitně odstranily kontaktní hlavičku. `nginx -t` prošlo; žádný guard ani jeho otisk se nevypisoval. Doklad zdrojového týmu je `/private/tmp/mojeporce-contact-live-dmz-proof.json`.
- Pět funkčních zdrojových vstupů adaptéru v přesném vydání odpovídá bajtově exact-image testu. Jediný rozdíl v šestém, `public-site.ts`, je obecné `publicSite.privacyVersion` (`2026-10-08` ve vydání, `2026-10-09` ve fixture). Kontaktní rozhraní tento údaj nepoužívá; kontaktní verze a skutečně zveřejněné znění byly nezávisle ověřené přesným digestem.
- Před central ON prošel skutečný veřejný GET 200 / `enabled=false` přes plně zapnutý vlastní app adaptér. Poté se atomicky změnil pouze vlastní strict záznam Moje porce. Výsledný registry SHA-256 je `762ea0860734bbd5317b383db5bd44f1f0ada9d901106173a82ac32ed81bbda4`; ostatní záznamy jsou zachované. Čerstvý soukromý gate má SHA-256 `437da94eed7487cfca76e61695925fc7de08b4fb3507bee3d8cacafc586e086c`. Vlastní immutable intent a doklad obsahují bezpečný návrat pouze tohoto záznamu do OFF.
- Závěrečný veřejný GET 200 / `enabled=true` ověřil pevnou aplikaci, origin, oblast a verzi v odpovědi, minimální prodlevu a platnou expiraci. Token nebyl vypsán ani uložen. Odpověď má jednu bezpečnostní politiku, `no-store`, žádné CORS ani cookies. Následný runtime readback znovu potvrdil zdravé vlastní propojení, nezměněné původní centrální container IDs/images a shodný záznam Městem hrou. Původní `PARTNERSHIP_*` příjem zůstává vypnutý.
- Trvalý analytický generátor a standard jsou uložené i v produkčních provozních podkladech. Aktualizovaly se pouze tyto dva konkrétní soubory s původními otisky a chráněnými zálohami; nedošlo k regenerování ostatních webů, klíčů nebo collectorů.
- Finální `pnpm check` (0 chyb, 0 varování), `pnpm test` (60 blog + 79 analytika + 32 downloads, vše PASS) a `pnpm build` prošly. Obě předepsaná Docker sestavení a veřejný smoke jsou doložené výše.

Místní kopie aktivace a bezpečných veřejných/runtime dokladů jsou v `/private/tmp/vcode-mojeporce-contact-20261010/`. V odsouhlaseném rozsahu nezůstává neprovedená brána. Fyzický iPhone a skutečné doručení Telegramu se tímto rozsahem netestují; síťové odeslání, inbox a obecný Telegram byly ověřené izolovaně na syntetických datech proti přesnému centrálnímu obrazu. Běžná další vydání musí zachovat mount, explicitní opt-in, kontaktní verzi/digest a oddělení všech proxy kontextů.
