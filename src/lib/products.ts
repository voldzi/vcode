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
  /** Draft products are available only through the explicitly gated local preview. */
  publication?: "draft" | "published";
};

export const products: Product[] = [
  {
    id: "vcode-recall", name: "VCode Recall", href: "vcode-recall", tone: "azure",
    categoryCs: "Paměť projektů pro AI", categoryEn: "Project memory for AI",
    headlineCs: "Váš projekt. Jeho souvislosti. Na vašem Macu.",
    headlineEn: "Your project. Its context. On your Mac.",
    summaryCs: "macOS aplikace pro místní vyhledávání v dokumentaci a zdrojových souborech vybraných projektů. Připravuje kontext pro Codex a Claude Code přes MCP a ukazuje, zda jsou indexy aktuální a vyhledávání připravené.",
    summaryEn: "A macOS app for local retrieval across the documentation and source files of selected projects. It supplies context to Codex and Claude Code through MCP and shows whether indexes are current and retrieval is ready.",
    capabilitiesCs: ["Vyhledávání v místních projektech přes MCP", "Místní vyhledávání bez dalších instalací", "Výběr složek a přírůstková indexace", "Přehled připravenosti, odezvy a stavu indexů", "České a anglické rozhraní"],
    capabilitiesEn: ["Local project retrieval through MCP", "Local search without extra installations", "Folder selection and incremental indexing", "Retrieval readiness, latency and index status", "Czech and English interface"],
    availabilityCs: "Zdarma pro Apple Silicon · macOS 26+",
    availabilityEn: "Free for Apple Silicon · macOS 26+",
    publication: "published"
  },
  {
    id: "myslopis", name: "Myslopis", href: "myslopis", tone: "violet",
    categoryCs: "Sebepoznání", categoryEn: "Self-exploration",
    headlineCs: "Poznejte svoje souvislosti.", headlineEn: "Explore what connects you.",
    summaryCs: "Český web pro sebepoznání dospělých. Veřejný pilot nabízí dotazník IPIP-50, přehled pěti rozměrů osobnosti a PDF bez účtu. Pracovní české znění nemá doloženou českou validaci ani populační normy; výsledek není diagnóza.",
    summaryEn: "A Czech website for adult self-exploration. The public pilot offers IPIP-50, an overview of five personality dimensions and a PDF without an account. The working Czech wording has no documented Czech validation or population norms; the result is not a diagnosis.",
    capabilitiesCs: ["IPIP-50 pro dospělé od 18 let", "Přehled pěti rozměrů osobnosti", "Výsledek a PDF bez registrace", "Možnost smazat výsledek"],
    capabilitiesEn: ["IPIP-50 for adults aged 18 and over", "An overview of five personality dimensions", "Results and PDF without registration", "Option to delete the result"],
    externalUrl: "https://myslopis.cz/",
    availabilityCs: "Veřejný pilot v češtině", availabilityEn: "Public pilot in Czech"
  },
  {
    id: "stratos-voice", name: "STRATOS Voice", href: "stratos-voice", tone: "violet", family: "stratos", inDevelopment: true,
    categoryCs: "Záznam a přepis", categoryEn: "Recording and transcription",
    headlineCs: "Záznam, přepis a chytré úpravy.", headlineEn: "Record, transcribe and refine.",
    summaryCs: "iOS aplikace pro nahrávání jednání, místní český přepis a pohodlné čtení v iPhonu. Volitelnou kontrolu textu pomocí vlastní nebo organizační AI spouštíte sami a změny přijímáte do nové revize.",
    summaryEn: "An iOS app for recording meetings, local Czech transcription and comfortable reading on iPhone. You choose when to request a review with personal or organisational AI and accept changes into a new revision.",
    capabilitiesCs: ["Nahrávání a místní přepis bez účtu", "Hledání, čtení a sdílení TXT/PDF nebo audia", "Volitelná kontrola textu s vlastní či organizační AI", "Původní přepis a historie revizí"],
    capabilitiesEn: ["Recording and local transcription without an account", "Search, reading and TXT/PDF or audio sharing", "Optional text review with personal or organisational AI", "Original transcript and revision history"],
    availabilityCs: "Připravujeme pro App Store", availabilityEn: "Preparing for the App Store"
  },
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
    id: "foldlight", name: "Foldlight", href: "foldlight", tone: "forest", kind: "game",
    categoryCs: "Světelná hříčka", categoryEn: "Light puzzle",
    headlineCs: "Rozevřete telefon. Nechte světlo rozkvést.", headlineEn: "Open your phone. Let the light bloom.",
    summaryCs: "Dvanáct světelných hlavolamů pro iPhone a iPad. Veďte paprsek přes zrcadla a nechte květiny rozkvést. Hrajte dotykem; na podporovaném iPhonu Duo můžete cestu světla měnit přehybem a náklonem.",
    summaryEn: "Twelve light puzzles for iPhone and iPad. Guide a beam through mirrors and let the flowers bloom. Play by touch, or use folding and tilt to change the light’s path on a supported iPhone Duo.",
    capabilitiesCs: ["Tři ukázky: ohyb, odraz a větvení světla", "Světlo probouzí květiny", "Dotykové ovládání na iPhonu a iPadu", "Dvanáct hlavolamů k prozkoumání"],
    capabilitiesEn: ["Three demonstrations: folding, reflection and branching light", "Light wakes the flowers", "Touch controls on iPhone and iPad", "Twelve puzzles to explore"],
    availabilityCs: "Dostupné v App Storu pro iPhone a iPad", availabilityEn: "Available on the App Store for iPhone and iPad"
  },
  {
    id: "rinklet", name: "Rinklet", href: "rinklet", tone: "cyan", kind: "game",
    categoryCs: "Stolní hokej", categoryEn: "Table hockey",
    headlineCs: "Malý stůl. Rychlá odveta.", headlineEn: "A small table. A quick rematch.",
    summaryCs: "Stolní hokej pro iPhone a iPad. Zahrajte si proti počítači, vyzvěte druhého hráče na jednom zařízení nebo soupeře přes Game Center. Rozdělené ovládání ponechá celý stůl na očích nad plochou pro prst.",
    summaryEn: "Air hockey for iPhone and iPad. Play the computer, challenge a second player on one device or find an opponent through Game Center. Split controls keep the whole rink in view above a separate touch surface.",
    capabilitiesCs: ["Soupeř se třemi obtížnostmi", "Dva hráči na jednom zařízení", "Trénink a místní hra offline", "Stůl a ovladač na oddělených plochách"],
    capabilitiesEn: ["Computer opponent with three difficulty levels", "Two players on one device", "Practice and offline local play", "Separate rink and controller surfaces"],
    availabilityCs: "Dostupné v App Storu pro iPhone a iPad", availabilityEn: "Available on the App Store for iPhone and iPad"
  },
  {
    id: "millora", name: "MILLORA — Mlýn", nameEn: "MILLORA — Nine Men's Morris", href: "millora", tone: "amber", kind: "game", inDevelopment: true,
    categoryCs: "Desková strategie", categoryEn: "Board strategy",
    headlineCs: "Devět kamenů. Spousta možností.", headlineEn: "Nine pieces. Many possibilities.",
    summaryCs: "Moderní zpracování klasického Mlýna pro iPhone, iPad a Apple TV. Pokládejte a posouvejte kameny, uzavírejte mlýny a promýšlejte další tah.",
    summaryEn: "A modern take on Nine Men's Morris for iPhone, iPad and Apple TV. Place and move pieces, form mills and think ahead.",
    capabilitiesCs: ["Klasická pravidla Mlýna", "Čtyři úrovně místního soupeře", "Dva hráči na jednom zařízení", "Interaktivní lekce a trénink", "Volitelné tahové hraní přes Game Center", "11 jazyků a volba materiálového tématu", "Vypnutí odlesků, zvuku a haptiky"],
    capabilitiesEn: ["Classic Nine Men's Morris rules", "Four levels of on-device opponent", "Two players on one device", "Interactive lessons and practice", "Optional turn-based play through Game Center", "11 languages and selectable material themes", "Optional reflections, sound and haptics"],
    availabilityCs: "Připravujeme pro App Store", availabilityEn: "Coming to the App Store"
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
    id: "apsyd-central", name: "APSYD Central", href: "apsyd-central", tone: "teal",
    categoryCs: "Koordinace pracovišť", categoryEn: "Site coordination",
    headlineCs: "Společný přehled pro řízenou síť pracovišť.",
    headlineEn: "A shared overview for a governed network of sites.",
    summaryCs: "Centrální aplikace ekosystému APSYD pro registr pracovišť, dohled nad dostupností a čerstvostí synchronizace a řízené sdílení verzí vyšetřovacích protokolů. Určená oprávněným správcům v soukromém zdravotnickém nasazení.",
    summaryEn: "The central application in the APSYD ecosystem for the site registry, availability and synchronisation freshness monitoring, and governed sharing of assessment protocol versions. Intended for authorised administrators in a private healthcare deployment.",
    capabilitiesCs: ["Registr a koordinace pracovišť", "Dohled nad stavem a synchronizací", "Řízený katalog vyšetřovacích protokolů", "Souhrnné provozní přehledy a audit"],
    capabilitiesEn: ["Site registry and coordination", "Status and synchronisation monitoring", "Governed assessment protocol catalogue", "Aggregate operational overviews and audit"],
    availabilityCs: "Soukromé zdravotnické nasazení",
    availabilityEn: "Private healthcare deployment"
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
    capabilitiesCs: ["Živá situační mapa", "Hlášení z terénu", "Poloha z telefonu a upozornění", "Bezpečný chat a hovory"],
    capabilitiesEn: ["Live situation map", "Field reporting", "Phone location and alerts", "Secure chat and calls"],
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
    headlineCs: "Každé písmeno vás přiblíží.",
    headlineEn: "Every letter brings you closer.",
    summaryCs: "Česká slovní hra pro iPhone a iPad. Odkrývejte písmena a překonejte svůj nejlepší čas. Představujeme také připravovanou aktualizaci pro rodiny a dva hráče; verzi pro Apple TV připravujeme.",
    summaryEn: "A Czech word game for iPhone and iPad. Reveal the letters and beat your best time. Explore the upcoming update for families and two players; an Apple TV version is in preparation.",
    capabilitiesCs: ["Tři obtížnosti, režim Slovesa a časomíra", "České slovníky a výsledky v Game Center", "Připravovaná aktualizace pro rodiny a dva hráče", "Připravovaná verze pro Apple TV"],
    capabilitiesEn: ["Three difficulties, Verbs mode and a timer", "Czech word lists and Game Center results", "Upcoming update for families and two players", "Apple TV version in preparation"],
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
    headlineCs: "Procházka, která má příběh.",
    headlineEn: "A walk with a story.",
    summaryCs: "Bezplatné příběhové výpravy v telefonu. Najdi místo, všimni si detailu a pokračuj v příběhu. Bez povinného účtu a instalace.",
    summaryEn: "Free outdoor story games on your phone. Find a place, notice a detail and follow the story. No account or installation required. Selected games are available in English.",
    capabilitiesCs: ["Výpravy po městech a obcích", "Otázky na jednotlivých zastaveních", "Příběhy a tajenky", "Hra zdarma bez povinného účtu"],
    capabilitiesEn: ["Story trails across Czechia", "Questions at each stop", "Clues and story reveals", "Free play without an account"],
    externalUrl: "https://mestemhrou.cz/mestem-hrou/",
    externalUrlEn: "https://mestemhrou.cz/mestem-hrou/?lang=en",
    availabilityCs: "Veřejná beta na webu",
    availabilityEn: "Public beta on the web"
  },
  {
    id: "masaze",
    name: "Masáže",
    href: "masaze",
    tone: "coral",
    categoryCs: "Rezervace a správa masérny",
    categoryEn: "Massage booking and practice management",
    headlineCs: "Rezervace, klienti a provoz masérny přehledně.",
    headlineEn: "Keep bookings, clients and your practice organised.",
    summaryCs: "Kalendář, klienti, doklady a finanční přehledy na jednom místě. Webové rezervace a správa na telefonu i počítači; řešení pro vaši provozovnu po domluvě.",
    summaryEn: "Schedules, clients, documents and financial overviews in one place. Web bookings and management on a phone or computer, with setup for your practice by arrangement.",
    capabilitiesCs: ["Kalendář a rezervace", "Karty klientů a poznámky", "Doklady, příjmy a výdaje", "Nápověda podle situace"],
    capabilitiesEn: ["Schedules and bookings", "Client records and notes", "Documents, income and expenses", "Help for everyday tasks"],
    externalUrl: "https://masaze.zeleznalady.cz/",
    availabilityCs: "V provozu",
    availabilityEn: "Live"
  },
  {
    id: "studio-balance",
    name: "Studio Balance",
    href: "studio-balance",
    tone: "balance",
    categoryCs: "Rezervace a správa studia",
    categoryEn: "Studio booking and management",
    headlineCs: "Rezervace a správa vašeho studia.",
    headlineEn: "Booking and management for your studio.",
    summaryCs: "Web, rozvrh, rezervace a docházka pro pohybová studia. Běžné změny i měsíční přehled instruktorů na jednom místě; vlastní podoba a zavedení po domluvě.",
    summaryEn: "A website, class schedule, bookings and attendance for movement studios. Manage everyday changes and monthly instructor reports in one place, with branding and setup agreed for your studio.",
    capabilitiesCs: ["Rozvrh a rezervace", "Změny ceny a kapacity", "Docházka a výkaz instruktorů", "Vlastní podoba po domluvě"],
    capabilitiesEn: ["Schedules and bookings", "Pricing and capacity changes", "Attendance and instructor reports", "Branding by arrangement"],
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
    capabilitiesCs: ["Budget & Contract a Executive Center", "ProjectFlow a ArchFlow", "AI Knowledge Base (AKB)", "STRATOS Voice pro iPhone"],
    capabilitiesEn: ["Budget & Contract and Executive Center", "ProjectFlow and ArchFlow", "AI Knowledge Base (AKB)", "STRATOS Voice for iPhone"],
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
    summaryCs: "Propojte vlastní recepty, domácí zásoby a nákupní seznam s jídelním deníkem. Začněte jedním zápisem a další části používejte podle potřeby. Vedle webu připravujeme aplikace pro iPhone, iPad a Apple Watch.",
    summaryEn: "Connect your own recipes, pantry and shopping list with a food diary. Start by logging one meal and add other parts as you need them. The app currently uses primarily Czech. Apps for iPhone, iPad and Apple Watch are in preparation alongside the web app.",
    capabilitiesCs: ["Deník jídla a vody", "Vlastní recepty a skutečné porce", "Domácí zásoby a nákupní seznam", "Uložené věrnostní karty a přehledy"],
    capabilitiesEn: ["Food and water diary", "Personal recipes and actual portions", "Pantry and shopping list", "Stored loyalty cards and insights"],
    externalUrl: "https://mojeporce.cz/",
    startUrl: "https://mojeporce.cz/domu",
    learnMoreUrl: "https://mojeporce.cz/o-aplikaci",
    availabilityCs: "Webová beta · iOS a Apple Watch připravujeme",
    availabilityEn: "Web beta · iOS and Apple Watch in preparation"
  }
];

/** Only this subset may feed public routes, discovery metadata or public APIs. */
export function getPublicProducts(): Product[] {
  return products.filter(product => product.publication !== "draft");
}

/** Shared order for the homepage and bilingual games hub. */
export const games = ["nest", "sibenice", "mestem-hrou", "foldlight", "rinklet", "millora"].map(id => getPublicProducts().find(product => product.id === id)).filter((product): product is Product => Boolean(product));

/** Public services presented first on the bilingual homepage. */
export const everydayProducts = ["kaloricke-tabulky", "masaze", "studio-balance"].map(id => getPublicProducts().find(product => product.id === id)).filter((product): product is Product => Boolean(product));
