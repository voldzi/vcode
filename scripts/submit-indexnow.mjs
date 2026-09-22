const origin = new URL(process.env.PUBLIC_SITE_URL ?? "https://vcode.zeleznalady.cz");
const key = "9aac48ffeaa997f7c28213c058c405e3";
const staticPaths = [
  "/", "/en/", "/blog/", "/en/blog/", "/navody/", "/en/guides/",
  "/podpora/", "/en/support/", "/soukromi/", "/en/privacy/",
  "/aplikace/jizda/", "/aplikace/cop-mobile/", "/aplikace/cop/",
  "/aplikace/masaze/", "/aplikace/studio-balance/", "/aplikace/stratos/",
  "/aplikace/kaloricke-tabulky/"
];

const urlList = staticPaths.map((path) => new URL(path, origin).href);
const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: origin.host,
    key,
    keyLocation: new URL(`/${key}.txt`, origin).href,
    urlList
  })
});

if (!response.ok) throw new Error(`IndexNow rejected the request: ${response.status} ${await response.text()}`);
console.log(`IndexNow accepted ${urlList.length} canonical URLs (${response.status}).`);
