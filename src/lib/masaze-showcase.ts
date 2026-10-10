export type MasazeScreenshot = {
  src: string;
  preview: string;
  width: number;
  height: number;
  titleCs: string;
  titleEn: string;
  captionCs: string;
  captionEn: string;
};

// Actual app captures with fictional records; source and output hashes are in docs.
export const masazeScreenshots: MasazeScreenshot[] = [
  {
    src: "/images/masaze/01-kalendar-tyden-f58988ae85ad.webp",
    preview: "/images/masaze/01-kalendar-tyden-f58988ae85ad-preview.webp",
    width: 1440,
    height: 1000,
    titleCs: "Váš pracovní den na první pohled",
    titleEn: "Your working day at a glance",
    captionCs: "Rezervace a volné časy v jednom kalendáři.",
    captionEn: "Appointments and available times in one calendar."
  },
  {
    src: "/images/masaze/05-karta-klientky-4f1db27300d6.webp",
    preview: "/images/masaze/05-karta-klientky-4f1db27300d6-preview.webp",
    width: 1440,
    height: 1000,
    titleCs: "Klienta příště snadno poznáte",
    titleEn: "Pick up where you left off",
    captionCs: "Přehled návštěv a vaše poznámky na kartě klienta.",
    captionEn: "Visit history and your own notes on a client’s card."
  },
  {
    src: "/images/masaze/06-doklady-7b503ffe1320.webp",
    preview: "/images/masaze/06-doklady-7b503ffe1320-preview.webp",
    width: 1440,
    height: 1000,
    titleCs: "Doklady, které znovu najdete",
    titleEn: "Documents you can find again",
    captionCs: "Nákupní doklady přehledně podle dodavatele a kategorií.",
    captionEn: "Purchase documents organised by supplier and category."
  },
  {
    src: "/images/masaze/07-finance-4fd0ab6129c3.webp",
    preview: "/images/masaze/07-finance-4fd0ab6129c3-preview.webp",
    width: 1440,
    height: 1000,
    titleCs: "Příjmy a výdaje pohromadě",
    titleEn: "Income and expenses together",
    captionCs: "Přijaté platby, zaplacené výdaje a doklady na jednom místě.",
    captionEn: "Received payments, paid expenses and supporting documents in one place."
  },
  {
    src: "/images/masaze/08-pruvodce-fcf475ce821c.webp",
    preview: "/images/masaze/08-pruvodce-fcf475ce821c-preview.webp",
    width: 1440,
    height: 1000,
    titleCs: "Pomoc podle vaší situace",
    titleEn: "Help for the task at hand",
    captionCs: "Krátký průvodce podle toho, co právě potřebujete zařídit.",
    captionEn: "Short guidance for what you need to do next."
  },
  {
    src: "/images/masaze/03-kalendar-telefon-17bb4677d325.webp",
    preview: "/images/masaze/03-kalendar-telefon-17bb4677d325-preview.webp",
    width: 390,
    height: 844,
    titleCs: "Přehled také na telefonu",
    titleEn: "Your schedule on your phone",
    captionCs: "Denní plán a volné časy po ruce i na menším displeji.",
    captionEn: "Your daily schedule and available times on a smaller screen."
  }
];

