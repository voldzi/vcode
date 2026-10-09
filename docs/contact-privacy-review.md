# Poptávky spolupráce: kontrola znění před aktivací

Verze: `contact-20261009`. Stav: připraveno ke schválení vlastníkem; nezveřejňovat ani neaktivovat před jeho souhlasem.

## Konkrétní znění

Úplné české a anglické znění je v `src/components/ContactPrivacy.astro`; oba jazyky budou součástí stránek `/soukromi/#poptavky-soukromi` a `/en/privacy/#enquiries-privacy`. Formulář bude odkazovat přímo na tuto informaci. Obě jazykové varianty jsou připravené záměrně a podléhají jednomu souhlasu vlastníka.

## Rozsah rozhodnutí

- Jméno, e-mail, nepovinná organizace, oblast/aplikace a zpráva slouží k vyřízení poptávky a komunikaci.
- Poptávky jsou neveřejné, pouze pro ověřeného pověřeného správce v Přehledu. V živé databázi se mažou nejpozději po 90 dnech od přijetí; po dřívějším odstranění se dál nezobrazují.
- Telegram má jen obecné oznámení s referencí, oblastí/aplikací a pevným odkazem na Přehled. Žádné jméno, e-mail, organizace ani obsah zprávy.
- Ochrana proti spamu bez externí CAPTCHA: krátkodobý podpis, skryté pole, omezení četnosti a obměňované otisky IP pouze v paměti.
- Analytika: pojmenované kliknutí na spolupráci; přijaté poptávky mají oddělené souhrnné provozní počty podle oblasti/aplikace. Žádný obsah formuláře v Umami. DNT/GPC zachovány.
- Žádné zpracování zpráv AI, reklamní rozesílky, sledovací cookies ani měření soukromého používání aplikací.
- Zálohování nesmí zavést neomezené uchování: samostatné schéma `vcode_contacts` se vylučuje z běžných logických záloh blogu; provozní pravidla pro existující infrastrukturní zálohy je nutné ověřit před aktivací. Veřejné znění slibuje 90denní dobu v Přehledu, nikoli tvrzení o neověřených zálohách.

Před produkcí ověřit konkrétní oprávnění správce, oddělení veřejného formuláře od neveřejné schránky, retenci a obecný obsah oznámení. Testy používají pouze syntetické zprávy a oddělené zkušební přijímače.

Právní referenční zdroj pro účel, minimalizaci a omezení uchování: [GDPR, články 5, 6 a 13](https://eur-lex.europa.eu/legal-content/CS/TXT/?uri=CELEX:32016R0679). Tento dokument nezmění původní schválené části soukromí pro ostatní aplikace.

## České znění

Poptávky spolupráce

VCode používá jméno, e-mail, nepovinný název organizace, vybranou oblast nebo aplikaci a text odeslané zprávy k vyřízení vaší poptávky a navazující komunikaci. Zpráva není veřejná. Ukládáme ji na našem serveru v soukromém Přehledu, přístupném pouze pověřenému správci. Zprávy v Přehledu automaticky mažeme nejpozději 90 dní po odeslání; správce je může odstranit i dříve.

Na Telegram odesíláme pouze upozornění s obecným tématem, případně názvem aplikace, referencí zprávy a odkazem na Přehled. Jméno, e-mail, organizace ani text poptávky se do tohoto upozornění neposílají. Obsah poptávek neodesíláme k posouzení AI a nepoužíváme jej pro reklamní rozesílky.

Pro omezení spamu používáme skryté pole, krátkodobý podepsaný požadavek a omezení četnosti odesílání. IP adresu při zpracování použijeme pro krátkodobý obměňovaný otisk v paměti služby; neukládáme ji do databáze poptávek. Formulář nevyžaduje sledovací cookies ani ověření prostřednictvím externí služby.

V analytice sledujeme také počet kliknutí na spolupráci. Počty přijatých zpráv a jejich rozdělení podle oblasti a aplikace zobrazujeme souhrnně v soukromém Přehledu. Jde o počty událostí a zpráv, nikoli unikátních lidí. Jméno, e-mail, organizace a text formuláře do analytiky nepatří. DNT a GPC potlačují analytické měření; nebrání odeslání zprávy, které sami požadujete.

O přístup ke své zprávě, její opravu nebo odstranění můžete požádat na podpora@zeleznalady.cz. Pokud ji znáte, uveďte referenci přidělenou po odeslání. Do poptávky neposílejte hesla, přístupové klíče ani citlivé osobní údaje.

## English wording

Collaboration enquiries

VCode uses your name, email, optional organisation name, selected area or app, and message to handle your enquiry and follow-up communication. Your message is not public. It is stored on our server in the private dashboard, accessible only to the authorised administrator. Dashboard messages are automatically deleted within 90 days of submission; the administrator can remove them sooner.

Telegram receives only a notification with the general topic, optionally the app name, a message reference and a link to the dashboard. Your name, email, organisation and message are not included in that notification. Enquiry contents are not sent to AI for assessment or used for advertising mailings.

Spam protection uses a hidden field, a short-lived signed request and submission limits. During processing, the IP address is used for a temporary rotating hash held in service memory; it is not stored in the enquiry database. The form requires neither tracking cookies nor verification by an external service.

Analytics also counts clicks on collaboration links. Received message counts and their breakdown by area and app are shown as aggregates in the private dashboard. These are event and message counts, not unique people. Your name, email, organisation and message are excluded from analytics. DNT and GPC suppress analytics; they do not prevent a message you choose to submit.

You can request access to your message, correction or deletion at podpora@zeleznalady.cz. Include the reference issued after submission if available. Never include passwords, access keys or sensitive personal information in an enquiry.

Kontrolní otisk konkrétního komponentu: `7f88a9df16c954a3c31fa68734ac6e393f689f4b0cee1e2c2e031f3d128fe637`.
