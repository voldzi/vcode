type CopyItem = readonly [title: string, text: string];

export type JizdaScreenshot = {
  src: string;
  preview: string;
  width: number;
  height: number;
  titleCs: string;
  titleEn: string;
  captionCs: string;
  captionEn: string;
};

// Authentic upcoming-version UI with fictional records, supplied by the source owner.
// Public release approval is separate from this local presentation preparation.
export const jizdaScreenshots: JizdaScreenshot[] = [
  {
    src: "/images/jizda/iphone-01-rides-ec575d2e160b.webp",
    preview: "/images/jizda/iphone-01-rides-ec575d2e160b-preview.webp",
    width: 1206, height: 2622,
    titleCs: "Cesty pohromadě", titleEn: "Journeys together",
    captionCs: "Připravovaný přehled jízd s ukázkovými záznamy.",
    captionEn: "The upcoming journey overview with demonstration records."
  },
  {
    src: "/images/jizda/iphone-02-vehicles-fa9c2e4c2702.webp",
    preview: "/images/jizda/iphone-02-vehicles-fa9c2e4c2702-preview.webp",
    width: 1206, height: 2622,
    titleCs: "Vozidla pro vaše cesty", titleEn: "Vehicles for your journeys",
    captionCs: "Připravovaný seznam vozidel se smyšlenými ukázkovými údaji.",
    captionEn: "The upcoming vehicle list with fictional demonstration details."
  },
  {
    src: "/images/jizda/iphone-03-passengers-77f48182a2f0.webp",
    preview: "/images/jizda/iphone-03-passengers-77f48182a2f0-preview.webp",
    width: 1206, height: 2622,
    titleCs: "Přehled cestujících", titleEn: "Passengers at a glance",
    captionCs: "Připravovaný seznam cestujících s fiktivními osobami.",
    captionEn: "The upcoming passenger list with fictional people."
  },
  {
    src: "/images/jizda/ipad-01-rides-193ba6b851ad.webp",
    preview: "/images/jizda/ipad-01-rides-193ba6b851ad-preview.webp",
    width: 2064, height: 2752,
    titleCs: "Více prostoru na iPadu", titleEn: "More room on iPad",
    captionCs: "Připravované rozhraní pro iPad s ukázkovými jízdami.",
    captionEn: "The upcoming iPad interface with demonstration journeys."
  }
];

type JizdaCopy = {
  eyebrow: string;
  headline: string;
  intro: string;
  explore: string;
  available: string;
  preparing: string;
  mapNote: string;
  visualTitle: string;
  visualItems: CopyItem[];
  facts: CopyItem[];
  featuresTitle: string;
  featuresIntro: string;
  features: CopyItem[];
  workflowTitle: string;
  workflow: CopyItem[];
  guideAction: string;
  upcomingEyebrow: string;
  upcomingTitle: string;
  upcomingIntro: string;
  upcoming: CopyItem[];
  galleryTitle: string;
  galleryIntro: string;
  galleryNotice: string;
  galleryLanguageNote: string;
  imageAction: string;
  faqTitle: string;
  faq: CopyItem[];
  helpTitle: string;
  help: CopyItem[];
  contactTitle: string;
  contactText: string;
  contactAction: string;
};

