---
title: "VCode Recall: instalace a první projekt"
summary: "Od instalace na Macu přes první index až po připojení Codexu nebo Claude Code, aktualizaci a odstranění."
application_id: vcode-recall
external_ref: DOC-VCODE-RECALL-GETTING-STARTED-CS
translation_key: vcode-recall-getting-started
language: cs
classification: public
status: published
document_type: manual
documentation_profile: akb-application-docs-1
document_revision: "1.0"
reviewed_on: 2026-10-08
slug: vcode-recall-prvni-nastaveni
order: 10
---

## Stav tohoto návodu

Návod je určený pro VCode Recall **0.6.0, sestavu 202610081600**. Instalátor, ověřené otisky, licence a odpovídající zdroje najdete na [produktové stránce](/aplikace/vcode-recall/). Nepoužívejte místo této verze starší balíček ChromaStatusBar ani vývojové sestavení.

Nativní sestavení je určené pro **Mac s Apple Silicon a macOS 26 nebo novějším**. Velikosti stažení a požadavky odpovídají finálnímu manifestu na produktové stránce. Dostupnost pro Intel, Windows ani App Store není oznámená.

Instalační balíček je zdarma. Vlastní zdrojový kód aplikace není zveřejněný; přibalené open source komponenty mají své vlastní licence. V Nastavení najdete **Licence a komponenty**; přehled licencí a odpovídající zdroje jsou také ke stažení na produktové stránce.

Toto vydání bylo ověřeno aktualizací pod stávajícím účtem se zachováním dat a nastavení, místním startem bez stahování závislostí a modelu, automatickým startem, MCP a vyhledáváním. Byly ověřeny české a anglické jazykové prostředky. Čistá instalace a první spuštění na novém účtu s karanténou, skutečný návrat ke starší verzi a odinstalace nebyly pro toto vydání provedeny. Níže uvedený postup není tvrzením, že tyto instalační scénáře prošly testem.

## Co budete potřebovat

- Mac odpovídající požadavkům zveřejněné verze a dostatek místa pro aplikaci i indexy vybraných projektů.
- Složku s dokumentací nebo zdrojovými soubory, které smí váš AI klient používat.
- Codex nebo Claude Code s podporou místního MCP připojení, pokud chcete vyhledávání využít v těchto klientech.

Samostatná nativní instalace obsahuje místní databázi, běhové knihovny, MCP službu a vícejazyčný embeddingový model pro vyhledávání. Model je již součástí aplikace. **Docker, systémový Python, Homebrew ani Ollamu nemusíte instalovat.** Ollama slouží pouze k volitelné doplňkové diagnostice a do běžného prvního nastavení nepatří.

## 1. Nainstalujte aplikaci

1. Na produktové stránce vyberte schválenou verzi pro Apple Silicon. Ověřte, že stahujete z odkazu VCode přes HTTPS. U balíčku budou uvedené jeho velikost a SHA-256.
2. U balíčku **DMG** otevřete obraz disku a přetáhněte **VCode Recall.app** do složky **Aplikace**. Poté obraz disku vysuňte. U zveřejněné varianty **ZIP** archiv rozbalte a přesuňte aplikaci do složky **Aplikace**.
3. Otevřete aplikaci ze složky Aplikace. Potvrďte běžné upozornění macOS na aplikaci staženou z internetu. Pokud macOS hlásí poškozený balíček nebo neověřeného vývojáře, instalaci přerušte a kontaktujte podporu; ochranu systému neobcházejte.
4. VCode Recall se ovládá z ikony v horním řádku nabídek. Trvalá ikona v Docku není součástí jeho běžného chování. Z nabídky otevřete přehled nebo **Nastavení**.

Instalace aplikace sama neindexuje projekty. Pro přípravu jejího místního prostředí není potřeba účet správce.

## 2. Projděte průvodcem

Při první instalaci se otevře průvodce. Pokud jej zavřete, znovu jej otevřete v Nastavení přes **Průvodce nastavením**.

1. Pro nový Mac zvolte **Připravit nové nativní prostředí…** a pročtěte souhrn změn.
2. Potvrďte přípravu. Aplikace ověří přibalené soubory a připraví prostředí ve vaší uživatelské knihovně. Počkejte na výsledek; příprava a aktivace jsou dva samostatné kroky.
3. Zvolte **Aktivovat připravené prostředí…** a potvrďte souhrn. Aplikace spustí a ověří svoji místní službu.
4. Po dokončení pokračujte k dohledu. Stav běžící služby ještě neznamená, že lze vyhledávat: nejdříve přidejte a zaindexujte projekt.

