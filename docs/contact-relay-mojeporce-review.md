# Moje porce — konkrétní příprava centrálního příjmu

## Aktuální stav 10. října 2026

Místní příprava a izolovaná akceptace; **produkční registrace, klíče, brána ani aktivace nejsou provedené**. Automatická kontrola odmítla operátorské předání druhému chatu i kontrolu produkčního serveru. Nepřijala lidský souhlas ověřený přes `read_thread` v chatu Moje porce jako přímé pověření pro toto vlákno. Před serverovými kroky a předáním pokynů je proto potřebné přímé potvrzení vlastníka zde. Odmítnutí se neobchází jiným agentem, přenosem nebo souborem pro nepřímé předání.

Konkrétní rozhodnutí vlastníka v chatu Moje porce bylo přečtené: zpráva `01a1255d-6310-7233-8f57-804c9672defc`, otázka `call_57816e1e4c3341dbb7d2991ca5c57214`, odpověď „Schválit tento konkrétní rozsah“. Zahrnuje vlastní registraci ve VCode, samostatné serverové klíče a omezenou zabezpečenou bránu, pouze dvě kontaktní cesty a aktivaci po izolovaném testu a publikaci schváleného textu. Výše uvedená automatická kontrola toto pověření zatím pro serverové akce v tomto vlákně nepřijala.

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

Vlastník také schválil konkrétní CS/EN návrh v lidské zprávě `01a12546-823e-7202-9a42-e059c11a6253`. Zdrojový tým uvádí budoucí publikaci na `https://mojeporce.cz/spoluprace/soukromi`; skutečný veřejný readback se dosud v této přípravě neeviduje. Původní schválení jiného partnerského rozhraní ani Městem hrou se nepřebírá.

## Připravené konkrétní soubory

- `deploy/contact-relays/mojeporce-node-ingress.conf.example`: pouze dvě přesné cesty v existujícím HTTPS vhostu, vlastní ingress guard, přepsaná skutečná adresa, konečný header allowlist, nested aplikační chyby, 16 KiB limit, no-store a no-CORS, potlačené kontaktní logy. Je nutné použít skutečný existující upstream a ověřenou topologii; jde o review šablonu, nikoli instalaci.
- `deploy/contact-relays/mojeporce-tls-gateway-compose.example.yml`: samostatná brána se samostatnou CA a leaf certifikátem, žádné host ports, UID 101, read-only a omezené zdroje. Pouze centrální síť a jedna nezávisle ověřená již existující aplikační síť Moje porce. Alias `vcode-contact-relay` pouze na Moje síti, unikátní `vcode-contact-relay-mojeporce` na centrální síti. Žádná třetí síť na původní bráně Městem hrou.
- `scripts/verify-mojeporce-contact-relay.mjs`: skutečné Moje porce route exporty a Node HTTPS transport přes DMZ a TLS do aktuální kontaktní služby, jednorázový PostgreSQL s pouze `002_contacts.sql` a mock Telegram. Žádné host ports, produkční spojení, skutečné kontakty nebo skutečná Telegram zpráva.

Ostatní proxy lokace musí vždy odstranit `X-Mojeporce-Contact-Ingress`; serverová direktiva se nedědí do lokace, která má vlastní `proxy_set_header`. DMZ získá jen vlastní guard. Node získá jen nový centrální credential, odlišný guard a veřejnou CA. CA signing key zůstává pouze operátorovi, mimo runtime. Žádný browser Authorization, cookie, forwarding chain, referrer nebo správcovské oprávnění se nepředává.

Statický Dockerfile Moje porce uvádí UID/GID `1001:1001` a návrhový read-only mount `/etc/mojeporce-contact`. Skutečný uživatel, mounty, topologie, container ID, síťové členství a network ID musí být před instalací ověřené. Nepoužije se odhad jména sítě, náhradní HTTP, vypnuté TLS ověřování nebo přístup k jiné databázové síti.

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

## Připravený rollout a návrat

1. Po přímém potvrzení v tomto vlákně ověřit aktuální serverové identity a existující síť; uložit soukromé baseline/rollback doklady bez vypisování tajných hodnot.
2. Na serveru v oddělených chráněných složkách vytvořit nový aplikační credential, samostatný ingress guard, novou CA a leaf pro `vcode-contact-relay`. Nové materiály nekopírovat do Git, image, browseru ani Compose interpolace; nepoužívat žádný starý klíč.
3. Atomicky přidat pouze vypnutou vlastní registry položku s kontrolou původních bajtů, režimu 0600, UID/GID, zákazu symlinků a shodného stávajícího záznamu Městem hrou. Přesný digest návrhu evidovat v chráněném dokladu; strict registry nepřipouští dodatečnou digest property.
4. Ověřit a instalovat pouze vlastní bránu na dvě již ověřené existující sítě. Ostatní služby, původní brány, tajné mounty, keys a registry položky zachovat. Zdrojový tým provede vlastní app/DMZ vydání s guardem a public-only mounty; vlastní frontend/API/database hranice zůstávají zachované.
5. Spustit finální izolovanou zkoušku proti přesnému nasazenému centrálnímu obrazu a skutečné zmrazené vstupní šabloně. Místní obraz s odpovídajícími moduly nenahrazuje ověření přesného produkčního obrazu ani instalace skutečné DMZ.
6. Před aktivací přečíst schválený přesný text ve skutečné veřejné aplikaci, zaznamenat publikaci a schválení a ověřit zdrojový web/runtime i překládané zkušenosti v zamýšleném rozsahu. Aktivovat pouze vlastní položku a následně ověřit veřejnou GET dostupnost bez živého POST.
7. Při selhání obnovit pouze vlastní změnu registru nebo zastavit/odstranit prokazatelně vlastní novou bránu a vrátit vlastněné zdrojové soubory podle otisků. Neobnovovat starší celý registry přes novější nezávislou změnu. Kontaktní databáze, jiné aplikace a jejich původní klíče se nemažou ani nerestartují.

## Zbývající brány

Přímé operátorské potvrzení v tomto vlákně; živá read-only inventura a bezpečný provisioning; exact-image izolace; vlastní produkční DMZ/app instalace; veřejný readback přesného textu a chráněných vstupů. Připravený kód, místní PASS nebo zdrojové schválení samo o sobě nejsou potvrzením produkční aktivace. Fyzický iPhone a skutečné doručení Telegramu se tímto rozsahem netestují.