// Current public App Store capabilities and upcoming source-team work are separate.
export const jizdaCopy: Record<"cs" | "en", JizdaCopy> = {
  cs: {
    eyebrow: "Jízdy, vozidla a náklady",
    headline: "Vaše cesty. Vše podstatné pohromadě.",
    intro: "Zaznamenejte cestu, přiřaďte vozidlo a cestující a doplňte výdaje. Jízda promění jednotlivé záznamy v přehled, ke kterému se můžete vracet.",
    explore: "Prohlédnout možnosti",
    available: "Dostupné pro iPhone, iPad a Apple Watch",
    preparing: "Připravujeme pro App Store",
    mapNote: "Mapové zobrazení a navigace v dostupné aplikaci jsou experimentální.",
    visualTitle: "Vaše cesta v souvislostech",
    visualItems: [
      ["Cesta", "Záznam pomocí GPS nebo ruční doplnění"],
      ["Vozidlo a cestující", "Komu a k čemu cesta patřila"],
      ["Výdaje a přehled", "Podklady pro vaše vlastní záznamy"]
    ],
    facts: [
      ["GPS i ruční zápis", "Vyberte způsob evidence své cesty"],
      ["Vozidla a cestující", "Souvislosti u každé jízdy"],
      ["Přehled a export", "Záznamy, se kterými můžete dál pracovat"]
    ],
    featuresTitle: "Od první cesty k užitečnému přehledu.",
    featuresIntro: "V aplikaci dostupné v App Storu najdete základ pro každodenní evidenci jízd. Trasy, náklady a související údaje zůstávají pohromadě.",
    features: [
      ["Záznam podle vás", "Jízdu zaznamenejte pomocí GPS nebo ji přidejte ručně. Pro GPS záznam aplikace potřebuje odpovídající oprávnění k poloze."],
      ["Vozidlo i cestující u každé cesty", "Přiřaďte k jízdě vozidlo a cestující. Při pozdější kontrole tak máte důležité souvislosti přímo u záznamu."],
      ["Výdaje, které patří k provozu", "Evidujte tankování, servis a další výdaje. Vedle cest si udržíte také přehled o nákladech na vozidlo."],
      ["Statistiky místo procházení poznámek", "Prohlédněte si souhrny evidovaných jízd a nákladů. Snáze se vrátíte k tomu, jak své vozidlo používáte."],
      ["Podklady pro další práci", "Své záznamy můžete exportovat a použít pro vlastní evidenci. Důležité údaje před dalším použitím zkontrolujte."],
      ["Také na Apple Watch", "Součástí aplikace je také verze pro Apple Watch. Mapové zobrazení a navigace jsou experimentální; při řízení se vždy řiďte skutečnou situací a dopravním značením."]
    ],
    workflowTitle: "Jedna cesta, tři jednoduché kroky.",
    workflow: [
      ["Připravíte záznam", "Vyberete vozidlo a cestující. Ještě před vyjetím nastavíte vše potřebné pro záznam pomocí GPS."],
      ["Zaznamenáte cestu", "Použijete GPS záznam nebo cestu doplníte ručně. Aplikaci ovládejte před cestou nebo po bezpečném zastavení."],
      ["Doplníte souvislosti", "Po příjezdu zkontrolujete jízdu a přidáte potřebné údaje a výdaje. Přehled a export máte k dispozici pro další práci."]
    ],
    guideAction: "První nastavení krok za krokem",
    upcomingEyebrow: "Co připravujeme",
    upcomingTitle: "Jízda s širšími možnostmi.",
    upcomingIntro: "Na další verzi pracujeme. Dostupnost následujících rozšíření oznámíme po jejich vydání.",
    upcoming: [
      ["Vlastní i sdílená vozidla COP", "Připravujeme společné prostředí pro osobní vozidla a vozidla sdílená přes COP, s evidencí tankování, nabíjení a servisu. Organizační možnosti budou záviset na vašem přístupu a oprávněních."],
      ["Navigace propojená s COP", "Rozvíjíme navigaci využívající dostupné trasy COP s náhradní trasou od Apple. Dopravní informace závisejí na pokrytí a aktuálnosti zdroje."],
      ["Volitelná komunikace COP", "Připravujeme propojení s komunikací COP pro uživatele, kteří ji chtějí využít a mají odpovídající účet."],
      ["CarPlay", "CarPlay je ve vývoji a vyžaduje schválení Apple. Zatím není dostupné."]
    ],
    galleryTitle: "Nahlédněte do připravované verze.",
    galleryIntro: "Nové rozhraní na iPhonu a iPadu. Kliknutím otevřete celý snímek a prohlédnete si podrobnosti.",
    galleryNotice: "Ukázkové jízdy, vozidla a cestující. Nové rozhraní se připravuje; osoby a údaje na snímcích jsou smyšlené.",
    galleryLanguageNote: "",
    imageAction: "Otevřít celý obrázek",
    faqTitle: "Než vyrazíte",
    faq: [
      ["Jaký je rozdíl mezi dostupnou a připravovanou aplikací?", "V App Storu je dostupná evidence jízd, vozidel, cestujících a výdajů, statistiky a exporty. Rozšířené propojení s COP a CarPlay připravujeme; termín jejich vydání zatím neuvádíme."],
      ["Musím každou jízdu zaznamenávat pomocí GPS?", "Ne. Cesty můžete evidovat také ručně. Pro GPS záznam je potřeba povolit polohu; potřebný rozsah oprávnění závisí na tom, jak aplikaci používáte."],
      ["Je záznam cesty vždy úplný?", "Záznam závisí na dostupnosti polohy, oprávněních a nastavení zařízení. Po jízdě zkontrolujte uložené údaje a případně je doplňte."],
      ["Potřebuji účet COP?", "Pro základní evidenci osobních jízd účet COP nepotřebujete. Připravované organizační funkce a komunikace COP budou vyžadovat odpovídající přístup."],
      ["Mohu už používat CarPlay?", "Zatím ne. CarPlay je ve vývoji a vyžaduje schválení Apple. V dostupné aplikaci jsou mapové zobrazení a navigace experimentální."]
    ],
    helpTitle: "Pomoc, když ji potřebujete.",
    help: [
      ["Návody", "První nastavení a přehled běžného používání."],
      ["Podpora", "Pomoc s aplikací a kontakt na náš tým."],
      ["Soukromí", "Jak Jízda pracuje s vašimi údaji."],
      ["Podmínky používání", "Důležité informace pro bezpečné používání."]
    ],
    contactTitle: "Dává Jízda smysl i pro váš projekt?",
    contactText: "Napište nám, jak evidujete cesty a co potřebujete zlepšit. Můžeme společně projít možnosti spolupráce.",
    contactAction: "Probrat spolupráci"
  },
  en: {
    eyebrow: "Journeys, vehicles and expenses",
    headline: "Your journeys. The details together.",
    intro: "Record a journey, assign a vehicle and passengers, and add expenses. Jízda brings individual records into an overview you can return to.",
    explore: "Explore the features",
    available: "Available for iPhone, iPad and Apple Watch",
    preparing: "Preparing for the App Store",
    mapNote: "The available app’s map display and navigation are experimental.",
    visualTitle: "Your journey in context",
    visualItems: [
      ["Journey", "GPS recording or a manual entry"],
      ["Vehicle and passengers", "Who and what the journey was for"],
      ["Expenses and overview", "Records for your own use"]
    ],
    facts: [
      ["GPS or manual entry", "Choose how to record your journey"],
      ["Vehicles and passengers", "Context for each journey"],
      ["Overview and export", "Records you can work with"]
    ],
    featuresTitle: "From your first journey to a useful overview.",
    featuresIntro: "The app available on the App Store provides the essentials for everyday journey logging. Routes, expenses and related details stay together.",
    features: [
      ["Record your way", "Record a journey using GPS or add it manually. GPS recording requires the appropriate location permission."],
      ["A vehicle and passengers for each journey", "Assign a vehicle and passengers to a journey. Its important context is there when you review the record later."],
      ["Vehicle expenses together", "Log fuel, servicing and other expenses. Keep an overview of vehicle costs alongside your journeys."],
      ["Statistics instead of searching through notes", "Explore summaries of your recorded journeys and expenses. See how you use your vehicle without checking each record individually."],
      ["Records for further use", "Export your records for your own logs. Check important details before using them elsewhere."],
      ["Also on Apple Watch", "An Apple Watch version is included with the app. Map display and navigation are experimental; when driving, always follow the actual road conditions and signs."]
    ],
    workflowTitle: "One journey, three simple steps.",
    workflow: [
      ["Prepare the record", "Choose your vehicle and passengers. Set up everything needed for GPS recording before you leave."],
      ["Record the journey", "Use GPS recording or add the journey manually. Operate the app before travelling or after stopping safely."],
      ["Add the context", "After arriving, review the journey and add the details and expenses you need. Use the overview and export for your next task."]
    ],
    guideAction: "First-time setup, step by step",
    upcomingEyebrow: "In preparation",
    upcomingTitle: "More possibilities for Jízda.",
    upcomingIntro: "We are working on the next version. We will announce the availability of these additions after their release.",
    upcoming: [
      ["Personal and COP shared vehicles", "We are preparing one environment for personal vehicles and vehicles shared through COP, with fuel, charging and servicing records. Organisational features will depend on your access and permissions."],
      ["Navigation connected to COP", "We are developing navigation using available COP routes with an alternative route from Apple. Traffic information depends on the source’s coverage and freshness."],
      ["Optional COP communication", "We are preparing a connection to COP communication for users who want to use it and have the appropriate account."],
      ["CarPlay", "CarPlay is in development and requires Apple approval. It is not yet available."]
    ],
    galleryTitle: "Explore the upcoming version.",
    galleryIntro: "The new interface on iPhone and iPad. Open any image at full size to see the details.",
    galleryNotice: "Demonstration journeys, vehicles and passengers. The new interface is in preparation; the people and details shown are fictional.",
    galleryLanguageNote: "The images show the app’s Czech interface.",
    imageAction: "Open the full-size image",
    faqTitle: "Before you set off",
    faq: [
      ["What is available now, and what is in preparation?", "Journey, vehicle, passenger and expense logging, statistics and exports are available on the App Store. Extended COP integration and CarPlay are in preparation; we are not announcing a release date yet."],
      ["Do I have to record every journey using GPS?", "No. You can also enter journeys manually. GPS recording requires location access; the scope of permission needed depends on how you use the app."],
      ["Is the journey record always complete?", "Recording depends on location availability, permissions and device settings. Review the saved details after a journey and add anything that is missing."],
      ["Do I need a COP account?", "You do not need a COP account for basic personal journey logging. The upcoming organisational features and COP communication will require the appropriate access."],
      ["Can I use CarPlay yet?", "Not yet. CarPlay is in development and requires Apple approval. The available app’s map display and navigation are experimental."]
    ],
    helpTitle: "Help when you need it.",
    help: [
      ["Guides", "First-time setup and everyday use."],
      ["Support", "Help with the app and contact details for our team."],
      ["Privacy", "How Jízda handles your data."],
      ["Terms of use", "Important information for safe use."]
    ],
    contactTitle: "Could Jízda help with your project?",
    contactText: "Tell us how you log journeys and what you would like to improve. We can explore possibilities for working together.",
    contactAction: "Discuss collaboration"
  }
};
