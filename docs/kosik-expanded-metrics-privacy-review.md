# Živý košík — rozšíření měření ke schválení

Stav: vlastník 22. 10. 2026 výslovně odpověděl „Schvaluji text i aktivaci“. Rozšíření je produkčně aktivní od 2026-10-22T07:09:30.589Z (09:09 Europe/Prague); samostatný monitor potvrdil propojení v 07:10:00.749Z. Přesný čas odpovědi vlastníka se nedovozuje. Původní návštěvnost zůstává aktivní.

## Přesné nové české znění

Následující text nahrazuje pouze oddíl „Měření návštěvnosti VCode“ na stránce soukromí Živého košíku. Ostatní informace o zpracování obecních údajů se nemění.

<!-- proposed-analytics-notice:start -->

Na vybraných veřejných přehledových stránkách používáme společné měření VCode. Pomáhá nám zjistit, které přehledy lidé využívají, z jaké obecné služby přicházejí a zda využívají odkazy na kontakt nebo vybrané externí služby. Zpracováváme souhrnné počty návštěv, zobrazení a těchto kliknutí a obecné kategorie zařízení, prohlížeče a operačního systému. Pokud prohlížeč předá zdroj příchodu, rozlišíme pouze službu Google, Seznam, Bing, DuckDuckGo, Facebook, Instagram, TikTok, LinkedIn, OpenAI/ChatGPT, Claude nebo Perplexity. Původní adresu příchodu ani hledaný výraz do analytiky neposíláme; chybějící či nerozpoznaný zdroj nerozlišujeme. U kliknutí zaznamenáme pouze kategorii „kontakt“ nebo „externí odkaz“ a veřejný přehled, na kterém k němu došlo. Neposíláme cílovou adresu, telefon, e-mail, text odkazu ani obsah formulářů. Kliknutí nepotvrzuje odeslání zprávy, podání ani využití externí služby. Nepoužíváme měřicí cookies, záznam obrazovky ani přihlášené identity. Technicky zpracovaná IP adresa slouží k denně obměňovanému odhadu návštěvníků; čitelné IP adresy ani odvozenou polohu v analytických záznamech neuchováváme. Odhad návštěvníků není přesný počet osob. Neměříme administraci, přihlášení, podněty a jejich sledování, přílohy, formuláře, odběry a potvrzení, stránku soukromí, konkrétní dokumenty, vyhledávané výrazy, parametry adres, fragmenty ani souřadnice. Respektujeme Do Not Track a Global Privacy Control; bez připojení události zahazujeme a neukládáme je k pozdějšímu odeslání. Analytické záznamy se uchovávají nejvýše 180 dní včetně stanoveného zálohovacího režimu. Přehled je neveřejný a přístupný oprávněnému provozovateli VCode.

<!-- proposed-analytics-notice:end -->

## Přesné technické vymezení

- Zachovat samostatnou registraci Živého košíku a dosavadní dobu zahájení návštěvnosti. Nerozšiřovat měření jiných aplikací na stejné doméně.
- Zachovat osm cest: `/kosik/`, `/kosik/pro-obcany`, `/kosik/aktualne`, `/kosik/akce`, `/kosik/urad`, `/kosik/kontakty`, `/kosik/zapojte-se`, `/kosik/uredni-deska`.
- Nově `captureSources:true` a právě `allowedEvents:["contact-click","outbound-click"]`. Události neobsahují dodatečné vlastnosti.
- Kontakt: označené odkazy telefon/e-mail v hlavním kontaktu a patičce. Čte se pouze pevná kategorie značky; hodnoty kontaktů se nečtou pro analytiku.
- Externí odkazy: označené odkazy na dosavadní obecní web, COP, Volební atlas, Moje porce, Městem hrou, Myslopis a VCode/návod. Vše se slučuje do kategorie „externí odkaz“; jednotlivé cíle se nerozlišují. Bez automatického sledování všech odkazů, stahování dokumentů, podnětů nebo odběrů.
- Cesta s parametry nebo fragmentem se nepovažuje za schválenou. Ani po čekání na načtení runtime se nesmí odeslat událost po přechodu na jinou cestu, zapnutí DNT/GPC nebo odpojení.
- Zachovat společný neměnný runtime a jeho SRI. Nepřidávat jinou analytickou knihovnu, soukromý klíč do klienta ani nové úložiště.

## Pořadí dokončení

1. Vlastník schválí přesné znění a rozsah tohoto dokumentu.
2. Zveřejnit schválený text spolu s připraveným klientem a ověřit znění, bajty, SRI, osm cest a potlačení sběru na vyloučených stránkách.
3. Aktivovat pouze dva nové typy událostí a zdroje příchodů v samostatné centrální registraci; zaznamenat skutečný čas rozšíření a ponechat počátek původní návštěvnosti.
4. Ověřit klienta, soukromý adaptér, centrální pravidla a nezávislý monitor bez vytváření platných syntetických událostí v produkci. Uchovat návrat na předchozí rozsah.

Tento dokument neuděluje souhlas sám sobě a nenahrazuje potvrzení vlastníka. Před jeho schválením se nové veřejné znění ani rozšířený sběr nezveřejňuje a neaktivuje.
