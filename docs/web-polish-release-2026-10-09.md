# VCode: úpravy webu a Přehledu, 9. října 2026

## Rozsah prvního nasazení

Zdrojový commit: `016d290`.

- České i anglické portfolio má hledání podle názvu a filtry dostupnosti a zařízení. Filtry používají skutečné dvojice zařízení a dostupnosti: například připravovaný iPhone u Moje porce není vydaný iPhone jen proto, že je dostupný web. Bez JavaScriptu zůstávají karty dostupné.
- Zavřené mobilní menu nevstupuje do pořadí klávesy Tab. Escape menu zavře a vrátí zaměření na tlačítko; ovládací prvky mají dostatečnou dotykovou plochu. Nabídka zůstává použitelná bez JavaScriptu.
- Primární modrá má lepší kontrast s bílou a ovládání má viditelné zaměření. Dekorace úvodu nepřekrývá text při animaci.
- Přihlašovací stránka Přehledu na telefonu ukazuje celý formulář včetně tlačítka na první obrazovce. Navigace soukromého přehledu se objeví až po přihlášení. Zapamatování zařízení na 30 dní zůstává volitelné.
- Přehled používá přísnější CSP bez povolení vloženého skriptu nebo stylu. Veřejný web má vlastní oddělenou politiku. Bezpečnostní hlavičky se dědí také u souborů Astro s dlouhou cache.
- Textové statické soubory a příslušné CSS/JS odpovědi proxy se komprimují. Soukromé JSON odpovědi a distribuované soubory se tímto pravidlem nekomprimují.
- Odkaz na podmínky v patičce výslovně pojmenovává aplikaci Jízda.

Nebyl měněn schválený rozsah měření, texty soukromí, blogové zápisy ani konfigurace soukromých služeb. Nasazení obnovilo pouze web a dashboard; běžící blog a distribuce souborů zůstaly na původních obrazech.

## Ověření

- `pnpm check`: bez chyb a varování; 12 existujících doporučení.
- `pnpm test`: 83 úspěšných testů (27 blog, 24 analytika, 32 distribuce).
- `pnpm build`: 152 statických stránek; ověření schváleného publikování Recall a katalogu s 25 kartami v obou jazycích.
- Sestaveny obrazy webu, blogu i dashboardu. Izolovaná kontrola skutečného obrazu Nginx ověřila CSP, soukromé odpovědi bez cache, odmítnutí nepřihlášeného přístupu, kompresi CSS/JS, zděděné hlavičky statických souborů a úplný i částečný přenos ZIP.
- Prohlížeč: český i anglický katalog při šířce 390 px, vyhledávání bez ohledu na diakritiku, kombinace zařízení a dostupnosti, prázdný výsledek a reset. Přihlášení, navigace a katalog byly ověřeny také při zvětšeném textu na 200 %; bez vodorovného přetékání. Soukromé stavy UI používají pouze syntetická data.
- Produkce: `/health`, `/health/blog`, oba jazyky domovské stránky, her, blogu a reprezentativních produktových stránek i návodů vracejí 200. Ověřena dostupnost PWA souborů a veřejného analytického skriptu.
- Soukromé API bez přihlášení vrací 401. Provozní kontrola účtu vlastníka ověřila přihlášení, atributy cookie Secure/HttpOnly/SameSite=Strict, souhrn s osmi dostupnými a zapnutými weby a odhlášení s následným 401. Návštěvnické záznamy nebyly ukládány do testovacích podkladů.
- Nasazené JS/CSS odpovídají přesně zkontrolovanému zdroji. Hlavní CSS má 31 237 bajtů před kompresí a 9 719 bajtů při gzip (přibližně o 69 % méně). Jde o ověření přenosové velikosti, nikoli o měření Core Web Vitals.
- Nová verze PWA nabízí tlačítko Aktualizovat; jeho použití bylo ověřeno. Soukromé statistiky se do offline cache neukládají.

## Identity a návrat

Nasazený web: `sha256:4fb6af19c4506610ddc5c1f342e0ec52e8b69803162a0312807c10a982ba6396`.

Nasazený dashboard: `sha256:00bf4f221fd68c0ea5d55df4af55d7b4a04f2407f46c4aa9827c90853189cc57`.

