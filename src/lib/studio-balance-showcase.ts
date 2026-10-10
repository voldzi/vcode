export type StudioScreenshot = {
  src: string;
  preview: string;
  width: number;
  height: number;
  titleCs: string;
  titleEn: string;
  captionCs: string;
  captionEn: string;
};

// Actual application captures; original hashes and demo provenance are recorded in docs.
export const studioScreenshots: StudioScreenshot[] = [
  {
    "src": "/images/studio-balance/studio-overview-3b9cf2538b05.webp",
    "preview": "/images/studio-balance/studio-overview-3b9cf2538b05-preview.webp",
    "width": 1440,
    "height": 1000,
    "titleCs": "Přehled studia",
    "titleEn": "Studio overview",
    "captionCs": "Rezervace, účast na lekcích a oblíbené lekce přehledně na jednom místě.",
    "captionEn": "Bookings, class participation and popular classes in one place."
  },
  {
    "src": "/images/studio-balance/session-participants-33fef52929f8.webp",
    "preview": "/images/studio-balance/session-participants-33fef52929f8-preview.webp",
    "width": 1440,
    "height": 1000,
    "titleCs": "Kdo přijde na lekci",
    "titleEn": "Who is coming to a class",
    "captionCs": "Otevřete konkrétní termín a uvidíte všechny přihlášené včetně doprovodu.",
    "captionEn": "Open a session to see its booked participants, including companions."
  },
  {
    "src": "/images/studio-balance/instructor-report-8046fb2fe9fd.webp",
    "preview": "/images/studio-balance/instructor-report-8046fb2fe9fd-preview.webp",
    "width": 1440,
    "height": 1000,
    "titleCs": "Výkaz instruktorů",
    "titleEn": "Instructor report",
    "captionCs": "Měsíční souhrn potvrzených lekcí, hodin a zadaných odměn.",
    "captionEn": "A monthly summary of confirmed classes, teaching hours and manually entered instructor pay."
  },
  {
    "src": "/images/studio-balance/cancel-one-session-db88eef40d51.webp",
    "preview": "/images/studio-balance/cancel-one-session-db88eef40d51-preview.webp",
    "width": 1440,
    "height": 1000,
    "titleCs": "Zrušení jednoho termínu",
    "titleEn": "Cancel a single session",
    "captionCs": "Zkontrolujte konkrétní lekci a vysvětlení. Ostatní termíny zůstanou.",
    "captionEn": "Check the class and your explanation. Other sessions stay unchanged."
  },
  {
    "src": "/images/studio-balance/news-60f0cb530bec.webp",
    "preview": "/images/studio-balance/news-60f0cb530bec-preview.webp",
    "width": 1440,
    "height": 1000,
    "titleCs": "Novinky pro klienty",
    "titleEn": "News for clients",
    "captionCs": "Napište krátké sdělení a zvolte, kdy ho klienti uvidí.",
    "captionEn": "Write a short update and choose when clients will see it."
  },
  {
    "src": "/images/studio-balance/participants-mobile-2df736ba6989.webp",
    "preview": "/images/studio-balance/participants-mobile-2df736ba6989-preview.webp",
    "width": 390,
    "height": 844,
    "titleCs": "Správa také na telefonu",
    "titleEn": "Management on your phone",
    "captionCs": "Seznam přihlášených máte po ruce i během lekce.",
    "captionEn": "Keep the participant list to hand during a class."
  }
];

