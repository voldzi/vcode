# VCode Recall — závěrečné předání licencí, zdrojů a vydání

**Aktuální stav 2026-10-08: zveřejněno a ověřeno.** Vydání 0.6.0 / 202610081600
je přijaté pravdivým receipt v2 se schváleným omezeným rozsahem. Dřívější čekající
stavy níže jsou historie přípravy; závěrečný záznam na konci je aktuální.

Stav k 8. 10. 2026: **postup připraven; NOT READY TO PUBLISH**.
Tento dokument nic nesestavuje, nepřenáší ani neaktivuje.
Na Macu se kvůli nízké kapacitě nespouští další velké sestavení Dockeru.

## 1. Již schválené texty

Konkrétní obě CZ/EN znění schválil vlastník; další potvrzení stejného znění
se nevyžaduje. Ověření přímé odpovědi obsahuje
`recall-owner-approval-2026-10-08.md`.

- Podmínky: SHA-256 `3db91d2147f494c66a9bab92c06c15353cdcc8de441e8358a8c05bfc9d465b76`.
- Soukromí: SHA-256 `9a1c8e81610803bcd526a36a71432130cc9a6c7a3503cd73d2e4fe877955cf13`.

Schválené soubory se nepřepisují. Znění pro příjemce tvoří první dvě jazykové
části, nikoli neveřejné kontrolní pokyny. Souhlas není READY-TO-PUBLISH ani
důkaz zveřejnění skutečných stránek soukromí.

## 2. Stav zdrojových podkladů

Správce aplikace oznámil konzervativní zdrojový superset: 943 registry komponent
s původními archivy ověřenými oficiálními registry checksumy, 14 sdists vlastníků
kompilovaných součástí, připnutý hnswlib a OpenSSL 4.0.1 a připnuté podklady
licencí/notices ONNX Runtime. U 65 crate archivů chyběl samostatný LICENSE;
správce oznámil získávání původních notices z přesných VCS commitů a dořešování
zbývajících výjimek.

Jde o hlášení správce, **nikoli o nezávislé převzetí nebo uzavření licenčního
auditu VCode**. Pracovní staging je
`.build/vcode-recall-acceptance-20261008/public-source-staging` v hlavním
repozitáři chromadb. VCode tuto pracovní složku nečte, nemění ani nevystavuje.
Samotný počet archivů nebo jejich registry checksumy nedokládají úplnost
atribuce skutečně distribuovaných kompilovaných/vendorovaných součástí.

### Aktualizace kandidátu 0.6.0 / 202610081300

V předchozí řízené složce `/private/tmp/vcode-recall-final-20261008/public-package-1300`
byla ověřena existence obou kandidátních instalátorů: ZIP 1 811 209 707 bajtů
a DMG 1 819 414 787 bajtů. Jejich finální otisky ani podepsané předání VCode
zatím nepřevzal; DMG podle správce ještě prochází samostatnou notarizací.
Tyto velikosti jsou průběžná evidence existence, nikoli akceptace finálních bajtů.

VCode nezávisle streamově ověřil velikost a SHA-256 doprovodného souboru:

- Název: `VCodeRecall-0.6.0-202610081300-third-party-materials.tar.gz`.
- Velikost: 240 232 621 bajtů.
- SHA-256: `729384b0fe962d8acc49b201d453872c28b1bb654d4e4df1026568636ed2f727`.

Archiv se nerozbaloval ani nepřekopíroval. Ověření 4 689 vnitřních souborů proti
SHA256SUMS a obsah `publication-review.json` jsou stále hlášení správce;
VCode tímto vnější hash kontrolou nepotvrdil úplnost licencí. Podle hlášení
zůstávají otevřené původní atribuce deseti komponent: `array-util`, `assoc`,
`cmsketch`, `failsafe`, `fax`, `fax_derive`, `htmlescape`, `ordered_hash_map`,
`pear` a `pear_codegen`, dále compiled/vendor přehled a přesná instalační akceptace.

