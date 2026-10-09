# Partnership forms: processing notice for owner review

Version: `partnership-intake-20261009-1`. **Draft; not approved or published.**
The owner's request authorizes preparation of the shared feature, not publication
of this new processing notice or production activation. Existing VCode contact notice
`contact-20261009` and approved analytics scopes remain unchanged.

## Concrete application notices

Each application uses the complete common Czech or English wording below, preceded
by its corresponding exact introduction. The selected form locale must have the
reviewed notice available. The maintainer records the final rendered text digest
and owner decision before publication; no automated translation is published.

| App / canonical ID | Czech introduction | English introduction | Proposed publication location |
| --- | --- | --- | --- |
| Moje porce / `kaloricke-tabulky` | Nabídku spolupráce pro Moje porce můžete odeslat přímo z této aplikace, bez registrace. | You can submit a partnership offer for Moje porce directly from this app, without registering. | `https://mojeporce.cz/ochrana-soukromi` |
| Městem hrou / `mestem-hrou` | Nabídku spolupráce pro Městem hrou můžete odeslat přímo z této aplikace, bez registrace. | You can submit a partnership offer for Městem hrou directly from this app, without registering. | `https://mestemhrou.cz/?zobrazit=soukromi` |
| Myslopis / `myslopis` | Nabídku spolupráce pro Myslopis můžete odeslat přímo z této aplikace, bez registrace. | You can submit a partnership offer for Myslopis directly from this app, without registering. | `https://myslopis.cz/privacy` |

These are proposed sections on existing public privacy routes, not new deployed
forms. Final section anchors and the type lists for Městem hrou/Myslopis need review.
Moje porce's proposed types are výrobce, obchod, autor receptu, jiné. No text below
authorizes measuring form fields, logged-in use, private questionnaires/results or
private food records. Do not ask visitors for passwords, health details or other
sensitive information in an offer.

## České společné znění

### Nabídky spolupráce

VCode používá vaše jméno, e-mail, nepovinný název organizace, zvolený typ nabídky
a zprávu k vyřízení nabídky a navazující komunikaci. Nabídka je přiřazena k aplikaci,
ze které ji odesíláte. Formulář nepotřebuje účet, telefon ani přílohu. Nabídku
nepropojujeme s vaším účtem nebo se soukromými údaji v aplikaci.

Zpráva není veřejná. Z aplikace ji předáváme na náš server do soukromého Přehledu
VCode, přístupného pouze pověřenému správci. V databázi aplikace nevytváříme další
kopii kontaktů a zprávy. Zprávu, stav vyřizování, další krok a záznam změn v Přehledu
mažeme nejpozději 90 dní od původního přijetí. Změna stavu ani opakované odeslání
téže zprávy tuto dobu neprodlužují. Správce ji může odstranit dříve. Po dřívějším
smazání zůstává jen záznam bez kontaktů a obsahu, který zabrání obnovení téže zprávy
opakovaným požadavkem; zmizí nejpozději při uplynutí stejné 90denní lhůty.

Telegram dostane pouze obecné upozornění s názvem aplikace, referencí a odkazem
na soukromý Přehled. Jméno, e-mail, organizaci ani obsah zprávy do upozornění
neposíláme. Obsah neposuzuje AI a nepoužíváme jej pro reklamní rozesílky. Odeslání
nabídky samo nepotvrzuje partnerství, smlouvu, licenci ani použití vašich dat
v aplikaci. Případná další spolupráce vyžaduje samostatnou domluvu.

Pro omezení spamu používáme skryté pole, krátkodobé ověření požadavku a limity
odesílání, bez externí CAPTCHA. Server aplikace dočasně použije IP adresu pro
omezení četnosti a vytvoření otisku, který se mění každou hodinu. VCode dostane
pouze tento otisk, nikoli původní IP adresu. Otisk používá jen v paměti služby
nejvýše jednu hodinu a neukládá jej do databáze nabídek. Formulář nevytváří
sledovací cookies. Do webové analytiky neposíláme hodnoty formuláře, obsah zprávy
ani události spojené s účtem. DNT a GPC nadále platí pro případné schválené měření
veřejných stránek; nebrání odeslání nabídky, které sami požadujete.

O přístup ke své nabídce, její opravu nebo odstranění můžete požádat na
podpora@zeleznalady.cz. Pokud ji máte, uveďte referenci přidělenou po odeslání.
Do nabídky neposílejte hesla, přístupové klíče ani citlivé osobní údaje.

