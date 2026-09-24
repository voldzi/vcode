const source = (definition) => Object.freeze({
  enabled: true,
  collectionMode: "rss",
  language: "cs",
  trustTier: "editorial",
  sourceKind: "publication",
  retentionPolicy: "metadata-only",
  licenseNote: "RSS metadata only; full-content retention requires separate review.",
  topics: [],
  ...definition
});

export const defaultSources = Object.freeze([
  source({ id: "root", name: "Root.cz", feedUrl: "https://www.root.cz/rss/clanky/", homepageUrl: "https://www.root.cz/", allowedHosts: ["www.root.cz", "root.cz"], topics: ["software", "internet", "security", "infrastructure"] }),
  source({ id: "zdrojak", name: "Zdroják", feedUrl: "https://zdrojak.cz/clanky/feed/", homepageUrl: "https://zdrojak.cz/", allowedHosts: ["zdrojak.cz", "www.zdrojak.cz"], topics: ["software", "web", "ai"] }),
  source({ id: "vzhurudolu", name: "Vzhůru dolů", feedUrl: "https://www.vzhurudolu.cz/rss", homepageUrl: "https://www.vzhurudolu.cz/", allowedHosts: ["www.vzhurudolu.cz", "vzhurudolu.cz"], topics: ["web", "performance", "accessibility"] }),
  source({ id: "cznic", name: "Blog CZ.NIC", feedUrl: "https://blog.nic.cz/feed/", homepageUrl: "https://blog.nic.cz/", allowedHosts: ["blog.nic.cz", "www.nic.cz", "nic.cz"], trustTier: "primary", sourceKind: "official", topics: ["internet", "security", "infrastructure"] }),
  source({ id: "nukib", name: "NÚKIB", feedUrl: "https://portal.nukib.gov.cz/rss.xml", homepageUrl: "https://nukib.gov.cz/", allowedHosts: ["portal.nukib.gov.cz", "nukib.gov.cz", "www.nukib.gov.cz"], trustTier: "authority", sourceKind: "official", topics: ["security"] }),
  source({ id: "csirt", name: "CSIRT.CZ", feedUrl: "https://www.csirt.cz/en/cybersecurity/security-news/feed/", homepageUrl: "https://csirt.cz/", allowedHosts: ["www.csirt.cz", "csirt.cz"], language: "en", trustTier: "authority", sourceKind: "official", licenseNote: "CC BY-SA 3.0; verify current page notice before excerpt retention", topics: ["security"] }),
  source({ id: "lupa", name: "Lupa.cz", feedUrl: "https://www.lupa.cz/rss/clanky/", homepageUrl: "https://www.lupa.cz/", allowedHosts: ["www.lupa.cz", "lupa.cz"], topics: ["internet", "digitalization", "infrastructure"] }),
  source({ id: "cesnet", name: "CESNET CyberFeed", feedUrl: "https://cyberfeed.cesnet.cz/feed", homepageUrl: "https://www.cesnet.cz/", allowedHosts: ["cyberfeed.cesnet.cz", "www.cesnet.cz", "cesnet.cz"], trustTier: "authority", sourceKind: "official", topics: ["security", "infrastructure"] }),
  source({ id: "huggingface", name: "Hugging Face Blog", feedUrl: "https://huggingface.co/blog/feed.xml", homepageUrl: "https://huggingface.co/blog", allowedHosts: ["huggingface.co", "www.huggingface.co"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["ai", "open-source"] }),
  source({ id: "openai", name: "OpenAI", feedUrl: "https://openai.com/news/rss.xml", homepageUrl: "https://openai.com/news/", allowedHosts: ["openai.com", "www.openai.com"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["ai"] }),
  source({ id: "ollama", name: "Ollama Blog", feedUrl: "https://ollama.com/blog/rss.xml", homepageUrl: "https://ollama.com/blog", allowedHosts: ["ollama.com", "www.ollama.com"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["ai", "infrastructure", "open-source"] }),
  source({ id: "cloudflare", name: "Cloudflare Blog", feedUrl: "https://blog.cloudflare.com/rss/", homepageUrl: "https://blog.cloudflare.com/", allowedHosts: ["blog.cloudflare.com"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["internet", "infrastructure", "software", "web"] }),
  source({ id: "kubernetes", name: "Kubernetes Blog", feedUrl: "https://kubernetes.io/feed.xml", homepageUrl: "https://kubernetes.io/blog/", allowedHosts: ["kubernetes.io"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["software", "infrastructure"] }),
  source({ id: "goblog", name: "The Go Blog", feedUrl: "https://go.dev/blog/feed.atom", homepageUrl: "https://go.dev/blog/", allowedHosts: ["go.dev"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["software", "infrastructure"] }),
  source({ id: "rustblog", name: "Rust Blog", feedUrl: "https://blog.rust-lang.org/feed.xml", homepageUrl: "https://blog.rust-lang.org/", allowedHosts: ["blog.rust-lang.org"], language: "en", trustTier: "primary", sourceKind: "official", topics: ["software", "infrastructure"] }),
  source({ id: "anthropic", name: "Anthropic Engineering", feedUrl: null, homepageUrl: "https://www.anthropic.com/engineering", allowedHosts: ["www.anthropic.com", "anthropic.com"], enabled: false, collectionMode: "pending-official-feed", language: "en", trustTier: "primary", sourceKind: "official", topics: ["ai", "security"], licenseNote: "Disabled until an official stable machine-readable feed is verified." })
]);

export function activeSources(sources = defaultSources) {
  return sources.filter((item) => item.enabled && item.collectionMode === "rss" && item.feedUrl);
}
