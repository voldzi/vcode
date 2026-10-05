export type Product = {
  id: string;
  name: string;
  nameEn?: string;
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
  externalUrlEn?: string;
  startUrl?: string;
  learnMoreUrl?: string;
  availabilityCs: string;
  availabilityEn: string;
  family?: "stratos";
  kind?: "game";
  inDevelopment?: boolean;
};

export const products: Product[] = [
  {
    id: "event", name: "Event", href: "event", tone: "azure", inDevelopment: true,
    categoryCs: "Akce a vzdělávání", categoryEn: "Events and learning",
    headlineCs: "Od programu k přehledu o celé akci.", headlineEn: "From the programme to a clear view of every event.",
    summaryCs: "Platforma pro organizaci vzdělávacích a firemních akcí. Spojuje program, přihlášky, QR prezenci, úkoly a přehledy pro organizátory.",
    summaryEn: "A platform for learning and business events, bringing together programmes, registrations, QR check-in, tasks and organiser overviews.",
    capabilitiesCs: ["Program a registrace účastníků", "QR prezence a přehled účasti", "Úkoly, materiály a hodnocení", "České a anglické rozhraní"],
    capabilitiesEn: ["Programmes and participant registration", "QR check-in and attendance overviews", "Tasks, materials and reviews", "Czech and English interface"],
    availabilityCs: "Ve vývoji — ukázka po domluvě", availabilityEn: "In development — demo by arrangement"
  },
  {
    id: "foldlight", name: "Foldlight", href: "foldlight", tone: "forest", kind: "game", inDevelopment: true,
    categoryCs: "Světelná hříčka", categoryEn: "Light puzzle",
    headlineCs: "Rozevřete telefon. Nechte světlo rozkvést.", headlineEn: "Open your phone. Let the light bloom.",
    summaryCs: "Jednoduchá hra se světlem, zrcadly a květinami. Krátká ukázka představuje ovládání ohybem na iPhonu Duo; na běžném iPhonu a iPadu slouží dotykové ovládání.",
    summaryEn: "A simple game of light, mirrors and flowers. A short showcase explores fold controls on iPhone Duo, with touch controls on ordinary iPhones and iPads.",
    capabilitiesCs: ["Tři ukázky: ohyb, odraz a větvení světla", "Světlo probouzí květiny", "Dotykové ovládání na iPhonu a iPadu", "Dvanáct hlavolamů k prozkoumání"],
    capabilitiesEn: ["Three demonstrations: folding, reflection and branching light", "Light wakes the flowers", "Touch controls on iPhone and iPad", "Twelve puzzles to explore"],
    availabilityCs: "Vývojový prototyp", availabilityEn: "Development prototype"
  },
  {
    id: "rinklet", name: "Rinklet", href: "rinklet", tone: "cyan", kind: "game", inDevelopment: true,
    categoryCs: "Stolní hokej", categoryEn: "Table hockey",
    headlineCs: "Malý stůl. Rychlá odveta.", headlineEn: "A small table. A quick rematch.",
    summaryCs: "Stolní hokej pro iPhone a iPad. Zahrajte si proti počítači, trénujte nebo vyzvěte druhého hráče na jednom zařízení. Pro iPhone Duo připravujeme rozdělení stolu a ovladače.",
    summaryEn: "Table hockey for iPhone and iPad. Play the computer, practise or challenge a second player on one device. A separate rink and controller layout is being developed for iPhone Duo.",
    capabilitiesCs: ["Soupeř se třemi obtížnostmi", "Dva hráči na jednom zařízení", "Trénink a místní hra offline", "Stůl a ovladač na oddělených plochách"],
    capabilitiesEn: ["Computer opponent with three difficulty levels", "Two players on one device", "Practice and offline local play", "Separate rink and controller surfaces"],
    availabilityCs: "Ve vývoji", availabilityEn: "In development"
  },
  {
    id: "millora", name: "MILLORA — Mlýn", nameEn: "MILLORA — Nine Men's Morris", href: "millora", tone: "amber", kind: "game", inDevelopment: true,
    categoryCs: "Desková strategie", categoryEn: "Board strategy",
    headlineCs: "Devět kamenů. Spousta možností.", headlineEn: "Nine pieces. Many possibilities.",
    summaryCs: "Moderní zpracování klasického Mlýna pro iPhone a iPad. Pokládejte a posouvejte kameny, uzavírejte mlýny a promýšlejte další tah.",
    summaryEn: "A modern take on Nine Men's Morris for iPhone and iPad. Place and move pieces, form mills and think ahead.",
    capabilitiesCs: ["Klasická pravidla Mlýna", "Čtyři úrovně místního soupeře", "Dva hráči na jednom zařízení", "Interaktivní lekce a trénink"],
    capabilitiesEn: ["Classic Nine Men's Morris rules", "Four levels of on-device opponent", "Two players on one device", "Interactive lessons and practice"],
    availabilityCs: "Ve vývoji", availabilityEn: "In development"
  },

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
    id: "pas",
    name: "PAS",
    href: "pas",
    tone: "pas",
    categoryCs: "Klinická péče",
    categoryEn: "Clinical care",
    headlineCs: "Podpora ošetřovatelské péče přímo u lůžka.",
    headlineEn: "Bedside support for nursing care.",
    summaryCs: "Soukromá iOS aplikace pro ÚVN pro bezpečné pracovní postupy ošetřovatelské péče, strukturovaný zápis klinických údajů a práci s pacientským kontextem.",
    summaryEn: "A private iOS application for ÚVN supporting safe nursing workflows, structured clinical entry and patient-context work.",
    capabilitiesCs: ["Přehled pacientů a klinický kontext", "Strukturované záznamy a EWS", "Fotodokumentace a týmová komunikace", "Lokální práce a řízená synchronizace"],
    capabilitiesEn: ["Patient overview and clinical context", "Structured entries and EWS", "Photo documentation and team communication", "Local work and governed synchronisation"],
    availabilityCs: "Soukromé nasazení v ÚVN",
    availabilityEn: "Private deployment at ÚVN"
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
    kind: "game",
    name: "NEST",
    href: "nest",
    tone: "nest",
    categoryCs: "Strategická hra",
    categoryEn: "Strategy game",
    headlineCs: "Promyšlená strategie. Každý tah má význam.",
    headlineEn: "Thoughtful strategy. Every move matters.",
    summaryCs: "Tahová strategická hra pro iPhone, iPad a Apple TV, ve které dva hráči vedou ptačí figurky na společném šestiúhelníkovém hnízdě.",
    summaryEn: "A turn-based strategy game for iPhone, iPad and Apple TV, where two players guide bird pieces across a shared hexagonal nest.",
    capabilitiesCs: ["Hra na jednom zařízení", "Soupeř s lokální AI", "Online hra přes Game Center", "Pravidla pro začátečníky i pokročilé"],
    capabilitiesEn: ["Play on one device", "On-device AI opponent", "Game Center multiplayer", "Rules for beginners and experienced players"],
    availabilityCs: "Dostupné v App Storu pro iPhone, iPad a Apple TV",
    availabilityEn: "Available on the App Store for iPhone, iPad and Apple TV"
  },
  {
    id: "sibenice",
    kind: "game",
    name: "Šibenice",
    href: "sibenice",
    tone: "amber",
    categoryCs: "Česká slovní hra",
    categoryEn: "Czech word game",
    headlineCs: "Uhodněte slovo dřív, než vyprší čas.",
    headlineEn: "Guess the Czech word before time runs out.",
    summaryCs: "Kreslená slovní hra pro iPhone a iPad. Hrajte sami nebo se střídejte s druhým hráčem na jednom zařízení; verzi pro Apple TV připravujeme.",
    summaryEn: "An illustrated Czech word game for iPhone and iPad. Play solo or take turns with a second player on one device; an Apple TV version is in preparation.",
    capabilitiesCs: ["Čtyři obtížnosti a časomíra", "Hra dvou hráčů na jednom zařízení", "České slovníky pro různé věkové skupiny", "Ovládání Apple TV pomocí ovladače"],
    capabilitiesEn: ["Four difficulty levels and a timer", "Two players on one device", "Czech word lists for different age groups", "Apple TV remote control support"],
    availabilityCs: "Dostupné v App Storu pro iPhone a iPad",
    availabilityEn: "Available on the App Store for iPhone and iPad"
  },
  {
    id: "mestem-hrou",
    kind: "game",
    name: "Městem hrou",
    nameEn: "Play the City",
    href: "mestem-hrou",
    tone: "forest",
    categoryCs: "Příběhová hra v terénu",
    categoryEn: "Outdoor story game",
    headlineCs: "Město není seznam. Je to příběh.",
    headlineEn: "Every city hides a story.",
    summaryCs: "Bezplatná webová hra s příběhovými výpravami po českých městech a obcích. Na zastaveních řešíte otázky a postupně odkrýváte příběh.",
    summaryEn: "Free outdoor story games across Czechia. Solve questions at each stop and uncover the story as you go.",
    capabilitiesCs: ["Výpravy po městech a obcích", "Otázky na jednotlivých zastaveních", "Příběhy a tajenky", "Hra zdarma bez povinného účtu"],
    capabilitiesEn: ["Story trails across Czechia", "Questions at each stop", "Clues and story reveals", "Free play without an account"],
    externalUrl: "https://mestemhrou.cz/",
    externalUrlEn: "https://mestemhrou.cz/mestem-hrou/?lang=en",
    availabilityCs: "Veřejná beta na webu",
    availabilityEn: "Public beta on the web"
  },
  {
    id: "masaze",
    name: "Masáže",
    href: "masaze",
    tone: "coral",
    categoryCs: "Rezervace a péče",
    categoryEn: "Booking and care",
    headlineCs: "Snadná cesta k volnému termínu.",
    headlineEn: "A clear path to your next appointment.",
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
    id: "budget-contract",
    name: "Budget & Contract",
    href: "budget-contract",
    tone: "violet",
    family: "stratos",
    categoryCs: "Finance a smlouvy",
    categoryEn: "Finance and contracts",
    headlineCs: "Rozpočty a smlouvy v souvislostech.",
    headlineEn: "Budgets and contracts in context.",
    summaryCs: "Aplikace rodiny STRATOS pro finanční plánování, rozpočtové položky, veřejné zakázky, smlouvy a dodavatele.",
    summaryEn: "A STRATOS application for financial planning, budget items, procurement, contracts and suppliers.",
    capabilitiesCs: ["Finanční plánování", "Rozpočtové položky", "Veřejné zakázky", "Smlouvy a dodavatelé"],
    capabilitiesEn: ["Financial planning", "Budget items", "Procurement", "Contracts and suppliers"],
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "executive-center",
    name: "Executive Center",
    href: "executive-center",
    tone: "violet",
    family: "stratos",
    categoryCs: "Řízení portfolia",
    categoryEn: "Portfolio oversight",
    headlineCs: "Přehled pro odpovědná rozhodnutí.",
    headlineEn: "A clear view for accountable decisions.",
    summaryCs: "Aplikace rodiny STRATOS pro manažerský přehled, stav portfolia a podklady pro porady.",
    summaryEn: "A STRATOS application for management overview, portfolio status and meeting materials.",
    capabilitiesCs: ["Manažerský přehled", "Stav portfolia", "Podklady pro porady", "Dohledatelné souvislosti"],
    capabilitiesEn: ["Management overview", "Portfolio status", "Meeting materials", "Traceable context"],
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "projectflow",
    name: "ProjectFlow",
    href: "projectflow",
    tone: "violet",
    family: "stratos",
    categoryCs: "Realizace projektů",
    categoryEn: "Project delivery",
    headlineCs: "Od mandátu k řízené realizaci.",
    headlineEn: "From mandate to governed delivery.",
    summaryCs: "Samostatná aplikace rodiny STRATOS pro projektové fáze, úkoly a rozhodovací brány při realizaci projektů.",
    summaryEn: "A separate STRATOS application for project phases, tasks and stage gates during delivery.",
    capabilitiesCs: ["Projektové fáze", "Úkoly a odpovědnosti", "Rozhodovací brány", "Návaznost na mandát"],
    capabilitiesEn: ["Project phases", "Tasks and responsibilities", "Stage gates", "Mandate links"],
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "archflow",
    name: "ArchFlow",
    href: "archflow",
    tone: "violet",
    family: "stratos",
    categoryCs: "Potřeby a architektura",
    categoryEn: "Needs and architecture",
    headlineCs: "Potřeby a rozhodnutí na jednom místě.",
    headlineEn: "Needs and decisions in one place.",
    summaryCs: "Aplikace rodiny STRATOS pro evidenci potřeb a cílů, předpisů a rozhodnutí rady před navazující realizací.",
    summaryEn: "A STRATOS application for needs, goals, regulations and council decisions before delivery begins.",
    capabilitiesCs: ["Potřeby a cíle", "Předpisy a souvislosti", "Rozhodnutí rady", "Předání do realizace"],
    capabilitiesEn: ["Needs and goals", "Regulations and context", "Council decisions", "Handoff to delivery"],
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "akb",
    name: "AI Knowledge Base (AKB)",
    nameEn: "AI Knowledge Base (AKB)",
    href: "akb",
    tone: "violet",
    family: "stratos",
    categoryCs: "Řízené znalosti",
    categoryEn: "Governed knowledge",
    headlineCs: "Znalosti s dohledatelným původem a řízeným přístupem.",
    headlineEn: "Knowledge with traceable sources and governed access.",
    summaryCs: "Interní platforma pro zpracování dokumentů, správu verzí a vyhledávání odpovědí s odkazy na zdroje. Obsah prochází pravidly přístupu a schvalováním před zveřejněním.",
    summaryEn: "An internal platform for document processing, version management and answers linked to their sources. Access rules and review govern what can be published.",
    capabilitiesCs: ["Příjem a zpracování dokumentů", "Řízené verze a schvalování", "Vyhledávání s citacemi", "Přístup podle oprávnění"],
    capabilitiesEn: ["Document intake and processing", "Governed versions and review", "Search with citations", "Permission-based access"],
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "stratos",
    name: "STRATOS",
    href: "stratos",
    tone: "violet",
    family: "stratos",
    categoryCs: "Rodina aplikací",
    categoryEn: "Application family",
    headlineCs: "Rozhodnutí opřená o jednu pravdu.",
    headlineEn: "Decisions grounded in one source of truth.",
    summaryCs: "Rodina aplikací pro strategii, finance, realizaci projektů, architekturu a řízené znalosti. Jednotlivé aplikace mají vlastní účel a společné principy oprávnění a auditu.",
    summaryEn: "A family of applications for strategy, finance, project delivery, architecture and governed knowledge. Each has its own purpose and shares access and audit principles.",
    capabilitiesCs: ["Budget & Contract a Executive Center", "ProjectFlow", "ArchFlow", "AI Knowledge Base (AKB)"],
    capabilitiesEn: ["Budget & Contract and Executive Center", "ProjectFlow", "ArchFlow", "AI Knowledge Base (AKB)"],
    externalUrl: "https://stratos.zeleznalady.cz/",
    availabilityCs: "Soukromé nasazení",
    availabilityEn: "Private deployment"
  },
  {
    id: "kaloricke-tabulky",
    name: "Moje porce",
    href: "kaloricke-tabulky",
    tone: "lime",
    categoryCs: "Výživa",
    categoryEn: "Nutrition",
    headlineCs: "Od nákupu přes vaření až po zápis jídla.",
    headlineEn: "From shopping and cooking to logging your meals.",
    summaryCs: "Propojte vlastní recepty, domácí zásoby a nákupní seznam s jídelním deníkem. Začněte jedním zápisem a další části používejte podle potřeby.",
    summaryEn: "Connect your own recipes, pantry and shopping list with a food diary. Start by logging one meal and add other parts as you need them. The app currently uses primarily Czech.",
    capabilitiesCs: ["Deník jídla a vody", "Vlastní recepty a skutečné porce", "Domácí zásoby a nákupní seznam", "Uložené věrnostní karty a přehledy"],
    capabilitiesEn: ["Food and water diary", "Personal recipes and actual portions", "Pantry and shopping list", "Stored loyalty cards and insights"],
    externalUrl: "https://mojeporce.cz/",
    startUrl: "https://mojeporce.cz/domu",
    learnMoreUrl: "https://mojeporce.cz/o-aplikaci",
    availabilityCs: "Veřejná beta · základ zdarma · PWA",
    availabilityEn: "Public beta · free core features · PWA"
  }
];

/** Shared order for the homepage and bilingual games hub. */
export const games = ["nest", "sibenice", "mestem-hrou", "foldlight", "rinklet", "millora"].map(id => products.find(product => product.id === id)!);

/** Public services presented first on the bilingual homepage. */
export const everydayProducts = ["kaloricke-tabulky", "masaze", "studio-balance"].map(id => products.find(product => product.id === id)!);