Soubor `third-party-materials.tar.gz` měl **intake název, který není
veřejným allowlistem podporovaný**. Ve skutečném handoffu musí publisher dodat
samostatnou položku licence a položku odpovídajících zdrojů pod podporovanými
názvy podle tabulky níže, s finálním manifestem a podepsanou vazbou na jejich
skutečné bajty. Případné zachování identických bajtů pod finálním názvem musí
být doloženo původním i finálním otiskem a správnou klasifikací obsahu;
přejmenování samo neuzavírá licenční výjimky ani nevytváří READY.
Neuvolňovat allowlist přidáním obecné cesty pro pracovní archivy.

### Nové trvalé kandidátní předání — názvy a bajty ověřeny

Správce následně předal vyhrazenou složku
`/Users/voldzi/Developer/18 2026/chromadb/.build/vcode-recall-acceptance-20261008/handoff-candidate-1300`.
VCode z ní četl pouze manifest a čtyři jím uvedené kandidátní veřejné artefakty,
nikoli pracovní konfigurace, indexy nebo `PRIVATE-candidate-status.json`.
Soubory nebyly rozbaleny, spuštěny, kopírovány nebo publikovány.

VCode nezávisle ověřil schema 2, přesné uzavřené názvy/kind, SHA-256 manifestu
`21e207081e627bba238e7d9a782abae1fa9c80cacdd9b991131b6b59875d6aa5`
a streamově skutečné SHA-256/velikost všech čtyř souborů: ZIP, DMG,
`.licenses.zip` a `.sources.tar.gz`. Přesné hodnoty zachovává
`recall-candidate-1300-byte-check.json`. Předchozí problém pracovního názvu je
tedy u tohoto předání vyřešen; veřejný allowlist se neměnil.

Zdrojový archiv má stejné bajty jako dříve ověřený doprovodný archiv.
Aktuální DMG má 1 819 418 556 bajtů. Správce hlásí samostatné Apple Accepted
`7cc88c9c-754a-4305-86ad-a89c79bf741f`, staple validate, Gatekeeper a 12
izolovaných native kontrol skutečného DMG. Jde o jeho technické hlášení;
VCode tyto Mac kontroly sám neprováděl. Izolovaný runtime nenahrazuje
instalovaný frozen stdio owner-discovery ani celou uživatelskou instalaci.

**NOT READY TO PUBLISH** zůstává: deset atributivních výjimek, compiled/vendor
přehled, uzavřená přesná instalační akceptace a skutečný podepsaný READY receipt
nebyly předány. `PRIVATE-candidate-status.json` není receipt a nevystavuje se.
Změní-li dokončení revize zdrojový/licenční archiv či aplikaci, musí být znovu
předán manifest s novými otisky a prověřeny odpovídající nové bajty/důkazy.
Schválené právní texty se tím automaticky nemění a znovu se nepožadují.

## 3. Co předat jako dokončené soubory

**Aktuální cílové vydání je 0.6.0 / 202610081600.** Správce oznámil nové
sestavení kvůli podepsaným resource souborům původních atribucí/licencí.
Předchozí kandidát 1300 není povolen k aktivaci. Jeho byte check zůstává pouze
historickou evidencí a nenahrazuje otisky, notarizaci a akceptaci sestavy 1600.
Nativní runtime a Tooling podle správce zůstávají beze změny; přesné finální
ZIP/DMG/manifest/receipt nové sestavy dosud nebyly převzaty.

Předat uzavřenou, soukromou složku jednoho vydání bez symlinků, pracovních
adresářů, klíčů a uživatelských dat. Proměnné `version` a `build` musí pocházet
ze skutečného finálního balíčku, nikoli automaticky z předchozího kandidáta.

| Soubor | Role |
| --- | --- |
| `VCodeRecall-<version>-<build>-macos-arm64.zip` | Finální instalační ZIP |
| `VCodeRecall-<version>-<build>-macos-arm64.dmg` | Finální instalační DMG |
| `VCodeRecall-<version>-<build>-macos-arm64.licenses.zip` | Přehled komponent, přesné licence/notices a mapa zdrojů |
| `VCodeRecall-<version>-<build>-macos-arm64.sources.tar.gz` | Přesné odpovídající zdrojové podklady |
| `VCodeRecall-<version>-<build>-macos-arm64.manifest.json` | Přijatý manifest podle schema 2 |
| Samostatný podepsaný acceptance receipt | Soukromé důkazy, nikdy veřejný download |