## 3. Rozhodněte o spuštění po přihlášení

Existují dvě samostatné volby:

- **Nastavení → Spustit po přihlášení** otevírá aplikaci po přihlášení do macOS.
- **Zapnout dohled po přihlášení…** v průvodci nastavuje automatický dohled nad místní službou. Vyžaduje vlastní potvrzení a můžete jej později vypnout pomocí **Vypnout automatické spouštění**.

Zapnutí jedné volby nepovažujte za zapnutí obou. Po dalším přihlášení ověřte ikonu aplikace a stav služby v přehledu. Ukončení okna nebo samotné aplikace nemusí zastavit běžící službu.

## 4. Přidejte první projekt

1. V Nastavení otevřete část **Repozitáře k indexaci** a zvolte **Přidat složky repozitářů**.
2. Vyberte konkrétní složku projektu. Pro první pokus použijte malý projekt s dobře známou dokumentací. Nevybírejte celý domácí adresář, zálohy nebo složky, které nemáte oprávnění zpřístupnit klientům.
3. V přehledu otevřete **Projekty**, vyberte projekt a zvolte **Obnovit index**. Potvrďte rozsah a sledujte průběh operace.
4. Počkejte na dokončení. První indexace může podle množství souborů a výkonu Macu trvat déle; objem indexu také zabírá místo na disku.
5. Zkontrolujte stav projektu a proveďte kontrolní vyhledávání na známém tématu. Ověřte, že výsledek odkazuje na očekávaný soubor a současný obsah.

Pro nové nebo změněné soubory používejte přírůstkovou obnovu indexu. Pouhé **Obnovit** aktualizuje zobrazený stav; nenahrazuje indexaci změněných zdrojů. Odebrání složky z konfigurace indexace nemaže její zdrojové soubory a není příslibem fyzického odstranění dříve vytvořených indexových dat.

## 5. Připojte Codex nebo Claude Code

MCP umožňuje klientovi požádat Recall o vyhledání kontextu. Připojení vytvářejte pouze pro klienta, kterému důvěřujete a který běží pod stejným uživatelským účtem na Macu.

1. V Nastavení VCode Recall najděte **Připojit Codex nebo Claude Code**.
2. Použijte **Kopírovat MCP konfiguraci**. Kopírujte údaje ze své skutečně nainstalované aplikace, nikoli cestu z příkladu nebo starého projektu.
3. V konfiguraci MCP svého klienta přidejte místní server typu **STDIO** podle těchto údajů. Příkaz ukazuje na přibalený program nainstalované aplikace a jeho jediný argument je `mcp-bridge`. Podobu konfiguračního souboru přizpůsobte danému klientovi; JSON a TOML nelze vložit zaměnitelně.
4. Do konfigurace klienta nepřidávejte soukromé přihlašovací údaje, síťovou adresu služby, cestu projektu ani proměnné prostředí. Potřebné místní údaje vyhledá přibalený program sám.
5. Klienta znovu otevřete nebo obnovte jeho MCP připojení. Již otevřená relace nemusí změnu načíst automaticky.
6. Při prvním požadavku určete projekt a požádejte o vyhledání známého tématu. Zkontrolujte nalezený soubor a jeho kontext. Připojený server bez zaindexovaného projektu ještě není ověřené vyhledávání.

Vyhledávání a tvorba indexu probíhají místně. Obsah předaný Codexu nebo Claude Code se však dál řídí nastavením a podmínkami daného klienta či AI služby; může být odeslán jejímu poskytovateli. Přidávejte pouze projekty, u kterých je takové použití povolené. Recall sám nenahrazuje nastavení ochrany dat ve vašem klientovi.

## 6. Nastavte jazyk

VCode Recall podporuje češtinu a angličtinu a přebírá jazyk z macOS. Pro vlastní jazyk aplikace otevřete **Nastavení systému → Obecné → Jazyk a oblast → Aplikace**, přidejte VCode Recall a vyberte jazyk.

Aplikaci ukončete a znovu otevřete, až nebude probíhat indexace ani příprava prostředí. Datum a čísla se řídí regionem macOS. Názvy projektů, cesty a původní diagnostické protokoly se nepřekládají. Pokud není žádný podporovaný jazyk v seznamu preferencí, použije se angličtina.

## 7. Aktualizujte bezpečně

