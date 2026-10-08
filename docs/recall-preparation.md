# VCode Recall — neveřejná příprava a ověření

**Aktuální stav: zveřejněno 2026-10-08.** Příprava níže je historická. Vydání
0.6.0 / 202610081600 bylo přijato pravdivým receipt v2 se schváleným rozsahem
`existing-owner-account`; živé CZ/EN stránky, downloady a autorizované souhrnné
metriky jsou ověřené. NOT-RUN cleanInstall/quarantineLaunch/removal/rollback jsou
výslovně uvedené. Aktuální úplná evidence je na konci `recall-final-handoff.md`.

Stav k 8. 10. 2026: **neveřejná příprava dokončena; NOT READY TO PUBLISH**.
V tomto kroku nebylo provedeno nasazení, aktivace měření, zveřejnění produktu,
commit ani push. Nově je byteově ověřen kandidátní manifest a čtyři artefakty;
finální licenční/instalační akceptace a podepsaný READY receipt dosud nebyly předány.
Přímý souhlas vlastníka v tomto vlákně pokrývá přípravu a testy, nikoli publikaci.

## Aktualizace předání aplikace — 8. 10. 2026

Správce aplikace oznámil kandidáta **0.6.0 / build 202610081131** a následující
výsledky. Jde o převzaté hlášení správce; VCode tyto Mac kontroly samostatně
neprovedl a nepřijal dosud konkrétní veřejný ZIP/manifest ani jeho otisky.

- Podpis týmem `MC3RPR926P`; Apple notarizace Accepted
  (`b20a6ac3-7b77-4871-8024-2774488c0671`), stapling a Gatekeeper passed.
- Řízená nativní instalace se zachováním místních projektů a dat, bez nové plošné
  reindexace. Docker, systémový Python ani Ollama nejsou předpokladem této instalace.
- Samostatný klient ověřil MCP registry, vyhledávání a kontext před i po
  odstavení starého backendu; klientské konfigurace byly řízeně přepnuty
  se zálohami. GUI a vlastní služba mají samostatný autostart.
- Podle novějšího hlášení správce byl na samostatnou výslovnou žádost uživatele
  odstraněn starý ChromaDB kontejner, jeho výhradní indexový volume a nepoužívaný
  image; oba původní LaunchAgenty byly vyřazeny. Starý Docker již není možností
  návratu. VCode žádný z těchto infrastrukturních zásahů neprováděl.
- Starší živá relace Codexu ještě čeká na obnovení MCP uživatelem. Aktuální
  označení serveru v uživatelské konfiguraci je `vcode_recall`.
- Zdrojový CLI wrapper nově přechází na nativní službu. Správce oznámil opravu
  chybného pokračování shellu, 66 úspěšných cílených testů a skutečné ověření CLI
  po odstranění starého backendu. Podepsaná aplikace sestavy `202610081131`
  touto zdrojovou opravou nebyla změněna; tyto testy nejsou testy VCode webu.

Toto předání nedokládá nové plošné porovnání čerstvosti všech místních indexů.

V novějším přímém souhlasu ve zdrojovém vlákně vlastník potvrdil stejného
provozovatele VCode a čitelné pomocné soubory v proprietární distribuci. Správce
mezitím změnil generovaný název MCP na `vcode_recall` a přidal odkaz na VCode
do nastavení aplikace. Podle nejnovějšího hlášení dokončil nový freeze runtime
`202610081232` a 21 cílených testů metadatového soukromí. Následně oznámil
dokončený a podepsaný archive `VCodeRecall-202610081300.xcarchive`, úspěšné
`verify_app --public` (101 připnutých balíčků, 169 přesných notice souborů,
CZ/EN katalogy 383 + 306 + 190 + 58), izolovanou nativní akceptaci 12/12 a plnou
Python sadu 1587/1587. Jde o převzaté technické výsledky správce, nikoli testy
VCode nebo převzetí veřejného ZIP/DMG a manifestu. Uzavření atribuce kompilovaných
a vendorovaných součástí stále čeká; právní texty následně schválil vlastník
podle záznamu níže. Správce také oznámil Apple Accepted pro aplikaci sestavy
`202610081300`, submission `d7f3cf49-bea2-4e83-9c85-3480c81f4778`; stapling
a Gatekeeper v tomto hlášení ještě prováděl. Jde o jeho technický důkaz,
nikoli READY-TO-PUBLISH nebo přijetí finálního ZIP/DMG VCode. Kandidát
`202610081131` tyto další změny nedokládá.