Pro zdroje je alternativně podporováno `.sources.zip`; pro licence také
`.licenses.txt` nebo `.licenses.json`. Nevyžaduje se duplicitní zabalení stejných
velkých zdrojů do více formátů. Seznam individuálních 943+ součástí patří do
licenčního přehledu uvnitř doprovodného archivu, nikoli do veřejného manifestu
nebo feedu: manifest má limit 65 536 bajtů a uzavřený seznam artefaktů.

Velké finální archivy vytvořit pouze jednou na publisherovi nebo důvěryhodném
svazku s dostatečnou kapacitou. Nepřidávat další jejich kopii na plný Mac.
VCode nepřevádí zdrojový staging na „hotové vydání“ a neodstraňuje původní
podklady. Přenos je soukromý do řízené intake složky, nikoli do webrootu.

### Mapa součástí a zdrojů

Licenční přehled má pro každou skutečně distribuovanou součást určit:

- název, přesnou verzi/revizi a vazbu na konkrétní runtime/binary/vendorovaný
  soubor; konzervativní zdroje navíc označit jako doplňkové, nikoli jako důkaz
  přítomnosti této součásti v aplikaci;
- licenci, umístění originální licence a notices a umístění materiálů, které
  příjemce skutečně dostane;
- původní archiv a jeho oficiální checksum/VCS commit, cestu v dodaném zdrojovém
  archivu a případné distribuované změny;
- výsledek kontroly výjimek, včetně všech 65 původně chybějících LICENSE;
- důkaz uzavření kompilovaných a vendorovaných závislostí, nejen Python wheels
  nebo registry locku.

Modelové soubory, nativní knihovny a čitelné helpery musí mít svůj odpovídající
záznam. Čitelnost helperu sama neurčuje jeho licenci. Do veřejných zdrojových
podkladů nepřidávat vlastní neveřejný repozitář, indexy, klientské konfigurace,
osobní cesty nebo privátní build/release evidence. Právní výsledek revize
potvrzuje publisher, nikoli pouhá existence složky či úspěšný hash.

Změna zapečetěné aplikace, runtime nebo přibalených notices znamená nové přesné
bajty a musí projít odpovídající podpisovou/notarizační akceptací. Samostatné
doprovodné archivy musí být v každém případě finální před podpisem handoffu.

## 4. Přijetí a kontrola bajtů bez aktivace

Následující příklad je určen až pro důvěryhodný intake server a dokončené
soubory. Neprovádět ho nad pracovním stagingem na Macu. Proměnné nastavuje
operátor podle skutečného předání; žádný veřejný endpoint ani katalog nemění.
Z kořene repozitáře VCode:

```sh
node --input-type=module - "$RECALL_HANDOFF" "$RECALL_MANIFEST" <<'NODE'
import { resolve } from 'node:path';
import { safePath, readRegular, parseManifest, artifactBase, verifiedFile, digest }
  from './services/downloads/release.mjs';
try {
  const [source, manifestFile] = process.argv.slice(2);
  if (!source || !/^VCodeRecall-[0-9.]+-[0-9]+-macos-arm64\.manifest\.json$/.test(manifestFile ?? ''))
    throw Error('Invalid intake identity');
  await safePath(source, { directory: true });
  const bytes = await readRegular(resolve(source, manifestFile));
  const manifest = parseManifest(bytes);
  if (manifestFile !== `${artifactBase(manifest.version, manifest.buildNumber)}.manifest.json`)
    throw Error('Manifest filename mismatch');
  for (const item of manifest.artifacts)
    await verifiedFile(resolve(source, item.file), item.sha256, item.sizeBytes);
  console.log(JSON.stringify({status:'BYTE-CHECK-ONLY', manifestSHA256:digest(bytes),
    artifactCount:manifest.artifacts.length, acceptance:false, publicationChanged:false}));
} catch {
  console.error('Private intake byte check refused; inspect the controlled handoff.');
  process.exitCode = 1;
}
NODE
```

