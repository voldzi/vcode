# MILLORA — dostupnost v App Storu a soukromí Apple TV

## Nasazení a schválení

Produkční akceptace dokončena **11. 10. 2026 ve 13:54:04,753 Europe/Prague**
(`2026-10-11T11:54:04.752977+00:00`). Zdrojový commit:
`f35501ef17490385cb4522fc22ee6cdc67efcd76`.

Nasazený webový obraz:
`sha256:c5dafb0cdbfdac969f1f50e58c23014686887604d2246b1d3ea3ef88a601b6ba`.
Předchozí funkční obraz pro návrat:
`sha256:408fe45a413ecc7b7fca12370063b1a7cb351c998a134dac2626d184da612273`.
Předepsaný blogový obraz byl rovněž sestaven:
`sha256:40b2faacc9c8986a067198b41916fead37b2cf027e259a550535b9f5864dc706`.
Blogová služba se tímto vydáním neměnila.

Přímý pokyn vlastníka k dokončení prezentace byl ověřen v původním vlákně
MILLORY společně s oznámením schválení iOS od Apple. V tomto vlákně vlastník
výslovně schválil přesné CZ/EN zpřesnění soukromí Apple TV a jeho zveřejnění;
podklad je [millora-tvos-privacy-review.md](app-store-connect/millora-tvos-privacy-review.md).

## Zveřejněný rozsah

- iPhone a iPad jsou označené jako dostupné. Apple TV nadále čeká na schválení.
- Stávající oficiální české a anglické Apple badge odkazují na veřejný detail
  aplikace **6821033229**. Strukturovaná data uvádějí pouze dostupnou platformu
  `iOS`; katalog rozlišuje `ios:available` a `tvos:upcoming`.
- Aktualizované CZ/EN soukromí zahrnuje Apple TV, místní herní údaje bez iCloud
  synchronizace a rozdíly v pohybových čidlech a haptice. Účinnost je 11. října
  2026. Odstavce Game Center a podpory, provozovatel, kontakt i lhůta podpory
  odpovídají původnímu schválenému znění.
- Pravidla, galerie a podpora zůstaly zachované. Custom Product Page odkazy se
  neaktivovaly. Existující vývojový příznak chrání před vznikem prázdného obecného
  návodu; ověřená dostupnost platforem je řízena samostatně.

Ověřené veřejné stránky:

- [Česká prezentace](https://vcode.zeleznalady.cz/aplikace/millora/)
- [English presentation](https://vcode.zeleznalady.cz/en/apps/millora/)
- [Česká stránka pro App Store](https://vcode.zeleznalady.cz/app-store/millora/)
- [English App Store page](https://vcode.zeleznalady.cz/en/app-store/millora/)
- [České soukromí](https://vcode.zeleznalady.cz/millora/privacy/)
- [English privacy](https://vcode.zeleznalady.cz/en/millora/privacy/)

Podpora v obou jazycích a původní obecné stránky soukromí s kotvou `#millora`
byly rovněž ověřeny. Všech šest HTML souborů podpory a soukromí se přesně shoduje
s otisky schváleného kandidáta.

## Opravená příčina předchozích návratů

Předchozí pokusy zachytily HTTP 403 u nezměněných Event obrázků a automaticky
obnovily původní obraz i vlastněné zdrojové soubory. Následné čtení prokázalo
stejné bajty, ale odlišná práva: původní obraz měl soubor 0644, zatímco instalovaný
zdroj, kopie pro další sestavení i chybný obraz měly 0600. Omezený režim zápisu
zdrojů a kopírování zachovávající práva přenesly tento režim do nového veřejného
artefaktu. Pracovní proces Nginxu pak obrázky nemohl číst.

Dockerfile nyní normalizuje pouze veřejný výsledný obsah: adresáře 0755 a soubory
0644. Před syntetickými kontrolními soubory ověřuje existující Nginx kontrola
všechny skutečné veřejné soubory jako neprivilegovaný uživatel `nginx`,
v izolovaném kontejneru bez sítě, s kořenovým systémem pouze pro čtení a omezeným
dočasným prostorem. Kontrola odmítla chybný obraz a přijala původní i opravený.
Soukromé podklady, klíče, registry a data nejsou součástí normalizace.

Veřejná akceptace používá rozestupy požadavků a opětovné použití již ověřených
odpovědí v rámci jednoho nasazení. Při aktivaci se tato paměť vymaže. Každý obrázek
musí stále vrátit HTTP 200 a přesný hash. Příčinou bylo oprávnění souborů;
konkrétní pravidlo externí ochrany prokázáno nebylo.

## Ověření

- `pnpm check`: 0 chyb, 0 varování, 31 stávajících doporučení.
- `pnpm test`: 199 úspěšných testů — 62 blogových, 105 analytických, 32 distribuce.
- `pnpm build`: 176 stránek, ověření katalogu, kontaktních cest a dohledatelnosti.
- Oba Docker obrazy, čitelnost skutečných veřejných souborů a bezpečnostní Nginx
  kontroly prošly před aktivací.
- Produkce vrátila HTTP 200 pro zdraví webu/blogu, oba úvodní weby a blogy,
  reprezentativní produkty/návody, všechny čtyři stránky MILLORY a její podporu
  a soukromí. Soukromé API zůstalo bez přihlášení na HTTP 401, interní kontakty
  na HTTP 404; Přehled zachoval `no-store`.
- Event v obou jazycích, jeho obrázky a veřejné integrační skripty zachovaly
  přesné bajty. Všechny zveřejněné obrázky MILLORY i oba Apple badge byly
  ověřeny proti zdrojovým hashům. Google/Seznam ověření a CSP zůstaly zachované.
- Prostředí, relace, proces, úložiště, síť a nastavení webu zůstaly zachované.
  Devět dalších služeb si zachovalo kontejnery, obrazy i provozní otisky.
- Akceptace nečetla skutečné návštěvnické záznamy ani zprávy; odeslané formuláře
  a Telegram oznámení: 0.

Skutečná produkční stránka byla ověřena také v prohlížeči. Snímek
`millora-production-20261011.png` zachycuje název, stav platforem a oficiální badge.
Kliknutí z produkce otevřelo funkční veřejný detail **VCode MILLORA Morris**,
**Free**, **iPhone, iPad**, správné ID a metadata; závěrečné čtení proběhlo
ve **13:54:26 Prague**. Fyzické stažení nebo instalace na zařízení se neprováděly.

Trvalý záznam vychází z `acceptance-result.json` a `build-acceptance.json` vydání
`millora-live-20261011`, lokálních validačních logů a izolovaného důkazu
`artifact-permissions-regression.json`.