export const studioCopy = {
  cs: {
    eyebrow: "Web, rezervace a správa pohybového studia",
    headline: "Věnujte se lekcím. Mějte přehled o studiu.",
    intro: "Rozvrh, rezervace, docházka i novinky na jednom místě. Klienti si vyberou lekci na telefonu a vy pohodlně upravíte kapacitu, cenu nebo jeden konkrétní termín.",
    arrangement: "Vytvořeno pro každodenní provoz skutečného studia. Pro vaše studio připravíme vlastní podobu webu a pomůžeme s prvním nastavením.",
    action: "Chci nezávaznou ukázku",
    actionNote: "Podíváme se na váš rozvrh a společně projdeme, co vaše studio potřebuje.",
    explore: "Prohlédnout možnosti správy",
    facts: [["3 měsíce", "Průběžně doplňovaný rozvrh"], ["Na telefonu", "Rezervace i vlastní účet"], ["Vaše studio", "Podoba a zavedení po domluvě"]],
    featuresTitle: "Každodenní změny zvládnete sami.",
    featuresIntro: "Od první rezervace po měsíční přehled. Důležité úpravy mají kontrolu dopadu a krátkou nápovědu.",
    features: [
      ["Rozvrh, který nemusíte pořád přepisovat", "Pravidelné lekce se průběžně doplňují až tři měsíce dopředu. Vy rozhodnete, jak dlouho před lekcí se otevřou rezervace."],
      ["Změny bez čekání na vývojáře", "Upravte cenu, kapacitu, čas nebo instruktora pro jeden termín i pravidelný plán. Před uložením uvidíte dopad na termíny a rezervace."],
      ["Jedna zrušená lekce, ostatní beze změny", "Vyberte konkrétní termín. Rezervace se zruší bez poplatku a klientům přijde zpráva do jejich účtu. Ostatní lekce zůstanou."],
      ["Hned víte, kdo přijde", "U lekce otevřete seznam přihlášených a přehled obsazenosti. Rezervace klienta a jeho jednoho doprovodu uvidíte samostatně."],
      ["Docházka jedním potvrzením", "Po skončení lekce označte pouze nepřítomné. Účast ostatních potvrdíte najednou a uložíte záznam o odučené lekci."],
      ["Měsíční přehled instruktorů", "Potvrzené lekce, odučené hodiny a ručně zadané odměny na jednom místě. Přehled můžete vytisknout nebo stáhnout."],
      ["Klienti se snadno zorientují", "Na telefonu mají rozvrh, své rezervace, novinky, zprávy a profil. Web si mohou přidat na plochu pro pohodlný návrat."],
      ["Vaše nabídka stále aktuální", "Sami upravíte názvy a popisy lekcí, představíte instruktory a zveřejníte novinky nebo skutečné recenze."]
    ],
    galleryTitle: "Nahlédněte do správy studia.",
    galleryIntro: "Přehledný rozvrh, účastníci lekcí i měsíční souhrny. Kliknutím otevřete celý obrázek.",
    galleryNotice: "Osoby a údaje na obrázcích jsou demonstrační.",
    imageAction: "Otevřít celý obrázek",
    workflowTitle: "Od rozvrhu k potvrzené lekci.",
    workflow: [["Připravíte nabídku", "Nastavíte lekce, pravidelné časy a otevření rezervací."], ["Klienti si vyberou", "Na telefonu rezervují místo pro sebe a případně jeden doprovod."], ["Potvrdíte, co proběhlo", "Po lekci uložíte docházku, instruktora a odměnu. Měsíční souhrn máte po ruce."]],
    guideAction: "Pět běžných úkolů krok za krokem",
    faqTitle: "Než si domluvíme ukázku",
    faq: [
      ["Pro koho je aplikace vhodná?", "Pro pohybová studia a provozovatele pravidelných skupinových lekcí. Na ukázce projdeme váš způsob práce a ověříme, zda aplikace odpovídá vašim potřebám."],
      ["Zvládnu běžné změny sám?", "Ano. Cenu, kapacitu, instruktora, pravidelný čas, zrušení konkrétní lekce i novinky upravíte ve správě. Důležité změny mají kontrolu dopadu."],
      ["Musí si klienti instalovat aplikaci z obchodu?", "Nemusí. Otevřou web na telefonu nebo počítači. Na telefonu si jej mohou přidat na plochu."],
      ["Může mít aplikace jméno a vzhled mého studia?", "Ano. Vlastní podobu webu, logo a obsah připravíme při domluveném nasazení. Společně projdeme rozvrh, nabídku a pravidla studia."],
      ["Co najdu ve výkazu instruktorů?", "Potvrzené lekce, skutečně odučené hodiny a zadané odměny za vybraný měsíc. Jde o provozní přehled výuky; další práci a mzdové podklady řešíte samostatně."]
    ],
    referenceEyebrow: "Aplikace v praxi",
    referenceTitle: "Vzniklo pro Studio Balance.",
    referenceText: "Podívejte se na veřejný web studia v Bruntále. Pro nové studio společně domluvíme vlastní podobu a rozsah řešení.",
    referenceAction: "Navštívit Studio Balance",
    contactTitle: "Jak by mohla fungovat správa vašeho studia?",
    contactText: "Ukážeme vám rezervace z pohledu klienta i běžné úpravy ve správě. Potom se domluvíme na podobě a rozsahu řešení pro vaše studio.",
    contactAction: "Domluvit nezávaznou ukázku"
  },
  en: {
    eyebrow: "Website, booking and management for movement studios",
    headline: "Focus on your classes. Stay in control of your studio.",
    intro: "Schedules, bookings, attendance and news in one place. Clients choose a class on their phone while you adjust capacity, pricing or a single session.",
    arrangement: "Built for the daily work of a real studio. We can create a website for your studio’s brand and help with the initial setup.",
    action: "Request a no-obligation demo",
    actionNote: "We’ll look at your schedule and discuss what your studio needs.",
    explore: "Explore studio management",
    facts: [["3 months", "A rolling class schedule"], ["On your phone", "Bookings and a client account"], ["Your studio", "Branding and setup by arrangement"]],
    featuresTitle: "Handle everyday changes yourself.",
    featuresIntro: "From the first booking to the monthly report. Important changes include a preview of their impact and short guidance.",
    features: [
      ["A schedule you don’t keep rewriting", "Recurring classes are added on a rolling basis up to three months ahead. You decide how far in advance bookings open."],
      ["Make changes without waiting for a developer", "Adjust the price, capacity, time or instructor for a single session or recurring schedule. Review the impact on sessions and bookings before saving."],
      ["Cancel one class and keep the rest", "Choose a specific session. Bookings are cancelled without a fee and clients receive a message in their account. Other classes stay in place."],
      ["See who is coming", "Open a class to see its participants and occupancy. A client’s booking and their one companion’s booking are listed separately."],
      ["Confirm attendance in one step", "After a class ends, mark those who were absent. Confirm everyone else together and save the record of the completed class."],
      ["Monthly instructor reports", "Confirmed classes, teaching hours and manually entered instructor pay in one place. Print or download the report."],
      ["Easy for clients to find their way", "Schedules, bookings, news, messages and a profile are available on a phone. Clients can add the website to their home screen."],
      ["Keep your offering current", "Edit class names and descriptions, introduce instructors and publish news or genuine reviews yourself."]
    ],
    galleryTitle: "Take a look inside studio management.",
    galleryIntro: "Clear schedules, class participants and monthly summaries. Select an image to open it in full.",
    galleryNotice: "People and records in these images are demonstration data.",
    imageAction: "Open full image",
    workflowTitle: "From your schedule to a completed class.",
    workflow: [["Prepare your offering", "Set up classes, recurring times and when bookings open."], ["Clients choose a class", "They book on their phone for themselves and, optionally, one companion."], ["Confirm what took place", "After a class, record attendance, the instructor and their pay amount. The monthly summary is ready to hand."]],
    guideAction: "Five everyday tasks, step by step",
    faqTitle: "Before we arrange a demo",
    faq: [
      ["Who is the app for?", "Movement studios and operators of recurring group classes. During a demo, we’ll discuss how you work and whether the app meets your needs."],
      ["Can I make everyday changes myself?", "Yes. Manage prices, capacity, instructors, recurring times, individual cancellations and news. Important changes include a preview of their impact."],
      ["Do clients need an app from a store?", "No. They open the website on a phone or computer, and can add it to their phone’s home screen."],
      ["Can it use my studio’s name and look?", "Yes. We can prepare your website, logo and content as part of an agreed setup. We’ll go through your schedule, offering and studio rules together."],
      ["What does the instructor report include?", "Confirmed classes, actual teaching hours and manually entered instructor pay for the selected month. It is a teaching activity report; other work and payroll records are handled separately."]
    ],
    referenceEyebrow: "The app in use",
    referenceTitle: "Created for Studio Balance.",
    referenceText: "Visit the public website of this studio in Bruntál. For a new studio, we agree on its own branding and the scope of the solution together.",
    referenceAction: "Visit Studio Balance (Czech)",
    contactTitle: "How could your studio management work?",
    contactText: "We’ll show you bookings from a client’s perspective and everyday management tasks. Then we can agree on the look and scope of the solution for your studio.",
    contactAction: "Arrange a no-obligation demo"
  }
};