Tato kontrola pouze streamově porovná soubory se schema 2 manifestem.
Neověřuje obsah licence, úplnost zdrojů, podpis Apple ani READY.
Archivy nerozbaluje a nepřidává důvěru k publisherovi.
Jestli skutečný publisher manifest používá jiné schema, zachovat jeho původní
bajty/otisk a předem prověřit adaptér s podepsanou vazbou všech polí;
nepřejmenovat ani nepřepsat nepodporovaný manifest pro obejití validace.

## 5. Co musí obsahovat finální READY handoff

- Přesnou identitu finálního vydání, manifest a SHA-256/velikost všech čtyř
  nebo dalších povolených souborů.
- Uzavřený přehled licencí/atribuce/odpovídajících zdrojů bez nevyřešených
  výjimek; `licenseReviewComplete` a `requiredSourcesComplete` potvrdit teprve
  po skutečné revizi. `requiredSourceFiles` přesně odpovídá manifestu.
- Důkazy aplikace i DMG a skutečné akceptace podle
  `recall-release-contract.md`, svázané s těmito přesnými bajty.
- Podepsaný Ed25519 receipt se schváleným privacy hashem výše a samostatným
  výslovným READY-TO-PUBLISH pro stejné vydání. Důvěryhodný veřejný klíč musí
  být zaveden nezávisle; klíč dodaný ve stejné neověřené zásilce není důvěra.

VCode nevyrobí podpis ani neprohlásí READY pouze na základě tohoto checklistu.
Soukromý receipt, Mac acceptance a klíče nepatří do veřejného manifestu,
licenčního archivu, zdrojového archivu nebo Docker kontextu.

## 6. Budoucí soukromé přijetí a řízené zveřejnění

Teprve po všech předchozích branách může autentizovaný operátor použít
existující publikační CLI na důvěryhodném serveru. Tento příklad se v rámci
přípravy **nespouští**; mění soukromý aktivní katalog:

```sh
node scripts/recall-release.mjs \
  --root "$RECALL_ARTIFACT_ROOT" \
  --catalog "$RECALL_CATALOG" \
  --trusted-public-key "$RECALL_TRUSTED_PUBLIC_KEY" \
  --source "$RECALL_HANDOFF" \
  --manifest "$RECALL_MANIFEST" \
  --receipt "$RECALL_RECEIPT" \
  --ack-ready "$RECALL_RELEASE_ID" \
  --ack-privacy "9a1c8e81610803bcd526a36a71432130cc9a6c7a3503cd73d2e4fe877955cf13"
```

CLI znovu ověřuje receipt, manifest, originální i kopírované soubory a atomicky
aktualizuje katalog; každá existující verze zůstává neměnná. Do té doby i během
soukromého stagingu zachovat vypnuté veřejné proxy/profil. Export veřejných
metadat a soukromého BuildKit proofu, vytvoření obou schválených privacy stránek
a návody provést podle distribučního kontraktu a zaznamenat vazbu veřejného
znění na schválené dokumenty. Veřejné sestavení neobsahuje privátní evidence.

Před skutečnou aktivací splnit AGENTS.md: `pnpm check`, `pnpm test`, `pnpm build`,
oba předepsané Docker obrazy a skutečné produkční smoke kontroly. Velké obrazy
nesestavovat na nyní téměř plném Macu; použít připravenou release infrastrukturu
s ověřenou kapacitou. Ověřit přímý HTTPS feed, oba jazyky, každou veřejnou
licenční/zdrojovou adresu, otisky a ranges, obě proxy vrstvy bez jednotlivých
distribučních logů, oprávnění Přehledu, DNT/GPC a retenci včetně záloh.

### Stav skutečné přípravy VCode

Produkční server byl ověřen jako dostupný a s dostatečnou kapacitou. Existující
web a blog jsou zdravé. V novém soukromém stagingu je runner
`scripts/recall-release.mjs` se SHA-256
`643eb974087e342ffa9a6b7a666a4aa35c6e702f7755f3a67ea9dbfb3a47dc50`
a modul `services/downloads/release.mjs` se SHA-256
`903e00b9911fb02601efcdce76bebe807d908bb58f887ab7937e278ea25b2462`.
Prázdný export v cached Node.js 24 image bez sítě a s read-only mounty vrací
`null`; žádný aktivní katalog ani veřejná služba nevznikly. Hostitelský Node.js
22 není cílový runtime. Konkrétní hostitel a soukromé adresáře jsou operátorská
konfigurace mimo veřejný repozitář.

