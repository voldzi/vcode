export const electionScreenshots = [
  { src: "/images/election-analyst/01-results.webp", preview: "/images/election-analyst/01-results-preview.webp", width: 1280, height: 720,
    titleCs: "Začněte celkovým přehledem", titleEn: "Start with the overview",
    captionCs: "Výsledky, účast a vysvětlení pro zvolené volby a území.", captionEn: "Results, turnout and explanations for the selected election and area." },
  { src: "/images/election-analyst/02-map.webp", preview: "/images/election-analyst/02-map-preview.webp", width: 2056, height: 1290,
    titleCs: "Přibližte si místo, které vás zajímá", titleEn: "Explore the place that matters to you",
    captionCs: "Mapa obcí s přehledem dostupných údajů a možností otevřít místní detail.", captionEn: "A municipality map with data availability and access to local detail." },
  { src: "/images/election-analyst/03-context.webp", preview: "/images/election-analyst/03-context-preview.webp", width: 1280, height: 720,
    titleCs: "Otevřete detail kandidatury", titleEn: "Open a candidature in detail",
    captionCs: "Zveřejněný výsledek kandidatury v kontextu konkrétních voleb a obce.", captionEn: "A published candidature result in the context of a specific election and municipality." }
];

export const electionCopy = {
  cs: {
    eyebrow: "Nezávislý volební atlas", title: "Election analyst", subtitle: "Výsledky voleb. V souvislostech.",
    intro: "Jak volila vaše obec? Co se změnilo mezi volbami? A odkud čísla pocházejí? Prozkoumejte veřejné výsledky v přehledných grafech, na mapě i v podrobnějších tabulkách.",
    open: "Otevřít volební atlas", explore: "Prohlédnout možnosti", note: "Veřejná webová aplikace v češtině. Bez registrace.",
    facts: [["Vaše místo", "Od celkového přehledu k obci"], ["Dva pohledy", "Pro občany i odborníky"], ["Dohledatelné zdroje", "Od grafu k původním údajům"]],
    featuresTitle: "Za čísly najdete konkrétní příběh místa.",
    featuresIntro: "Začněte jednoduchou otázkou. Podrobnosti si otevřete, až je budete potřebovat.",
    features: [
      ["Výsledky bez hledání v několika tabulkách", "Vyberte volby a území. Na jednom místě uvidíte zveřejněné výsledky, volební účast i vysvětlení toho, co jednotlivá čísla znamenají."],
      ["Mapa, která vás dovede k detailu", "Přibližte kraj, okres nebo obec a přepínejte mezi výsledky, účastí a dostupností dat. Hledání vás dovede přímo k vybranému místu."],
      ["Porovnání, které zachovává souvislosti", "Dostupná volební období si prohlédnete vedle sebe. Když se liší území nebo způsob přiřazení hlasů, aplikace vysvětlí omezení porovnání."],
      ["Občanský i odborný pohled", "Pro rychlou orientaci stačí občanský režim. Odborný pohled přidává pracovní prostor, podrobnější tabulky a kontroly dostupných dat."],
      ["Kandidatury v jejich volebním kontextu", "Vyhledejte kandidaturu, otevřete její zveřejněný výsledek a volební působnost. Stejné jméno se automaticky nevydává za tutéž osobu v různých volbách."],
      ["Podklady, ke kterým se můžete vrátit", "U výsledků najdete zdroje a vysvětlení metodiky. Připravený výběr můžete sdílet odkazem a dostupné tabulky stáhnout jako CSV."]
    ],
    galleryTitle: "Od celku k místním souvislostem.", galleryIntro: "Nahlédněte do atlasu. Kliknutím otevřete celý snímek a prohlédnete si podrobnosti.",
    galleryNote: "Aplikace i ukázky jsou v češtině.", imageAction: "Otevřít celý obrázek", heroCaption: "Výsledky, účast a přehled pro vybrané území",
    workflowTitle: "Vaše první otázka. Tři kroky k odpovědi.",
    workflow: [["Vyberte volby a místo", "Zvolte druh a termín voleb. Najděte obec nebo jiné dostupné území."], ["Prozkoumejte výsledek", "Otevřete graf, mapu nebo porovnání. Podle potřeby přepněte do odborného pohledu."], ["Ověřte a sdílejte", "Podívejte se na původ údajů a jejich omezení. Uložte si odkaz nebo stáhněte dostupný export."]],
    contextTitle: "Čísla se zdrojem. Výklad se souvislostmi.",
    contextText: "Atlas pracuje se zveřejněnými výsledky ČSÚ a dalšími uvedenými veřejnými podklady. Nejde o oficiální aplikaci ČSÚ ani o předpověď budoucích výsledků. Podnět z datové kontroly je důvod podívat se na podklad, sám o sobě neprokazuje volební podvod.",
    faqTitle: "Než se pustíte do zkoumání",
    faq: [["Potřebuji účet?", "Ne. Veřejný atlas otevřete v prohlížeči bez registrace. Přepnutí do odborného pohledu zpřístupňuje podrobnější práci s veřejnými daty."], ["Jsou k dispozici všechny volby?", "Atlas nabízí dostupné zveřejněné výsledky z období 2022–2026 a výsledky sněmovních voleb 2021. Rozsah se liší podle voleb a území; konkrétní dostupnost ukazuje přímo aplikace. Budoucí kola nemají vymyšlené výsledky."], ["Jsou výsledky živé?", "Atlas ukazuje převzaté zveřejněné podklady. Jejich původ a stav najdete v aplikaci; nejde o živé sčítání voleb."], ["Mohu atlas používat na telefonu?", "Ano, rozhraní se přizpůsobuje menším displejům. Prohlížeč může nabídnout přidání na plochu. Pro načtení výsledků a map potřebujete připojení k internetu."]],
    contactTitle: "Potřebujete podobný přehled pro svá data?", contactText: "Propojme vaše podklady s mapou, srozumitelnými grafy a dohledatelnými souvislostmi. Rádi s vámi projdeme, co má vaše aplikace lidem usnadnit.", contactAction: "Probrat spolupráci"
  },
  en: {
    eyebrow: "Independent election atlas", title: "Election analyst", subtitle: "Election results. In context.",
    intro: "How did your municipality vote? What changed between elections? Where do the numbers come from? Explore public results through clear charts, maps and detailed tables.",
    open: "Open the election atlas", explore: "Explore the features", note: "Public web app in Czech. No registration required.",
    facts: [["Your area", "From the overview to a municipality"], ["Two perspectives", "For citizens and specialists"], ["Traceable sources", "From a chart to the original data"]],
    featuresTitle: "Put the numbers in the context of a place.", featuresIntro: "Start with a simple question. Open more detail when you need it.",
    features: [
      ["Results without scattered tables", "Choose an election and area. Find published results, turnout and explanations of what the individual figures mean in one place."],
      ["A map that leads to local detail", "Explore regions, districts and municipalities, and switch between results, turnout and data availability. Search takes you directly to a selected place."],
      ["Comparisons that keep their context", "Read available election periods side by side. Where boundaries or vote allocation differ, the app explains the limits of comparison."],
      ["Citizen and specialist perspectives", "Use the citizen view for a quick overview. The specialist view adds a workspace, detailed tables and checks of available data."],
      ["Candidatures in their election context", "Find a candidature and explore its published result and electoral area. Matching names do not automatically identify the same person across elections."],
      ["Sources you can return to", "Find sources and methodology alongside the results. Share a prepared selection with a link and download available tables as CSV."]
    ],
    galleryTitle: "From the overview to local context.", galleryIntro: "Take a look inside the atlas. Select an image to view it in full and explore the details.", galleryNote: "The app and screenshots are in Czech.", imageAction: "Open full image", heroCaption: "Results, turnout and an overview of the selected area",
    workflowTitle: "Your first question. Three steps towards an answer.",
    workflow: [["Choose an election and place", "Select the election type and date. Find a municipality or another available area."], ["Explore the result", "Open a chart, map or comparison. Switch to the specialist view for more detail."], ["Check and share", "Review the sources and limitations. Save the link or download an available export."]],
    contextTitle: "Traceable numbers. Context for interpretation.", contextText: "The atlas uses published Czech Statistical Office results and other identified public sources. It is an independent app, not an official service of the Czech Statistical Office or a forecast of future results. A data-check finding is a reason to examine a source; it does not in itself establish electoral fraud.",
    faqTitle: "Before you explore",
    faq: [["Do I need an account?", "No. Open the public atlas in your browser without registering. Switching to the specialist view provides more detailed ways to work with public data."], ["Are all elections available?", "The atlas offers available published results from 2022–2026 and the 2021 parliamentary election. Coverage varies by election and area; the app shows availability for each selection. Future rounds have no invented results."], ["Are the results live?", "The atlas displays captured published sources. Find their origin and status in the app; this is not a live election count."], ["Can I use the atlas on my phone?", "Yes. The interface adapts to smaller screens. Your browser may offer an option to add it to your home screen. Loading election results and maps requires an internet connection."]],
    contactTitle: "Would a similar overview help you understand your data?", contactText: "Connect your sources with a map, clear charts and traceable context. Let’s discuss what your app could make easier for its users.", contactAction: "Discuss a project"
  }
};
