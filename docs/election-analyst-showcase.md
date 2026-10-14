# Election analyst — prezentace VCode

## Rozsah

Samostatná česká a anglická prezentace na `/aplikace/election-analyst/` a `/en/apps/election-analyst/`, karta katalogu, skutečná ikona aplikace a návody. Rozvržení navazuje na prezentaci Masáží. Výchozí ověřený produkční commit VCode je `e0308ff770e86919c589d02a528ad4d82e80b5a3`.

## Zdroj tvrzení

Podklady vlastní projekt Election analyst: `README.md`, `docs/product-design.md`, `docs/data-sources.md`, `docs/search-and-quality.md`, `docs/pwa.md` a `research/2026-10-14/stage3-release-0117/browser-public-accepted.json`. Veřejný vstup https://stratos.zeleznalady.cz/ea/ byl při přípravě dostupný se správným názvem Volební atlas.

Nezávislá aplikace nad veřejnými podklady, nikoli oficiální služba ČSÚ. Žádný příslib živého sčítání, předpovědi, automatického potvrzení podvodu nebo dostupnosti budoucích volebních kol. PWA není popsaná jako offline atlas. Měření na cílovém webu, právní stránky a služby aplikace se touto prezentací nemění.

## Obrazové podklady

Převzaté skutečné snímky veřejného rozhraní a oficiální projektová ikona; beze změny zobrazených hodnot. Převod na WebP a menší náhledy pro portfolio. Galerie je označená jako české rozhraní i na anglické stránce.

### research/2026-10-14/context-release/release-0.6.1/browser-public-overview.png

Originál SHA-256: `4453c7542885ebe8aa8c88f140511be6160912b848a75cbe73403308930e7765`

- `public/images/election-analyst/01-results.webp` · SHA-256 `f92c62d25eca0a3d12e0c5aaf5f2f39d8ab59ce0da44c70d4b25825582e9b9cb`
- `public/images/election-analyst/01-results-preview.webp` · SHA-256 `d72d1e6615b69f6a5ed287e1049335d9cdf441568881409aad3d94aaf92718f3`

### research/2026-10-14/stage1-release/ui-audit-03-desktop-after.png

Originál SHA-256: `38269435ce84571fd8d0842d31fe4be58e7409a8f819b3fcddef9cc3e1cadd08`

- `public/images/election-analyst/02-map.webp` · SHA-256 `f84900e6605999187c35808d4a0c48b9fd40a34e9ef167e44c49afa6a8129562`
- `public/images/election-analyst/02-map-preview.webp` · SHA-256 `aa13c166e7a0831ead3954a20b6d0df2b59acdfabce6fc63f96c8a9667edfddc`

### research/2026-10-14/stage3-release-0117/browser-public-profile-top.png

Originál SHA-256: `49cd363930e0201f306dd954645bf6982d1ab12e33a241db793babfec64068fb`

- `public/images/election-analyst/03-context.webp` · SHA-256 `35b0b9b3654276062e2dbb15c932b5c713bed8a6062c2406ceec10a53a84cfe8`
- `public/images/election-analyst/03-context-preview.webp` · SHA-256 `4e04185ede08128f2cad860236c23b3614805910d9ea9c78f90e24057a3269b4`

Ikona `public/apps/election-analyst.png` pochází z projektového `assets/icon-512.png`; SHA-256 `217048d52f0c3099bfc47c3b53632f87e8971e94791297858ea080f4c3976591`.

## Ověření a vydání

Povinné brány: pnpm check, pnpm test, pnpm build; kontrola obou jazyků, skutečných obrázků, katalogové dostupnosti web:available, návodů, canonical/hreflang, sitemap a llms.txt. Nasazení je doloženo odděleným provozním receipt; tento dokument sám nepotvrzuje publikaci.