Správce také oznámil shromáždění původních zdrojových archivů pěti MPL součástí
(certifi, orjson, tqdm, colored a option-ext) s ověřenými otisky. Jde o průběžné
hlášení, nikoli převzetí kompletního zdrojového archivu finálního vydání. VCode
soukromou pracovní složku aplikace nečetl. Konečný přehled musí spojit každou
distribuovanou součást s přesnou verzí, licencí, změnami/notices a skutečnými
zdrojovými soubory přijatého balíčku.

Stav zůstává **NOT READY TO PUBLISH**. Úplný přehled přibalených OSS komponent,
licencí a požadovaných zdrojů a konečný veřejný balíček s manifestem nejsou
uzavřené. Vlastník následně přímo schválil konkrétní obě CZ/EN znění; přesné
otisky a nezávislé ověření přímé odpovědi dokládá
`recall-owner-approval-2026-10-08.md`.
Hlášení o nainstalovaném kandidátovi nenahrazuje podepsané předání přesných bajtů
budoucí veřejné distribuce. CZ/EN koncepty a vypnuté stahování se zachovávají.

## Co je připraveno

- České a anglické představení, oficiální ikona a označené ilustrace se smyšlenými
  projekty. `RecallHero` a `RecallDetails` sdílí lokální náhled i budoucí veřejná
  šablona. Nejde o snímky nainstalované aplikace ani důkaz její připravenosti.
- Návrh obou návodů: instalace, samostatná příprava/aktivace, první index,
  připojení MCP klienta, změna jazyka, ruční aktualizace, zachování dat a odstranění.
- Návrh soukromí v `recall-download-privacy-review.md` a informací o distribuci
  v `recall-distribution-terms-review.md`. Oba konkrétní CZ/EN texty jsou
  schválené podle samostatného záznamu; zatím nejsou zveřejněné.
- Oddělená distribuční služba s uzavřeným seznamem souborů, podpisem předání,
  kontrolou přesných otisků, neměnnými adresami, rozsahy, rollbackem a soukromým
  dohledem. Služba sama nepotvrzuje Apple kontrolu nebo skutečnou instalaci.
- Souhrnné metriky v přihlášeném Přehledu: kliknutí, GET/HEAD, dokončené celé
  odpovědi 200, rozsahy 206, chyby, přerušení a zapsané bajty. Metadata, licence
  a povinné zdroje mají společnou skupinu oddělenou od instalátorů.
  Nejde o osoby, instalace či doručení až k počítači.
  Mazání starších souhrnů pokračuje i při vypnuté distribuci; chybějící soubor
  se při deaktivaci nevytváří. Zálohy a úplně zastavená služba vyžadují postup
  uvedený v distribučním kontraktu.

## Neveřejné náhledy

Vývojový server váže pouze `127.0.0.1:4330`. Trasy existují jen v režimu DEV,
mají `noindex,nofollow`, nemají návštěvnickou analytiku ani funkční stažení:

- CZ: `/preview-local/recall/cs/`, návod `/preview-local/recall/cs/guide/`.
- EN: `/preview-local/recall/en/`, návod `/preview-local/recall/en/guide/`.
- Varianty `cs-zoom` a `en-zoom` slouží ke kontrole skutečného 200% textu.

`generate-recall-dashboard-preview.mjs` vytváří pouze lokální syntetickou ukázku
rozhraní metrik, bez napojení na API či skutečné návštěvníky. Tato ukázka není
produkční Přehled. Obrázky a jejich původ popisuje `recall-visual-provenance.md`.

## Výsledky ověření

