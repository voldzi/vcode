export type Product = {
  id: string;
  name: string;
  href: string;
  tone: string;
  categoryCs: string;
  categoryEn: string;
  headlineCs: string;
  headlineEn: string;
  summaryCs: string;
  summaryEn: string;
  capabilitiesCs: string[];
  capabilitiesEn: string[];
  externalUrl?: string;
  availabilityCs: string;
  availabilityEn: string;
};

export const products: Product[] = [
  {
    id: "apsyd",
    name: "APSYD",
    href: "apsyd",
    tone: "teal",
    categoryCs: "Psychodiagnostika",
    categoryEn: "Psychodiagnostics",
    headlineCs: "Vyšetření jako bezpečný, řízený proces.",
    headlineEn: "Assessment as a secure, controlled workflow.",
    summaryCs: "Klinické a provozní prostředí pro příjem probanda, psychodiagnostické vyšetření, odborné posouzení výsledků a koordinaci pracovišť.",
    summaryEn: "A clinical and operational environment for participant intake, psychodiagnostic assessment, professional result review and site coordination.",
    capabilitiesCs: ["Příjem a příprava vyšetření", "Řízené testování", "Odborná kontrola výsledků", "Audit a koordinace pracovišť"],
    capabilitiesEn: ["Intake and assessment preparation", "Controlled test delivery", "Professional result review", "Audit and site coordination"],
    availabilityCs: "Řízené zdravotnické nasazení",
    availabilityEn: "Controlled healthcare deployment"
  },
  {
    id: "jizda",
    name: "Jízda",
    href: "jizda",
    tone: "azure",
    categoryCs: "Mobilita",
    categoryEn: "Mobility",
    headlineCs: "Každá cesta přehledně.",
    headlineEn: "Every journey, clearly recorded.",
    summaryCs: "Evidence jízd, navigace, vozidla, cestující, náklady a bezpečná komunikace v jedné aplikaci pro iPhone a Apple Watch.",
    summaryEn: "Ride logging, navigation, vehicles, passengers, costs and secure communication in one iPhone and Apple Watch app.",
    capabilitiesCs: ["Záznam a obnova jízdy", "Navigace a dopravní kontext", "Vozidla, náklady a statistiky", "COP komunikace"],
    capabilitiesEn: ["Ride recording and recovery", "Navigation and road context", "Vehicles, costs and insights", "COP communication"],
    availabilityCs: "Připravujeme pro App Store",
    availabilityEn: "Preparing for the App Store"
  },
  {
    id: "cop-mobile",
    name: "COP Mobile",
    href: "cop-mobile",
    tone: "cyan",
    categoryCs: "Bezpečnost a situace",
    categoryEn: "Safety and situational awareness",
    headlineCs: "Situační přehled, který máte u sebe.",
    headlineEn: "Situational awareness you can carry.",
    summaryCs: "Mobilní přístup k mapě COP, hlášením, poloze, upozorněním a šifrované komunikaci.",
    summaryEn: "Mobile access to the COP map, reports, location, alerts and encrypted communication.",
    capabilitiesCs: ["Živá situační mapa", "Hlášení z terénu", "Nativní poloha a upozornění", "Bezpečný chat a hovory"],
    capabilitiesEn: ["Live situation map", "Field reporting", "Native location and alerts", "Secure chat and calls"],
    externalUrl: "https://cop.zeleznalady.cz/",
    availabilityCs: "Web je dostupný, aplikaci připravujeme",
    availabilityEn: "Web available, mobile app in preparation"
  },
  {
    id: "cop",
    name: "COP",
    href: "cop",
    tone: "navy",
    categoryCs: "Veřejná situační mapa",
    categoryEn: "Public situation map",
    headlineCs: "Důležité dění na jedné mapě.",
    headlineEn: "What matters, on one map.",
    summaryCs: "Mapová aplikace pro dopravu, počasí, infrastrukturu, veřejná hlášení a bezpečné plánování tras.",
    summaryEn: "A map for traffic, weather, infrastructure, public reports and safer route planning.",
    capabilitiesCs: ["Doprava a živé rychlosti", "Výstrahy a omezení", "Veřejná infrastruktura", "Trasy pro různé situace"],
    capabilitiesEn: ["Traffic and live speeds", "Alerts and restrictions", "Public infrastructure", "Routes for different situations"],
    externalUrl: "https://cop.zeleznalady.cz/",
    availabilityCs: "Dostupné jako webová aplikace",
    availabilityEn: "Available as a web app"
  },
  {
    id: "nest",
    name: "NEST",
    href: "nest",
    tone: "nest",
    categoryCs: "Strategická hra",
    categoryEn: "Strategy game",
    headlineCs: "Klidná strategie. Každý tah má význam.",
    headlineEn: "Calm strategy. Every move matters.",
    summaryCs: "Tahová strategická hra pro iPhone a iPad, ve které dva hráči vedou ptačí figurky na společném šestiúhelníkovém hnízdě.",
    summaryEn: "A turn-based strategy game for iPhone and iPad, where two players guide bird pieces across a shared hexagonal nest.",
    capabilitiesCs: ["Hra na jednom zařízení", "Soupeř s lokální AI", "Online hra přes Game Center", "Pravidla pro začátečníky i pokročilé"],
    capabilitiesEn: ["Play on one device", "On-device AI opponent", "Game Center multiplayer", "Rules for beginners and experienced players"],
    availabilityCs: "Připravujeme vydání v App Store",
    availabilityEn: "Preparing for release on the App Store"
  },
  {
    id: "masaze",
    name: "Masáže Železná Lady",
    href: "masaze",
    tone: "coral",
    categoryCs: "Rezervace a péče",
    categoryEn: "Booking and care",
    headlineCs: "Klidná cesta k volnému termínu.",
    headlineEn: "A calm path to your next appointment.",
    summaryCs: "Přehled služeb, volných termínů a jednoduchá rezervace masáže bez zbytečných kroků.",
    summaryEn: "Services, live availability and a straightforward massage booking experience.",
    capabilitiesCs: ["Aktuální nabídka služeb", "Nejbližší volné termíny", "Rezervace bez účtu", "Klientská samoobsluha"],
    capabilitiesEn: ["Current service offering", "Nearest available slots", "Booking without an account", "Client self-service"],
    externalUrl: "https://masaze.zeleznalady.cz/",
    availabilityCs: "V provozu",
    availabilityEn: "Live"
  },
  {
    id: "studio-balance",
    name: "Studio Balance",
    href: "studio-balance",
    tone: "balance",
    categoryCs: "Pohyb a rezervace",
    categoryEn: "Movement and booking",
    headlineCs: "Pohyb, který dává smysl.",
    headlineEn: "Movement that feels right.",
    summaryCs: "Digitální zázemí boutique studia v Bruntále: lekce, aktuální rozvrh, rezervace a klientská samoobsluha v jednom klidném prostředí.",
    summaryEn: "The digital home of a boutique movement studio in Bruntál: classes, live schedules, booking and client self-service in one calm experience.",
    capabilitiesCs: ["Aktuální rozvrh lekcí", "Jednoduché rezervace", "Klientský účet", "Správa kapacity a docházky"],
    capabilitiesEn: ["Live class schedule", "Straightforward booking", "Client account", "Capacity and attendance management"],
    externalUrl: "https://studio-balance.cz/",
    availabilityCs: "V provozu",
    availabilityEn: "Live"
  },
  {
    id: "stratos",
    name: "STRATOS",
    href: "stratos",
    tone: "violet",
    categoryCs: "Řízení organizace",
    categoryEn: "Organisational management",
    headlineCs: "Rozhodnutí opřená o jednu pravdu.",
    headlineEn: "Decisions grounded in one source of truth.",
    summaryCs: "Auditovatelný systém pro strategie, projekty, finance, rizika, rozhodnutí a řízenou znalost.",
    summaryEn: "An auditable system for strategy, projects, finance, risk, decisions and governed knowledge.",
    capabilitiesCs: ["Portfolio a projekty", "Rozpočty a smlouvy", "Potřeby a architektura", "Řízené znalosti v AKB"],
    capabilitiesEn: ["Portfolio and projects", "Budgets and contracts", "Needs and architecture", "Governed knowledge in AKB"],
    externalUrl: "https://stratos.zeleznalady.cz/",
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "kaloricke-tabulky",
    name: "Kalorické tabulky",
    href: "kaloricke-tabulky",
    tone: "lime",
    categoryCs: "Výživa",
    categoryEn: "Nutrition",
    headlineCs: "Jídlo bez nátlaku. Data s kontextem.",
    headlineEn: "Food without pressure. Data with context.",
    summaryCs: "Český jídelní deník s důvěryhodným katalogem, offline zápisem a citlivým přístupem k cílům.",
    summaryEn: "A Czech food diary with a trusted catalogue, offline logging and a considerate approach to goals.",
    capabilitiesCs: ["Rychlý offline zápis", "Ověřený katalog potravin", "Recepty a porce", "Neutrální trendy a soukromí"],
    capabilitiesEn: ["Fast offline logging", "Verified food catalogue", "Recipes and servings", "Neutral trends and privacy"],
    externalUrl: "https://kaloricketabulky.zeleznalady.cz/",
    availabilityCs: "Dostupné jako PWA",
    availabilityEn: "Available as a PWA"
  }
];