1. V Nastavení otevřete **Instalace a aktualizace → Ověřit aktualizace**. Kontrola je ruční; sama nic nestahuje ani neinstaluje.
2. Stáhněte schválený nový balíček a uschovejte celý původní ověřený balíček pro případ návratu.
3. Počkejte na dokončení indexace. Ve stále nainstalované aplikaci zvolte **Připravit bezpečnou výměnu** a potvrďte **Pozastavit vlastní službu**. Nestačí jen zavřít aplikaci: její pomocný proces může být stále aktivní.
4. Ověřte úspěšné dokončení přípravy a ukončete aplikaci. Teprve poté ji ručně nahraďte ve složce Aplikace.
5. Otevřete novou aplikaci, připravte dodané prostředí v průvodci a samostatně jej aktivujte. Aktualizace prostředí není totéž jako zkopírování aplikace.
6. Ověřte kontrolní vyhledávání a poté znovu zapněte dohled po přihlášení, pokud jej používáte. Připojení klientů obnovte, jestliže se změnila cesta pomocného programu.

Běžná nativní aktualizace zachovává datové úložiště, seznam projektů a embeddingový profil. Změna modelu nebo přechod z Dockeru je samostatná potvrzovaná migrace s novou indexací, nikoli automatický vedlejší účinek aktualizace. Pokud jste výměnu pouze připravili a aplikaci ještě nenahradili, **Obnovit provoz** umožňuje přípravu zrušit. Po skutečné výměně není pouhé obnovení dohledu náhradou za návrat celého původního balíčku; při neúspěchu kontaktujte podporu.

## 8. Odstraňte aplikaci

1. Počkejte na dokončení operací nebo použijte jejich ovládání pro zrušení a počkejte na potvrzené ukončení.
2. Odeberte připojení Recall z konfigurace MCP svých klientů a obnovte jejich relace.
3. V Nastavení vypněte **Spustit po přihlášení**. Použijte **Připravit bezpečnou výměnu → Pozastavit vlastní službu** a ověřte, že její automatický dohled je vypnutý a vlastní služba zastavená.
4. Ukončete aplikaci. Poté přesuňte **VCode Recall.app** ze složky Aplikace do koše.

Odstranění aplikace nemaže zdrojové projekty. Oddělená nastavení, indexy a místní historie mohou zůstat v uživatelské knihovně; kvůli kompatibilitě používají adresář **ChromaStatusBar** v **Library/Application Support**. Pokud chcete odstranit také tato data, nejprve ověřte zastavenou službu a zálohu, a dohodněte konkrétní rozsah s podporou. Aplikace nemá v tomto návodu doložené tlačítko pro úplné odstranění všech dat. Nemažte celý adresář Library ani složky projektů.

## Pokud již používáte ChromaStatusBar nebo Docker

Tento návod pro první instalaci nenahrazuje řízenou migraci existujícího prostředí. Běžící **ChromaStatusBar.app nepřejmenovávejte ve Finderu** a nestřídejte svévolně profily. Změna názvu balíčku může změnit absolutní cestu, kterou používají služby a MCP klienti.

Přechod z Dockeru připravuje samostatné nativní úložiště, nepřevádí původní vektory a vyžaduje novou indexaci i ověření klientů. Stávající Docker data se během přípravy nemažou. Před takovým přechodem si s podporou potvrďte postup pro svou skutečnou instalaci.

## Když něco nefunguje

- **Služba neběží:** otevřete průvodce, ověřte stav a zkontrolujte výsledek aktivace. Nepokoušejte se službu zpřístupnit přes síť.
- **Projekt je bez indexu nebo neaktuální:** ověřte vybranou složku a proveďte jeho přírůstkovou obnovu indexu.
- **Klient server nevidí:** zkopírujte aktuální konfiguraci z nainstalované aplikace, ověřte podporu STDIO a obnovte MCP připojení klienta.
- **Vyhledávání vrací starý obsah:** zkontrolujte dokončení indexace konkrétního projektu a porovnejte výsledek se zdrojovým souborem.
- **Nedostatek místa nebo přerušená operace:** zkontrolujte stav v přehledu a potvrzený výsledek operace. Při nejasném stavu nepoužívejte destruktivní obnovu jako první pokus.

Podpora: [podpora@zeleznalady.cz](mailto:podpora@zeleznalady.cz). Uveďte verzi aplikace, sestavu, macOS a stručný popis kroku. Soukromý zdrojový kód, obsah indexů nebo celé diagnostické protokoly neposílejte automaticky; nejprve se domluvte na nezbytných podkladech.