export const masazeCopy = {
  cs: {
    eyebrow: "Rezervace, klienti a provoz masérny",
    headline: "Méně přepisování. Více času na klienty.",
    intro: "Naplánujte návštěvy, uložte poznámky a zaznamenejte platby na jednom místě. S přehledem o dnešku i podklady na konec roku.",
    action: "Domluvit nezávaznou ukázku",
    actionNote: "Projdeme váš způsob práce a potřeby vaší provozovny.",
    explore: "Prohlédnout možnosti správy",
    arrangement: "Aplikace vznikla pro každodenní provoz skutečné masérny. Podobu a zavedení pro vaši provozovnu domluvíme individuálně.",
    facts: [["Váš pracovní den", "Objednaní klienti i volné časy"], ["Bez dvojího zápisu", "Platby u návštěvy i ve financích"], ["Vaše provozovna", "Podoba a zavedení po domluvě"]],
    featuresTitle: "Od první rezervace po konec roku.",
    featuresIntro: "Běžné situace zvládnete přehledně, bez hledání v poznámkách a přepisování mezi několika místy.",
    features: [
      ["Kalendář, ve kterém se vyznáte", "Vidíte objednané klienty i volné časy. Přepnete den, týden nebo měsíc a při telefonátu objednáte klienta rovnou na domluvený čas."],
      ["Poznámky pro příští návštěvu", "U klienta dohledáte kontakt, přehled návštěv a vlastní poznámky. Snadno si připomenete jeho preference a navážete na předchozí návštěvu."],
      ["Doklady bez dlouhého hledání", "Účtenku vyfotíte nebo nahrajete. AI může pomoci přečíst údaje; před potvrzením je zkontrolujete podle originálu. Doklady najdete podle dodavatele, čísla nebo názvu."],
      ["Platbu nezapisujete podruhé", "Platba uložená u návštěvy se objeví také ve finančním přehledu. Další úhrady a výdaje doplníte zvlášť a propojíte s doklady."],
      ["Pomoc, když ji potřebujete", "Krátká vysvětlení a průvodce vás provedou běžnými situacemi. Volitelný AI pomocník může vysvětlení rozšířit; změny za vás neukládá ani nepotvrzuje."],
      ["Pracovní plán i na telefonu", "K plánu se dostanete také z telefonu nebo tabletu. Na menším displeji zobrazíte jeden den a otevřete konkrétní návštěvu."]
    ],
    galleryTitle: "Nahlédněte do správy masérny.",
    galleryIntro: "Kalendář, klienti, doklady i finance. Kliknutím otevřete celý obrázek a prohlédnete si podrobnosti.",
    galleryNotice: "Osoby, rezervace, dodavatelé a částky na obrázcích jsou smyšlené ukázkové údaje.",
    imageAction: "Otevřít celý obrázek",
    heroCaption: "Rezervace a volné časy · ukázková data",
    workflowTitle: "Běžný den v několika krocích.",
    workflow: [
      ["Domluvíte návštěvu", "V kalendáři vyberete volný čas a uložíte rezervaci klienta."],
      ["Navážete na předchozí péči", "Na kartě klienta si připomenete návštěvy a vlastní poznámky."],
      ["Zapíšete přijatou platbu", "Platbu uložíte u návštěvy. Ve finančním přehledu se objeví automaticky."]
    ],
    guideAction: "Jednoduchý průvodce správou masérny",
    eetEyebrow: "Co připravujeme",
    eetTitle: "EET připravujeme.",
    eetText: "Platby už evidujete v aplikaci. Přímé odesílání do EET připravujeme a nyní zkoušíme mimo běžný provoz. Nejde zatím o zapnutou evidenci tržeb pro finanční správu.",
    eetPlan: "Cílem je, aby po dokončení běžné přijetí platby nevyžadovalo další přepisování. Termín zapnutí zatím neslibujeme.",
    faqTitle: "Než si domluvíme ukázku",
    faq: [
      ["Pro koho je aplikace vhodná?", "Pro maséry a menší provozovny, které chtějí mít rezervace, klienty, doklady a finance na jednom místě. Na ukázce ověříme, jak odpovídá vašemu způsobu práce."],
      ["Může mít aplikace podobu mé provozovny?", "Podobu, obsah a rozsah řešení pro vaši provozovnu domluvíme individuálně. Při ukázce projdeme, co potřebujete a co pro vás dává smysl."],
      ["Je finanční přehled plnohodnotné účetnictví?", "Slouží k evidenci příjmů, výdajů a podkladů na konec roku, především pro neplátce DPH se skutečnými výdaji. Podklady si můžete stáhnout. Aplikace za vás nepodává daňové přiznání."],
      ["Co dělá AI pomocník?", "Může pomoci přečíst údaje z dokladu nebo rozšířit vysvětlení. Údaje i změny kontrolujete a potvrzujete vy. Nákupní doklad sám o sobě neznamená, že jste ho už zaplatili."],
      ["Je už odesílání do EET zapnuté?", "Ne. Běžné přijaté platby se nyní finanční správě neodesílají. Přímé odesílání připravujeme a zkoušíme odděleně od běžného provozu."]
    ],
    referenceEyebrow: "Aplikace v praxi",
    referenceTitle: "Vzniklo pro Masáže Železná Lady.",
    referenceText: "Na veřejném webu se podívejte na nabídku služeb a rezervaci z pohledu klienta. Správu provozovny vám ukážeme při domluvené ukázce.",
    referenceAction: "Prohlédnout klientský web",
    contactEyebrow: "Vaše masérna a VCode",
    contactTitle: "Chcete podobný přehled pro svou masérnu?",
    contactText: "Domluvme si nezávaznou ukázku. Projdeme společně, jak pracujete, co potřebujete a co pro vaši provozovnu dává smysl.",
    contactAction: "Domluvit ukázku"
  },
  en: {
    eyebrow: "Bookings, clients and massage practice management",
    headline: "Less repeated work. More time for your clients.",
    intro: "Plan appointments, keep notes and record payments in one place. Stay on top of today’s work and keep your year-end records to hand.",
    action: "Arrange a no-obligation demo",
    actionNote: "We’ll discuss how you work and what your practice needs.",
    explore: "Explore practice management",
    arrangement: "Built for the daily work of a real massage practice. We agree on the look and setup for your practice individually.",
    facts: [["Your working day", "Booked clients and available times"], ["No duplicate entry", "Visit payments in your financial overview"], ["Your practice", "Branding and setup by arrangement"]],
    featuresTitle: "From the first booking to year-end records.",
    featuresIntro: "Handle everyday tasks without searching through scattered notes or entering the same information in several places.",
    features: [
      ["A calendar you can follow", "See booked clients and available times. Switch between day, week and month views, and book a client straight into the agreed slot when they call."],
      ["Notes for the next visit", "Find a client’s contact details, visit history and your own notes together. Recall their preferences and pick up where you left off."],
      ["Documents without the searching", "Photograph or upload a receipt. AI can help read its details; check them against the original before confirming. Find documents by supplier, number or name."],
      ["Record each payment once", "A payment saved against a visit also appears in the financial overview. Record other payments received and expenses separately and link them to supporting documents."],
      ["Help when you need it", "Short explanations and a guide walk you through everyday tasks. An optional AI assistant can expand the explanation; it does not save or confirm changes for you."],
      ["Your schedule on your phone", "Access your plan on a phone or tablet too. On a smaller screen, show a single day and open a specific appointment."]
    ],
    galleryTitle: "Take a look inside practice management.",
    galleryIntro: "Calendar, clients, documents and finances. Select an image to open it in full and explore the details.",
    galleryNotice: "People, appointments, suppliers and amounts in these images are fictional demonstration data.",
    imageAction: "Open full image",
    heroCaption: "Appointments and available times · demonstration data",
    workflowTitle: "Your working day in a few steps.",
    workflow: [
      ["Arrange an appointment", "Choose an available time in the calendar and save the client’s booking."],
      ["Pick up where you left off", "Use the client’s card to recall past visits and your own notes."],
      ["Record the payment received", "Save the payment against the visit. It appears automatically in your financial overview."]
    ],
    guideAction: "A simple guide to managing your practice",
    eetEyebrow: "What we’re preparing",
    eetTitle: "EET reporting is in preparation.",
    eetText: "You can already record payments in the app. Direct reporting to Czech EET is being prepared and tested outside everyday operation. Reporting sales to the financial administration is not active yet.",
    eetPlan: "Our aim is to avoid another manual entry when receiving a payment once this is ready. We are not promising an activation date.",
    faqTitle: "Before we arrange a demo",
    faq: [
      ["Who is the app for?", "Massage therapists and small practices who want bookings, clients, documents and finances together. During a demo, we’ll check how well it fits the way you work."],
      ["Can it reflect my own practice?", "We agree on the look, content and scope of the solution for your practice individually. During a demo, we’ll discuss what you need and what makes sense for you."],
      ["Is the financial overview a full accounting system?", "It keeps income, expenses and year-end supporting records together, primarily for Czech businesses that are not VAT registered and claim actual expenses. You can download the records. The app does not file your tax return."],
      ["What does the AI assistant do?", "It can help read a document’s details or expand an explanation. You check and confirm the information and changes. A purchase document alone does not mean you have already paid it."],
      ["Is EET reporting already active?", "No. Ordinary payments received are not currently sent to the financial administration. Direct reporting is being prepared and tested separately from everyday operation."]
    ],
    referenceEyebrow: "The app in use",
    referenceTitle: "Created for Masáže Železná Lady.",
    referenceText: "Visit the public website to see the services and booking experience from a client’s perspective. We’ll show you practice management during an arranged demo.",
    referenceAction: "Visit the client website (Czech)",
    contactEyebrow: "Your practice and VCode",
    contactTitle: "Would you like this overview for your practice?",
    contactText: "Let’s arrange a no-obligation demo. We’ll discuss how you work, what you need and what makes sense for your practice.",
    contactAction: "Arrange a demo"
  }
};
