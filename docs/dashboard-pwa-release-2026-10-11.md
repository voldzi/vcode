# Přehled: mobilní pracovní prostředí a upozornění — nasazení 11. 10. 2026

## Nasazený rozsah

Zdrojový commit: `5231fc391dae4b30154649f6f0e0856bd888cdcc` (`feat(dashboard): compact mobile workspace, attention badges and opt-in web push`).

- Číselné odznaky nových poptávek a nabídek partnerství ve fázi `new`. Počty jsou nezávislé na zvoleném období, webu a filtrech schránky; otevření zprávy samo její stav nemění. Nedostupný údaj se nevydává za nulu. Stav se na otevřené stránce obnovuje přibližně každou minutu a po změně zprávy.
- Spodní menu na telefonu: Souhrn, Weby, Zprávy, Nabídky a Nastavení. Zprávy vedou do poptávek. Menu respektuje bezpečné okraje displeje a vyhrazené místo pod obsahem.
- Kompaktní záhlaví přihlášeného pracovního prostředí. Jazyk, vzhled, instalace, export, vysvětlení metrik a odhlášení jsou v Nastavení.
- Dobrovolná upozornění prostřednictvím Web Push a číslo na ikoně aplikace, pokud je zařízení podporuje. Klepnutí na oznámení vede do příslušné soukromé schránky a zachová cíl při nutném přihlášení.
- Záměrně zpracovaná česká a anglická varianta včetně informace o soukromí upozornění v Nastavení.

## Schválení a aktivace

Vlastník 11. 10. 2026 přímo v tomto vlákně schválil konkrétní české a anglické znění v [dashboard-notifications-privacy-review.md](dashboard-notifications-privacy-review.md) a spuštění služby.

Produkční akceptace skončila **11. 10. 2026 v 10:02:52,695 Europe/Prague** (`2026-10-11T08:02:52.695145+00:00`). Nasazený obraz dashboardu:

`sha256:bde65b52b1b0e4e1a18db4bba64f144e2a4541775c1248a40d5f3193675ac921`

Předchozí obraz pro případ návratu:

`sha256:7e1f228dcf01ac278aca850fdbce4a436aa23e451577e203e6c7271835abf5bd`

Akceptace potvrdila aktivní gate `ANALYTICS_PUSH_ENABLED=true`, soukromé úložiště upozornění s omezenými právy a použití existujícího adresáře relací. Tento gate byl jedinou přidanou runtime volbou. Schválení služby samo neuděluje systémové oprávnění žádnému telefonu: každý správce je zapíná na svém zařízení zvlášť.

## Zachované bezpečnostní hranice

- Přihlášení, ověření správce a konkrétního vlastníka i přístup k webu VCode zůstávají podmínkou. Upozornění neprodlužují přihlašovací relaci ani nevytvářejí další přihlašovací oprávnění.
- Akceptace potvrdila zachování session volume, mountů a původního prostředí s výjimkou schváleného push gate. Devět souvisejících služeb si zachovalo stejné kontejnery, obrazy i časy spuštění.
- Registrace zařízení je šifrovaná, platí nejdéle do konce přihlášení, nejvýše 30 dní. Vypnutí v Přehledu nebo odhlášení příslušnou registraci odstraní. První zapnutí nepovažuje historické zprávy za nové události.
- Oznámení neobsahují jméno, e-mail, organizaci ani text zprávy. Podrobnosti se zobrazují až v Přehledu po přihlášení.
- Service worker ukládá pouze veřejné soubory rozhraní. Soukromé zprávy, API, analytická data a přihlášení se do offline cache neukládají. Rozsah veřejné analytiky se tímto nasazením nemění.

## Ověřené výsledky

Záznam produkční akceptace potvrdil:

- HTTP 200 pro `/health`, `/health/blog`, českou i anglickou úvodní stránku, oba blogy, reprezentativní produktové stránky Studio Balance a Masáže, oba návody Městem hrou a `/prehled/`.
- HTTP 401 pro nepřihlášené požadavky na souhrn, poptávky, partnerství, počty nových zpráv a nastavení oznámení. Interní kontaktní rozhraní nebylo veřejně dostupné (HTTP 404).
- Shodu publikovaných souborů dashboardu s kandidátem, novou identitu PWA cache a verzi `/prehled/dashboard.js?v=5fc4b8e06fdd99942f50`.
- Aktivní službu upozornění a zachované úložiště relací.

Uložené lokální validační logy potvrzují `pnpm check` bez chyb a varování (31 stávajících doporučení), úspěšné `pnpm build` se 176 statickými stránkami a **199 úspěšných testů**: 62 blogových, 105 analytických a 32 stahovací služby. Testy upozornění používají syntetické schránky a náhradu doručovací služby.

Mobilní vizuální ověření je zachované v lokálním snímku `vcode-pwa-menu-20261011.jpg`: kompaktní záhlaví, spodní menu a odznaky 3/2. Jde o syntetickou ukázku rozhraní s demonstračními údaji, nikoli produkční návštěvnické záznamy nebo skutečné zprávy. Snímek není důkazem doručení na fyzický telefon.

Produkční akceptace **nečetla skutečné návštěvnické záznamy ani zprávy**. Počet skutečných odeslaných push oznámení, testovacích formulářových podání a Telegram oznámení při této akceptaci byl **0**.

Podkladem tohoto trvalého souhrnu je `acceptance-result.json` z pracovní složky vydání `vcode-pwa-release-20261011` a uložené logy `vcode-pwa-check.log`, `vcode-pwa-tests.log` a `vcode-pwa-build.log`. Další provozní pravidla a návrat jsou v [dashboard-pwa-notifications.md](dashboard-pwa-notifications.md).

## Samostatné ověření na iPhonu

**Nasazení a aktivace služby jsou ověřené; fyzické doručení na iPhone součástí této akceptace nebylo.**

Na iOS/iPadOS 16.4 nebo novějším:

1. V Safari otevřít [Přehled](https://vcode.zeleznalady.cz/prehled/) a zvolit **Sdílet → Přidat na plochu**.
2. Otevřít aplikaci z nové ikony a přihlásit se. Na vlastním zařízení lze zvolit **Zapamatovat toto zařízení na 30 dní**; bez této volby přihlášení platí jednu hodinu.
3. V Přehledu otevřít **Nastavení → Zapnout upozornění** a potvrdit systémové povolení.

Ověření skutečného doručení, čísla na ikoně a otevření správné schránky na tomto telefonu je samostatný následný krok po jeho povolení. Doručení může ovlivnit síť, režim soustředění a systémové nastavení. Požadavek instalace na plochu a přímého uživatelského souhlasu popisuje [oficiální dokumentace WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).