Produkční Ed25519 trusted public key byl následně zaveden odděleně od
artefaktového balíčku. VCode ověřil veřejný SPKI formát, typ Ed25519 a SHA-256
PEM bajtů `80ab8d754d9ac03d7190ac1eda9021af3652427427bd07fee07558dd3f18f429`
před přenosem i na cíli. Protected soubor má 0600, UID/GID 1000 a načtení
skutečným Node.js 24 runnerem prošlo. Soukromý klíč nebyl čten ani přenesen.
Změna signer identity vyžaduje nové nezávislé ověření, nikoli klíč přibalený
k neověřenému receipt. Receipt nemá veřejný upload
endpoint: předává se soukromě do řízeného intake adresáře. Samotný kandidátní
stav nebo veřejný klíč uvnitř téže zásilky nesmí zpřístupnit download.

Privacy/terms šablony již čerpají pouze schválené recipient copy, mají oba
jazyky a při `publication: draft` se nevygenerují. Build kontroluje SHA-256
schválených dokumentů, odpovídající hash v signed receipt a existenci všech
čtyř právních stránek. V lokálním náhledu prošly mobilní a 200% varianty;
veřejné HTTPS adresy je nutné ověřit po skutečném deploymentu.

Do neveřejného incoming vydání 1600 byly přeneseny pouze dva dokončené
doprovodné soubory. VCode ověřil jejich skutečné velikosti a SHA-256 lokálně
a znovu na serveru přes read-only Node.js 24 runner:

| Suffix finálního názvu | Bajty | SHA-256 |
| --- | ---: | --- |
| `.sources.tar.gz` | 243384733 | `ad9e798b6b3cd7a2c024cbde47b1fba64efd0dac923b4f498db01690dca1fedd` |
| `.licenses.zip` | 5643749 | `0cf234bc5ade0189831ad507d95364e2c3b04a9462ee91d614e4d02800c5c0a1` |

Oba mají oprávnění 0600. Žádný jiný soubor nebo podadresář zdrojové složky
nebyl přenesen; `withheld-internal-preamble`, `notary-app.zip`, soukromý
podpisový klíč a kandidátní interní stav nebyly čteny ani kopírovány.
Aktivní katalog stále neexistuje, download profil ani veřejné routy nebyly
aktivovány. **Neveřejně připravené soubory nejsou veřejné publikování.**

Správce oznámil technické uzavření licenčního review sestavy 1600; VCode je
zatím nepřijal v podepsaném READY receipt. Apple submission aplikace
`45e47693-64ea-4db2-82dc-3104c1502790` byl podle posledního hlášení správce
In Progress, nikoli Accepted. Finální DMG a přesná instalační akceptace čekají.
Notarizace a byte check dřívější sestavy 1300 se nepřebírají jako důkazy 1600.

Zbývající blokátory: uzavřená licence a přesná instalační akceptace ve finálním
signed receipt/READY, přesné finální instalátory a manifest, následný webový build
s public metadata a private BuildKit proofem, deployment a produkční smoke.
Tyto kroky nezahrnují další schvalování již nezměněných právních textů.

Nejnovější hlášení správce uvádí Accepted aplikace 1600
`45e47693-64ea-4db2-82dc-3104c1502790` a DMG
`4202602e-680a-4bc7-8d55-6bbb39284593`, úspěšný stapling/Gatekeeper a
izolovaných 12 native kontrol. Zbývá skutečný frozen stdio owner-settings
discovery po řízené instalaci; tento stav se nesmí převést na
`acceptance.mcpClients: true` bez dokončeného důkazu. Dřívější In Progress je
historické hlášení, nikoli aktuální Apple stav podle správce.