Před aktivací byly porovnány kontrolní součty dotčených produkčních souborů, uložena jejich záloha a označeny původní obrazy pro návrat. Privátní release evidence obsahuje úplný zdrojový archiv, kontrolní součty a původní identity. Přihlašovací údaje, registry a provozní adresy nejsou součástí tohoto dokumentu.

Po tomto nasazení bylo další nasazování pozastaveno kvůli koordinované údržbě sdíleného produkčního serveru.

## Dodatečná oprava přehledu Recall

Zdrojový commit: `0855dd9`. Oprava byla po výslovném uvolnění údržbového okna nasazena a ověřena v produkci.

- Před seznamem webů je samostatná karta VCode Recall s oficiální ikonou, odkazem na produkt, kliknutími na stažení, počtem celých souborů zapsaných do proxy a objemem souborových odpovědí.
- Karta uvádí skutečné období, čas poslední agregace a hranici měření. Nativní používání ani instalace se neměří; webový filtr se na distribuční souhrn nevztahuje. Recall není registrován jako nový samostatný web.
- Osm velkých technických karet bylo nahrazeno rozbalovacím seznamem čítačů a jejich významu. Podrobný rozpis souborů lze také rozbalit; denní graf i tabulka zachovávají mezery bez domýšlení nul.
- Nula se zobrazí jen při existujícím záznamu. Chybějící souhrn má pomlčky a vysvětlení. Nedostupnost souhrnu sama o sobě neprokazuje stav publikování aplikace.
- Účet bez oprávnění k VCode nevidí ani souhrnnou kartu, ani podrobnosti. Oba bloky se úplně vyprázdní při odhlášení, přechodu offline nebo zániku relace.
- PWA používá veřejný shell v11 a oba skripty mají novou verzi `20261009-2`. Soukromé API a navigace zůstávají mimo cache.

Po této opravě znovu prošly `pnpm check`, všech 83 testů a sestavení 152 stránek. Syntetický regresní test pokrývá oba jazyky, čítače, nuly/chybějící údaje, nedostupnost, oprávnění a skutečnou cestu vyčištění dashboardu. Nezávislá revize autorizace a významu metrik nenašla blokující problém.

Prohlížečové ověření použilo výslovně označený neveřejný náhled se smyšlenými čítači: 390 × 844 px, čeština, angličtina, světlý/tmavý vzhled, text 200 % a rozbalení technických údajů. Bez vodorovného přetékání; při zvětšení se metriky řadí pod sebe. Žádná návštěvnická produkční data nebyla použita jako testovací fixture.

### Ověření druhého nasazení

Nasazený dashboard: `sha256:c9a52f15444ef6620f808d7e6aff99717c4220b32a86c95f5ea2df7eeb3e91bf`.

- Sériově byly sestaveny kandidátní obrazy webu, blogu a dashboardu a znovu prošla izolovaná kontrola skutečné konfigurace Nginx. Aktivován byl pouze dashboard; obrazy webu, blogu a distribuce zůstaly stejné. Všechny čtyři služby jsou zdravé.
- Před aktivací byly porovnány kontrolní součty všech šesti změněných souborů s předchozím vydáním a vytvořena záloha zdroje i původního obrazu dashboardu.
- Prošlo 18 veřejných cest včetně obou jazyků, návodů, obou blogů, PWA, analytického skriptu a veřejných metadat Recall. Pět veřejných souborů dashboardu a ikona Recall přesně odpovídají otestovanému zdroji. CSP je přísná a soukromé odpovědi mají `no-store`; nepřihlášené summary vrací 401.
- Provozní kontrola účtu vlastníka potvrzuje dostupné agregace `vcode-recall`, existující souhrn a jedno publikované vydání. Všech osm zapojených webů má měření zapnuté a dostupná data; souhrn není neúplný. Byly ověřeny atributy přihlašovací cookie i odhlášení s následným 401. Do evidence nebyly ukládány návštěvnické čítače ani záznamy.
- V produkčním prohlížeči je přítomna nová skrytá sekce aplikací a oba skripty `20261009-2`; bez přihlášení se její data nezobrazují. Tlačítko Aktualizovat úspěšně aktivovalo novou PWA verzi a po načtení zmizelo.
