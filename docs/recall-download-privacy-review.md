# VCode Recall — znění soukromí ke schválení / privacy copy for approval

**Ke kontrole vlastníkem; není schváleno ani zveřejněno.**
Tento dokument neaktivuje produkt, stahování ani měření. Před zveřejněním musí
vlastník ověřit finální balíček a skutečný provoz, schválit oba jazyky a konkrétní
znění. Hash schválených bajtů dokumentu patří do podepsaného předání.
Správce aplikace musí samostatně předat READY-TO-PUBLISH.

## Čeština

### Provozovatel a aplikace na vašem Macu

VCode Recall poskytuje **VCode**. Správcem údajů, které zpracováváme při poskytování webu a podpory, je VCode; kontakt: **podpora@zeleznalady.cz**.

Přibalená nativní konfigurace indexuje pouze místní složky, které vyberete, pomocí
modelu přibaleného v aplikaci. Nastavení, indexy a provozní historie zůstávají
na vašem Macu. Aplikace neobsahuje reklamní sledování ani vlastní návštěvnickou
analytiku a automaticky nám neposílá obsah projektů, dotazy nebo diagnostiku.
Instalace sama nespouští indexování ani nestahuje AI model.

Důvěryhodné místní klienty, například Codex a Claude Code, připojujete sami.
Mohou číst vybrané projekty a požádat o jejich indexování. Nalezený kontext mohou
dále předat svému AI poskytovateli podle nastavení a zásad daného klienta.
Povolení místního přístupu tedy samo neurčuje, jak připojený AI klient nakládá
s kontextem. Místní služby nejsou určeny ke sdílení na internetu nebo v síti.

Volitelná diagnostika přes Ollamu je oddělená. Její místní dohled může zobrazovat názvy procesů a síťové adresy připojených klientů, nikoli obsah promptů. Místní provozní historii spravujete podle nastavení aplikace. Starší Docker instalace zachovává
původního poskytovatele embeddingů; nastavení vzdáleného poskytovatele může změnit
místo zpracování. Oznámení macOS vyžadují vaše povolení. Ruční kontrola aktualizací
načte z VCode přes HTTPS pouze informace o veřejné verzi; nepředává registry
projektů, zdrojové soubory, prompty nebo místní historii.

Odstranění samotné aplikace nemaže původní projekty ani místní indexy.
Před výměnou nebo odstraněním runtime bezpečně zastavte vlastní místní službu
podle návodu. Podpoře neposílejte diagnostiku bez kontroly citlivých cest a údajů.

### Veřejné stahování a souhrnné počty

Na veřejném webu VCode můžeme bez analytických cookies počítat kliknutí na odkaz
ke stažení VCode Recall. Pošle se jen označení produktu, bez vašich projektů,
názvů souborů, původní či cílové adresy, formulářů a uživatelského identifikátoru.
Klientské měření respektuje Do Not Track a Global Privacy Control, neposílá
přihlašovací cookies a neodesílá události při odpojení. Kliknutí nemusí vést ke stažení.

Distribuční server samostatně vytváří denní souhrny požadavků GET a HEAD,
dokončených odpovědí s celým instalačním souborem, dílčích přenosů, chyb,
přerušených odpovědí a bajtů zapsaných distribuční službou směrem k jejímu
proxy serveru. Metadata, licence a povinné zdrojové archivy se evidují odděleně
od instalačních souborů. Souhrny jsou členěné podle dne v UTC, veřejné verze a
konkrétního instalačního ZIP/DMG; metadata, licence a zdrojové archivy tvoří společnou oddělenou skupinu, nikoli statistiku každého doprovodného souboru. Ruční kontrola aktualizací může přispět k technickým počtům požadavků. Souhrny neobsahují IP adresu, user agent, adresu příchodu,
identifikátor návštěvníka, cookies ani obsah projektů. Síťová adresa se technicky
zpracovává při HTTPS doručení, ale neukládá se do těchto souhrnů.
Na distribučních cestách nejsou vedeny jednotlivé přístupové protokoly.

