# AI v práci — prezentace a zájem

## Zdroj a obsah

Samostatná česká a anglická prezentace `/aplikace/ai-v-praci/` a `/en/apps/ai-v-praci/`, katalog, skutečná ikona a dva veřejné návody. Vizuální vzor: `MasazeShowcase.astro` — velký úvod, skutečné snímky, možnosti, postup, FAQ a opakované tlačítko. Vlastní barvy cvičebny: námořnická modrá, zelená, jemná levandulová.

Tvrzení vycházejí z vydání cvičebny 4.0.0 a veřejných podkladů. Rozhraní a dokumenty aplikace jsou české i při vstupu z anglické prezentace. Devět příběhů, 196 připravených dokumentů a 400 předem připravených odpovědí. Nezávislý nácvik bez živého AI modelu; není službou Microsoftu, certifikací ani aplikací z App Storu. Veřejné příklady offline po prvním načtení, přílohy po výslovném stažení; osobní uložení potřebuje síť.

Použity jen původní veřejná ikona a schválené veřejné snímky úvodu a dokumentu. Žádné profily, poznámky, administrační obrazovky, osobní kódy, autorské materiály ani neveřejné originály.

## Měření

Veřejné návštěvy prezentací pokrývá stávající VCode pageview. Nová samostatná událost `practice-open-click` zaznamená pouze kliknutí na výslovně označené tlačítko s přesným veřejným odkazem. Identifikátor webu je veřejný, není klíčem. Payload: `website`, pevné `name`, kanonická veřejná zdrojová `url`; bez cílové adresy, query/hash, referreru, identity a obsahu. Bez cookies a fronty, DNT/GPC/offline potlačují odeslání. Odkaz funguje nezávisle na měření.

Server přijme pouze dvě přesné prezentační cesty, správný origin a tři povolená pole. Vyžaduje samostatnou registraci souhlasu `aiPracticeClicks`, verzi informace, schválení, ověřené zveřejnění a zahájení sběru. Výchozí stav bez těchto údajů je vypnuto. Nezasahuje do stávajícího měření Rajčatové sklizně ani ostatních webů.

Souhlas vlastníka s konkrétním CZ/EN dokumentem `ai-v-praci-click-privacy-review.md` i aktivací byl přímo v chatu VCode získán 19. října 2026 před zveřejněním. Informace se publikuje jako oddíl `#ai-practice-clicks` českého a anglického soukromí. Skutečné zapnutí smí následovat až po ověření těchto veřejných textů.

Report: soukromý Přehled → web VCode → nejnavštěvovanější stránky pro příslušnou prezentaci a Zájem a kliknutí → „Otevření cvičebny AI v práci“. Součet kliknutí není počet lidí nebo zahájených cvičení. Cvičebna nemá tímto zadáním aktivované vlastní měření vstupů, průchodu ani obsahu; její správce vlastní interní přehled procvičování.

## Přejímka

Povinné kontroly: check, test, build, obě Docker sestavy, příslušné integrační a vizuální kontroly, veřejné cesty, návody, obrázky, canonical/hreflang, sitemap, llms.txt, anonymní ochrana Přehledu a existující blogy. Produkční události ani skutečné návštěvnické záznamy nejsou testovacími vstupy. Produkční výsledek dokládá samostatný receipt; tento dokument sám nepotvrzuje nasazení.
