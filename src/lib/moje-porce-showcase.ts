export interface MojePorceScreenshot {
  id: string;
  src: string;
  preview: string;
  width: number;
  height: number;
  previewWidth: number;
  previewHeight: number;
  titleCs: string;
  titleEn: string;
  captionCs: string;
  captionEn: string;
  altCs: string;
  altEn: string;
}

export const mojePorceScreenshots: MojePorceScreenshot[] = [
  {
    "id": "diary-desktop",
    "src": "/images/moje-porce/01-web-diary-be862050835d.webp",
    "preview": "/images/moje-porce/01-web-diary-be862050835d-preview.webp",
    "width": 2880,
    "height": 2000,
    "previewWidth": 960,
    "previewHeight": 667,
    "titleCs": "Dnes na první pohled",
    "titleEn": "Your day at a glance",
    "captionCs": "Energie, živiny a voda v jednom denním přehledu.",
    "captionEn": "Energy, nutrients and water in one daily overview.",
    "altCs": "Dnes na první pohled: Energie, živiny a voda v jednom denním přehledu. Vzorová data, české rozhraní.",
    "altEn": "Your day at a glance: Energy, nutrients and water in one daily overview. Sample data, Czech interface."
  },
  {
    "id": "recipe-desktop",
    "src": "/images/moje-porce/02-web-recipe-8295de9d0b7f.webp",
    "preview": "/images/moje-porce/02-web-recipe-8295de9d0b7f-preview.webp",
    "width": 2880,
    "height": 2000,
    "previewWidth": 960,
    "previewHeight": 667,
    "titleCs": "Vlastní recepty",
    "titleEn": "Your own recipes",
    "captionCs": "Recept, suroviny, postup a výběr porce na jednom místě.",
    "captionEn": "A recipe, ingredients, instructions and portion selection in one place.",
    "altCs": "Vlastní recepty: Recept, suroviny, postup a výběr porce na jednom místě. Vzorová data, české rozhraní.",
    "altEn": "Your own recipes: A recipe, ingredients, instructions and portion selection in one place. Sample data, Czech interface."
  },
  {
    "id": "pantry-desktop",
    "src": "/images/moje-porce/03-web-pantry-c0b653e04f34.webp",
    "preview": "/images/moje-porce/03-web-pantry-c0b653e04f34-preview.webp",
    "width": 2880,
    "height": 2000,
    "previewWidth": 960,
    "previewHeight": 667,
    "titleCs": "Co máte doma",
    "titleEn": "What you have at home",
    "captionCs": "Přehled zásob a toho, co je potřeba doplnit.",
    "captionEn": "See your pantry items and what needs replenishing.",
    "altCs": "Co máte doma: Přehled zásob a toho, co je potřeba doplnit. Vzorová data, české rozhraní.",
    "altEn": "What you have at home: See your pantry items and what needs replenishing. Sample data, Czech interface."
  },
  {
    "id": "shopping-desktop",
    "src": "/images/moje-porce/04-web-shopping-98f5336458f4.webp",
    "preview": "/images/moje-porce/04-web-shopping-98f5336458f4-preview.webp",
    "width": 2880,
    "height": 2000,
    "previewWidth": 960,
    "previewHeight": 667,
    "titleCs": "Nákupní seznam",
    "titleEn": "Shopping list",
    "captionCs": "Seznam, odškrtávání v košíku a dokončení nákupu.",
    "captionEn": "A list, ticking items off and completing a purchase.",
    "altCs": "Nákupní seznam: Seznam, odškrtávání v košíku a dokončení nákupu. Vzorová data, české rozhraní.",
    "altEn": "Shopping list: A list, ticking items off and completing a purchase. Sample data, Czech interface."
  },
  {
    "id": "ai-review-demo",
    "src": "/images/moje-porce/05-web-ai-review-b09c7589fffc.webp",
    "preview": "/images/moje-porce/05-web-ai-review-b09c7589fffc-preview.webp",
    "width": 2880,
    "height": 2000,
    "previewWidth": 960,
    "previewHeight": 667,
    "titleCs": "Ilustrační ukázka AI návrhu",
    "titleEn": "Illustrative AI suggestion demo",
    "captionCs": "Pevně připravený příklad ukazuje kontrolu návrhu před uložením.",
    "captionEn": "A fixed example illustrates reviewing a suggestion before saving.",
    "altCs": "Ilustrační ukázka AI návrhu: Pevně připravený příklad ukazuje kontrolu návrhu před uložením. Vzorová data, české rozhraní.",
    "altEn": "Illustrative AI suggestion demo: A fixed example illustrates reviewing a suggestion before saving. Sample data, Czech interface."
  },
  {
    "id": "portion-mobile",
    "src": "/images/moje-porce/06-web-mobile-portion-e43cd64992b0.webp",
    "preview": "/images/moje-porce/06-web-mobile-portion-e43cd64992b0-preview.webp",
    "width": 780,
    "height": 1688,
    "previewWidth": 480,
    "previewHeight": 1039,
    "titleCs": "Porce před uložením",
    "titleEn": "Review your portion",
    "captionCs": "Upravte množství a zkontrolujte energii a živiny.",
    "captionEn": "Adjust the amount and review energy and nutrients.",
    "altCs": "Porce před uložením: Upravte množství a zkontrolujte energii a živiny. Vzorová data, české rozhraní.",
    "altEn": "Review your portion: Adjust the amount and review energy and nutrients. Sample data, Czech interface."
  }
];