Finální ZIP, DMG a schema 2 manifest byly následně dodány do `release-1600`.
VCode lokálně ověřil manifest a skutečné velikosti/SHA-256 všech čtyř artefaktů.
Serverový read-only Node.js 24 runner následně ověřil manifest a všechny čtyři
artefakty včetně dokončeného DMG. Přenos všech souborů skončil úspěšně; jejich
finální názvy jsou uzavřeny pouze v neveřejném incoming adresáři s oprávněním
0600. Aktivní publikační katalog stále neexistuje. Plošné testy nebyly opakovány a publisher receipt
nebyl vyroben za správce aplikace.

Produkční Docker build kontext nově výslovně vylučuje soukromý `.downloads`
staging. Původní konfigurace byla před atomickým doplněním pravidla zachována
v chráněné operátorské záloze. Tato ochrana neaktivuje profil ani nemění běžící
web, blog či analytiku.

Zveřejnění předávaných zdrojů a instalačních souborů musí být společné;
licenční zdroje nesmějí zůstat v neveřejném stagingu po spuštění instalátorů.


### Dokončená neveřejná kontrola finálního vydání 1600

Manifest schema 2: 1 464 bajtů, SHA-256
`ba215839409d0a5a2926f4e411cdfade1027861f8d75e129cf17c22fc5079e21`.
Všechny následující soubory mají předponu
`VCodeRecall-0.6.0-202610081600-macos-arm64`:

| Suffix | Bajty | SHA-256 |
| --- | ---: | --- |
| `.zip` | 1817064802 | `370311a313cafddfc5deb3b09690b549fda837463bde9a4bd19d4b7a7e6ce6d7` |
| `.dmg` | 3025714824 | `7dd543b6ce63dc6bf9c2b61ec9fbcacfabb53cd3cff0660e925ad521bd3cf7e3` |
| `.licenses.zip` | 5643749 | `0cf234bc5ade0189831ad507d95364e2c3b04a9462ee91d614e4d02800c5c0a1` |
| `.sources.tar.gz` | 243384733 | `ad9e798b6b3cd7a2c024cbde47b1fba64efd0dac923b4f498db01690dca1fedd` |

Předchozí blokátor chybějících instalátorů a manifestu je uzavřený. Zbývá
pravdivý signed receipt/READY po finální instalační akceptaci, webový release
build a ověřené veřejné nasazení. Konkrétní soukromé cesty jsou pouze
v operátorském záznamu mimo repozitář. Neveřejná příprava není veřejné vydání.


### Neveřejně připravený kontrakt v2

VCode připravil a otestoval oddělený `existing-owner-account` receipt v2;
původní v1 zůstává podporovaný a beze změny. Konkrétní rozsah a přesná pole jsou
v `recall-existing-owner-acceptance-review.md`, normativní popis v
`recall-release-contract.md`. V2 vyžaduje nezávislé `--ack-scope` vedle
`--ack-ready` a `--ack-privacy`. Aktuální testy: 83/83; download část 32/32 také
na cílovém Node.js 24. Check a draft build prošly. Produkční runner nebyl změněn.
Schválení konkrétního omezeného rozsahu vlastníkem bylo následně ověřeno v přímé
lidské odpovědi; NOT-RUN se nesmí vydávat za PASS.
Před případným v2 vydáním je nutné soukromě synchronizovat a ověřit oba nové
operátorské soubory; dřívější otisky runneru/modulu výše jsou historické v1.

## Dokončené produkční vydání — 2026-10-08

Přijaté vydání `0.6.0-202610081600`, manifest SHA-256
`ba215839409d0a5a2926f4e411cdfade1027861f8d75e129cf17c22fc5079e21`.
Genuine v2 receipt SHA-256
`9ae61955c3878bbd2a42611500bace839f990dd7fd449c89d9953b8008a0461e`
prošel proti nezávisle zavedenému signerovi a všem třem acknowledgments.
Původní runner je soukromě zálohovaný. Signed scope i jeho přímé lidské schválení
jsou zaznamenané v `recall-existing-owner-acceptance-review.md`.