| Kontrola | Výsledek |
| --- | --- |
| `pnpm check` | 0 chyb, 0 varování; 12 existujících informačních hints |
| `pnpm test` | 80/80 prošlo, bez skipů: blog 27, analytika 24, distribuce 29 |
| Node.js 24.20 v Dockeru | Nové distribuční kontroly 29/29; analytika 24/24 prošla v předchozím běhu |
| `pnpm build` | 142 statických stránek; kontrola vyloučení konceptu prošla |
| Docker obrazy web, analytika, distribuce | Všechny sestaveny lokálně |
| Mobilní CZ/EN produkt a návod, šířka 390 px, text 200 % | Bez přetečení obsahu; FAQ ovladatelné klávesnicí |
| Syntetický náhled metrik CZ/EN, mobilní 200 %, tmavé zobrazení | Ověřeno; chybějící data nejsou vykreslena jako nuly |
| Izolovaný kontejnerový smoke | Nginx syntax, `/health`, obě jazykové verze, NEST, návody, Přehled/PWA a nové statické metriky prošly |
| Privátní metriky bez přihlášení | `/prehled/api/summary` vrací 401 |
| Nezveřejněné Recall trasy, obrázky, klientský sběrač a `latest.json` | V kontejnerovém webu 404 |
| Prázdná distribuční služba | Soukromé zdraví 200 / disabled; veřejné zdraví a metriky 404 |
| Individuální přístupové logy distribučních cest | V izolovaném testu nepřítomné |
| Retence po deaktivaci, prázdném katalogu a restartu | 5 syntetických testů prošlo; žádné nové čítače ani vytvoření chybějícího souboru |
| CZ/EN privacy/terms, šířka 390 px a 200% text | Všech 8 lokálních variant bez přetečení; žádné privátní review pokyny ani analytika |
| Build proof a právní texty | Jiný schválený privacy hash je odmítnut; hash obou zdrojových textů i přítomnost veřejných stránek se kontrolují při publikaci |

Kontejnery testu měly interní síť bez portů na hostiteli a byly odstraněny.
Blogové `/health/blog`, `/blog/` a `/en/blog/` se v tomto testu směrovaly na
výslovně syntetickou náhradu. To **není** produkční nebo databázová akceptace blogu.
V automatické sadě a izolovaném kontejnerovém smoke nebyla použita skutečná
návštěvnická data, instalovaný Recall, uživatelské indexy nebo skutečné publikační
klíče. Jejich testovací podpisy a soubory byly syntetické. Pozdější samostatná
read-only kontrola skutečných kandidátních souborů je popsána níže;
nenahrazuje Mac akceptaci ani podepsaný publisher receipt.

Lokální tagy: `vcode-recall-{web,analytics,downloads}-prep:20261008`.
Manifest-list otisky z předchozího neveřejného sestavení; následné právní šablony
a zpřísnění approval gate budou při skutečném release znovu sestaveny na serveru:

- Web: `sha256:41d4fda939576daa9a28336d3eda99ca6be9ef5f6e8ad36e55cafb8934188b0b`.
- Analytika: `sha256:f84f54a2a047dc23ddf389a308833235f7353a5bf8bea643b09de1aecf2658d3`.
- Distribuce: `sha256:e915797a36625c508ef0716e9ae57048dcf5405e68863162adec2fc778de84c5`.

Vlastníkovi byly předloženy finální CZ/EN návrhy textů a jeho přímý souhlas
byl následně ověřen ve zdrojovém vlákně. Přesné otisky schválených dokumentů:

- `recall-distribution-terms-review.md`: `3db91d2147f494c66a9bab92c06c15353cdcc8de441e8358a8c05bfc9d465b76`.
- `recall-download-privacy-review.md`: `9a1c8e81610803bcd526a36a71432130cc9a6c7a3503cd73d2e4fe877955cf13`.

První dvě jazykové části každého dokumentu jsou konkrétní veřejné znění;
kontrolní pokyny pod nimi jsou pouze neveřejný podklad. Tyto otisky samy nejsou
souhlasem, podpisem publisheru ani důkazem zveřejnění stránek. Samostatný
záznam schválení zachovává vazbu na otázku a přímou odpověď vlastníka.

## Co patří až do samostatného zveřejnění

1. Převzít konkrétní finální ZIP/DMG, manifest, úplné licence a požadované OSS
   zdroje. Přípravné schema 2 porovnat s reálným publisher manifestem; případný
   adaptér zvlášť prověřit a zachovat vazbu na původní bajty/otisk manifestu.
2. Převzít skutečné důkazy podpisu/notarizace a akceptace přesného balíčku,
   včetně instalace, aktualizace/rollbacku a znovupřipojení klientů. Testy
   webové služby ani zdrojového projektu tyto důkazy nenahrazují.
3. Zachovat již ověřený konkrétní CZ/EN souhlas vlastníka s informacemi
   o soukromí/distribuci a jeho vazbu na přesné otisky; získat samostatné
   výslovné **READY-TO-PUBLISH** pro dané vydání.
4. Publikovat připravené odsouhlasené privacy/terms stránky a podpůrné odkazy;
   ověřit přesné veřejné znění proti schválenému textu. BuildKit proof nyní
   svazuje privacy hash s dokumentem a build kontroluje obě jazykové stránky.
   Ověřit finální návody,
   odstranit jejich soukromý úvod, aktualizovat datum revize a obě `status`.
   Aktualizovat dostupnost produktu a `inDevelopment` podle přijatého vydání.