export const mojePorceCopy = {
  "cs": {
    "eyebrow": "Webová beta pro váš den",
    "headline": "Jídlo, nákupy a domácnost. V jednom přehledu.",
    "intro": "Zapište, co jste jedli, uložte vlastní recepty a připravte nákup podle toho, co máte doma. Začněte jedním jídlem a další části si přidejte, když je potřebujete.",
    "action": "Vyzkoušet zdarma",
    "actionNote": "Webová beta · nyní převážně v češtině",
    "explore": "Poznat aplikaci",
    "arrangement": "Moje porce funguje v prohlížeči na telefonu i počítači. Na telefonu si ji můžete přidat na plochu.",
    "facts": [
      [
        "Skutečná porce",
        "Zápis podle toho, co jste snědli"
      ],
      [
        "Doma i v obchodě",
        "Recepty, zásoby a nákupní seznam"
      ],
      [
        "Váš výběr",
        "AI návrh kontrolujete a potvrzujete"
      ]
    ],
    "featuresTitle": "Méně přemýšlení kolem každého zápisu",
    "featuresIntro": "Od zápisu jídla přes vlastní recepty až po nákup a domácnost.",
    "features": [
      [
        "Váš den na první pohled",
        "Energie, živiny a voda pohromadě. Přehled si upravíte podle toho, co chcete sledovat."
      ],
      [
        "Jídlo, které opravdu jíte",
        "Vyhledejte jídlo, vyberte porci a uložte zápis. U známých výrobků pomůže čárový kód, oblíbená jídla máte po ruce."
      ],
      [
        "Vlastní kuchyně",
        "Recepty, suroviny a postup na jednom místě. Do deníku patří porce, kterou jste skutečně snědli."
      ],
      [
        "Nákup navazuje na zásoby",
        "Sepište, co chybí, během nákupu odškrtávejte a po kontrole účtenky doplňte domácnost."
      ],
      [
        "Domácnost spolu",
        "Sdílejte seznam, zásoby a vybrané věrnostní karty. Osobní deník zůstává váš."
      ],
      [
        "Fotografie jako pomocník",
        "Volitelná AI navrhne jídlo nebo přečte účtenku. Návrh před uložením vždy zkontrolujete; cenu analýzy uvidíte předem."
      ]
    ],
    "galleryTitle": "Podívejte se dovnitř",
    "galleryIntro": "Deník, recepty a nákupy v jedné aplikaci. Kliknutím otevřete celý obrázek a prohlédnete si podrobnosti.",
    "galleryNotice": "Ukázky zachycují české rozhraní se vzorovými daty. Ukázka AI návrhu používá pevně připravený příklad.",
    "imageAction": "Otevřít celý obrázek",
    "heroCaption": "Deník a denní přehled · ukázková data",
    "workflowTitle": "Od receptu až k zapsané porci",
    "workflow": [
      [
        "Vyberte, co budete vařit",
        "Otevřete recept a podívejte se, co už máte doma."
      ],
      [
        "Nakupte, co chybí",
        "Připravte seznam. Nákup můžete po kontrole účtenky propojit se zásobami."
      ],
      [
        "Zapište, co jste snědli",
        "Vyberte skutečnou porci a sledujte svůj den v přehledu."
      ]
    ],
    "guideAction": "Průvodce recepty, zásobami a nákupy",
    "plansTitle": "Začněte zdarma. Další možnosti jsou volitelné.",
    "freeTitle": "Zdarma",
    "freeText": "Základní zápisy jídla a vody, vyhledávání, vlastní recepty, zásoby, nákupní seznam a věrnostní karty můžete používat zdarma.",
    "premiumTitle": "Premium beta",
    "premiumText": "Premium v beta provozu přidává volitelné AI zpracování fotografií a účtenek, rozšířené plánování a delší přehledy. AI analýzy využívají kredity; konkrétní cenu uvidíte před potvrzením. Informace o dostupnosti Premium a kreditů najdete přímo v aplikaci. Samostatný nákup předplatného zatím není dostupný.",
    "plansAction": "Premium a AI kredity",
    "nativeEyebrow": "Web a připravované aplikace pro Apple",
    "nativeTitle": "Na počítači i v telefonu",
    "nativeText": "Webovou aplikaci otevřete v prohlížeči a na telefonu si ji můžete přidat na plochu. Aplikaci pro iPhone a iPad a doprovod pro Apple Watch připravujeme. Zatím nejsou veřejně ke stažení.",
    "nativeHealth": "",
    "faqTitle": "Na co se často ptáte",
    "faq": [
      [
        "Musím používat všechny části aplikace?",
        "Ne. Začněte deníkem a zapněte si jen záložky, které potřebujete."
      ],
      [
        "Uloží AI jídlo rovnou?",
        "Ne. Fotografie dává orientační návrh. Před uložením zkontrolujete jídlo, množství i hodnoty."
      ],
      [
        "Funguje aplikace bez internetu?",
        "Část zápisů deníku lze uchovat v zařízení. AI, aktuální nabídky a přenos dat mezi zařízeními potřebují připojení."
      ],
      [
        "Najdu vždy nejlevnější nákup?",
        "Nabídky postupně doplňujeme. Dostupnost závisí na obchodu, místě a platnosti; některé ceny vyžadují věrnostní kartu. Úplné pokrytí ani nejlevnější celý košík neslibujeme."
      ],
      [
        "Co sdílím s domácností?",
        "Vybrané seznamy, zásoby a věrnostní karty. Osobní deník, zdravotní údaje a soukromé doklady se tím automaticky nesdílejí."
      ],
      [
        "Lze propojit Apple Zdraví na webu?",
        "Přímé propojení patří do připravované aplikace pro iPhone. Web může zobrazit souhrny, které z ní výslovně sdílíte se svým účtem."
      ],
      [
        "Je aplikace i v angličtině?",
        "Rozhraní je nyní české. Tato prezentace je dostupná také v angličtině."
      ]
    ],
    "helpTitle": "Pomůžeme s prvními kroky",
    "helpText": "Najděte postup pro první zápis, recepty nebo nákupy.",
    "helpLinks": [
      [
        "https://mojeporce.cz/pruvodce",
        "Průvodce aplikací"
      ],
      [
        "https://mojeporce.cz/pruvodce/recepty-nakupy-a-zasoby",
        "Recepty, nákupy a zásoby"
      ],
      [
        "https://mojeporce.cz/pruvodce/fotografie-jidla-a-uctenky",
        "Fotografie jídla a účtenky"
      ],
      [
        "https://mojeporce.cz/podpora",
        "Podpora"
      ],
      [
        "https://mojeporce.cz/ochrana-soukromi",
        "Informace o soukromí"
      ]
    ],
    "contactEyebrow": "Moje porce pro váš den",
    "contactTitle": "Začněte jedním jídlem",
    "contactText": "Nemusíte si naplánovat všechno dopředu. Otevřete Moje porce a zapište svůj první den.",
    "contactAction": "Vyzkoušet zdarma",
    "partnershipText": "Máte nápad na spolupráci?",
    "partnershipAction": "Ozvěte se VCode"
  },
  "en": {
    "eyebrow": "Web beta for your day",
    "headline": "Food, shopping and your household. One clear overview.",
    "intro": "Log what you eat, keep your own recipes and plan shopping around what you already have at home. Start with one meal and add other sections when you need them.",
    "action": "Try it free",
    "actionNote": "Web beta · currently primarily in Czech",
    "explore": "Explore the app",
    "arrangement": "Moje porce works in your browser on phones and computers. You can add it to your phone’s home screen.",
    "facts": [
      [
        "Your actual portion",
        "Log what you have eaten"
      ],
      [
        "At home and in the shop",
        "Recipes, pantry and shopping lists"
      ],
      [
        "Your choice",
        "You review and confirm AI suggestions"
      ]
    ],
    "featuresTitle": "Make everyday food tracking easier",
    "featuresIntro": "From logging food and keeping recipes to shopping and household planning.",
    "features": [
      [
        "Your day at a glance",
        "Energy, nutrients and water together. Choose what you want to see in your overview."
      ],
      [
        "The food you actually eat",
        "Find a meal, choose a portion and save it. Scan known products by barcode and keep favourites close at hand."
      ],
      [
        "Your own kitchen",
        "Recipes, ingredients and instructions in one place. Log the portion you actually ate."
      ],
      [
        "Shopping connected to your pantry",
        "List what is missing, tick items off as you shop and update your pantry after reviewing the receipt."
      ],
      [
        "A household you can share",
        "Share shopping lists, pantry items and selected loyalty cards. Your personal food diary remains yours."
      ],
      [
        "Photos as a helping hand",
        "Optional AI can suggest a meal or read a receipt. Review the suggestion before saving; the analysis price is shown beforehand."
      ]
    ],
    "galleryTitle": "Take a look inside",
    "galleryIntro": "Diary, recipes and shopping in one app. Select an image to open it in full. The application interface shown is in Czech.",
    "galleryNotice": "Screenshots show the Czech interface with sample data. The AI suggestion demo uses a fixed illustrative example.",
    "imageAction": "Open full image",
    "heroCaption": "Diary and daily overview · demonstration data · Czech interface",
    "workflowTitle": "From a recipe to the portion you ate",
    "workflow": [
      [
        "Choose what to cook",
        "Open a recipe and check what you already have at home."
      ],
      [
        "Buy what is missing",
        "Make a shopping list. After reviewing a receipt, you can connect the purchase to your pantry."
      ],
      [
        "Log what you ate",
        "Choose your actual portion and follow your day in the overview."
      ]
    ],
    "guideAction": "Guide to recipes, pantry and shopping (Czech)",
    "plansTitle": "Start free. Extra features are optional.",
    "freeTitle": "Free",
    "freeText": "Basic food and water logging, search, personal recipes, pantry items, shopping lists and loyalty cards are free to use.",
    "premiumTitle": "Premium beta",
    "premiumText": "Premium is in beta and adds optional AI photo and receipt analysis, extended planning and longer-term summaries. AI analyses use credits; the specific price is shown before confirmation. Availability of Premium and credits is explained in the app. Self-service subscription purchases are not available yet.",
    "plansAction": "Premium and AI credits (Czech)",
    "nativeEyebrow": "Web and upcoming Apple apps",
    "nativeTitle": "On your computer and your phone",
    "nativeText": "Open the web app in your browser or add it to your phone’s home screen. The iPhone and iPad app and Apple Watch companion are in preparation. They are not publicly available for download yet.",
    "nativeHealth": "",
    "faqTitle": "Common questions",
    "faq": [
      [
        "Do I have to use every section?",
        "No. Start with the diary and enable only the tabs you need."
      ],
      [
        "Does AI save a meal automatically?",
        "No. A photo produces an estimate. Review the food, amount and nutrition values before saving."
      ],
      [
        "Does it work offline?",
        "Some diary entries can be kept on the device. AI, current offers and transfers between devices need an internet connection."
      ],
      [
        "Will it always find the cheapest shopping?",
        "We are gradually expanding offers. Availability depends on the store, location and dates; some prices require a loyalty card. We do not promise complete coverage or the cheapest whole basket."
      ],
      [
        "What do I share with my household?",
        "Selected lists, pantry items and loyalty cards. Your personal diary, health data and private receipts are not automatically shared."
      ],
      [
        "Can I connect Apple Health on the web?",
        "Direct access belongs to the upcoming iPhone app. The web can display summaries you explicitly choose to share from it with your account."
      ],
      [
        "Is the app available in English?",
        "The interface is currently in Czech. This presentation is also available in English."
      ]
    ],
    "helpTitle": "Help with your first steps",
    "helpText": "Find help with your first entry, recipes or shopping. These guides are in Czech.",
    "helpLinks": [
      [
        "https://mojeporce.cz/pruvodce",
        "App guide"
      ],
      [
        "https://mojeporce.cz/pruvodce/recepty-nakupy-a-zasoby",
        "Recipes, shopping and pantry"
      ],
      [
        "https://mojeporce.cz/pruvodce/fotografie-jidla-a-uctenky",
        "Food photos and receipts"
      ],
      [
        "https://mojeporce.cz/podpora",
        "Support"
      ],
      [
        "https://mojeporce.cz/ochrana-soukromi",
        "Privacy information (Czech)"
      ]
    ],
    "contactEyebrow": "Moje porce for your day",
    "contactTitle": "Start with one meal",
    "contactText": "You do not need to plan everything in advance. Open Moje porce and start logging your day.",
    "contactAction": "Try it free",
    "partnershipText": "Have an idea for a partnership?",
    "partnershipAction": "Contact VCode"
  }
};