Souhrnné čítače serveru zahrnují i roboty, opakované a dílčí požadavky a požadavky
se zapnutým DNT/GPC. Neidentifikují jednotlivé návštěvníky. Dokončená odpověď
služby jejímu proxy serveru nepotvrzuje, že telefon nebo počítač celý soubor přijal.
Počty nevyjadřují osoby, jedinečné návštěvníky, instalace nebo spuštění aplikace.

Počty kliknutí a provozní souhrny uchováváme na našem serveru nejvýše za aktuální
den v UTC a 29 předchozích dní. Přístup mají oprávněné osoby s přístupem k webu VCode po přihlášení do Přehledu VCode.

### Návštěvnost prezentace, podpora a vaše práva

Návštěvnost veřejné prezentace Recall měříme odděleně podle [zásad soukromí webu VCode](https://vcode.zeleznalady.cz/soukromi/): bez sledovacích cookies, s DNT/GPC a uchováním návštěvnických analytických záznamů nejvýše 180 dní. Nejde o měření používání nativní aplikace.

Pokud napíšete podpoře, zpracujeme váš e-mail a informace, které sami pošlete, k vyřízení dotazu. Právním důvodem je náš oprávněný zájem poskytovat podporu a reagovat na žádosti. Vyřízené zprávy podpory mažeme nejpozději 90 dní po uzavření dotazu. Podpoře neposílejte hesla, tokeny, soukromé zdrojové soubory nebo celé indexy; diagnostiku sdílejte až po vlastní kontrole.

Pro uplatnění práv napište na podpora@zeleznalady.cz. Za podmínek GDPR můžete žádat přístup, opravu, výmaz nebo omezení zpracování, vznést námitku a případně uplatnit právo na přenositelnost. Můžete podat stížnost k [Úřadu pro ochranu osobních údajů](https://uoou.gov.cz/). Místní indexy, které nám aplikace neposílá, nelze odstranit z našeho serveru; spravujete je na svém Macu. Pro údaje předané AI poskytovateli kontaktujte také daného poskytovatele.

Síťovou adresu při doručení webu technicky zpracováváme za účelem doručení a ochrany služby na základě oprávněného zájmu; není součástí distribučních souhrnů popsaných výše.

## English

### Provider and the application on your Mac

VCode Recall is provided by **VCode**. VCode is the controller of data we process when providing the website and support; contact: **podpora@zeleznalady.cz**.

The bundled native configuration indexes only local folders you select, using
the model bundled in the application. Settings, indexes and operational history
remain on your Mac. The app contains no advertising tracking or visitor analytics
and does not automatically send us your project contents, queries or diagnostics.
Installing the app does not itself start indexing or download an AI model.

You connect trusted local clients such as Codex and Claude Code yourself.
They can read selected projects and request indexing. They may forward retrieved
context to their AI providers according to the clients' settings and policies.
Allowing local access does not itself determine how a connected AI client handles
context. The local services are not intended for Internet or network sharing.

Optional Ollama diagnostics are separate. Their local monitoring may display process names and connected clients' network addresses, not prompt contents. You manage local operational history through the app's settings. An older Docker installation preserves
its original embedding provider; configuring a remote provider may change where
processing occurs. macOS notifications require your permission. A manual update
check only retrieves public release information from VCode over HTTPS; it does
not transmit project registries, source files, prompts or local history.

Removing the app alone does not delete original projects or local indexes.
Safely stop the app's own local service before replacing or removing its runtime,
as described in the guide. Review diagnostic reports for sensitive paths and data
before sending them to support.

### Public downloads and aggregate counts

The public VCode website may count clicks on a VCode Recall download link without
analytics cookies. Only the product identifier is sent, without your projects,
filenames, referring or destination URL, forms or a user identifier. This client
measurement respects Do Not Track and Global Privacy Control, sends no login
cookies and sends no events while offline. A click does not necessarily result
in a download.

The distribution server separately produces daily aggregate counts of GET and
HEAD requests, completed full installer-file responses, partial transfers,
errors, interrupted responses and bytes written by the distribution service
toward its proxy server. Metadata, licenses and required source archives are
counted separately from installer files. Aggregates are grouped by UTC day, public
version and the specific installer ZIP/DMG; metadata, licences and source archives form one separate group rather than per-file statistics for each supporting file. Manual update checks may contribute to technical request counts. Aggregates contain no IP address, user agent, referring
URL, visitor identifier, cookies or project contents. A network address is
technically processed for HTTPS delivery but is not stored in these aggregates.
Individual access logs are disabled on distribution routes.

Server aggregates also include bots, repeated and partial requests and requests
with DNT/GPC enabled. They do not identify individual visitors. A completed
service response to its proxy does not confirm that a phone or computer received
the entire file. The totals do not represent people, unique visitors,
installations or application launches.

Click counts and operational aggregates are stored on our server for the current
UTC day and the previous 29 days at most. Access is limited to authorised people with access to the VCode website after signing into the VCode Overview.

### Presentation visits, support and your rights

Visits to the public Recall presentation are measured separately under the [VCode website privacy policy](https://vcode.zeleznalady.cz/en/privacy/): without tracking cookies, with DNT/GPC, and visitor analytics records retained for at most 180 days. This does not measure use of the native app.

If you contact support, we process your email address and information you choose to send to resolve your enquiry. The legal basis is our legitimate interest in providing support and responding to requests. We delete resolved support messages no later than 90 days after closure. Do not send passwords, tokens, private source files or complete indexes to support; review diagnostic information before sharing it.

To exercise your rights, contact podpora@zeleznalady.cz. Subject to GDPR conditions, you may request access, rectification, erasure or restriction, object to processing and, where applicable, exercise data portability. You may complain to the [Czech Office for Personal Data Protection](https://uoou.gov.cz/). Local indexes that the app does not send us cannot be removed from our server; you manage them on your Mac. For data forwarded to an AI provider, also contact that provider.

We technically process a network address when delivering the website for delivery and service protection based on our legitimate interest; it is not included in the distribution aggregates described above.

## Kontrola před aktivací / Before activation

- Ověřit oba jazyky proti skutečnému finálnímu balíčku a provozu.
- Publikovat schválené oznámení a veřejné odkazy před zapnutím měření.
- Ověřit vypnutí jednotlivých access logů na obou proxy vrstvách.
- Ověřit soukromá oprávnění metrik, produkční retenci i při deaktivaci a klientské DNT/GPC. Metrikový stav vyloučit ze záloh, nebo zajistit jejich stejnou retenci. Při úplném zastavení retenční služby data odstranit nebo zajistit samostatné čištění; zastavený kontejner sám nemůže čistit soubor.
- Souhlas pro jinou aplikaci není schválením tohoto nového znění.


## Identita, plánované adresy a podklad pro kontrolu

- Vydavatel/provozovatel: VCode, výslovně potvrzený vlastníkem jako právní název v tomto vlákně; stejný subjekt vlastník znovu potvrdil ve zdrojovém vlákně 8. 10. 2026. Nejde o nezávislou kontrolu obchodního rejstříku. IČ, právní forma ani poštovní adresa nebyly doloženy a nejsou domýšlené.
- Kontakt: podpora@zeleznalady.cz, shodný s dříve schválenými stránkami ostatních aplikací.
- Budoucí CZ privacy URL: https://vcode.zeleznalady.cz/vcode-recall/privacy/
- Budoucí EN privacy URL: https://vcode.zeleznalady.cz/en/vcode-recall/privacy/
- Tyto dvě adresy nejsou dosud publikované; jejich zveřejnění vyžaduje schválení tohoto textu a přijetí finální distribuce.
- [GDPR, články 6 a 13 a práva subjektů údajů](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32016R0679); [informace ÚOOÚ o právech](https://uoou.gov.cz/poradna/poradna-gdpr/prava-subjektu-udaju).

První dvě jazykové části jsou konkrétní text k posouzení. Kontrolní pokyny a evidence identity nejsou veřejným textem. Předání musí svázat přesné schválené bajty s výsledným veřejným oznámením; změna textu po schválení vyžaduje novou kontrolu.