5. Na důvěryhodném serveru zavést nezávislý publikační klíč, přijmout předání
   a exportovat veřejná metadata i soukromý BuildKit proof podle
   `recall-release-contract.md`. Privátní důkazy nebo klíče nikdy nekopírovat
   do veřejného Docker kontextu nebo `dist`.
6. Teprve potom zapnout profil/proxy a soukromý mount metrik. Ověřit konkrétní
   produkční HTTPS feed bez přesměrování, otisky/ranges, obě proxy vrstvy,
   autentizaci, retenci a klientské DNT/GPC. Při nasazení splnit celý AGENTS.md
   včetně obrazů webu/blogu a skutečných produkčních smoke kontrol.

Výchozí `publication: draft`, `release: null`, vypnutý Compose profil a
`$downloads_enabled = 0` zůstávají zachované. Starý instalátor není náhradou.

Závěrečný intake postup a konkrétní očekávané soubory popisuje
`recall-final-handoff.md`. Podklady 943 registry součástí, 14 sdists a dalších
nativních závislostí jsou zatím hlášení správce; chybějící notices a uzavření
kompilované/vendorované atribuce nejsou označené jako vyřešené. Nově byly
ověřeny existence kandidátního ZIP/DMG a přesný vnější hash doprovodného archivu
240 232 621 bajtů, nikoli jeho vnitřní licenční closure nebo finální instalace.
Otevřených deset atribucí je zaznamenáno v závěrečném handoffu; nejde o READY.
Nové trvalé kandidátní předání už vyhovuje schema 2 i uzavřeným názvům.
SHA-256/velikosti jeho manifestu a všech čtyř skutečných artefaktů byly ověřeny
streamově bez rozbalování a zachovány v `recall-candidate-1300-byte-check.json`.
Soukromý kandidátní stav není podepsaný receipt a nebyl čten nebo zveřejněn. Nečteme ani
nevystavujeme jeho pracovní staging. Kvůli malé kapacitě Macu nebylo spuštěno
další sestavení, vytvoření velkých archivů nebo čištění sdílených dat.

Produkční read-only preflight potvrdil dostupnost, zdravý web/blog, kapacitu
pro příjem vydání a cached Node.js 24 image. Hostitelský Node.js 22 se pro
publisher runner nepoužívá. V novém odděleném soukromém stagingu byl připraven
runner se shodnými otisky a v Node.js 24 bez sítě/jen pro čtení ověřen prázdný
export `null`. V této první staging fázi nebyl zaveden publikační klíč,
aktivní katalog ani download služba;
běžící aplikace se neměnily. Skutečné soukromé cesty/hostitel zůstávají mimo
veřejný repozitář. Poslední nasazení stále čeká na closure, akceptaci a podepsané
READY předání s nezávisle zavedeným Ed25519 veřejným klíčem.

Nejnovější cílové vydání je **0.6.0 / 202610081600**. Správce připravuje nový
podepsaný resource atribucí; kandidát 1300 se nesmí aktivovat. Jeho ověřené
otisky zůstávají historickou evidencí, nikoli důkazy nové sestavy. Operátorský
intake a budoucí `--ack-ready` se vážou pouze na nové finální vydání.

Následně byl nezávisle zaveden pouze produkční veřejný Ed25519 SPKI klíč;
SHA-256 PEM bajtů `80ab8d754d9ac03d7190ac1eda9021af3652427427bd07fee07558dd3f18f429`
byl ověřen před přenosem i na serveru. Soubor má 0600 a UID/GID 1000;
read-only Node.js 24 runner jej úspěšně načetl. Soukromý podpisový klíč nebyl
čten ani přenášen. Aktuální stav a konkrétní doprovodné soubory jsou
v `recall-final-handoff.md`; zavedený trust sám není READY ani veřejná aktivace.


Finální balíček 0.6.0 / 202610081600 byl kompletně přenesen do neveřejného
produkčního stagingu: ZIP, DMG, licence, zdroje a schema 2 manifest. VCode
ověřil jejich skutečné velikosti a SHA-256 lokálně i na serveru přes izolovaný
read-only Node.js 24 runner. Oprávnění všech souborů jsou 0600; aktivní katalog
neexistuje a download profil/routy zůstávají vypnuté. Produkční build kontext
výslovně vylučuje soukromý staging a původní konfigurace je zálohovaná.
Otisky a zbývající instalační/READY brána jsou v `recall-final-handoff.md`.
