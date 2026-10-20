# Oprava schvalování blogu — 20. října 2026

## Příčiny

- Telegram evidoval odmítnutí webhooku HTTP 403. Veřejná cesta správně přenášela ověřovací hlavičku a aplikace přijímala aktuální klíč. Registrace webhooku byla obnovena se stejnou adresou, aktuálním existujícím klíčem a pouze událostmi `callback_query`; čekající události se nezahazovaly. Pozorovaný stav odpovídal nesouladu registrovaného a aplikačního klíče.
- Soukromý webový náhled používá `no-referrer`. Chromium při odeslání formuláře s tímto nastavením posílá `Origin: null` bez `Referer`. Původní kontrola vyžadovala doménový původ, a proto vracela `Forbidden` i při oprávněném potvrzení.

## Změna

- Formuláře mají HMAC potvrzení svázané s konkrétním neveřejným tokenem a akcí. Podepsaný požadavek může přijít bez původu nebo s `Origin: null`; explicitně cizí původ, odkazující stránka a mezidoménový požadavek zůstávají odmítnuté.
- Zůstává povinné vědomé potvrzení publikace či zamítnutí, kontrola platnosti odkazu a atomické zpracování s redakčním auditem. Ochrana ostatních formulářů se nemění. Soukromé stránky si ponechávají `no-store`, `noindex` a `no-referrer`.
- Telegram vysvětlí, že návrh již byl zpracován, vypršel nebo neexistuje. Tyto stavy už nevytvářejí neošetřenou chybu obsluhy.
- Neměnila se konfigurace ranního běhu, rozpočet, databázové schéma ani ruční schvalování.

## Ověření a nasazení

- Devět nových automatických testů: podpisy, chybějící a cizí původ, změna akce/tokenu, potvrzení, oba kroky Telegramu, zrušení, audit publikace, neplatné a opakované akce.
- Celý `pnpm test` uspěl v izolovaném kontejneru s produkční verzí Node.js, bez sítě a bez produkčních přihlašovacích údajů či dat.
- Chromium odeslalo skutečný vykreslený formulář s `Origin: null` a bez `Referer`; syntetický článek prošel standardní publikační funkcí právě jednou. Fyzický iPhone ani WebKit nebyly ověřeny.
- Nasazena pouze služba blogu. Obraz rozšiřuje přesný předchozí produkční obraz o čtyři soubory. Zachována prostředí, disky, omezení, síťové členství i ostatních 13 služeb; předchozí obraz a soubory jsou uchovány pro návrat.
- Produkční kontrola: `/health/blog` 200; správně podepsané připojení webhooku 200 a nesprávný klíč 403 při prázdné události; neznámý neveřejný token 404. Telegram potvrdil očekávanou adresu, pouze callback události a nulový počet čekajících událostí. Jeho záznam poslední historické chyby může přetrvávat i po opravě.
- Nebyla vytvořena testovací produkční událost ani odeslána testovací zpráva. Úplné potvrzení skutečným kliknutím uživatele v Telegramu/iPhone zůstává neověřené.

## Zveřejněné články

Po výslovném schválení přesného opraveného českého a anglického znění byly standardní redakční funkcí zveřejněny články 251 a 252. Všechny čtyři veřejné stránky byly ověřeny se stavem 200 a aktuálním názvem i úvodním textem:

- [IBM Research představuje kurz o architekturách AI akcelerátorů](https://vcode.zeleznalady.cz/blog/ibm-research-predstavuje-kurz-o-architekturach-ai-akceleratoru-3c93087a/)
- [Magnetar: ověřování výpočtů pomocí důkazů](https://vcode.zeleznalady.cz/blog/magnetar-overovani-vypoctu-pomoci-dukazu-eea2eb60/)

Provozní důkazy a návratový postup jsou uloženy odděleně v chráněném nasazení `blog-approval-20261020`. Tato dokumentace neobsahuje soukromé odkazy, klíče ani obsah produkční konfigurace.
