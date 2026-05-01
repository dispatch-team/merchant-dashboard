/**
 * Amharic translations for Dispatch
 *
 * HOW TO EDIT:
 *  - Mirror every key from `en.ts` here.
 *  - Keep the brand name "Dispatch" in English.
 *  - Amharic script (Ge'ez) is right-to-left within words but the language
 *    itself flows left-to-right at the sentence level in modern digital use,
 *    so no `dir="rtl"` is needed.
 */

import type { Messages } from "./en";

const am: Messages = {
  // ─── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Dispatch",
    tagline: "የተዋሃደ የሎጂስቲክስ መድረክ",
    description:
      "ነጋዴዎችን ከኩሪየር አቅራቢዎች ጋር የሚያገናኝ ሶፍትዌር፣ የ shipment ፈጠራን፣ ኩሪየር ምርጫን፣ እና የዕቃ ክትትልን በአንድ ኃይለኛ መድረክ ያቃልላል።",
  },

  // ─── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    features: "ባህሪያት",
    howItWorks: "እንዴት ይሰራል",
    portals: "መግቢያዎች",
    login: "ግባ",
    getStarted: "ጀምር",
  },

  // ─── Merchant Navigation ────────────────────────────────────────────────────
  nav_merchant: {
    dashboard: "ዳሽቦርድ",
    shipments: "ጭነቶች",
    couriers: "ኩሪየሮች",
    apiKeys: "API ቁልፎች",
    webhooks: "Webhooks",
    profile: "መገለጫ",
    settings: "የሲስተም ቅንብሮች",
    logout: "ውጣ",
  },

  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    sessionExpired: "ቆይታዎ አልፎበታል። እባክዎን እንደገና ይግቡ።",
  },

  // ─── Landing Hero ───────────────────────────────────────────────────────────
  hero: {
    badge: "ለአዲስ አበባ ሎጂስቲክስ የተሰራ",
    headline1: "ለእያንዳንዱ ዕቃ አቅርቦት",
    headline2: "ትክክለኛው አቋራጭ።",
    downloadDriverApp: "የሾፌር መተግበሪያ አውርድ",
    merchantLogin: "ነጋዴ ግባ",
    scroll: "ወደታች ሸብልል",
  },

  // ─── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    courierPartners: "የኩሪየር አጋሮች",
    activeMerchants: "ንቁ ነጋዴዎች",
    deliveriesCompleted: "የተጠናቀቁ ዕቃ አቅርቦቶች",
    avgDeliveryTime: "አማካይ የማቅረቢያ ጊዜ",
  },

  // ─── Features Section ────────────────────────────────────────────────────────
  features: {
    sectionLabel: "መድረክ",
    headline1: "የሚያስፈልጉዎት ሁሉ።",
    headline2: "የማይሻሉትን ሳይጨምር።",
    shipmentManagement: {
      title: "የ Shipment አወዳደር",
      description:
        "ከብዙ የኩሪየር አቅራቢዎች በአንድ ወጥ ዳሽቦርድ shipmentዎችን ፍጠር፣ ክትተለ፣ እና አስተዳድር።",
    },
    fleetCoordination: {
      title: "የፍሊት ቅንጅት",
      description:
        "በቅጽበታዊ ሾፌር ክትትል፣ ብልጥ የመንገድ አወዳደር፣ እና የዕቃ አቅርቦት ማረጋገጫ ዓሠራሮች።",
    },
    performanceAnalytics: {
      title: "የአፈጻጸም ትንታኔ",
      description:
        "በይነተገናኝ ትንታኔ አማካይነት የኩሪየር አፈጻጸምን፣ የዕቃ አቅርቦት ጊዜን፣ እና የስኬት ደረጃዎችን አወዳድር።",
    },
    apiIntegration: {
      title: "የ API ውህደት",
      description:
        "ከ e-commerce መድረኮች ጋር ቀላል ውህደት ለማድረግ ቁልፍ አወዳደር ያለው RESTful API።",
    },
    locationIntelligence: {
      title: "የቦታ ብልህነት",
      description:
        "ለአዲስ አበባ ልዩ አድራሻ ስርዓት የተዘጋጀ የምልክት-ቦታ መፍቻ።",
    },
    courierRatings: {
      title: "የኩሪየር ደረጃ አሰጣጥ",
      description:
        "ከእውነተኛ የዕቃ አቅርቦት አፈጻጸም ውሂብ ተመስርቶ የኩሪየር አቅራቢዎችን ደምድም እና አወዳድር።",
    },
  },

  // ─── How It Works ───────────────────────────────────────────────────────────
  howItWorks: {
    sectionLabel: "ሂደት",
    headline: "በደቂቃዎች ጀምር።",
    step1: {
      title: "ተመዝገብ",
      description:
        "የነጋዴ ሂሳብህን በንግድ ዝርዝሮችህ ፍጠር እና ወዲያው የመድረኩን ተደራሽነት አግኝ።",
    },
    step2: {
      title: "ኩሪየር ምረጥ",
      description:
        "ያሉ ኩሪየሮችን ዳስስ፣ ዋጋዎችን፣ የአፈጻጸም መለኪያዎችን፣ እና የዕቃ አቅርቦት ቦታዎችን አወዳድር።",
    },
    step3: {
      title: "ላክ እና ክትተለ",
      description:
        "Shipmentዎችን ፍጠር፣ በቅጽበት ክትተለ፣ የማቅረቢያ ማረጋገጫ አግኝ፣ እና ሎጂስቲክስ ተንተን።",
    },
  },

  // ─── Portals Section ────────────────────────────────────────────────────────
  portals: {
    sectionLabel: "መግቢያዎች",
    headline: "ለእያንዳንዱ ሚና የተሰራ።",
    subheading:
      "በዕቃ አቅርቦት ሰንሰለት ውስጥ ላለ እያንዳንዱ ባለድርሻ አካል የተለዩ ዳሽቦርዶች።",
    merchant: {
      title: "ነጋዴ",
      description: "Shipmentዎችን ፍጠር፣ ኩሪየሮችን አወዳድር፣ እና ዕቃ አቅርቦቶችን ክትተለ።",
    },
    supervisor: {
      title: "የኩሪየር ተቆጣጣሪ",
      description: "ሾፌሮችን አስተዳድር፣ Shipmentዎችን ምደብ፣ እና ፍሊቱን ክትተለ።",
    },
    admin: {
      title: "አስተዳዳሪ",
      description: "መድረኩን፣ ኩሪየሮችን፣ እና የሲስተም መለኪያዎችን ተቆጣጠር።",
    },
  },

  // ─── CTA Section ────────────────────────────────────────────────────────────
  cta: {
    headline1: "ሎጂስቲክስህን ለማቅለል",
    headline2: "ዝግጁ ነህ?",
    subheading:
      "Dispatchን ተቀላቀልና ዛሬ ንግዱን ከአዲስ አበባ ኩሪየር መረብ ጋር አገናኝ።",
    createAccount: "የነጋዴ ሂሳብ ፍጠር",
    courierLogin: "የኩሪየር ግቢያ",
  },

  // ─── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Dispatch. ለአዲስ አበባ የተሰራ።",
    merchant: "ነጋዴ",
    supervisor: "ተቆጣጣሪ",
    downloadDriverApp: "የሾፌር መተግበሪያ አውርድ",
    admin: "አስተዳዳሪ",
  },

  // ─── Login Page ─────────────────────────────────────────────────────────────
  login: {
    welcomeBack: "እንኳን ደህና ተመለሱ",
    platformDescription:
      "ነጋዴዎችን እና የኩሪየር አቅራቢዎችን በአዲስ አበባ የሚያገናኝ የተዋሃደ የሎጂስቲክስ መድረክ።",
    back: "ተመለስ",
    emailLabel: "ኢሜይል",
    emailPlaceholder: "you@example.com",
    passwordLabel: "የሚስጥር ቁጥር",
    forgotPassword: "የሚስጥር ቁጥርዎን ረሱ?",
    signIn: "ግባ",
    signingIn: "በመግባት ላይ...",
    switchPortal: "ወደ ሌላ መግቢያ ቀይር",

    roles: {
      merchant: {
        label: "ነጋዴ",
        subtitle: "Shipmentዎችን ያስተዳድሩ እና ዕቃ አቅርቦቶችን ይከታተሉ",
      },
      supervisor: {
        label: "የኩሪየር ተቆጣጣሪ",
        subtitle: "ሾፌሮችን እና የፍሊት ስራዎችን ያስተዳድሩ",
      },
      admin: {
        label: "አስተዳዳሪ",
        subtitle: "የመድረኩን ስራዎች እና መለኪያዎች ይቆጣጠሩ",
      },
    },

    validation: {
      emailRequired: "ኢሜይል ያስፈልጋል።",
      emailInvalid: "እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ።",
      emailTooLong: "ኢሜይሉ ከ 255 ፊደሎች ያነሰ መሆን አለበት።",
      passwordRequired: "የሚስጥር ቁጥር ያስፈልጋል።",
      passwordTooShort: "የሚስጥር ቁጥሩ ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባል።",
    },

    lockout: {
      message: "ብዙ ስህተታ ሙከራዎች። እባክዎ በ {time} ውስጥ እንደገና ይሞክሩ።",
    },
  },

  // ─── Register Page ──────────────────────────────────────────────────────────
  register: {
    title: "Dispatchን ይቀላቀሉ",
    subtitle: "ንግድዎን ይመዝግቡ እና በአዲስ አበባ ካሉ ምርጥ ኩሪየሮች ጋር ጭነቶችን ማስተዳደር ይጀምሩ።",
    headline: "የነጋዴ ሂሳብ ይፍጠሩ",
    subheadline: "Dispatchን መጠቀም ለመጀመር ንግድዎን ይመዝግቡ",
    steps: {
      account: {
        title: "ሂሳብዎን ይፍጠሩ",
        desc: "ከንግድ ዝርዝሮችዎ ጋር ይመዝገቡ",
      },
      courier: {
        title: "ኩሪየር ይምረጡ",
        desc: "የኩሪየር አቅራቢዎችን ያስሱ እና ያወዳድሩ",
      },
      shipping: {
        title: "መላክ ይጀምሩ",
        desc: "ጭነቶችን ይፍጠሩ እና ማድረሻዎችን ይከታተሉ",
      },
    },
    fields: {
      firstName: "ስም",
      lastName: "የአባት ስም",
      businessName: "የንግድ ስም",
      address: "የኩባንያ አድራሻ",
      industry: "የስራ መስክ",
      phone: "ስልክ ቁጥር",
      email: "ኢሜይል",
      website: "የድረ-ገጽ አድራሻ (አማራጭ)",
      description: "የንግድ መግለጫ (አማራጭ)",
      password: "የሚስጥር ቁጥር",
      confirmPassword: "የሚስጥር ቁጥር ያረጋግጡ",
    },
    placeholders: {
      firstName: "ዮሐንስ",
      lastName: "በቀለ",
      businessName: "የእርስዎ ኩባንያ ኃ.የተ.የግ.ማ",
      address: "ቦሌ መንገድ፣ አዲስ አበባ፣ ኢትዮጵያ",
      industry: "ሎጂስቲክስ",
      phone: "+2519xxxxxxxx",
      email: "you@business.com",
      website: "https://example.com",
      description: "ስለ ንግድዎ ይግለጹ...",
    },
    validation: {
      firstName: "ስም ያስፈልጋል",
      lastName: "የአባት ስም ያስፈልጋል",
      businessName: "የንግድ ስም ያስፈልጋል",
      address: "አድራሻ ያስፈልጋል",
      industry: "የስራ መስክ ያስፈልጋል",
      phoneRequired: "ስልክ ቁጥር ያስፈልጋል",
      phoneInvalid: "ስልክ በ +251XXXXXXXXX ቅርጸት መሆን አለበት",
      emailInvalid: "ትክክለኛ ኢሜይል ያስፈልጋል",
      passwordShort: "የሚስጥር ቁጥር ቢያንስ 8 ቁምፊዎች መሆን አለበት",
      passwordMismatch: "የሚስጥር ቁጥሮች አይዛመዱም",
    },
    button: "ሂሳብ ፍጠር",
    creating: "ሂሳብ በመፍጠር ላይ...",
    success: "ሂሳብ በትክክል ተፈጥሯል!",
    alreadyHaveAccount: "ቀድሞውኑ ሂሳብ አለዎት?",
    signIn: "ግባ",
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  merchantDashboard: {
    title: "ነጋዴ",
    welcome: "እንኳን ደህና መጡ",
    welcomeSubtitle: "ዛሬ ከጭነቶችዎ ጋር ምን እየሆነ እንዳለ ይመልከቱ።",
    at: "በ",
    liveOverview: "ቀጥታ አጠቃላይ እይታ",
    syncData: "ውሂብ ያመሳስሉ",
    errorAuth: "የማረጋገጫ ቶከን ጠፍቷል",
    errorLoadOverview: "የጭነት አጠቃላይ እይታን መጫን አልተቻለም",
    defaultUser: "ነጋዴ",
    stats: {
      activeShipments: "ንቁ ጭነቶች",
      totalCreated: "ጠቅላላ የተፈጠሩ",
      pendingReview: "በመጠባበቅ ላይ",
      deliveryRate: "የማድረስ መጠን",
      actionNeeded: "እርምጃ ያስፈልጋል",
    },
    latestDeparture: {
      title: "የቅርብ ጊዜ መላኪያ",
      subtitle: "የቅርብ ጊዜ እንቅስቃሴ",
      viewAll: "ሁሉንም ይመልከቱ",
      trackingId: "መከታተያ መለያ",
      route: "መንገድ",
      carrier: "ኩሪየር አጋር",
      details: "የጥቅል ዝርዝሮች",
      contents: "ይዘቶች",
      noShipments: "እስካሁን ምንም ጭነቶች የሉም",
      noShipmentsSubtitle: "ጭነት ሲፈጠር የቅርብ ጊዜ ጭነትዎ እዚህ ይታያል።",
      createFirst: "የመጀመሪያዎን ጭነት ይፍጠሩ",
      loading: "የጭነት መረጃ በመጫን ላይ...",
      noDescription: "ምንም መግለጫ አልተሰጠም",
      originUnset: "መነሻ አልተወሰነም",
      destinationUnset: "መድረሻ አልተወሰነም",
      unassigned: "ያልተመደበ",
      weightUnspecified: "ክብደት አልተገለጸም",
      dimensionsNA: "ልኬቶች የሉም",
      noItems: "ምንም እቃዎች አልተዘረዘሩም",
      createdAt: "የተፈጠረበት",
      fee: "ክፍያ",
      currency: "ETB ",
      retry: "እንደገና ይሞክሩ",
    },
    quickActions: {
      title: "ፈጣን እርምጃዎች",
      subtitle: "አቋራጮች",
      newShipment: {
        label: "አዲስ ጭነት",
        desc: "በሰከንዶች ውስጥ ጭነቶችን ይፍጠሩ እና ይላኩ",
      },
      shipments: {
        label: "ጭነቶች",
        desc: "የክትትል እና የማቅረቢያ ሪፖርቶችን ይመልከቱ",
      },
      couriers: {
        label: "ኩሪየሮች",
        desc: "የኩሪየር አጋሮችን እና ክፍያዎችን ያወዳድሩ",
      },
    },
  },

  // ─── Couriers ───────────────────────────────────────────────────────────────
  couriers: {
    title: "የኩሪየር አጋርነት",
    subtitle: "በአዲስ አበባ ውስጥ የማድረሻ ኔትወርኮችን ያግኙ እና አጋሮችን ያስተዳድሩ።",
    searchPlaceholder: "ኩሪየሮችን ይፈልጉ…",
    searchLabel: "ኩሪየሮችን ይፈልጉ",
    filters: "ማጣሪያዎች",
    stats: {
      network: "በኔትወርክ ውስጥ ያሉ ኩሪየሮች",
      partners: "የእርስዎ አጋሮች",
      notPartnered: "እስካሁን አጋር ያልሆኑ",
    },
    tabs: {
      all: "ሁሉም ኩሪየሮች",
      partners: "አጋሮች",
    },
    filterActive: "ማጣሪያ፡ \"{query}\"",
    availableCouriers: "የሚገኙ ኩሪየሮች",
    partnerCouriers: "አጋር ኩሪየሮች",
    results: "{count} ውጤቶች",
    connecting: "ከኩሪየር ኔትወርክ ጋር በመገናኘት ላይ...",
    loadingPartners: "አጋሮችን በመጫን ላይ...",
    noResultsSearch: "ከፍለጋዎ ጋር የሚዛመድ ኩሪየር አልተገኘም። ጥያቄውን ይቀይሩ እና የፍለጋ ቁልፉን ይጫኑ።",
    noResultsAvailable: "አሁን ላይ ምንም የሚገኙ ኩሪየሮች የሉም።",
    noResultsPartners: "እስካሁን ምንም የኩሪየር አጋሮችን አልጨመሩም። አንዱን ለመጨመር ሁሉንም ኩሪየሮች ይመልከቱ።",
    card: {
      partnerBadge: "አጋር",
      availableBadge: "የሚገኝ",
      privateEmail: "የግል",
      feesLimits: "ክፍያዎች እና ገደቦች",
      basePrice: "መነሻ ዋጋ",
      distance: "ርቀት",
      weight: "ክብደት",
      perKm: "/ኪ.ሜ",
      perKg: "/ኪ.ግ",
      capacity: "አቅም",
      maxLoad: "{weight} ኪ.ግ ከፍተኛ ጭነት",
      visitSite: "ድረ ገጽ ይጎብኙ",
      viewDetails: "ዝርዝሮችን ይመልከቱ",
    },
    errorAuth: "የኩሪየር ኔትወርክን ማረጋገጥ አልተቻለም",
    errorLoad: "ኩሪየሮችን መጫን አልተቻለም",
  },

  // ─── Profile ────────────────────────────────────────────────────────────────
  profile: {
    title: "የመለያ መገለጫ",
    subtitle: "የግል እና የንግድ መረጃዎን ያስተዳድሩ።",
    personalInfo: "የግል መረጃ",
    businessInfo: "የንግድ መረጃ",
    fullName: "ሙሉ ስም",
    email: "የኢሜይል አድራሻ",
    phone: "የስልክ ቁጥር",
    phoneNumber: "የስልክ ቁጥር",
    companyName: "የድርጅት ስም",
    companyAddress: "የድርጅት አድራሻ",
    companyLogo: "የድርጅት አርማ",
    logoRecommended: "ተመራጭ፡ ካሬ የሆነ JPG ወይም PNG፣ ቢበዛ 2 ሜባ።",
    changeLogo: "አርማ ቀይር",
    uploadLogo: "አርማ ስቀል",
    industry: "የስራ ዘርፍ",
    description: "የድርጅት መግለጫ",
    websiteUrl: "ድረ ገጽ",
    saveChanges: "ለውጦችን አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",
    cancel: "ሰርዝ",
    successUpdate: "መገለጫ በትክክል ተሻሽሏል!",
    errorUpdate: "መገለጫን ማሻሻል አልተቻለም።",
    success: "መገለጫው በትክክል ተዘምኗል",
    error: "መገለጫውን ማዘመን አልተቻለም",
    errorLoad: "መገለጫውን መጫን አልተቻለም",
    phonePlaceholder: "+2519xxxxxxxx",
  },

  // ─── Shipments ──────────────────────────────────────────────────────────────
  shipments: {
    title: "ማድረሻዎችን ያስተዳድሩ",
    subtitle: "ጭነቶችን ይከታተሉ፣ ሁኔታዎችን ያጣሩ፣ እና እያንዳንዱን ማድረሻ ይመልከቱ።",
    overview: "የጭነቶች አጠቃላይ እይታ",
    newShipment: "አዲስ ጭነት",
    refresh: "አድስ",
    stats: {
      total: "ጠቅላላ ጭነቶች",
      active: "ንቁ መላኪያዎች",
      pending: "በመጠባበቅ ላይ",
    },
    searchPlaceholder: "በኮድ ወይም በመግለጫ ይፈልጉ",
    columns: {
      code: "ኮድ",
      pickup: "መነሻ",
      destination: "መድረሻ",
      status: "ሁኔታ",
      created: "የተፈጠረበት",
      actions: "እርምጃዎች",
    },
    viewDetails: "ዝርዝሮችን ይመልከቱ",
    empty: "ምንም ጭነቶች አልተገኙም። ለመጀመር ጭነት ይፍጠሩ።",
    loading: "ጭነቶች በመጫን ላይ...",
    prev: "ቀዳሚ",
    next: "ቀጣይ",
    showing: "ከ {total} ጭነቶች ውስጥ {count} እየታዩ ነው",
    pageOf: "ገጽ {current} ከ {total}",
    errorAuth: "የማረጋገጫ አውድ ጠፍቷል",
    errorLoad: "ጭነቶችን መጫን አልተቻለም",
  },

  // ─── API Keys ──────────────────────────────────────────────────────────────
  apiKeys: {
    title: "የ API ቁልፎች",
    subtitle: "ለቀጥታ የ API ውህደት የማረጋገጫ ቶክኖችን ያስተዳድሩ።",
    newKey: "አዲስ ቁልፍ ፍጠር",
    nameLabel: "የቁልፍ ስም",
    placeholder: "የምርት ቁልፍ",
    generate: "ቁልፍ ፍጠር",
    table: {
      name: "የቁልፍ ስም",
      key: "የ API ቁልፍ",
      status: "ሁኔታ",
      created: "የተፈጠረበት",
      actions: "እርምጃዎች",
    },
    active: "ንቁ",
    revoked: "የተሰረዘ",
    copy: "ቅዳ",
    delete: "ቁልፍን ሰርዝ",
    confirmDelete: "ይህንን የኤፒአይ ቁልፍ መሰረዝዎን እርግጠኛ ነዎት? ይህ እርምጃ ሊቀለበስ አይችልም።",
    deleting: "በመሰረዝ ላይ...",
    confirm: "ቁልፍን ሰርዝ",
    authorizedCredentials: "የተፈቀደላቸው መለያዎች",
    totalKeys: "{count} ጠቅላላ ቁልፎች",
    verifyTitle: "የኤፒአይ ቁልፍን አረጋግጥ",
    verifyDesc: "አሁንም የሚሰራ እና ንቁ መሆኑን ለማረጋገጥ የኤፒአይ ቁልፍን ከታች ይለጥፉ።",
    verifyLabel: "የኤፒአይ ቁልፍ ገመድ",
    isValid: "ቁልፉ ትክክል ነው",
    isInvalid: "የማይሰራ ቁልፍ",
    validDesc: "ይህ የኤፒአይ ቁልፍ ንቁ ነው እና ለውህደት ሊያገለግል ይችላል።",
    invalidDesc: "ይህ ቁልፍ ወይ የተሳሳተ ነው ወይም ተሰርዟል።",
    warning: "ማስታወሻ",
    criticalWarning: "ወሳኝ ማስጠንቀቂያ",
    criticalDesc: "ይህ ቁልፍ የሚታየው አንድ ጊዜ ብቻ ነው። ከጠፋብዎ አዲስ ማመንጨት እና ውህደቶችዎን ማዘመን ይኖርብዎታል። በይለፍ ቃል አቀናባሪ ወይም በቮልት ውስጥ ደህንነቱ በተጠበቀ ሁኔታ ያስቀምጡት።",
    savedKey: "ቁልፉን አስቀምጫለሁ",
    successCreate: "የ API ቁልፍ በትክክል ተፈጥሯል!",
    successDelete: "የ API ቁልፍ በትክክል ተሰርዟል!",
  },

  // ─── Webhooks ──────────────────────────────────────────────────────────────
  webhooks: {
    title: "ዌብሁኮች",
    subtitle: "ለጭነቶችዎ ቅጽበታዊ ዝመናዎችን ለመቀበል ድረ-ገጾችን እዚህ ያዋቅሩ።",
    addWebhook: "ዌብሁክ ይመዝግቡ",
    activeCallbacks: "ንቁ ጥሪዎች",
    totalWebhooks: "{count} ጠቅላላ ዌብሁኮች",
    urlLabel: "የመድረሻ ድረ-ገጽ",
    successCreate: "ዌብሁክ በተሳካ ሁኔታ ተዋቅሯል",
    successDelete: "ዌብሁክ ተወግዷል",
    table: {
      url: "ኤንድፖይንት",
      status: "ሁኔታ",
      actions: "ድርጊቶች",
    },
    dialogs: {
      register: {
        title: "ዌብሁክ ይመዝግቡ",
        desc: "የጭነት ክትትል ማሳወቂያዎችን መቀበል የሚፈልጉበትን የኤንድፖይንት URL ያስገቡ።",
        note: "ኤንድፖይንትዎ በይፋ ተደራሽ መሆኑን እና ከአገልጋዮቻችን የሚመጡ የPOST ጥያቄዎችን ማስተናገድ የሚችል መሆኑን ያረጋግጡ።",
        save: "ኤንድፖይንት ይመዝግቡ",
        configuring: "በማዋቀር ላይ...",
      },
      success: {
        title: "በተሳካ ሁኔታ ተመዝግቧል",
        desc: "ዌብሁክ #{id} ተዋቅሯል። እባክዎን ከታች ያለውን የፊርማ ቁልፍ ይቅዱ፤ እንደገና አያዩትም።",
        signingKey: "የፊርማ ቁልፍ",
        securityWarning: "የደህንነት ማስጠንቀቂያ",
        securityDesc: "ይህ ቁልፍ ወደ እርስዎ URL ለሚላኩ ማሳወቂያዎች ለመፈረም ያገለግላል። ከጠፋብዎ አዲስ ለማግኘት ዌብሁክን ሰርዘው እንደገና መመዝገብ አለብዎት።",
        understand: "ተረድቻለሁ",
      },
      delete: {
        title: "ዌብሁክ ይሰርዙ",
        desc: "በ {id} ላይ ማሳወቂያዎችን መቀበል ማቆም እንደሚፈልጉ እርግጠኛ ነዎት? ይህ ድርጊት ቋሚ ነው።",
        confirm: "ዌብሁክ ይሰርዙ",
        deleting: "በማስወገድ ላይ...",
      },
    },
  },

  // ─── Courier Details ──────────────────────────────────────────────────────
  courierDetails: {
    back: "ወደ ኩሪየሮች ይመለሱ",
    partner: "የእርስዎ አጋር",
    notPartnered: "አጋር ያልሆነ",
    type: "የኩሪየር ኩባንያ",
    endPartnership: "አጋርነትን ያቋርጡ",
    addPartner: "እንደ አጋር ያክሉ",
    ending: "በማቋረጥ ላይ...",
    adding: "በማከል ላይ...",
    successEnd: "አጋርነት ተቋርጧል",
    successAdd: "ኩሪየሩ እንደ አጋር ታክሏል",
    errorAuth: "ማረጋገጥ አልተቻለም",
    errorAction: "የአጋርነት ድርጊት አልተሳካም",
    invalid: "የማይሰራ የኩሪየር ሊንክ።",
    notFound: "ይህ ኩሪየር ሊገኝ አልቻለም።",
    loading: "ኩሪየሩን በመጫን ላይ...",
    sections: {
      contact: {
        title: "እውቂያ እና ቦታ",
        subtitle: "ይህንን ኩሪየር እንዴት ማግኘት እንደሚቻል",
        website: "ድረ-ገጽ",
      },
      pricing: {
        title: "ዋጋ እና አቅም",
        subtitle: "ጭነቶችን ለማቀድ የሚታዩ ዋጋዎች",
        base: "መነሻ ዋጋ",
        distance: "ርቀት",
        weight: "ክብደት",
        time: "ጊዜ",
        maxWeight: "ከፍተኛ ክብደት",
        perKm: "/ኪ.ሜ",
        perKg: "/ኪ.ግ",
      },
    },
  },

  // ─── Dashboards (Admin & Supervisor) ──────────────────────────────────────
  dashboards: {
    admin: {
      title: "የአስተዳዳሪ ዳሽቦርድ",
      welcome: "ወደ Dispatch አስተዳደር መግቢያ እንኳን ደህና ተመለሱ።",
    },
    supervisor: {
      title: "የኩሪየር ተቆጣጣሪ ዳሽቦርድ",
      welcome: "ወደ Dispatch የተቆጣጣሪ መግቢያ እንኳን ደህና ተመለሱ።",
    },
    returnToWebsite: "ወደ ድህረ-ገጹ ተመለስ",
    logout: "ውጣ",
  },


  // ─── Common ─────────────────────────────────────────────────────────────────
  common: {
    language: "ቋንቋ",
    theme: "ገጽታ",
    darkMode: "ጨለማ ሁናቴ",
    lightMode: "ብርሃን ሁናቴ",
    systemMode: "ስርዓት",
  },

  // ─── Shipment Details ──────────────────────────────────────────────────────
  shipmentDetails: {
    header: "ለ {code} ዝርዝሮች",
    snapshot: "የጭነት መግለጫ",
    status: "የጭነት ሁኔታ",
    code: "የጭነት ኮድ",
    confirmationCode: "የማረጋገጫ ኮድ",
    created: "የተፈጠረበት",
    lastUpdated: "መጨረሻ የተሻሻለው",
    merchant: "ነጋዴ",
    refresh: "አድስ",
    cancel: "ጭነት ሰርዝ",
    cancelling: "በመሰረዝ ላይ...",
    cancelDialog: {
      title: "ይህን ጭነት መሰረዝ ይፈልጋሉ?",
      desc: "ይህ እርምጃ ሊቀለበስ አይችልም። ይህንን ጭነት መሰረዝ የሚከተሉትን ያደርጋል፡",
      list: [
        "ከዳሽቦርድዎ ላይ በቋሚነት ያስወግدهዋል።", "ማንኛውንም ንቁ የማድረስ ጥያቄዎችን ይሰርዛል።", "የተመደበውን ኩሪየር (ካለ) ስለ ስረዛው ያሳውቃል።",
      ],
      remarkLabel: "ለምን እየሰረዙ ነው? (አማራጭ)",
      remarkPlaceholder: "ለምሳሌ፡ ሀሳቤን ቀይሬያለሁ፣ ሌላ ኩሪየር አግኝቻለሁ...",
      keep: "አይ፣ ይቆይ",
      confirm: "ስረዛውን አረጋግጥ",
    },
    locations: "ቦታዎች",
    pickup: "መነሻ",
    destination: "መድረሻ",
    package: "ጥቅል እና ተቀባይ",
    recipient: "ተቀባይ",
    phone: "ስልክ",
    notes: "ማስታወሻዎች",
    items: "እቃዎች",
    weight: "ክብደት",
    dimensions: "ልኬቶች",
    fee: "ጠቅላላ ክፍያ",
    carrier: "ኩሪየር አጋር",
    updateTitle: "ዝርዝሮችን ያሻሽሉ",
    updateSubtitle: "የመነሻ፣ የመድረሻ፣ የተቀባይ ወይም የጥቅል ዝርዝሮችን ይቀይሩ።",
    cannotUpdate: "ይህ ጭነት ከእንግዲህ ሊሻሻል አይችልም (ቀድሞውኑ ተመድቧል ወይም ተጠናቅቋል)።",
    save: "ለውጦችን አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",
    actions: "እርምጃዎች",
    actionsSubtitle: "ሁኔታውን ለማደስ ወይም ጭነቱን ለመሰረዝ እነዚህን ይጠቀሙ።",
    refreshDetails: "ዝርዝሮችን አድስ",
    newShipment: "አዲስ ጭነት",
    generateCode: "የማረጋገጫ ኮድ ይፍጠሩ",
    generating: "በመፍጠር ላይ...",
    codeGenerated: "ኮድ ተፈጥሯል",
    noCouriersDesc_part1: "ጭነቶችን ለእነሱ ለመመደብ በ ",
    noCouriersDesc_part2: " ገጽ ላይ ኩሪየሮችን እንደ አጋር ያክሉ።",
    noChanges: "ምንም ለውጥ አልተገኘም።",
    successUpdate: "ጭነት በትክክል ተሻሽሏል።",
    successCancel: "ጭነት በትክክል ተሰርዟል",
    successCode: "የማረጋገጫ ኮድ በትክክል ተፈጥሯል",
    errorUpdate: "የጭነት ዝርዝሮችን ማሻሻል አልተቻለም።",
    errorStatus: "በ '{status}' ሁኔታ ላይ ያሉ ጭነቶች ሊሻሻሉ አይችሉም።",
    notFound: "ጭነት አልተገኘም",
    notFoundDesc: "ያንን የጭነት ኮድ ማግኘት አልቻልንም።",
    backToList: "ወደ ዝርዝር ተመለስ",
    retry: "እንደገና ይሞክሩ",
    rating: {
      title: "የማድረስ ልምድን ይገምግሙ",
      subtitle: "የእርስዎ ግምገማ ለሁለቱም ለኩሪየር ኩባንያው እና ለግል ሾፌሩ ይተገበራል።",
      submit: "ግምገማን ይላኩ",
      submitting: "በመላክ ላይ...",
      success: "ለግምገማዎ እናመሰግናለን! የሾፌሩ እና የኩሪየር ኩባንያው ግምገማዎች ተሻሽለዋል።",
      scoreHint: "ለአገልጋዩ {score} / 10 ይልካል",
      selectFirst: "መጀመሪያ የኮከብ ደረጃ ይምረጡ",
    },
  },

  // ─── New Shipment Page ─────────────────────────────────────────────────────
  newShipment: {
    title: "አዲስ ጭነት",
    subtitle: "አዲስ ማድረሻ ለመመዝገብ ዝርዝሮቹን ከዚህ በታች ይሙሉ",
    breadcrumb: "ነጋዴ / አዲስ ጭነት",
    successTitle: "ጭነት ተፈጥሯል!",
    successDesc: "ጭነትዎ በሁኔታ {status} ተመዝግቧል።",
    shipmentId: "የጭነት መለያ",
    dashboard: "ዳሽቦርድ",
    sections: {
      courier: "ኩሪየር",
      addresses: "አድራሻዎች",
      recipient: "ተቀባይ",
      package: "የጥቅል ዝርዝሮች",
    },
    fields: {
      partnerCourier: "ኩሪየር አጋር",
      loadingCouriers: "አጋር ኩሪየሮችን በመጫን ላይ...",
      noCouriers: "ምንም አጋር ኩሪየሮች አልተገኙም",
      chooseCourier: "አጋር ኩሪየር ይምረጡ",
      maxWeightHint: "ከፍተኛ {weight} ኪ.ግ",
      basePrice: "መነሻ ዋጋ",
      maxWeight: "ከፍተኛ ክብደት",
      pickupAddress: "የመነሻ አድራሻ",
      destinationAddress: "መድረሻ አድራሻ",
      recipient: "ተቀባይ",
      phone: "ስልክ",
      recipientName: "የተቀባይ ስም",
      recipientPhone: "የተቀባይ ስልክ",
      packageDescription: "የጥቅል መግለጫ",
      weight: "ክብደት (ኪ.ግ)",
      dimensions: "ልኬቶች",
      items: "እቃዎች",
      optional: "አማራጭ",
      maxWeightForCourier: "ለዚህ ኩሪየር ከፍተኛው {weight} ኪ.ግ ነው",
      commaSeparated: "እቃ 1, እቃ 2, እቃ 3",
    },
    cancel: "ሰርዝ",
    create: "ጭነት ፍጠር",
    creating: "በመፍጠር ላይ…",
    validation: {
      selectCourier: "እባክዎ ትክክለኛ ኩሪየር አጋር ይምረጡ።",
      pickupRequired: "የመነሻ አድራሻ ያስፈልጋል።",
      destRequired: "የመድረሻ አድራሻ ያስፈልጋል።",
      nameRequired: "የተቀባይ ስም ያስፈልጋል።",
      phoneRequired: "የተቀባይ ስልክ ቁጥር ያስፈልጋል።",
      phoneInvalid: "ትክክለኛ ስልክ ቁጥር ያስገቡ።",
      descRequired: "የጥቅል መግለጫ ያስፈልጋል።",
      weightPositive: "ክብደት አወንታዊ ቁጥር መሆን አለበት።",
      weightExceeds: "ክብደት ከ {name} ከፍተኛ {weight} ኪ.ግ ይበልጣል።",
    },
  },
};

export default am;
