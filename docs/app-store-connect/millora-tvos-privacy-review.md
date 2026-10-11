# MILLORA — zpřesnění platforem v soukromí

Stav: vlastník 11. 10. 2026 přímo v tomto vlákně schválil konkrétní CZ/EN
zpřesnění i jeho zveřejnění. Účinnost upraveného textu je 11. 10. 2026.
Dosavadní schválené
zásady pokrývají místní hry a volitelný Game Center, ale v úvodu uvádějí jen
iPhone a iPad. Níže jsou schválené změny pro Apple TV. Produkční zveřejnění
prošlo akceptací 11. 10. 2026 ve 13:54:04 Europe/Prague; konkrétní výsledky jsou
v [záznamu nasazení](../millora-status-release-2026-10-11.md).
Podklad: doplněk Apple TV v projektovém `docs/vcode-app-store-handoff.md`.

## České změny

První věta:

> MILLORA je hra Mlýn pro iPhone, iPad a Apple TV.

Na konec odstavce Data na zařízení doplnit:

> Na Apple TV se herní údaje uchovávají místně v zařízení a místní partie se
> nesynchronizují přes iCloud.

Odstavec Náklon a vzhled nahradit:

> Na podporovaném iPhonu a iPadu dodává pohybové čidlo pouze aktuální náklon
> pro odlesky. Vzorky se nezapisují do souborů ani neposílají do sítě. Odlesky
> lze vypnout v nastavení a zastaví se také při omezení pohybu a v pozadí.
> Barevné téma vybírá uživatel; aplikace nezjišťuje fyzickou barvu telefonu.
> Zvuk lze vypnout; na podporovaném iPhonu lze samostatně vypnout také haptiku.
> Verze pro Apple TV nepoužívá pohybová čidla ani haptiku.

V odstavci Uchování a odstranění nahradit „Odstranění aplikace z telefonu“
slovy „Odstranění aplikace ze zařízení“.

## English changes

First sentence:

> MILLORA is a Nine Men's Morris game for iPhone, iPad and Apple TV.

Add at the end of On-device data:

> On Apple TV, game data stays locally on the device and local matches do not
> sync through iCloud.

Replace Tilt and appearance:

> On supported iPhones and iPads, the motion sensor supplies only the current
> tilt for reflections. Samples are not written to files or sent over the
> network. Reflections can be disabled in Settings, and motion updates stop
> with Reduce Motion or when the app is in the background. You choose the
> material theme; the game does not identify your phone's physical colour.
> Sound can be disabled; haptics can also be disabled separately on supported
> iPhones. The Apple TV version uses neither motion sensors nor haptics.

The existing English deletion wording already refers to the app and its local
data without limiting it to a phone.

## Rozsah schválení

Provozovatel, kontakt, doba uchování podpory a celý odstavec Game Center zůstávají
ve schváleném znění. Toto zpřesnění neaktivuje měření hry, reklamy, nové SDK ani
novou službu. Nevytváří tvrzení, že Apple TV už byla vydána. App Store Connect
deklarace se v rámci úpravy VCode nemění.
