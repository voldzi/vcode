# Rinklet — samostatné vydání cílených odkazů

## Aktuální oprávnění a rozsah

V původním chatu Rinklet vlastník nejprve schválil tematické Custom Product
Pages a koordinaci s VCode. Dne 12. října následně přímo požádal znovu ověřit
spojení a dokončit nasazení odkazů Rinklet. Toto vydání je výhradně pro Rinklet.

Předchozí společně připravený balíček se nepoužije. Kandidát vznikl v odděleném
worktree od zdrojové reference posledního přijatého produkčního vydání Jízdy.
Publikační vstupy se rekonstruují z jeho přesně materializované základny
601 souborů a překryjí pouze pět schválených změn: sdílený render, datový typ,
data Rinklet a dva tyto přípravné dokumenty.

MILLORA data zůstávají bajtově totožná s produkčním základem a nemají nové CTA.
Stejně se zachovají ostatní hry, soukromí, podpora, galerie, pravidla, analytický
kód i rozsah měření a dostupnost platforem. Předchozí čtyři nepoužité Jízda
deriváty zůstanou mimo výsledný artefakt a jejich URL musí vracet HTTP 404.

## Dva schválené vedlejší odkazy

| Karta CZ / EN | Odkaz CZ / EN | CPP |
| --- | --- | --- |
| Stůl nahoře. Prst dole. / Table above. Finger below. | Prohlédnout rozdělené ovládání v App Storu / View split controls on the App Store | Table & controller |
| Dva u jednoho stolu / Two players. One table. | Prohlédnout místní duel v App Storu / View the local duel on the App Store | Local duel |

Sdílená komponenta použije volitelné storeLink pouze u těchto dvou karet.
Každá ze čtyř existujících CZ/EN produktových a App Store marketingových
stránek musí mít přesně dva vedlejší odkazy. Podtržený text respektuje
klávesnicový fokus, zalamování a dotykovou plochu nejméně 44 px.

Hlavní lokalizovaný oficiální Apple badge, katalog a downloadUrl zůstávají na
https://apps.apple.com/app/rinklet/id6821032563 bez ppid. Galerie dál otevírá
původní obrázky. Cílový odkaz je náhled v App Storu; nezaručuje automatické
spuštění konkrétního režimu v aplikaci. Stávající app-store-click se použije
beze změny a cílové URL ani ppid se do analytiky nepřidává.

## Předepsaná samostatná kontrola

Na přesném novém kandidátu spustit pnpm check, pnpm test a pnpm build.
Před serverovými kroky zachytit čerstvý skutečný source/runtime stav.
Sestavit oba povinné Docker obrazy a ověřit čitelnost skutečného veřejného
artefaktu a existující bezpečnostní hranice Nginx. Aktivace smí nahradit jen web.

Produkční přijetí musí potvrdit přesné kandidátní HTML, čtyři Rinklet stránky,
dva kontextově správné cíle, všechen původní obsah ostatních produktů včetně
MILLORY bez nových CTA, původní média Rinklet a video byte range, hlavní badge,
právní a integrační bajty, zdraví/obě lokality/blogy/návody, přístupové hranice
a zachování devíti dalších služeb. Zdrojová a kontejnerová identita před
změnou i návratem musí projít compare-and-swap kontrolou.

Neprovádí se změna VPN, firewallu, autentizace nebo segmentace, neaktivuje se
PPO ani monitor. Skutečné návštěvnické záznamy nebo formuláře se nepoužijí.
Výsledek serverové aktivace bude samostatně zaznamenán s image/source/rollback
identitou, časem přijetí a skutečným produkčním snímkem.
