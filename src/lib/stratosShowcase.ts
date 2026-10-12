export type StratosShowcaseId =
  | "stratos"
  | "budget-contract"
  | "executive-center"
  | "projectflow"
  | "archflow"
  | "akb"
  | "stratos-voice";

export type ShowcaseCopy = {
  audience: string[];
  lead: string;
  outcome: string;
  features: Array<{ title: string; body: string }>;
  situations: Array<{ title: string; body: string }>;
  steps: string[];
  illustration: {
    title: string;
    items: Array<{ label: string; value: string }>;
  };
};

export const stratosShowcases: Record<
  StratosShowcaseId,
  { cs: ShowcaseCopy; en: ShowcaseCopy }
> = {
  stratos: {
    cs: {
      audience: ["Vedení organizace", "Gestoři oblastí", "Projektové týmy"],
      lead: "Dobrá změna začíná potřebou, pokračuje rozhodnutím a končí výsledkem. STRATOS propojuje jednotlivé kroky, aby vedení, správci rozpočtu a projektové týmy pracovali se stejnými souvislostmi. Každá aplikace má jasný účel: posoudit potřebu, připravit finance, řídit projekt nebo najít podklad. Informace se mezi nimi předávají s vazbou na svůj původ.",
      outcome: "Víte, proč se změna připravuje, kdo za ni odpovídá a co má následovat. Od prvního podnětu se můžete vrátit k rozhodnutí, finančnímu plánu i projektovým úkolům. Schválení potřeby, přidělení peněz a zahájení realizace zůstávají samostatnými kroky.",
      features: [
        { title: "Od potřeby k projektu", body: "ArchFlow připraví potřebu k posouzení, Budget ji zařadí do finančního plánování a ProjectFlow převezme zadání k přípravě nebo realizaci. Předání zachovává odkazy, aby další tým nemusel začínat od prázdné stránky." },
        { title: "Přehled podle vaší práce", body: "Vedení sleduje portfolio v Executive Center. Gestor pracuje s rozpočtem a smlouvami, projektový tým s úkoly a architekt se souvislostmi změny. Společná rodina dává každé z těchto rolí vlastní pracovní prostor." },
        { title: "Společné přihlášení a přístupy", body: "Organizace spravuje osoby a jejich pověření na jednom místě. Přístup může mít konkrétní rozsah a dobu platnosti. Uživatel získá práva pro svou práci; správa aplikace sama o sobě neotevírá veškerý obsah." },
        { title: "Podklady s dohledatelným původem", body: "Dokumenty a jejich verze spravuje AKB. Potřeba, smlouva nebo projekt se na konkrétní podklad odkazují. Při další práci tak lze ověřit, z jakých informací rozhodnutí vycházelo, v mezích aktuálních oprávnění." },
        { title: "Příprava může začít včas", body: "První návrh nemusí mít hotový rozpočet ani termín. Tým může rozpracovat zadání a úkoly a později je propojit se schválenou akcí. Neznámá cena zůstává neznámá a příprava neznamená povolení výdajů." },
      ],
      situations: [
        { title: "Připravujete větší změnu", body: "Potřebujete spojit důvod modernizace, odborné posouzení, finanční výhled a práci týmu. STRATOS drží vazby mezi jednotlivými kroky a pomáhá rozdělit odpovědnost za další postup." },
        { title: "Sestavujete roční plán", body: "Vedle smluvních závazků se objevují provozní potřeby i nové záměry. V jednom prostředí lze porovnat plánování s přidělenými prostředky a zachovat návaznost na projektovou přípravu." },
        { title: "Vedení potřebuje rozhodnout", body: "Přehled vede od situace portfolia ke konkrétnímu projektu a podkladu. Rozhodnutí z porady může dostat vlastníka a další úkol, aby nezůstalo jen poznámkou v zápisu." },
      ],
      steps: [
        "Vyberte pracovní oblast a nastavte lidem odpovědnosti i potřebné přístupy.",
        "Zachyťte potřebu a propojte její posouzení s finančním plánem a přípravou projektu.",
        "Sledujte průběh, ověřujte podklady a navazujte další kroky na zaznamenaná rozhodnutí.",
      ],
      illustration: {
        title: "Jedna změna, souvislý postup",
        items: [
          { label: "Potřeba", value: "Posouzení v ArchFlow" },
          { label: "Plán", value: "Finanční výhled v Budgetu" },
          { label: "Projekt", value: "Příprava v ProjectFlow" },
        ],
      },
    },
    en: {
      audience: ["Organisational leaders", "Business owners", "Project teams"],
      lead: "A worthwhile change starts with a need, moves through a decision and leads to a result. STRATOS connects these steps so leaders, budget owners and project teams can work with the same context. Each application has a clear purpose: assess a need, prepare funding, manage a project or find supporting information. Handoffs retain links to their origins.",
      outcome: "You can see why a change is being prepared, who owns it and what comes next. Follow an initial proposal through its decision, financial plan and project tasks. Approval of a need, allocation of funding and authorisation to deliver remain separate steps.",
      features: [
        { title: "From a need to a project", body: "ArchFlow prepares a need for assessment, Budget brings it into financial planning and ProjectFlow receives the assignment for preparation or delivery. Handoffs retain their links, giving the next team a useful starting point." },
        { title: "A view suited to your work", body: "Leaders follow the portfolio in Executive Center. Budget owners work with plans and contracts, project teams with tasks, and architects with the context of a change. Each role has a distinct workspace within the same family." },
        { title: "Shared sign-in and access management", body: "The organisation manages people and their access assignments in one place. An assignment can cover a specific area and period. Users receive access for their work; administering an application does not automatically open all business content." },
        { title: "Supporting information with a source", body: "AKB manages documents and their versions. Needs, contracts and projects link to specific supporting material. Later readers can check the information behind a decision, subject to their current access rights." },
        { title: "Start preparing at the right time", body: "An initial proposal does not need a completed budget or a delivery date. Teams can develop the assignment and tasks before linking them to an approved action. An unknown cost stays unknown, and preparation does not authorise spending." },
      ],
      situations: [
        { title: "Preparing a significant change", body: "Connect the reason for modernisation, specialist assessment, financial outlook and team work. STRATOS retains the relationships between these steps and helps establish who is responsible for the next action." },
        { title: "Building an annual plan", body: "Contractual commitments sit alongside operational needs and new proposals. Compare planning with allocated resources in a shared environment while keeping the link to project preparation." },
        { title: "Helping leaders reach a decision", body: "Move from the portfolio overview to a specific project and its supporting information. Give a meeting decision an owner and a follow-up task, rather than leaving it as a note in the minutes." },
      ],
      steps: [
        "Choose the working area and give people clear responsibilities and appropriate access.",
        "Capture a need and connect its assessment to financial planning and project preparation.",
        "Follow progress, check supporting information and base subsequent actions on recorded decisions.",
      ],
      illustration: {
        title: "One change, a connected journey",
        items: [
          { label: "Need", value: "Assessment in ArchFlow" },
          { label: "Plan", value: "Financial outlook in Budget" },
          { label: "Project", value: "Preparation in ProjectFlow" },
        ],
      },
    },
  },
  "budget-contract": {
    cs: {
      audience: ["Gestoři oblastí", "Správci rozpočtu", "Pracovníci nákupu"],
      lead: "Roční rozpočet vzniká z mnoha různých potřeb. Některé platby už vyplývají ze smluv, jiné jsou odhadem obnovy a další teprve čekají na přidělení financí. Budget & Contract je spojuje do pracovního plánu a zachovává souvislosti se smlouvami, dodavateli i projekty. Pomáhá připravit další rok a průběžně se orientovat v tom současném.",
      outcome: "Máte podklady pro rozhovor s financemi i vedením: co je závazek, co je návrh a kde je potřeba něco doplnit. Rozpočtový plán, přidělené finance a evidence čerpání mají svůj vlastní význam. Smluvní platební plán sám není bankovním potvrzením úhrady.",
      features: [
        { title: "Čtyři oblasti jednoho výhledu", body: "Připravte smluvní závazky a odhady plnění na výzvu, běžnou obnovu, schválené potřeby a malé akce. Položky mají společný finanční přehled, přitom si zachovávají svůj původ a důvod zařazení do plánu." },
        { title: "Porovnání s přidělenými financemi", body: "Zaznamenejte prostředky přidělené na další rok a porovnejte je s připraveným plánem po rozpočtových položkách. Rozdíly ukážou, které záměry lze připravovat dál a kde je potřeba domluvit další postup s financemi." },
        { title: "Smlouvy v souvislostech", body: "U smlouvy sledujte dodavatele, navázanou akci a platební podmínky. Jednorázové pořízení, pravidelná podpora i plnění na výzvu mají odlišný význam a mohou vytvářet výhled pro další období." },
        { title: "Potřeby nemusíte přepisovat", body: "Schválená potřeba z ArchFlow přichází s odpovědným gestorem a doporučeným rokem. Zařadíte ji do plánování a doplníte dostupné informace. Samotné schválení potřeby přitom neznamená, že jí už byly přiděleny peníze." },
        { title: "Projektová příprava i bez ceny", body: "Akci lze předat k přípravě, i když náklady ještě neznáte. V ProjectFlow může navázat nový projekt nebo konkrétní připravený návrh se zachováním úkolů. Oprávnění k výdajům tím nevzniká." },
      ],
      situations: [
        { title: "Plánujete další rok", body: "Včas poskládejte povinné platby, odhady obnovy a nové potřeby. Výhled na navazující roky pomáhá neztratit závazky, které pokračují i po skončení právě plánovaného období." },
        { title: "Rozpočet nestačí na vše", body: "Porovnejte přidělené finance s plánem a připravte konkrétní podklad pro dohodu o prioritách. Návrh bez financování zůstává viditelný, aniž by se vydával za zajištěnou realizaci." },
        { title: "Z nákupu se stane smlouva", body: "Propojte realizovanou akci se smlouvou a jejími platebními podmínkami. Následující plánování pak může vycházet z tohoto závazku a zachovat vztah k původnímu záměru." },
      ],
      steps: [
        "Sestavte roční výhled z existujících závazků a nových potřeb své oblasti.",
        "Porovnejte jej s přidělenými financemi a rozhodněte o dalším postupu jednotlivých akcí.",
        "Předávejte projektová zadání a doplňujte smlouvy i evidenci čerpání podle dostupných podkladů.",
      ],
      illustration: {
        title: "Přehled připravené akce",
        items: [
          { label: "Záměr", value: "Obnova služby" },
          { label: "Náklady", value: "Čekají na odhad" },
          { label: "Další krok", value: "Projektová příprava" },
        ],
      },
    },
    en: {
      audience: ["Business owners", "Budget managers", "Procurement teams"],
      lead: "An annual budget brings together different kinds of needs. Some payments already follow from contracts, others are estimates for renewal, and further proposals await funding. Budget & Contract combines them into a working plan while retaining their context: contracts, suppliers and projects. It helps prepare the next year and keep track of the current one.",
      outcome: "Bring clear information to discussions with finance and management: what is a commitment, what is a proposal and what still needs attention. The budget plan, allocated funding and recorded expenditure have distinct meanings. A contractual payment schedule is not, by itself, bank evidence of payment.",
      features: [
        { title: "Four areas in one outlook", body: "Plan contractual commitments and estimated on-demand work, routine renewal, approved needs and smaller actions. The items share a financial overview while retaining their origins and the reasons they entered the plan." },
        { title: "Compare plans with allocated funding", body: "Record resources allocated for the next year and compare them with the proposed plan by budget item. Differences show which proposals can move forward and where a further discussion with finance is needed." },
        { title: "Contracts in context", body: "Keep the supplier, related action and payment terms connected to each contract. A one-off purchase, recurring support and on-demand work serve different purposes and can contribute to an outlook for future periods." },
        { title: "Keep the link to an approved need", body: "A need approved in ArchFlow arrives with an accountable owner and a recommended year. Bring it into planning and add the available information. Approval of the need does not mean that funding has already been allocated." },
        { title: "Prepare a project before its cost is known", body: "An action can be handed over for preparation with an unknown cost. ProjectFlow can use a new project or a specific existing proposal while retaining its tasks. This handoff does not create permission to spend." },
      ],
      situations: [
        { title: "Preparing the next annual plan", body: "Bring together required payments, renewal estimates and new needs in good time. The outlook for subsequent years helps retain commitments that continue beyond the period currently being planned." },
        { title: "Funding cannot cover everything", body: "Compare allocated funds with the plan and prepare a concrete basis for agreeing priorities. An unfunded proposal remains visible without being presented as an authorised and funded delivery." },
        { title: "Turning a purchase into a contract", body: "Connect a completed procurement action to its contract and payment terms. Future planning can then draw on this commitment while preserving the relationship to the original proposal." },
      ],
      steps: [
        "Build an annual outlook from existing commitments and new needs in your area.",
        "Compare it with allocated funding and decide the next step for each action.",
        "Hand over project assignments and update contracts and expenditure records from available evidence.",
      ],
      illustration: {
        title: "A proposed action at a glance",
        items: [
          { label: "Proposal", value: "Service renewal" },
          { label: "Cost", value: "Awaiting an estimate" },
          { label: "Next step", value: "Project preparation" },
        ],
      },
    },
  },
  "executive-center": {
    cs: {
      audience: ["Vrcholové vedení", "Vedoucí oblastí", "Správci portfolia"],
      lead: "Vedení potřebuje rychle pochopit situaci a rozhodnout o dalším kroku. Executive Center nabízí vlastní prostor pro přehled portfolia, důležitých změn a podkladů pro porady. Z manažerského souhrnu se můžete dostat ke konkrétnímu projektu a jeho souvislostem, aniž byste při každé poradě znovu skládali informace z jednotlivých pracovních evidencí.",
      outcome: "Vidíte, čemu věnovat pozornost a na čem stojí předložené informace. Rozhodnutí lze spojit s odpovědnou osobou a navazujícím úkolem. Uzavřený zápis zachovává obsah porady; pozdější práce s úkoly jej zpětně nepřepisuje.",
      features: [
        { title: "Portfolio v srozumitelném přehledu", body: "Sledujte stav projektů a navázané finanční souvislosti v rozsahu svého přístupu. Manažerský pohled pomáhá vybrat téma k řešení a přejít od celkového obrazu ke konkrétnímu záměru nebo projektu." },
        { title: "Od souhrnu ke zdroji", body: "Když potřebujete vysvětlení, otevřete navazující detail a ověřte podklad. Vyhledávání pomáhá najít dostupný projekt, smlouvu nebo nákup. Přehled tak nekončí u samostatného čísla bez kontextu." },
        { title: "Podklady pro poradu", body: "Připravte témata a zachyťte podklad, nad kterým vedení jedná. Porada má svou agendu a souvislosti. Pro další čtení zůstává rozlišitelné, co bylo předloženo tehdy a jaký je současný stav." },
        { title: "Rozhodnutí s dalším krokem", body: "Zaznamenejte rozhodnutí, přiřaďte odpovědnou osobu a termín navazujícího úkolu. Při další poradě lze vrátit pozornost k otevřeným akcím a ověřit jejich postup, místo hledání závazků v různých poznámkách." },
        { title: "Sestavy pro další jednání", body: "Podklady lze předat jako PDF nebo prezentaci. Sestava zachycuje stav v okamžiku vytvoření a respektuje přístup ke zdrojům. Pomáhá při jednání, ale nenahrazuje aktuální pracovní evidenci ani účetní uzávěrku." },
      ],
      situations: [
        { title: "Před pravidelnou poradou", body: "Připravte společný přehled a vyberte témata, která vyžadují rozhodnutí. Účastníci mohou vycházet z konkrétního podkladu a vrátit se k předchozím závěrům i otevřeným úkolům." },
        { title: "Projekt potřebuje podporu vedení", body: "Otevřete jeho souvislosti, pojmenujte další krok a zaznamenejte odpovědnost. Management nemusí přebírat správu harmonogramu, aby mohl srozumitelně rozhodnout a následně sledovat výsledek." },
        { title: "Připravujete podklad k jednání", body: "Vyberte přehled pro dostupné portfolio a vytvořte sestavu pro další diskusi. Odkazy na zdroje pomáhají vysvětlit souvislosti; neznámé nebo nedostupné informace se nesmějí vydávat za nulové hodnoty." },
      ],
      steps: [
        "Otevřete manažerský přehled svého portfolia a vyberte téma, které vyžaduje pozornost.",
        "Ověřte jeho souvislosti a připravte podklad pro rozhodnutí nebo poradu.",
        "Zaznamenejte závěr, odpovědnost a další krok; při příštím jednání se k nim vraťte.",
      ],
      illustration: {
        title: "Od přehledu k rozhodnutí",
        items: [
          { label: "Téma", value: "Příprava modernizace" },
          { label: "Podklad", value: "Projekt a finanční plán" },
          { label: "Výsledek", value: "Rozhodnutí a další úkol" },
        ],
      },
    },
    en: {
      audience: ["Executive leaders", "Department heads", "Portfolio managers"],
      lead: "Leaders need to understand a situation quickly and decide what comes next. Executive Center provides a dedicated space for portfolio overviews, important changes and meeting materials. Move from a management summary to a specific project and its context, without reconstructing the picture from separate working records every time a meeting approaches.",
      outcome: "See what needs attention and what supports the information presented. Connect decisions to accountable people and follow-up tasks. Closed minutes retain the content of the meeting; subsequent work on tasks does not rewrite that historical record.",
      features: [
        { title: "A clear portfolio overview", body: "Follow project status and related financial context within your access rights. The management view helps select an issue to address and move from the overall picture to a particular proposal or project." },
        { title: "From the summary to its source", body: "When you need an explanation, open the related detail and check the supporting information. Search helps find an accessible project, contract or purchase. The overview gives context beyond an isolated number." },
        { title: "Materials for a meeting", body: "Prepare topics and capture the information that leaders will discuss. Each meeting has its agenda and context. Later readers can distinguish what was presented at the time from the current state of the work." },
        { title: "Decisions with a next step", body: "Record a decision, assign an accountable person and set a due date for the follow-up task. The next meeting can revisit open actions and check progress instead of searching through unrelated notes for commitments." },
        { title: "Reports to support discussions", body: "Share materials as a PDF or presentation. A report reflects the state when it was created and respects access to its sources. It supports discussion without replacing current working records or an accounting close." },
      ],
      situations: [
        { title: "Before a regular management meeting", body: "Prepare a shared overview and select issues that require decisions. Participants can work from a specific set of materials and revisit earlier conclusions and outstanding tasks." },
        { title: "A project needs leadership support", body: "Open its context, identify the next step and record responsibility. Management can make a clear decision and follow its outcome without taking over day-to-day ownership of the project schedule." },
        { title: "Preparing information for a discussion", body: "Select the view for an accessible portfolio and create a report for further discussion. Source links help explain the context; unknown or inaccessible information must not be treated as a zero value." },
      ],
      steps: [
        "Open the management view of your portfolio and select an issue that needs attention.",
        "Check its context and prepare the information needed for a decision or meeting.",
        "Record the conclusion, responsibility and next action; revisit them at the following meeting.",
      ],
      illustration: {
        title: "From an overview to a decision",
        items: [
          { label: "Topic", value: "Preparing modernisation" },
          { label: "Evidence", value: "Project and financial plan" },
          { label: "Outcome", value: "Decision and follow-up task" },
        ],
      },
    },
  },
  projectflow: {
    cs: {
      audience: ["Projektoví manažeři", "Řešitelé úkolů", "Vedoucí týmů"],
      lead: "Projekt nemusí začít hotovým harmonogramem. Nejprve je potřeba ujasnit zadání, rozdělit práci a zjistit, co chybí. ProjectFlow dává této přípravě místo a navazuje na ni řízeným projektovým plánem. Etapy, milníky, úkoly, odpovědnosti a návaznosti drží pohromadě, aby tým věděl, na čem pracuje a co má být výsledkem.",
      outcome: "Z návrhu vzniká plán, který lze postupně doplňovat a řídit. Připravený projekt může později převzít konkrétní zadání z Budgetu bez ztráty původních úkolů. Rozpracovaný návrh, pověřená příprava a schválená realizace se přitom nezaměňují.",
      features: [
        { title: "Místo pro první návrh", body: "Začněte zadáním a strukturou práce, i když ještě neznáte cenu nebo termíny. Nevyplněné informace nemusíte nahrazovat odhadem vydávaným za jistotu. Návrh slouží k přípravě a sám nepovoluje zahájení financované realizace." },
        { title: "Etapy, milníky a konkrétní úkoly", body: "Rozdělte projekt na přehledné části a popište očekávané výsledky. Milník pojmenuje, čeho má tým dosáhnout; úkol určí práci, odpovědnost a případný termín. Plán tak není jen seznamem neurčitých názvů." },
        { title: "Tabulka i časový plán", body: "Přehledná tabulka pomáhá s podrobnostmi, Ganttův diagram s orientací v čase. Návaznosti ukazují, které kroky na sebe čekají. Podle připravených informací lze postupně zpřesňovat termíny i rozdělení práce v týmu." },
        { title: "Předání do připraveného projektu", body: "Když Budget připraví zadání, lze jej propojit s konkrétním existujícím návrhem. Původní úkoly a jejich vazby zůstávají zachované. Tým pokračuje ve stejné přípravě a získává souvislost s rozhodnutím a finanční akcí." },
        { title: "Podklady pro kontrolu postupu", body: "Projektové přehledy, úkolové záznamy a kapacitní pohledy pomáhají při řízení práce a poradách. Změny plánu mají revize; při souběžné úpravě se starý plán nemá tiše přepsat přes novější práci kolegy." },
      ],
      situations: [
        { title: "Záměr teprve získává obrysy", body: "Vytvořte návrh projektu, připravte úkoly pro získání podkladů a určete očekávané výsledky. Pozdější schválení může navázat na rozpracovanou práci, místo jejího opakovaného zakládání." },
        { title: "Tým se potřebuje domluvit", body: "Pojmenujte úkoly, odpovědné řešitele a návaznosti. Časový pohled pomůže vysvětlit pořadí kroků a kapacitní pohled ukáže souvislosti přidělené práce; plánovaná kapacita není vykázaná práce." },
        { title: "Přichází nové projektové zadání", body: "Převezměte zadání do správného projektu a ověřte rozsah přípravy nebo realizace. Vazba na Budget umožní dohledat důvod předání a finanční kontext bez jeho ručního přepisování do harmonogramu." },
      ],
      steps: [
        "Založte návrh nebo otevřete předané zadání a pojmenujte očekávaný výsledek projektu.",
        "Rozdělte práci do etap, milníků a úkolů; doplňujte odpovědnosti, návaznosti a známé termíny.",
        "Po převzetí schváleného zadání pokračujte ve stejném projektu a průběžně ověřujte postup.",
      ],
      illustration: {
        title: "Projekt v přípravě",
        items: [
          { label: "Etapa", value: "Sběr podkladů" },
          { label: "Milník", value: "Ověřené zadání" },
          { label: "Úkol", value: "Zmapovat závislosti" },
        ],
      },
    },
    en: {
      audience: ["Project managers", "Task owners", "Team leaders"],
      lead: "Start by clarifying the assignment, dividing the work and identifying what is missing. ProjectFlow gives that preparation a home and connects it to a managed project plan. Phases, milestones, tasks, responsibilities and dependencies stay together, helping everyone understand the work and its intended result.",
      outcome: "Turn a proposal into a plan that can be developed and managed over time. A prepared project can later receive a specific assignment from Budget without losing its original tasks. A working proposal, authorised preparation and approved delivery remain distinct states.",
      features: [
        { title: "A home for the first proposal", body: "Start with the assignment and work structure, even when the cost or dates are unknown. There is no need to present a guess as a confirmed fact. A proposal supports preparation; it does not authorise funded delivery." },
        { title: "Phases, milestones and concrete tasks", body: "Divide a project into understandable parts and describe the expected outcomes. A milestone states what the team needs to achieve; a task identifies the work, responsibility and any due date. The plan becomes more than a list of vague titles." },
        { title: "A table and a timeline", body: "Use the table for details and the Gantt chart to understand timing. Dependencies show which steps rely on others. As information becomes available, refine dates and the allocation of work across the team." },
        { title: "A handoff into a prepared project", body: "When Budget prepares an assignment, link it to a specific existing proposal. Original tasks and their relationships are retained. The team continues its preparation with a clear connection to the decision and financial action." },
        { title: "Information for tracking progress", body: "Project overviews, task records and capacity views support coordination and meetings. Changes to the plan have revisions. When people edit concurrently, an older plan should not silently replace a colleague's newer work." },
      ],
      situations: [
        { title: "A proposal is still taking shape", body: "Create a project proposal, prepare tasks for gathering information and identify expected outcomes. Later approval can build on that work instead of requiring the team to recreate it in another project." },
        { title: "The team needs a shared plan", body: "Define tasks, accountable owners and dependencies. A timeline helps explain the order of work, while capacity views show the context of assigned work. Planned capacity is not a record of work performed." },
        { title: "A new assignment arrives", body: "Receive the assignment into the correct project and check whether it covers preparation or delivery. The Budget link preserves the reason for the handoff and its financial context without copying it into the schedule." },
      ],
      steps: [
        "Create a proposal or open a received assignment and describe the project's intended result.",
        "Divide the work into phases, milestones and tasks; add owners, dependencies and known dates.",
        "After receiving the approved assignment, continue in the same project and check progress regularly.",
      ],
      illustration: {
        title: "A project in preparation",
        items: [
          { label: "Phase", value: "Gathering information" },
          { label: "Milestone", value: "Validated assignment" },
          { label: "Task", value: "Map dependencies" },
        ],
      },
    },
  },
  archflow: {
    cs: {
      audience: ["Zadavatelé potřeb", "Architekti", "Schvalovací rada"],
      lead: "Než se z nápadu stane projekt, potřebujete porozumět jeho smyslu a dopadům. ArchFlow spojuje potřeby s cíli organizace, odborným posouzením a architekturou. Pomáhá pojmenovat očekávaný výsledek, doložit souvislosti a připravit rozhodnutí. Vedle evidence potřeb nabízí prostor pro architektonické prvky, jejich vazby a pohledy na současný i zamýšlený stav.",
      outcome: "Potřeba má jasný důvod, podklady a odpovědného gestora. Po schválení může pokračovat do Budgetu s doporučeným rokem plánování. Architektonický model lze rozvíjet vedle této práce; potvrzení potřeby není automatickým přidělením financí ani souhlasem s realizací.",
      features: [
        { title: "Potřeba s očekávaným výsledkem", body: "Zachyťte problém, požadavky a kritéria, podle kterých poznáte přínos změny. Zadání může začít jednoduše a postupně se doplňovat. Důležité je rozlišit, čeho chcete dosáhnout, od předčasného výběru konkrétního řešení." },
        { title: "Cíle a jejich podklady", body: "Spojte potřebu s cíli organizace a konkrétními dokumentovými zdroji. Katalog cílů má hierarchii a publikované verze. Podklady v AKB pomáhají doložit souvislosti a rozlišit současný strategický rámec od teprve připravované změny." },
        { title: "Rozhodnutí a další odpovědnost", body: "Odborné posouzení a rozhodnutí rady doplní další postup, odpovědného gestora a doporučený rok. Schválená potřeba se předává do finančního plánování, kde se dál řeší možnosti financování a konkrétní příprava akce." },
        { title: "Architektura, kterou můžete rozvíjet", body: "V katalogu evidujte prvky a jejich vztahy. Modelovací pohledy umožňují pracovat s umístěním prvků a vazbami v rozšířeném editoru. Popis současného a cílového stavu pomáhá vysvětlit, co zamýšlená změna ovlivní." },
        { title: "Návrhy a předání modelu", body: "Návrhy prvků z dokumentových podkladů procházejí lidským potvrzením. Potvrzený model lze předat ve formátu ArchiMate Model Exchange XML. Import podporovaného profilu nejprve ukáže změny a pouze přidává; výměnu s konkrétním nástrojem je potřeba ověřit." },
      ],
      situations: [
        { title: "Objevila se nová potřeba", body: "Zapište důvod a požadovaný přínos, připojte dostupné podklady a připravte posouzení. Cena nemusí být známá při prvním návrhu; schválení do plánování a financování mají odlišný význam." },
        { title: "Připravujete modernizaci služby", body: "Zmapujte související systémy, služby a závislosti. Architektonický pohled pomůže diskutovat dopady variant, získat chybějící informace a připravit zadání pro navazující projektovou práci." },
        { title: "Potřebujete předat architekturu", body: "Zkontrolujte potvrzené prvky, vazby a modelové pohledy a připravte export. Soubor usnadňuje odbornou výměnu modelu; sám není schválením architektury příslušnou institucí." },
      ],
      steps: [
        "Popište potřebu, její očekávaný výsledek a vztah k cílům organizace.",
        "Doplňte podklady, odborné posouzení a rozhodnutí o dalším postupu.",
        "Předejte schválenou potřebu gestorovi do Budgetu a rozvíjejte související architekturu.",
      ],
      illustration: {
        title: "Potřeba a její souvislosti",
        items: [
          { label: "Cíl", value: "Spolehlivější služba" },
          { label: "Podklad", value: "Ověřená verze dokumentu" },
          { label: "Další krok", value: "Posouzení a plánování" },
        ],
      },
    },
    en: {
      audience: ["People proposing needs", "Architects", "Approval boards"],
      lead: "Before an idea becomes a project, its purpose and impact need to be understood. ArchFlow connects needs to organisational goals, specialist assessment and architecture. It helps describe the intended result, establish the context and prepare a decision. Alongside needs management, it provides a space for architectural elements, their relationships and views of the current and intended state.",
      outcome: "Each need has a clear reason, supporting information and an accountable owner. After approval it can move to Budget with a recommended planning year. The architectural model can develop alongside this work; approving a need does not automatically allocate funds or authorise delivery.",
      features: [
        { title: "A need with an expected outcome", body: "Capture the problem, requirements and criteria that will demonstrate the benefit of a change. Start with a simple assignment and develop it over time. Distinguish the intended outcome from an early commitment to a particular solution." },
        { title: "Goals and supporting information", body: "Connect a need to organisational goals and specific document sources. The goal catalogue has a hierarchy and published versions. AKB sources help establish context and distinguish the current strategic framework from a change still being prepared." },
        { title: "A decision and an accountable owner", body: "Specialist assessment and a board decision establish the next step, accountable owner and recommended year. An approved need enters financial planning, where funding options and the preparation of a specific action are considered separately." },
        { title: "Architecture you can develop", body: "Record elements and their relationships in the catalogue. Modelling views support element placement and connections in an expanded editor. Descriptions of the current and target state help explain what a proposed change will affect." },
        { title: "Suggestions and model exchange", body: "Suggested elements drawn from documents require human confirmation. Confirmed models can be exported as ArchiMate Model Exchange XML. Importing a supported profile previews changes and only adds content; exchange with a particular tool still requires validation." },
      ],
      situations: [
        { title: "A new need has emerged", body: "Record its reason and intended benefit, add available information and prepare an assessment. The cost need not be known at the first proposal; approval for planning and funding have different meanings." },
        { title: "Preparing service modernisation", body: "Map related systems, services and dependencies. An architectural view supports discussion of alternative impacts, helps identify missing information and informs the assignment for subsequent project work." },
        { title: "Sharing an architectural model", body: "Review the confirmed elements, relationships and model views before exporting. The file supports professional model exchange; it is not, by itself, institutional approval of the architecture." },
      ],
      steps: [
        "Describe the need, its intended outcome and its relationship to organisational goals.",
        "Add supporting information, specialist assessment and a decision on the next step.",
        "Hand the approved need to its owner in Budget and develop the related architecture.",
      ],
      illustration: {
        title: "A need in context",
        items: [
          { label: "Goal", value: "A more reliable service" },
          { label: "Source", value: "A verified document version" },
          { label: "Next step", value: "Assessment and planning" },
        ],
      },
    },
  },
  akb: {
    cs: {
      audience: ["Pracovníci s dokumenty", "Odborní garanti", "Manažeři a týmy"],
      lead: "Dokument je užitečný tehdy, když ho dokážete najít, rozumíte jeho platnosti a můžete se vrátit ke zdroji odpovědi. AI Knowledge Base spojuje dokumentový registr, řízené verze a vyhledávání s citacemi. Patří do rodiny STRATOS jako samostatná aplikace pro znalosti a podklady, které potřebujete při rozhodování, přípravě změn i každodenní práci.",
      outcome: "Místo dohledávání příloh v různých složkách pracujete s dokumenty, jejich verzemi a souvislostmi. Odpověď s citací je cestou k podkladu, který můžete otevřít a posoudit. AI pomáhá s orientací; odborný závěr a rozhodnutí zůstávají na člověku.",
      features: [
        { title: "Dokumenty na jednom místě", body: "Přijímejte podklady do dokumentového registru a doplňujte informace potřebné pro jejich další použití. Smlouvy, metodiky nebo odborné materiály získají dohledatelný záznam, na který mohou odkazovat navazující pracovní oblasti STRATOS." },
        { title: "Verze, které neztrácejí původ", body: "Při změně dokumentu pracujte s konkrétní verzí a zachovejte vztah k předchozím podkladům. Uživatel se tak může orientovat v tom, ze kterého znění vycházel dotaz nebo související pracovní záznam." },
        { title: "Publikování podle pravidel", body: "Obsah prochází nastavenými pravidly přístupu a schvalováním. Organizace určuje odpovědnost i podmínky použití dokumentů. Nahrání souboru proto samo o sobě neznamená, že je připraven k použití všemi kolegy." },
        { title: "Otázky a odpovědi se zdroji", body: "Vyhledávání a chat pomáhají najít relevantní informace v dostupných podkladech. Citace vedou ke konkrétnímu zdroji pro ověření. Výsledek je třeba číst v jeho souvislostech; samotná formulace AI není důkazem správnosti." },
        { title: "Znalosti propojené s prací", body: "Potřeby, projektové úkoly a další záznamy mohou odkazovat na dokumentové podklady. AKB spravuje jejich obsah a verze, zatímco navazující aplikace zachovávají vazby. Čtenář vždy potřebuje odpovídající přístup ke konkrétnímu zdroji." },
      ],
      situations: [
        { title: "Hledáte odpověď v podkladech", body: "Položte konkrétní otázku, prohlédněte nalezené citace a ověřte relevantní část dokumentu. Pro důležité rozhodnutí zvažte i úplnost zdrojů a to, zda jsou pro váš účel aktuální." },
        { title: "Přichází nová verze metodiky", body: "Zařaďte ji do řízeného postupu a připravte potřebné posouzení. Zachování verzí pomáhá navázat na předchozí práci, aniž by se staré podklady bez vysvětlení nahrazovaly novými." },
        { title: "Tým potřebuje sdílený podklad", body: "Připojte konkrétní dokument k potřebě nebo projektu a nastavte jeho použití pro oprávněné kolegy. Stejný odkaz může sloužit k další kontrole i odborné diskusi." },
      ],
      steps: [
        "Zařaďte dokument a připravte jeho popis, odpovědnost a pravidla použití.",
        "Dokončete potřebné posouzení a zpřístupněte konkrétní verzi oprávněným čtenářům.",
        "Vyhledávejte, ptejte se a ověřujte citace před použitím odpovědi v další práci.",
      ],
      illustration: {
        title: "Odpověď, ke které je podklad",
        items: [
          { label: "Otázka", value: "Jaké podmínky platí?" },
          { label: "Zdroj", value: "Konkrétní verze dokumentu" },
          { label: "Ověření", value: "Otevření citované části" },
        ],
      },
    },
    en: {
      audience: ["Document users", "Subject specialists", "Managers and teams"],
      lead: "A document becomes useful when you can find it, understand which version applies and return to the source of an answer. AI Knowledge Base combines a document registry, governed versions and search with citations. It is the STRATOS family's dedicated knowledge application, supporting decisions, the preparation of changes and everyday work.",
      outcome: "Work with documents, their versions and context instead of searching for attachments in separate folders. A cited answer leads to material you can open and assess. AI helps you navigate information; professional judgement and decisions remain with people.",
      features: [
        { title: "Documents in one place", body: "Bring supporting material into the document registry and add the information needed for its use. Contracts, guidance and specialist documents gain a traceable record that other STRATOS working areas can reference." },
        { title: "Versions that retain their origins", body: "When a document changes, work with a specific version and keep its relationship to earlier material. Readers can see which text supported a question or a related working record rather than relying on an unspecified file." },
        { title: "Publishing under agreed rules", body: "Content follows configured access and approval rules. The organisation establishes responsibility and conditions for using documents. Uploading a file does not automatically make it ready for use by every colleague." },
        { title: "Questions and answers with sources", body: "Search and chat help find relevant information in accessible material. Citations lead to specific sources for verification. Read the result in context: the wording of an AI response is not, on its own, evidence of accuracy." },
        { title: "Knowledge connected to work", body: "Needs, project tasks and other records can reference supporting documents. AKB manages their content and versions while connected applications retain the links. Readers still need appropriate access to the particular source they want to open." },
      ],
      situations: [
        { title: "Looking for an answer in documents", body: "Ask a specific question, review the citations and check the relevant passage. Before an important decision, consider whether the sources are complete and current enough for the intended purpose." },
        { title: "A new guidance version arrives", body: "Bring it into the governed process and prepare the required review. Retained versions let new work build on earlier material without silently replacing the evidence behind previous decisions." },
        { title: "A team needs shared information", body: "Link a specific document to a need or project and establish its use for authorised colleagues. The same reference can support further checks and professional discussion as the work develops." },
      ],
      steps: [
        "Register a document and prepare its description, responsibility and conditions of use.",
        "Complete the required review and make the specific version available to authorised readers.",
        "Search, ask questions and check citations before using an answer in subsequent work.",
      ],
      illustration: {
        title: "An answer with supporting material",
        items: [
          { label: "Question", value: "Which conditions apply?" },
          { label: "Source", value: "A specific document version" },
          { label: "Check", value: "Open the cited passage" },
        ],
      },
    },
  },
  "stratos-voice": {
    cs: {
      audience: ["Účastníci porad", "Vedoucí a řešitelé", "Lidé pracující se zápisy"],
      lead: "Na poradě se chcete soustředit na rozhovor a k detailům se vrátit později. STRATOS Voice připravujeme pro iPhone jako pomocníka pro záznam, místní český přepis a pohodlnou práci s textem. Pro běžné nahrávání a přepis nepotřebujete projekt, portfolio ani účet. Organizační AI je volitelná cesta, kterou si vybíráte pro konkrétní kontrolu textu.",
      outcome: "Ze záznamu získáte pracovní přepis, ve kterém můžete hledat, poslouchat konkrétní úsek a opravovat text. Původní přepisy zůstávají zachované a přijaté opravy vytvářejí další revizi. Aplikaci připravujeme pro App Store; tato prezentace nepředstavuje veřejně dostupné stažení.",
      features: [
        { title: "Záznam a přepis v telefonu", body: "Nahrajte jednání, použijte pauzu nebo importujte audio. Místní český přepis lze vytvořit bez účtu. Výsledek je pracovní podklad, který je potřeba zkontrolovat, zejména u jmen, čísel a důležitých závěrů." },
        { title: "Čtení propojené s poslechem", body: "Procházejte přepis, vyhledejte konkrétní výraz a vraťte se k odpovídajícímu úseku nahrávky. Ruční úprava vám umožní doplnit přesné znění podle poslechu a znalosti situace, místo pouhého spoléhání na automatický přepis." },
        { title: "AI jen na váš pokyn", body: "Volitelně zvolte vlastní nebo organizací spravovanou AI pro kontrolu textu. Před odesláním si prohlédnete vybraný obsah a kontrolu výslovně spustíte. Při této AI kontrole se zvuková nahrávka neodesílá." },
        { title: "Opravy pod vaší kontrolou", body: "Porovnejte návrh s aktuálním zněním a přijměte jen změny, které považujete za správné. Potvrzené opravy vytvoří novou revizi. Historie a původní přepisy umožní vrátit se k tomu, z čeho upravený text vznikl." },
        { title: "Výstup pro další práci", body: "Sdílejte text nebo PDF podle potřeby, případně exportujte audio samostatně. Přepis může sloužit jako osobní pomůcka nebo podklad pro další zpracování. Jeho vytvoření samo nezakládá schválený zápis ani projektové úkoly." },
      ],
      situations: [
        { title: "Operativní schůzka bez projektu", body: "Zachyťte rozhovor a připravte si pracovní přepis bez zakládání portfolia nebo projektu. Vy sami rozhodujete, které poznámky později využijete a zda je předáte do dalšího prostředí." },
        { title: "Potřebujete ověřit důležitou větu", body: "Najděte příslušný úsek a poslechněte si jej znovu. U jména, částky nebo záporu rozhoduje ověření v původním záznamu a kontext rozhovoru, nikoli přesvědčivost navržené formulace." },
        { title: "Připravujete čitelný pracovní text", body: "Upravte přepis ručně nebo požádejte o volitelnou AI kontrolu. Prohlédněte návrhy a potvrďte vhodné změny do nové revize, přičemž původní znění zůstane dohledatelné." },
      ],
      steps: [
        "Pořiďte nebo importujte záznam a vytvořte místní pracovní přepis.",
        "Přečtěte text, ověřte důležité úseky poslechem a případně vyžádejte AI kontrolu.",
        "Potvrďte vybrané opravy do nové revize a sdílejte výstup podle vlastní potřeby.",
      ],
      illustration: {
        title: "Každou opravu potvrzujete vy",
        items: [
          { label: "Původní přepis", value: "Zůstává zachovaný" },
          { label: "Návrh úpravy", value: "Čeká na vaše posouzení" },
          { label: "Potvrzení", value: "Vytvoří novou revizi" },
        ],
      },
    },
    en: {
      audience: ["Meeting participants", "Leaders and team members", "People preparing meeting notes"],
      lead: "Focus on the conversation and return to details later. STRATOS Voice is being prepared for iPhone for recording, local Czech transcription and working comfortably with text. Recording and transcription require no project, portfolio or account. Organisational AI is an optional route you choose for a particular text review.",
      outcome: "Turn a recording into a working transcript you can search, check against a specific audio passage and edit. Original transcripts are retained, and accepted corrections create another revision. The app is being prepared for the App Store; this presentation does not offer a publicly available download.",
      features: [
        { title: "Recording and transcription on your phone", body: "Record a meeting, pause when needed or import audio. Local Czech transcription can be created without an account. The result is a working draft that needs checking, especially names, numbers and important conclusions." },
        { title: "Reading connected to listening", body: "Browse the transcript, search for a particular expression and return to the corresponding recording passage. Manual editing lets you establish the correct wording from listening and context rather than relying only on an automatic transcript." },
        { title: "AI only when you request it", body: "Optionally select personal or organisation-managed AI for a text review. Preview the selected content before sending it and explicitly start the review. The audio recording is not sent as part of this AI text review." },
        { title: "Corrections under your control", body: "Compare a suggestion with the current text and accept only changes you consider correct. Confirmed corrections create a new revision. The history and original transcripts let you return to the material behind the edited version." },
        { title: "An output for further work", body: "Share text or a PDF as needed, or export audio separately. A transcript can remain a personal aid or support further processing. Creating it does not automatically produce approved minutes or create project tasks." },
      ],
      situations: [
        { title: "An operational meeting without a project", body: "Capture the conversation and prepare a working transcript without creating a portfolio or project. You decide which notes to use later and whether to bring them into another working environment." },
        { title: "Checking an important sentence", body: "Find the relevant passage and listen again. A name, amount or negative statement requires checking against the original recording and conversation context, rather than trusting how convincing a suggested sentence sounds." },
        { title: "Preparing a readable working text", body: "Edit the transcript manually or request an optional AI review. Examine the suggestions and confirm suitable changes into a new revision while retaining the original wording for reference." },
      ],
      steps: [
        "Record or import audio and create a local working transcript.",
        "Read the text, check important passages by listening and optionally request an AI review.",
        "Confirm selected corrections into a new revision and share the output as needed.",
      ],
      illustration: {
        title: "You confirm every correction",
        items: [
          { label: "Original transcript", value: "Retained for reference" },
          { label: "Suggested edit", value: "Awaiting your review" },
          { label: "Confirmation", value: "Creates a new revision" },
        ],
      },
    },
  },
};
