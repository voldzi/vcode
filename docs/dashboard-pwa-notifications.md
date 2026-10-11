# Přehled: každodenní práce a upozornění

## Rozsah

Soukromý Přehled má na telefonu spodní menu a kompaktní záhlaví. Jazyk, vzhled, instalace, export, vysvětlení metrik a odhlášení jsou v Nastavení. Počet nových poptávek a počet nabídek ve fázi `new` se zjišťují z `/prehled/api/attention`, nezávisle na období, webu a filtrech schránky. Otevření zprávy samo nemění její stav. Když se oprávnění nepotvrdí, čísla se odstraní; chybějící údaj není nula. Na otevřené stránce se stav ověřuje přibližně po minutě a po provedené změně zprávy.

## Zapnutí

Vlastník schválil konkrétní CZ/EN znění v `docs/dashboard-notifications-privacy-review.md` a spuštění služby v tomto vlákně 11. 10. 2026. Znění je dostupné v Nastavení, v části Soukromí upozornění.

Odesílání je ve výchozí konfiguraci vypnuté. Schválené produkční nasazení používá soukromou runtime konfiguraci s `ANALYTICS_PUSH_ENABLED=true`. Každé zařízení musí zvlášť zvolit **Nastavení → Zapnout upozornění** a potvrdit systémové oprávnění. Žádný souhlas se nevyžaduje při běžném otevření stránky.

Na iPhonu/iPadu je potřebná instalace přes Safari → Sdílet → Přidat na plochu a iOS/iPadOS 16.4+. Poté otevřít ikonu aplikace, přihlásit se a zapnout upozornění. Pro upozornění během delšího používání vlastního zařízení použít při přihlášení volbu zapamatování na 30 dní; bez ní relace skončí po hodině. Přihlášení se neprodlužuje zapnutím oznámení. Doručení může ovlivnit režim soustředění, síť a nastavení systému.

## Provoz a ochrana

- Používá se existující soukromý volume `/sessions`; nová databáze, port ani samostatné přihlašovací oprávnění nejsou potřeba.
- `dashboard-push.enc` obsahuje šifrovanou konfiguraci a registrace. Nezveřejňovat soubor, technické adresy zařízení, šifrovací klíče ani soukromý podpisový klíč. Veřejný aplikační klíč je určený pro registraci prohlížeče.
- Odesílání ověřuje platnost existující relace, roli, konkrétního vlastníka a právo k webu VCode. Neplatné/odhlášené relace nedostávají nové push požadavky.
- První registrace nastaví výchozí stav bez oznámení historických zpráv. Následné zprávy se rozpoznají i při nezměněném celkovém počtu. Kontrola schránek probíhá přibližně po 90 sekundách.
- Oznámení ukazuje jen obecné sdělení, kategorii a počty. Jméno, kontakty, aplikace odesílatele, zpráva ani její ID se do push payloadu nevkládají. Pevný odkaz vede do schránky poptávek/partnerství, včetně návratu po přihlášení.
- Server ponechává registraci nejdéle do konce relace (nejvýše 30 dní); odstranění a odhlášení ji ruší ihned. Expirované registrace se odstraňují pravidelně i při vypnutém odesílání. Oznámení již přijaté doručovací službou může ještě krátce přijít, nejdéle v rámci pětiminutové TTL.
- Service worker ukládá jen veřejné soubory rozhraní. API, zprávy, analytická data ani přihlášení nejsou v offline cache. Jazyk/vzhled jsou jediné běžné preference v localStorage.
- Gate `ANALYTICS_PUSH_ENABLED=false` zastaví odesílání; počítadla a běžné schránky zůstávají dostupné. Pro návrat použít zachovaný předchozí obraz a přesnou runtime konfiguraci; zachovat session volume.

## Ověření

Povinné kontroly jsou `pnpm check`, `pnpm test`, `pnpm build`, oba produkční Docker obrazy a obraz dashboardu. Zkoušky registrací, doručení, zrušení a přepínání menu používají pouze syntetická data a náhradu doručovací služby. Nepoužívat skutečné návštěvníky ani zprávy pro akceptaci. Produkční kontrola potvrzuje obraz, gate, veřejné soubory, oprávnění nepřihlášeného klienta, zdraví služeb a zachování session volume; nečte schránky. Doručení na fyzický iPhone je poslední samostatný krok po souhlasu zařízení.
