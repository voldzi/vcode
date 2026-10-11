export type EventScreenshot = {
  src: string;
  preview: string;
  width: number;
  height: number;
  titleCs: string;
  titleEn: string;
  captionCs: string;
  captionEn: string;
};

// Real application captures with fictional records; provenance is recorded in docs.
export const eventScreenshots: EventScreenshot[] = [
  {
    src: "/images/event/01-public-vcode-5afba7e85b82.webp",
    preview: "/images/event/01-public-vcode-5afba7e85b82-preview.webp",
    width: 1280,
    height: 720,
    titleCs: "Vlastní veřejný vstup",
    titleEn: "Your public entrance",
    captionCs: "Vlastní veřejný vstup organizace ve vzhledu Studio.",
    captionEn: "Your organization's public entrance in the Studio style."
  },
  {
    src: "/images/event/02-program-admin-5699d5a1f5c9.webp",
    preview: "/images/event/02-program-admin-5699d5a1f5c9-preview.webp",
    width: 1280,
    height: 1499,
    titleCs: "Program pro organizátora",
    titleEn: "A programme for the organiser",
    captionCs: "Dvoujazyčný program a další krok na jednom místě.",
    captionEn: "The bilingual programme and your next step in one place."
  },
  {
    src: "/images/event/03-program-attendee-94f67cbc235a.webp",
    preview: "/images/event/03-program-attendee-94f67cbc235a-preview.webp",
    width: 1280,
    height: 1535,
    titleCs: "Program pro účastníka",
    titleEn: "The participant’s programme",
    captionCs: "Účastník vidí program a stav své přihlášky.",
    captionEn: "Participants can see the programme and enrollment status."
  },
  {
    src: "/images/event/04-mobile-enrollment-cc11e843cdb4.webp",
    preview: "/images/event/04-mobile-enrollment-cc11e843cdb4-preview.webp",
    width: 390,
    height: 901,
    titleCs: "Přihláška na telefonu",
    titleEn: "Registration on your phone",
    captionCs: "Přihláška v telefonu a jasná cesta k QR průkazu.",
    captionEn: "Enrollment on your phone with a clear route to the QR pass."
  },
  {
    src: "/images/event/05-mobile-scanner-3388815581d3.webp",
    preview: "/images/event/05-mobile-scanner-3388815581d3-preview.webp",
    width: 390,
    height: 844,
    titleCs: "Mobilní skener",
    titleEn: "Mobile scanner",
    captionCs: "Kompaktní skener dává na první místo správné setkání.",
    captionEn: "A compact scanner puts the correct meeting first."
  },
  {
    src: "/images/event/06-attendance-report-6ac9837c93c9.webp",
    preview: "/images/event/06-attendance-report-6ac9837c93c9-preview.webp",
    width: 1280,
    height: 920,
    titleCs: "Souhrn účasti",
    titleEn: "Attendance overview",
    captionCs: "Souhrn rozlišuje přítomnost a nezaznamenaný stav.",
    captionEn: "The summary distinguishes attendance from missing records."
  }
];

export const alternateStyleScreenshots: EventScreenshot[] = [
  {
    src: "/images/event/07-public-editorial-c3c16c6b1bc3.webp",
    preview: "/images/event/07-public-editorial-c3c16c6b1bc3-preview.webp",
    width: 1280,
    height: 720,
    titleCs: "Editorial",
    titleEn: "Editorial",
    captionCs: "Stejná organizace v klidném vzhledu Editorial.",
    captionEn: "The same organization in the calm Editorial style."
  },
  {
    src: "/images/event/08-public-focus-fb56462bff07.webp",
    preview: "/images/event/08-public-focus-fb56462bff07-preview.webp",
    width: 1280,
    height: 720,
    titleCs: "Focus",
    titleEn: "Focus",
    captionCs: "Vzhled Focus pro přehledný a soustředěný vstup.",
    captionEn: "The Focus style for a clear, focused entrance."
  }
];

type EventLocaleCopy = {
  eyebrow: string;
  headline: string;
  intro: string;
  action: string;
  explore: string;
  actionNote: string;
  featuresTitle: string;
  featuresIntro: string;
  features: [string, string][];
  workflowTitle: string;
  workflow: [string, string][];
  faqTitle: string;
  faq: [string, string][];
  publicEntryTitle: string;
  publicEntryText: string;
  publicEntryAction: string;
  contactTitle: string;
  contactText: string;
  contactAction: string;
  galleryTitle: string;
  galleryIntro: string;
  galleryNotice: string;
  galleryLanguageNote: string;
  styleGalleryTitle: string;
  styleGalleryIntro: string;
  fullSize: string;
};