## Common English wording

### Partnership offers

VCode uses your name, email, optional organisation name, selected offer type and
message to handle your offer and follow-up communication. The offer is associated
with the app from which you submit it. The form requires no account, telephone
number or attachment. We do not link the offer to your account or private app data.

Your message is not public. The app forwards it to our server and the private
VCode dashboard, accessible only to the authorised administrator. We do not create
an additional copy of your contact details or message in the app's database.
The message, handling status, next action and change history are deleted from the
dashboard within 90 days of the original receipt. A status change or retry of the
same message does not extend that period. The administrator can delete it sooner.
After earlier deletion, only a record without contact details or message content
remains to prevent the same message from being restored by a repeated request;
it is deleted by the end of that same original 90-day period.

Telegram receives only a general notification with the app name, reference and
private dashboard link. Your name, email, organisation and message are excluded.
Message contents are not assessed by AI or used for advertising mailings.
Submitting an offer does not itself establish a partnership, contract, licence or
permission to use your data in the app. Further cooperation requires a separate
agreement.

Spam protection uses a hidden field, short-lived request verification and submission
limits, without an external CAPTCHA. The app server temporarily uses the IP address
to limit request frequency and create a fingerprint that changes each hour. VCode
receives only that fingerprint, not the original IP address. It uses the fingerprint
only in service memory for up to one hour and does not store it in the offers database.
The form creates no tracking cookies. Form values, message contents and account-linked
events are not sent to website analytics. DNT and GPC continue to apply to any approved
public-page measurement; they do not prevent an offer you choose to submit.

You can request access to your offer, correction or deletion at podpora@zeleznalady.cz.
Include the reference issued after submission if available. Do not include passwords,
access keys or sensitive personal information in an offer.

## Independent partner-record proposal

**Separate draft, not approved.** Intake approval does not approve these records.
Each app needs an explicit purpose, policy version, rendered notice, owner decision
and fixed retention before `partnerPolicy.enabled` can become true. Proposed maximum
retention is **365 days from explicit promotion**, with no automatic extension.
The backend permits a separately approved shorter period of 1–365 days.

### Návrh českého dodatku

Po samostatné domluvě o spolupráci může pověřený správce vytvořit minimální
záznam partnera: název, související aplikaci, typ partnerství, verzi pravidel,
správce a datum vytvoření a skončení záznamu. Tento záznam slouží ke sledování
domluvené spolupráce, nikoli k uchování celé poptávky. Nekopírujeme do něj e-mail
ani obsah zprávy. Název může obsahovat jméno osoby, proto do něj uvádíme jen
údaj potřebný pro tuto spolupráci. Záznam smažeme nejpozději 365 dní od vytvoření,
nebo dříve na pokyn správce. Původní zpráva se dál maže do 90 dní od přijetí.
Evidence partnera sama nenahrazuje smlouvu, licenci ani souhlas s importem dat.

### Proposed English supplement

After a separate agreement to cooperate, the authorised administrator can create
a minimal partner record: display name, associated app, partnership type, policy
version, administrator and the record's creation and expiry dates. This record
helps manage the agreed cooperation and is not a copy of the complete offer.
It contains no copied email address or message. A display name may identify a
person, so we include only what that cooperation requires. The record is deleted
within 365 days of creation, or sooner on the administrator's instruction.
The original message still expires within 90 days of receipt. A partner record
does not replace a contract, licence or permission to import data.

## Approval and publication ledger

For each application record: final CZ/EN text and digest; owner identity/decision
and timestamp; actual published URL/locale/section and read-back evidence; fixed
type list; intake version; service/relay source and image identities; activation
timestamp and responsible administrator. The notice's 90-day claim concerns the
live dashboard; separately verify operator-governed recovery-copy retention.
Routine blog dumps continue to exclude `vcode_contacts`. No publication, app
flag, central enable flag or promotion policy is changed by this draft.

Moje porce's prepared Czech `src/lib/partnership-privacy.ts` was checked on
9 October 2026: all five paragraphs match this draft exactly. Composed-text SHA-256:
`e51f75f34afd247d2ec6ed64282d7b9655865bf330736e308d4e9539c45bca1a`.
Source-file SHA-256:
`92bbb61f0919524185e0a751391884538bd7c69870e4ed01b6cc61705c16afa3`.
No English text is present in that source file. Neither hash records approval
or public publication; see the remaining activation gates in the operations runbook.
