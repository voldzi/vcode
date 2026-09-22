# VCode help content governance

## Public content boundary

Only a guide with all of these properties may appear on the public website:

- `classification: public`
- `status: published`
- unique `external_ref`
- an application owner and human-reviewed revision in AKB
- no credentials, internal host names, personal data or private screenshots

The source is bilingual but each language is an independent reviewed document. A Czech revision does not silently publish or update its English counterpart.

## AKB layout

Use one dedicated AKB application space, `vcode-help`, on the existing AKB platform. Separate it by application metadata and public publication lifecycle instead of operating a duplicate Qdrant, PostgreSQL and object-storage stack.

Suggested metadata:

- application: `vcode-help`
- component: product id (`jizda`, `cop`, `cop-mobile`, `masaze`, `stratos`, `kaloricke-tabulky`)
- types: `manual`, `knowledge_base_article`
- classification: `public` only for deliberately anonymous help
- source system: `git`
- stable external reference: `DOC-VCODE-<PRODUCT>-<TOPIC>-<LANG>`

Internal operational runbooks remain in their product repositories or an internal AKB audience. They are never mixed with public help.