export const eventCopy: Record<"cs" | "en", EventLocaleCopy> = {
  cs: {
    eyebrow: "Akce, přihlášky a mobilní prezence",
    headline: "Vaše akce. Vaše značka. Přehled bez chaosu.",
    intro: "Propojte přípravu akce, přihlášky účastníků a mobilní prezenci. Event provede váš tým od programu a QR průkazů až k přehledu docházky — v prostředí, které nese styl vaší organizace.",
    action: "Domluvit ukázku",
    explore: "Prohlédnout možnosti",
    actionNote: "Projdeme práci organizátora i účastníka a potřeby vaší organizace.",
    featuresTitle: "Od programu k přehledu o celé akci.",
    featuresIntro: "Účastník ví, kam jít. Organizátor ví, co udělat dál. Vy vidíte výsledek.",
    features: [
      ["Vaše organizace, váš styl", "Vyberte Studio, Editorial nebo Focus a doplňte vlastní logo, údaje a úvodní obrázek. O veřejné podobě rozhoduje vaše organizace."],
      ["Jeden jasný vstup", "Organizace má vlastní veřejnou adresu. Přihlášení členové odtud pokračují do svého pracovního prostoru."],
      ["Přihláška bez dohledávání", "Účastník vidí stav své účasti a u potvrzené registrace si na vyžádání otevře QR průkaz."],
      ["Mobilní prezence", "Kompaktní skener dává na první místo správné setkání, kameru a výsledek. Ruční dohledání zůstává alternativou."],
      ["Přehled potvrzených výsledků", "Souhrnná prezence rozlišuje přítomnost, absenci a nezaznamenaný stav. Výsledky jednotlivých setkání najdete na jednom místě."],
      ["Pomoc přímo u práce", "České a anglické návody vás provedou dalším krokem. Event si můžete přidat na plochu telefonu a otevírat jako aplikaci."]
    ],
    workflowTitle: "Jak to funguje — tři kroky",
    workflow: [
      ["Připravte akci", "Správce doplní program a přiřadí organizátora. Pro prezenci připraví konkrétní setkání."],
      ["Dejte účastníkovi jasnou cestu", "V dostupné akci odešle přihlášku, zkontroluje její stav a u potvrzené registrace si otevře QR průkaz."],
      ["Načtěte a zkontrolujte výsledek", "Organizátor načte průkaz do vybraného otevřeného setkání. Potvrzené výsledky najdete v souhrnu. Předem připravený skener může během výpadku zachytit záznam; po obnovení připojení zkontrolujete jeho potvrzení."]
    ],
    faqTitle: "Než si domluvíme ukázku",
    faq: [
      ["Můžeme mít vlastní vzhled?", "Ano. Organizace vybírá ze tří prostředí, doplňuje svou značku a rozhoduje, co zveřejní. Stejný vzhled provází členy týmu jejich pracovním prostorem."],
      ["Musí mít návštěvník účet?", "Veřejná stránka organizace je dostupná bez účtu. Pracovní prostor, dostupné akce a přihlášky vyžadují oprávněný účet a členství. Veřejná stránka zatím není katalog akcí ani volná registrace."],
      ["Funguje skener bez internetu?", "U skeneru připraveného předem online lze během výpadku zachytit záznamy příchodů. Nové přihlášení bez internetu není dostupné. Po obnovení připojení zkontrolujte, zda byly příchody potvrzené."],
      ["Co když někdo načte průkaz dvakrát?", "Opakovaný platný příchod nezakládá druhý příchod téhož účastníka do stejného setkání. Rozhraní odlišuje duplicitu od nového výsledku; různá setkání se evidují odděleně."],
      ["Co uvidíme při vedené ukázce?", "Projdeme přípravu akce, pohled účastníka, mobilní prezenci a výsledný přehled. Společně vybereme prostředí a způsob použití pro vaši organizaci."]
    ],
    publicEntryTitle: "Veřejná stránka organizace VCODE",
    publicEntryText: "Stránku organizace si můžete prohlédnout bez účtu. Přípravu akcí a práci jednotlivých rolí vám ukážeme při vedené ukázce.",
    publicEntryAction: "Prohlédnout veřejnou stránku VCODE",
    contactTitle: "Jak by Event fungoval ve vaší organizaci?",
    contactText: "Domluvte si vedenou ukázku. Projdeme přípravu akce, pohled účastníka, mobilní prezenci a výsledný přehled. Společně vybereme prostředí a způsob použití pro vaši organizaci.",
    contactAction: "Domluvit ukázku",
    galleryTitle: "Od přípravy akce k přehledu účasti.",
    galleryIntro: "Nahlédněte do aplikace. Každý snímek můžete otevřít v plné velikosti a prohlédnout si podrobnosti.",
    galleryNotice: "Skutečné rozhraní Eventu se smyšlenými ukázkovými údaji. Termíny, organizace a účastníci nejsou skutečnou pozvánkou.",
    galleryLanguageNote: "Snímky ukazují české rozhraní aplikace.",
    styleGalleryTitle: "Jedna organizace. Tři podoby.",
    styleGalleryIntro: "Stejný veřejný vstup ve vzhledu Studio, Editorial a Focus.",
    fullSize: "Otevřít celý snímek"
  },
  en: {
    eyebrow: "Events, registration and mobile check-in",
    headline: "Your events. Your brand. A clear view of attendance.",
    intro: "Bring event preparation, participant registration and mobile attendance together. Guide your team from the programme and QR passes to an attendance overview — in an environment that reflects your organisation’s own style.",
    action: "Request a guided demo",
    explore: "Explore the possibilities",
    actionNote: "We’ll explore the organiser and participant experience and your organisation’s needs.",
    featuresTitle: "From the programme to a clear view of every event.",
    featuresIntro: "Participants know where to go. Organisers know what to do next. You can see the results.",
    features: [
      ["Your organisation, your style", "Choose Studio, Editorial or Focus and add your own logo, details and introductory image. Your organisation decides what to publish."],
      ["One clear entrance", "Your organisation has its own public address. Signed-in members continue from there to their workspace."],
      ["A clear registration status", "Participants can check their registration status and request a QR pass for confirmed registration."],
      ["Mobile attendance capture", "A compact scanner puts the correct meeting, camera and result first. Manual lookup remains an alternative."],
      ["Confirmed results in one overview", "Distinguish present, absent and unrecorded states. Find the results of individual meetings together."],
      ["Help at the point of work", "Czech and English guides walk you through the next step. You can add Event to your phone’s home screen and open it like an app."]
    ],
    workflowTitle: "How it works — three steps",
    workflow: [
      ["Prepare the event", "An administrator adds the programme and assigns an organiser. A specific meeting is prepared for attendance."],
      ["Guide the participant", "They register for an available event, check their registration status and open their pass once registration is confirmed."],
      ["Scan and review", "The organiser scans the pass in the selected open meeting. Confirmed results appear in the overview. A scanner prepared in advance can capture a record during an outage; check its confirmation after reconnecting."]
    ],
    faqTitle: "Before we arrange a demo",
    faq: [
      ["Can we use our own brand?", "Yes. Choose from three visual environments, add your brand and decide what to publish. The same visual identity accompanies team members in their workspace."],
      ["Does a visitor need an account?", "Not to view the public organisation page. Workspaces, available events and registration require an authorised account and membership. The public page is not currently an event catalogue or open signup."],
      ["Can the scanner work offline?", "A scanner prepared online can capture arrival records during an outage. New offline sign-in is not available. Reconnect and check that the arrivals were confirmed."],
      ["What happens if a pass is scanned twice?", "A repeat valid arrival does not create a second arrival for the same participant and meeting. The interface distinguishes a duplicate from a new result; separate meetings are recorded independently."],
      ["What will the guided demo show us?", "We’ll explore event preparation, the participant experience, mobile check-in and the results. Together, we can choose a visual environment and workflow for your organisation."]
    ],
    publicEntryTitle: "VCODE organisation page",
    publicEntryText: "You can view the organisation page without an account. We’ll show you event preparation and the different roles during a guided demo.",
    publicEntryAction: "View VCODE’s public page",
    contactTitle: "How could Event work for your organisation?",
    contactText: "Request a guided demo of event preparation, the participant experience, mobile check-in and the results. Together, we can choose a visual environment and workflow for your organisation.",
    contactAction: "Request a guided demo",
    galleryTitle: "From event preparation to an attendance overview.",
    galleryIntro: "Take a look inside the app. Open any screenshot at full size to explore the details.",
    galleryNotice: "The real Event interface with fictional example data. Dates, organizations and participants do not represent a real invitation.",
    galleryLanguageNote: "Screenshots show the app’s Czech interface.",
    styleGalleryTitle: "One organisation. Three styles.",
    styleGalleryIntro: "The same public entrance in Studio, Editorial and Focus.",
    fullSize: "Open full screenshot"
  }
};