PASS: aktualizace stávajícího účtu se zachováním dat/nastavení, přibalený místní
start bez dodatečných downloadů, autostart, MCP, retrieval a lokalizační prostředky.
NOT-RUN: cleanInstall, quarantineLaunch, removal, rollback. Veřejná CZ/EN kopie
uvádí přesný omezený rozsah; nejde o čistý Mac nebo úplný ruční bilingvní audit.

Nasazené obrazy:

| Služba | Image SHA-256 |
| --- | --- |
| Web | `572d369e0e2c6306d46e5c9fc2314b19697583690280b9ca90d6ea909f2ac712` |
| Downloads | `5c3e6b98053109b065e4f2f08e7edaea28e6bf23601801c4485266698a628a6f` |
| Dashboard | `a9f5a003906cb1bc74a2bcec48d4ac4fea7c65b0f34a0d2ec19d254336d73f27` |

Všechny tři běžící služby jsou healthy. Web/blog/worker obrazy byly sestavené;
běžící blog/worker nebyly kvůli Recall přepisované. Předchozí web/dashboard
obrazy a zdrojová konfigurace jsou zálohované. Soukromý dossier, receipt a
podpisový klíč nejsou součástí veřejných souborů ani Docker kontextu.

Check: 0 chyb, 0 varování, 12 existujících hints. Testy 83/83. Finální přijatý
build má 152 stránek a ověřil podpisová metadata, oba právní hashe i kryptografickou
vazbu veřejného validation.scope/notRunChecks. Právní dokumenty se nezměnily.

Veřejné health, obě homepage, Recall produkt/návod/soukromí/podmínky v obou
jazycích, reprezentativní starší produkt/návod, oba blogy a PWA assety: 200.
Feed a manifest mají přesnou identitu/hash. Všechny čtyři artefakty byly kompletně
hashově ověřené na serveru, včetně kopírování do neměnného úložiště. HTTPS HEAD
má správné velikosti a SHA-256 ETag; první i poslední 16b rozsah každého souboru
vrací 206 a přesné uložené bajty. Celé velké soubory nebyly znovu stahované na Mac.
Interní katalog/receipt/trust/metrics/preview cesty: 404; summary bez loginu: 401;
DNT/GPC intent potlačení: 204 bez nového intent záznamu.

Skutečný login existujícím owner účtem a autorizované summary: 200, downloads
`available`, vydání 1600, `service-to-proxy`, retence 30 UTC dní. Mount readeru
a kanonická website permission guard jsou aktivní. Testovací relace byla odhlášena;
tajné údaje ani skutečné návštěvnické záznamy nebyly vypsané nebo ukládané do evidence.

Obě proxy vrstvy mají vypnuté individuální distribuční access logy, omezené
hlavičky a žádné diskové bufferování. DMZ změnu provedl infrastrukturní správce
se zálohou/CAS/nginx testem/reloadem; VCode stejnou proxy souběžně neměnil.
Obecné WAF a přihlášení jsou zachované. Mobilní 390px CZ/EN prezentace nepřetéká
a skutečně zobrazuje schválené omezení testů.

Veřejné vstupy: `/aplikace/vcode-recall/`, `/en/apps/vcode-recall/`,
`/navody/vcode-recall-prvni-nastaveni/`, `/en/guides/vcode-recall-first-time-setup/`,
`/vcode-recall/privacy/`, `/en/vcode-recall/privacy/`, `/vcode-recall/terms/`,
`/en/vcode-recall/terms/`, `/downloads/chromadb-status/latest.json`.

### Trvalé provozní zapojení

Dashboard nasazovat s existujícím analytickým env a privátním env s kanonickým
VCode website ID a distribuční state cestou, s oběma soubory
`deploy/analytics/compose.yml` a `deploy/downloads/analytics-overlay.yml`.
Základní compose bez overlay by odpojil distribuční reader. Relace, registry a
ostatní analytické služby byly zachované. Veřejný web sestavovat s BuildKit
secrets `recall_acceptance` a `recall_publisher_public_key` exportovanými ze
skutečně přijatého katalogu. Tyto vstupy ani `.downloads` nepatří do kontextu/dist.
Budoucí update znovu vyžaduje exact signed receipt, artifact checks a oddělená
acknowledgments. Konkrétní privátní cesty zůstávají mimo veřejný repozitář.
