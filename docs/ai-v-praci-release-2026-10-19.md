# AI v práci — nasazení 19. října 2026

## Veřejný výsledek

- Česká prezentace: https://vcode.zeleznalady.cz/aplikace/ai-v-praci/
- Anglická prezentace: https://vcode.zeleznalady.cz/en/apps/ai-v-praci/
- Český návod: https://vcode.zeleznalady.cz/navody/ai-v-praci-prvni-kroky/
- Anglický návod: https://vcode.zeleznalady.cz/en/guides/ai-v-praci-getting-started/
- Informace o měření: https://vcode.zeleznalady.cz/soukromi/#ai-practice-clicks a https://vcode.zeleznalady.cz/en/privacy/#ai-practice-clicks

Přijato **19. 10. 2026 v 17:26:11 Europe/Prague**. Vydání `ai-v-praci-20261019-r3`, skutečný zdrojový commit `334e89d685e0bde32abceed4406d575141abffeb`. Následná dokumentace nepředstavuje další změnu běžící aplikace.

Prezentace navazuje na aktuální `MasazeShowcase.astro`: velký úvod, původní ikona, skutečné veřejné snímky, možnosti, postup, FAQ a opakované CTA. Používá vlastní námořnickou/modrou, zelenou a jemně levandulovou identitu cvičebny. Anglický detail výslovně otevírá českou aplikaci. Nativní App Store aplikace, živý AI model, certifikace ani služba Microsoftu se neslibují. Autorské podklady a lektorská prezentace se nekopírovaly.

Katalog obsahuje 28 produktů; nová aplikace je dostupný web. Katalog je také sladěn s kontaktním formulářem a jeho veřejným i neveřejným kontraktem. Nový výběr se tím může bezpečně přijmout bez změny účelu či rozsahu kontaktních údajů.

## Aktivní měření a souhlas

Vlastník schválil konkrétní CZ/EN text i aktivaci přímo v chatu VCode, v odpovědi na `call_dcfad26c0f524bce8272531318a19103`: „Schvaluji CZ/EN znění i aktivaci“. Koordinační zpráva původního chatu nebyla náhradou tohoto souhlasu.

- Stávající VCode pageview měří veřejné prezentační stránky.
- Nová událost `practice-open-click` je **zapnutá od 2026-10-19T15:26:10.885966Z**, tedy 17:26:10 Europe/Prague.
- Registrace `aiPracticeClicks` má pouze `/aplikace/ai-v-praci/` a `/en/apps/ai-v-praci/` a verzi `ai-practice-2026-10-19`.
- Payload obsahuje jen veřejné ID VCode, pevný název události a kanonickou zdrojovou stránku. Žádné cílové adresy, query/hash, referrer, přezdívky, návratové kódy ani obsah práce.
- DNT/GPC/offline potlačují odesílání. Bez cookies, identity, fronty a změny nativního odkazu. Podrobné záznamy nejvýše 180 dní.
- Texty byly zveřejněny a porovnány s přijatou sestavou před změnou přepínače.

Report: soukromý Přehled → web **VCode** → stránky pro návštěvnost detailu; **Zájem a kliknutí → Otevření cvičebny AI v práci** pro agregovaný počet kliknutí. Kliknutí nejsou počet lidí nebo dokončených cvičení. Nové měření uvnitř cvičebny se nezapínalo; neproběhl zásah do jejích zdrojů, PWA cache ani nasazení. Pro tento rozsah její vývojář nemusí měnit runtime.

## Přijetí

- Check: 0 chyb, 0 varování; 31 dosavadních diagnostických doporučení.
- 217 úspěšných testů; také izolovaný HTTP test skutečného nového analytického obrazu.
- Kompletní 194stránkový build, obě Docker sestavy a Nginx hranice prošly. Podepsané sestavovací podklady zůstaly na serveru.
- Lokální i skutečné veřejné prohlížečové kontroly: CS/EN při 390 a 1440 px, mobilní text 200 %, žádné přetékání, načtené obrázky, FAQ a viditelné cíle kotev.
- 33 veřejných HTTP kontrol, přesná shoda nových stránek a médií, správné canonical/hreflang, sitemap a llms.txt. Nejde o doklad zaindexování či pořadí ve vyhledávání.
- Přihlašovací shell Přehledu je veřejný (200) bez dat; soukromé API vyžaduje přihlášení (401). Neexistující starší review cesta zůstává 404. Dosud nezveřejněné snímky zůstaly 404.
- Pouze osm existujících HTML stránek se změnilo a přibylo šest nových. 180 existujících HTML stránek a všechny dosavadní veřejné soubory zůstaly zachované.
- Pro web, dashboard a minimální aktualizaci katalogu blogu zůstalo nastavení, prostředí, připojení, omezení a úložiště zachované. Ostatních jedenáct služeb i osm dalších registrací beze změny. Původní tracker a měření Rajčatové sklizně beze změny.
- Neodesílaly se syntetické produkční události, nečetly se skutečné návštěvnické záznamy ani neposílaly zkušební zprávy.

Privátní provozní receipt a oddělený veřejný prohlížečový doklad jsou uložené u vydání; konfigurace, registry a klíče nejsou součástí repozitáře. Screenshoty a netajný souhrn zůstávají v přílohách tohoto chatu.

## Návrat a uchování

Během přejímky proběhl skutečný automatický návrat všech tří služeb, ještě před zapnutím nové události. Důvodem byla chybná kontrola očekávající zákaz u veřejného přihlašovacího shellu. Původní obrazy, zdroje a registr se vrátily do zdravého stavu; neúspěšné doklady zůstaly zachované. Následné ověřené přepnutí rozlišuje veřejný shell a chráněné API.

Při problému po zapnutí nejprve vypnout pouze `aiPracticeClicks` a zachovat zveřejněnou informaci o již proběhlém měření. Nestrhávat automaticky nové texty soukromí a neměnit ostatní registrace. Před návratem webu na starší obraz je nutné zachovat dostupnost nové informace. Návratové obrazy a konfigurace zůstávají zachované.

Registrace retence potvrdila ochranu aktuálního vydání a dvou ověřených návratových generací. Tento release nespouštěl mazání obrazů, cache, záloh ani dat.
