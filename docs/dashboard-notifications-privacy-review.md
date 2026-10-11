# Soukromý Přehled: dobrovolná upozornění na zařízení

Stav: vlastník schválil konkrétní CZ/EN znění i spuštění služby přímo v tomto vlákně dne 11. 10. 2026. Nastavení služby a souhlas s oznámeními na konkrétním zařízení jsou samostatné kroky. Toto rozšíření se týká pouze přihlášeného správce; nemění veřejné měření návštěvníků ani způsob příjmu poptávek.

## České znění k publikaci

### Upozornění v soukromém Přehledu

Přehled může na vaše výslovné přání upozornit vaše zařízení na novou poptávku nebo nabídku partnerství. Upozornění zapnete v Nastavení a potvrdíte v nabídce svého zařízení. Bez vašeho souhlasu je neposíláme. Na iPhonu je pro tuto funkci potřeba přidat Přehled na plochu a používat systém iOS 16.4 nebo novější.

Pro doručení uchováváme na našem serveru technickou adresu upozornění vašeho zařízení, jeho šifrovací klíče, jazyk a vazbu na vaše ověřené přihlášení. Tyto údaje jsou uložené šifrovaně, nejsou veřejné a nepoužíváme je pro reklamu ani měření návštěvníků. Pro zamezení opakovaných upozornění ukládáme také počty a nečitelné otisky označení nových zpráv. Neukládáme do těchto údajů jména, e-maily ani text zpráv.

Upozornění obsahuje jen obecnou informaci o nové zprávě, její kategorii a počet čekajících zpráv. Podrobnosti jsou dostupné až v Přehledu po přihlášení. Odesílání probíhá přes službu oznámení poskytovatele vašeho prohlížeče nebo systému: Apple, Google nebo Mozilla. Obsah před odesláním šifrujeme; poskytovatel zajišťuje doručení na vaše zařízení a může zpracovávat související technické údaje podle svých pravidel.

Přihlášení k upozorněním trvá nejdéle do skončení příslušné přihlašovací relace, nejvýše 30 dní. Na serveru pravidelně odstraňujeme neplatná a expirovaná přihlášení k upozorněním. Upozornění můžete kdykoli vypnout v Nastavení Přehledu nebo v nastavení svého zařízení. Vypnutí v Přehledu smaže registraci zařízení; odhlášení smaže registrace spojené s touto relací. Nová upozornění se po odhlášení neposílají. Upozornění již přijaté doručovací službou se může ještě krátce zobrazit; čekání u doručovací služby omezujeme nejvýše na pět minut.

Provozovatel: VCode. Kontakt: podpora@zeleznalady.cz.

## English wording for publication

### Notifications in the private dashboard

If you explicitly choose to enable them, the dashboard can notify your device about a new enquiry or partnership offer. Enable notifications in Settings and confirm your choice in the permission prompt on your device. We do not send them without your consent. On an iPhone, add the dashboard to the Home Screen and use iOS 16.4 or later.

To deliver notifications, our server retains your device's technical push address, its encryption keys, your language and a link to your verified sign-in session. This information is stored encrypted, is not public and is not used for advertising or visitor analytics. To avoid repeated notifications, we also retain counts and unreadable fingerprints of new message identifiers. These records do not contain names, email addresses or message text.

A notification contains only a general notice about a new message, its category and the number of waiting messages. Details remain available only in the dashboard after sign-in. Delivery uses the notification service of your browser or operating system provider: Apple, Google or Mozilla. We encrypt the content before sending it. The provider delivers it to your device and may process related technical information under its own policies.

Your notification registration lasts no longer than the related sign-in session, up to 30 days. Our server regularly removes invalid and expired registrations. You can turn notifications off at any time in dashboard Settings or in your device settings. Turning them off in the dashboard deletes that device registration; signing out deletes registrations linked to that session. No new notifications are sent after sign-out. A notification already accepted by the delivery service may still appear briefly; we limit its waiting time at that service to no more than five minutes.

Operator: VCode. Contact: podpora@zeleznalady.cz.

## Ověřitelné provozní skutečnosti

- Oprávnění: při nastavení, čtení a před každým odesláním se znovu ověřuje role administrátora, konkrétní vlastník a přístup k webu VCode. Není přidaný samostatný přihlašovací token ani prodloužení relace.
- Úložiště: `/sessions/dashboard-push.enc` šifrované AES-256-GCM stejným serverovým klíčem jako existující relace, práva 0600; soukromý podpisový klíč VAPID je také uvnitř šifrovaného souboru. Veřejný aplikační klíč je jediný podpisový údaj vracený prohlížeči.
- Stav registrace: ověřené interní označení vlastníka, otisk relace, technická adresa zařízení a klíče, jazyk, konec platnosti, počty a SHA-256 otisky označení nejvýše 100 nových zpráv z každé schránky, provozní stav opakování. Bez kontaktů nebo obsahu zpráv.
- Retence: konec existující relace (běžně hodina, při zapamatování nejvýše 30 dní), případně dřívější konec registrace daný prohlížečem. Pravidelný úklid přibližně po 90 sekundách běží i při vypnutém odesílání. Při restartu se expirované záznamy neponechají. Odhlášení a vypnutí v Přehledu odstraní příslušné registrace ihned.
- Limity: nejvýše 5 zařízení na relaci a 20 celkem. Každý požadavek na službu oznámení nejvýše 5 sekund, platnost čekajícího oznámení nejvýše 300 sekund a nikdy déle než zbývající relace. Po opakovaném dočasném selhání se pokusy postupně rozestoupí, nejvýše na hodinu. Neexistující nebo expirované registrace (404/410) se smažou.
- Síť: pouze povolené HTTPS služby `*.push.apple.com`, `fcm.googleapis.com`, `updates.push.services.mozilla.com`; bez cíle zadaného do URL Přehledu, bez přesměrování, s kontrolou veřejné DNS adresy. Soukromé, lokální a vyhrazené adresy se odmítají.
- Oznámení: pouze typ, kategorie, jazyk a souhrnné počty. Cílovou část Přehledu určuje pevně service worker. Není posíláno jméno, e-mail, organizace, znění zprávy ani její označení. Není připojený obsah formulářů nebo analytických záznamů.
- Při prvním zapnutí existující nové zprávy vytvoří výchozí stav; neodesílají se jako nové události. Další nové zprávy se rozeznají i při nezměněném celkovém počtu. Čítače v menu jsou nezávislé na aktivních filtrech. Pokud některá schránka není dostupná, její počet se nevymýšlí.
- Zkoušky používají jen syntetické schránky a náhradu doručovací služby; neodesílají skutečné oznámení ani nečtou skutečné zprávy. Fyzické doručení na nainstalovaný iPhone je samostatné ověření vlastníkem.

Podklady: [oficiální dokumentace WebKit k upozorněním na iOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/), [knihovna web-push](https://github.com/web-push-libs/web-push). Přesná verze knihovny je 3.6.7 a je uzamčená v závislostech.
