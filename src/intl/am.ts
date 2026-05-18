import type { Messages } from "./en";

const am: Messages = {
  // ─── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Dispatch",
    tagline: "የተዋሃደ የሎጂስቲክስ መድረክ",
    description: "ነጋዴዎችን ከኩሪየር አቅራቢዎች ጋር የሚያገናኝ ሶፍትዌር፣ የ shipment ፈጠራን፣ ኩሪየር ምርጫን፣ እና የዕቃ ክትትልን በአንድ ኃይለኛ መድረክ ያቃልላል።",
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
    shipmentAnalytics: "የጭነት ትንታኔ",
    apiUsage: "የ API አጠቃቀም",
    courierComparison: "የኩሪየር ንፅፅር",
    apiKeys: "API ቁልፎች",
    webhooks: "ዌብሁኮች",
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
  },

  // ─── Features ───────────────────────────────────────────────────────────────
  features: {
    title: "ለምን Dispatch?",
    subtitle: "በኢትዮጵያ የዕቃ አቅርቦት ስራዎን ለማሳደግ የሚያስፈልጉዎት ሁሉ።",
    items: {
      unified: {
        title: "የተዋሃደ የኩሪየር API",
        desc: "አንድ ጊዜ ይገናኙ፣ ሁሉንም ኩሪየሮች ይድረሱ። የእኛ API የብዙ አቅራቢዎችን ውስብስብነት ያስቀራል።",
      },
      automated: {
        title: "አውቶማቲክ ምርጫ",
        desc: "በዋጋ፣ በፍጥነት እና በአስተማማኝነታቸው ላይ በመመስረት ለያንዳንዱ ጭነት ምርጥ ኩሪየር ይምረጡ።",
      },
      tracking: {
        title: "ቅጽበታዊ ክትትል",
        desc: "ለእያንዳንዱ ጥቅል ትክክለኛ እና ቅጽበታዊ ክትትል በማቅረብ ደንበኞችዎን መረጃ እንዲኖራቸው ያድርጉ።",
      },
    },
  },

  // ─── How It Works ───────────────────────────────────────────────────────────
  howItWorks: {
    title: "እንዴት ይሰራል",
    subtitle: "ሎጂስቲክስዎን ለማቀላጠፍ ሶስት ቀላል ደረጃዎች።",
    steps: {
      connect: {
        title: "ተገናኝ",
        desc: "እንደ ነጋዴ ይመዝገቡ እና የእኛን ቀላል API ያዋህዱ ወይም የእኛን ዳሽቦርድ ይጠቀሙ።",
      },
      ship: {
        title: "ላክ",
        desc: "ጭነቶችን ይፍጠሩ እና ወዲያውኑ የሚገኙ ኩሪየር አጋሮችን ግልጽ በሆነ ዋጋ ይመልከቱ።",
      },
      track: {
        title: "ተከታተል",
        desc: "አቅርቦቶችዎን በቅጽበት ይከታተሉ እና በ webhooks አማካኝነት አውቶማቲክ የሁኔታ ማሻሻያዎችን ያግኙ።",
      },
    },
  },

  // ─── Portals ───────────────────────────────────────────────────────────────
  portals: {
    title: "የመግቢያ ገጾቻችንን ያስሱ",
    subtitle: "በስነ-ምህዳሩ ውስጥ ላለ እያንዳንዱ አካል የተዘጋጁ ልምዶች።",
    merchant: {
      title: "የነጋዴ መግቢያ",
      desc: "ትዕዛዞችን፣ አጋሮችን እና የንግድ ትንታኔዎችን ያስተዳድሩ።",
      action: "ነጋዴ ግባ",
    },
    supervisor: {
      title: "የሱፐርቫይዘር መግቢያ",
      desc: "የኩሪየር ስራዎችን እና የሾፌር አስተዳደርን ይቆጣጠሩ።",
      action: "ሱፐርቫይዘር ግባ",
    },
    admin: {
      title: "የአስተዳዳሪ መግቢያ",
      desc: "አጠቃላይ የሲስተም ውቅር እና የመድረክ ቁጥጥር።",
      action: "አስተዳዳሪ ግባ",
    },
  },

  // ─── CTA ───────────────────────────────────────────────────────────────────
  cta: {
    title: "አቅርቦቶችዎን ለማቅለል ዝግጁ ነዎት?",
    subtitle: "ደንበኞቻቸውን በፍጥነት ለመድረስ Dispatch የሚጠቀሙ ነጋዴዎችን ይቀላቀሉ።",
    button: "መለያዎን ይፍጠሩ",
  },

  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: {
    rights: "© {year} Dispatch. መብቱ በህግ የተጠበቀ ነው።",
    links: {
      privacy: "የግላዊነት ፖሊሲ",
      terms: "የአገልግሎት ውል",
      contact: "ድጋፍ ያግኙ",
    },
  },

  // ─── Login ─────────────────────────────────────────────────────────────────
  login: {
    merchant: {
      title: "የነጋዴ መግቢያ",
      subtitle: "የእርስዎን የሎጂስቲክስ ዳሽቦርድ ይግቡ",
    },
    admin: {
      title: "የአስተዳዳሪ መግቢያ",
      subtitle: "የሲስተም አስተዳደር እና ቁጥጥር",
    },
    supervisor: {
      title: "የሱፐርቫይዘር መግቢያ",
      subtitle: "የኩሪየር ስራዎች አስተዳደር",
    },
    username: "የተጠቃሚ ስም",
    password: "የይለፍ ቃል",
    submit: "ግባ",
    loggingIn: "በመግባት ላይ...",
    error: "የተሳሳተ መረጃ ወይም የሰርቨር ችግር።",
    noAccount: "መለያ የሎትም?",
    register: "አሁን ይመዝገቡ",
    welcomeBack: "እንኳን በደህና መጡ",
    platformDescription: "ነጋዴዎችን ከኩሪየር አቅራቢዎች ጋር የሚያገናኝ ሶፍትዌር፣ የ shipment ፈጠራን፣ ኩሪየር ምርጫን፣ እና የዕቃ ክትትልን በአንድ ኃይለኛ መድረክ ያቃልላል።",
    back: "ወደ መነሻ ተመለስ",
    roles: {
      merchant: {
        label: "የነጋዴ መግቢያ",
        subtitle: "የእርስዎን የሎጂስቲክስ ዳሽቦርድ ይግቡ",
      },
      admin: {
        label: "የአስተዳዳሪ መግቢያ",
        subtitle: "የሲስተም አስተዳደር እና ቁጥጥር",
      },
      supervisor: {
        label: "የሱፐርቫይዘር መግቢያ",
        subtitle: "የኩሪየር ስራዎች አስተዳደር",
      },
    },
    lockout: {
      message: "በጣም ብዙ ያልተሳኩ ሙከራዎች። ለ{time} ተቆልፈዋል።",
    },
    emailLabel: "የኢሜል አድራሻ",
    emailPlaceholder: "name@company.com",
    passwordLabel: "የይለፍ ቃል",
    forgotPassword: "የይለፍ ቃል ረሱ?",
    signingIn: "በመግባት ላይ...",
    signIn: "ግባ",
    switchPortal: "መግቢያ ቀይር",
    validation: {
      emailRequired: "የኢሜል አድራሻ ያስፈልጋል።",
      emailInvalid: "እባክዎ ትክክለኛ የኢሜል አድራሻ ያስገቡ።",
      emailTooLong: "የኢሜል አድራሻው በጣም ረጅም ነው።",
      passwordRequired: "የይለፍ ቃል ያስፈልጋል።",
      passwordTooShort: "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት።",
    },
  },

  // ─── Register ──────────────────────────────────────────────────────────────
  register: {
    title: "የነጋዴ መለያ ይፍጠሩ",
    subtitle: "ዛሬውኑ በ Dispatch ጭነት ይጀምሩ",
    username: "የተጠቃሚ ስም",
    email: "የኢሜል አድራሻ",
    password: "የይለፍ ቃል",
    companyName: "የኩባንያ ስም",
    submit: "ተመዝገብ",
    registering: "በመመዝገብ ላይ...",
    error: "ምዝገባው አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
    hasAccount: "ቀድሞውኑ መለያ አለዎት?",
    login: "እዚህ ይግቡ",
    success: "ምዝገባው በተሳካ ሁኔታ ተጠናቋል! አሁን መግባት ይችላሉ።",
    headline: "የነጋዴ መለያ ይፍጠሩ",
    subheadline: "ዛሬውኑ በ Dispatch ጭነት ይጀምሩ",
    steps: {
      account: {
        title: "መለያ ይፍጠሩ",
        desc: "ይመዝገቡ እና የነጋዴ መገለጫዎን ያዋቅሩ።",
      },
      courier: {
        title: "ከኩሪየሮች ጋር ይገናኙ",
        desc: "በአዲስ አበባ ካሉ ምርጥ የዕቃ አቅርቦት ሰጪዎች ጋር አጋር ይሁኑ።",
      },
      shipping: {
        title: "ጭነት ይጀምሩ",
        desc: "አቅርቦቶችን ያስይዙ እና በቅጽበት ይከታተሉ።",
      },
    },
    fields: {
      firstName: "ስም",
      lastName: "የአባት ስም",
      businessName: "የኩባንያ ስም",
      address: "የኩባንያ አድራሻ",
      industry: "የስራ ዘርፍ",
      phone: "የስልክ ቁጥር",
      email: "የኢሜል አድራሻ",
      website: "የድረ-ገጽ አድራሻ (አማራጭ)",
      description: "የንግድ መግለጫ (አማራጭ)",
      password: "የይለፍ ቃል",
      confirmPassword: "የይለፍ ቃል ያረጋግጡ",
    },
    placeholders: {
      firstName: "ዮሐንስ",
      lastName: "ከበደ",
      businessName: "ኤክሜ ኮርፖሬሽን",
      address: "ቦሌ፣ አዲስ አበባ",
      industry: "ኢ-ኮሜርስ",
      phone: "+2519xxxxxxxx",
      email: "name@company.com",
      website: "https://example.com",
      description: "ስለ ንግድዎ ይንገሩን...",
    },
    creating: "መለያ በመፍጠር ላይ...",
    button: "ተመዝገብ",
    alreadyHaveAccount: "ቀድሞውኑ መለያ አለዎት?",
    signIn: "እዚህ ይግቡ",
    validation: {
      firstName: "ስም ያስፈልጋል።",
      lastName: "የአባት ስም ያስፈልጋል።",
      businessName: "የኩባንያ ስም ያስፈልጋል።",
      address: "የኩባንያ አድራሻ ያስፈልጋል።",
      industry: "የስራ ዘርፍ ያስፈልጋል።",
      phoneRequired: "የስልክ ቁጥር ያስፈልጋል።",
      phoneInvalid: "እባክዎ ትክክለኛ የስልክ ቁጥር ያስገቡ (ምሳሌ +2519xxxxxxxx)።",
      emailInvalid: "እባክዎ ትክክለኛ የኢሜል አድራሻ ያስገቡ።",
      passwordShort: "የይለፍ ቃል ቢያንስ 8 ቁምፊዎች መሆን አለበት።",
      passwordMismatch: "የይለፍ ቃላት አይዛመዱም።",
    },
  },

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  merchantDashboard: {
    welcome: "እንኳን ደህና መጡ",
    defaultUser: "ነጋዴ",
    at: "በ",
    liveOverview: "ወቅታዊ ሁኔታ",
    welcomeSubtitle: "የዛሬው የንግድ እንቅስቃሴዎ ይኸውና።",
    syncData: "መረጃ አድስ",
    stats: {
      totalShipments: "ጠቅላላ ጭነቶች",
      activeDeliveries: "ንቁ አቅርቦቶች",
      deliveredToday: "ዛሬ የደረሱ",
      pendingPickups: "የሚጠባበቁ ትዕዛዞች",
      activeShipments: "ንቁ ጭነቶች",
      totalCreated: "በጠቅላላ የተፈጠሩ",
      pendingReview: "በግምገማ ላይ ያሉ",
      deliveryRate: "የስኬት መጠን",
      actionNeeded: "እርምጃ ያስፈልጋል",
    },
    recentShipments: "የቅርብ ጊዜ ጭነቶች",
    viewAll: "ሁሉንም ይመልከቱ",
    quickActions: {
      subtitle: "ፈጣን እርምጃዎች",
      title: "የሚቀጥሉ እርምጃዎች",
      newShipment: {
        label: "አዲስ ጭነት",
        desc: "ከኩሪየር አጋር ጋር አዲስ አቅርቦት ያስይዙ።"
      },
      manageCouriers: {
        label: "ኩሪየሮችን አስተዳድር",
        desc: "የኩሪየር አቅራቢዎችን ይመልከቱ እና ይገናኙ።"
      },
      apiUsage: {
        label: "የ API አጠቃቀም",
        desc: "የውህደት መለኪያዎችዎን ይከታተሉ።"
      },
      shipments: {
        label: "ጭነቶች",
        desc: "የአቅርቦት ታሪክዎን ይመልከቱ።"
      },
      couriers: {
        label: "ኩሪየሮች",
        desc: "የአጋር ኔትወርክዎን ያስተዳድሩ።"
      }
    },
    latestDeparture: {
      subtitle: "የመጨረሻ እንቅስቃሴ",
      title: "የቅርብ ጊዜ ጭነት",
      viewAll: "ታሪክ ይመልከቱ",
      loading: "የቅርብ ጊዜ ጭነት በመጫን ላይ...",
      retry: "እንደገና ሞክር",
      createdAt: "የተፈጠረበት",
      trackingId: "የመከታተያ መታወቂያ",
      noDescription: "መግለጫ አልተሰጠም",
      route: "መንገድ",
      originUnset: "መነሻ አልተገለጸም",
      destinationUnset: "መድረሻ አልተገለጸም",
      carrier: "ኩሪየር",
      unassigned: "ያልተመደበ",
      details: "የጥቅል ዝርዝሮች",
      weightUnspecified: "ክብደት አልተገለጸም",
      dimensionsNA: "ልኬቶች የሉም",
      contents: "ይዘቶች",
      noItems: "ምንም ዕቃዎች አልተዘረዘሩም",
      fee: "ጠቅላላ ክፍያ",
      currency: "ብር",
      noShipments: "እስካሁን ምንም ጭነት የለም",
      noShipmentsSubtitle: "ጭነት መላክ ሲጀምሩ የቅርብ ጊዜው እዚህ ይታያል።",
      createFirst: "የመጀመሪያውን ጭነት ይፍጠሩ",
    }
  },

  // ─── Courier List ──────────────────────────────────────────────────────────
  couriers: {
    title: "የኩሪየር አጋሮች",
    subtitle: "ከአቅርቦት ሰጪዎች ጋር ያለዎትን ግንኙነት ያስተዳድሩ።",
    all: "ሁሉም አቅራቢዎች",
    partners: "የእኔ አጋሮች",
    searchPlaceholder: "ኩሪየሮችን ፈልግ...",
    searchLabel: "ፈልግ",
    filters: "ማጣሪያዎች",
    empty: "ከእርስዎ ፍላጎት ጋር የሚዛመድ ኩሪየር አልተገኘም።",
    stats: {
      network: "ጠቅላላ ኔትወርክ",
      partners: "የእርስዎ አጋሮች",
      notPartnered: "አጋር ያልሆኑ"
    },
    tabs: {
      all: "ሁሉም ኩሪየሮች",
      partners: "የእኔ አጋሮች"
    },
    filterActive: "ንቁ ማጣሪያ: {query}",
    availableCouriers: "የሚገኙ ኩሪየሮች",
    partnerCouriers: "አጋር ኩሪየሮች",
    results: "{count} ውጤቶች",
    connecting: "ከኔትወርክ ጋር በመገናኘት ላይ...",
    loadingPartners: "የአጋር መረጃ በመጫን ላይ...",
    noResultsSearch: "ከፍለጋዎ ጋር የሚዛመድ ኩሪየር አልተገኘም።",
    noResultsAvailable: "በአሁኑ ጊዜ የሚገኙ ኩሪየሮች የሉም።",
    noResultsPartners: "እስካሁን ምንም አጋር ኩሪየር አልጨመሩም።",
    card: {
      partnerBadge: "አጋር",
      availableBadge: "የሚገኝ",
      privateEmail: "የግል ኢሜይል",
      feesLimits: "ክፍያዎች እና ገደቦች",
      basePrice: "መነሻ ዋጋ",
      distance: "ርቀት",
      weight: "ክብደት",
      perKm: "/ኪ.ሜ",
      perKg: "/ኪ.ግ",
      capacity: "አቅም",
      maxLoad: "ከፍተኛ ክብደት: {weight}ኪ.ግ",
      visitSite: "ድረ-ገጽ ይጎብኙ",
      viewDetails: "ዝርዝር ይመልከቱ"
    },
    partnership: {
      active: "አጋር",
      inactive: "አጋር ያልሆነ",
    },
    viewProfile: "መገለጫ ይመልከቱ",
  },

  // ─── Merchant Profile ──────────────────────────────────────────────────────
  profile: {
    title: "የመለያ ቅንብሮች",
    subtitle: "የነጋዴ መገለጫዎን እና የንግድ ዝርዝሮችዎን ያስተዳድሩ።",
    tabs: {
      general: "አጠቃላይ",
      business: "ንግድ",
      security: "ደህንነት",
    },
    personalInfo: "የግል መረጃ",
    businessInfo: "የንግድ መረጃ",
    fullName: "ሙሉ ስም",
    email: "የኢሜል አድራሻ",
    phone: "የስልክ ቁጥር",
    phoneNumber: "የስልክ ቁጥር",
    companyName: "የኩባንያ ስም",
    companyAddress: "የኩባንያ አድራሻ",
    companyLogo: "የኩባንያ አርማ",
    logoRecommended: "የሚመከር፡ ካሬ JPG ወይም PNG፣ ቢበዛ 2MB።",
    changeLogo: "አርማ ቀይር",
    uploadLogo: "አርማ ስቀል",
    industry: "ኢንዱስትሪ",
    description: "የንግድ መግለጫ",
    websiteUrl: "የድረ-ገጽ አድራሻ",
    saveChanges: "ለውጦችን አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",
    cancel: "ሰርዝ",
    successUpdate: "መገለጫው በተሳካ ሁኔታ ተዘምኗል!",
    errorUpdate: "መገለጫውን ማዘመን አልተሳካም።",
    success: "መገለጫው በተሳካ ሁኔታ ተዘምኗል",
    error: "መገለጫውን ማዘመን አልተሳካም",
    errorLoad: "መገለጫውን መጫን አልተሳካም",
    phonePlaceholder: "+2519xxxxxxxx",
  },

  // ─── Shipments ──────────────────────────────────────────────────────────────
  shipments: {
    title: "አቅርቦቶችን ያስተዳድሩ",
    subtitle: "ጭነቶችን ይከታተሉ፣ ሁኔታዎችን ያጣሩ፣ እና እያንዳንዱን አፈጻጸም ይመልከቱ።",
    overview: "የጭነት አጠቃላይ እይታ",
    newShipment: "አዲስ ጭነት",
    refresh: "አድስ",
    stats: {
      total: "ጠቅላላ ጭነቶች",
      active: "ንቁ ስርጭቶች",
      pending: "ግምገማ የሚጠባበቁ",
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
    viewDetails: "ዝርዝር ይመልከቱ",
    empty: "ምንም ጭነት አልተገኘም",
    emptyDesc: "እስካሁን ምንም ጭነት አልፈጠሩም። እዚህ ለማየት የመጀመሪያዎን አቅርቦት ይጀምሩ።",
    loading: "ጭነቶች በመጫን ላይ...",
    prev: "የበፊቱ",
    next: "የሚቀጥለው",
    showing: "ከ {total} ጭነቶች ውስጥ {count} በማሳየት ላይ",
    pageOf: "ገጽ {current} ከ {total}",
    errorAuth: "የማረጋገጫ መረጃ ይጎድላል",
    errorLoad: "ጭነቶችን መጫን አልተቻለም",
    statuses: {
      pending: "በመጠባበቅ ላይ",
      assigned_to_courier: "ለኩሪየር ተመድቧል",
      assigned_to_driver: "ለአሽከርካሪ ተመድቧል",
      picked_up: "ተነስቷል",
      in_transit: "በመንገድ ላይ",
      delivered: "ደርሷል",
      cancelled: "ተሰርዟል",
      failed: "አልተሳካም",
      unknown: "ያልታወቀ",
    },
  },

  // ─── API Keys ──────────────────────────────────────────────────────────────
  apiKeys: {
    title: "API ቁልፎች",
    subtitle: "ለቀጥታ API ውህደት የማረጋገጫ ቶከኖችን ያስተዳድሩ።",
    newKey: "አዲስ ቁልፍ ፍጠር",
    nameLabel: "የቁልፍ ስም",
    placeholder: "የምርት ቁልፍ",
    generate: "ቁልፍ ፍጠር",
    table: {
      name: "የቁልፍ መታወቂያ",
      key: "API ቁልፍ",
      status: "ሁኔታ",
      createdAt: "የተፈጠረበት",
      lastActivity: "መጨረሻ ጥቅም ላይ የዋለ",
      actions: "እርምጃዎች",
    },
    active: "ንቁ",
    revoked: "የተሰረዘ",
    copy: "ቅዳ",
    delete: "ቁልፍ ሰርዝ",
    confirmDelete: "ይህን የ API ቁልፍ መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ እርምጃ ሊመለስ አይችልም።",
    deleting: "በመሰረዝ ላይ...",
    confirm: "ቁልፍ ሰርዝ",
    authorizedCredentials: "የተፈቀዱ መረጃዎች",
    totalKeys: "በጠቅላላ {count} ቁልፎች",
    verifyTitle: "የ API ቁልፍን አረጋግጥ",
    verifyDesc: "የ API ቁልፍ አሁንም መስራቱን ለማረጋገጥ ከታች ያስገቡ።",
    verifyLabel: "የ API ቁልፍ",
    isValid: "ቁልፉ ይሰራል",
    isInvalid: "ቁልፉ አይሰራም",
    validDesc: "ይህ የ API ቁልፍ ንቁ ነው እና ለውህደት ሊያገለግል ይችላል።",
    invalidDesc: "ይህ ቁልፍ የተሳሳተ ነው ወይም ተሰርዟል።",
    warning: "ማስታወሻ",
    criticalWarning: "ወሳኝ ማስጠንቀቂያ",
    criticalDesc: "ይህ ቁልፍ የሚታየው አንድ ጊዜ ብቻ ነው። ከጠፋብዎት አዲስ መፍጠር ይኖርብዎታል። ደህንነቱ በተጠበቀ ቦታ ያስቀምጡት።",
    savedKey: "ቁልፉን አስቀምጫለሁ",
    successCreate: "የ API ቁልፍ በተሳካ ሁኔታ ተፈጥሯል!",
    successDelete: "የ API ቁልፍ በተሳካ ሁኔታ ተሰርዟል!",
    empty: "ምንም የ API ቁልፍ አልተገኘም",
    emptyDesc: "Dispatchን ከራስዎ ሲስተሞች ጋር ማዋሃድ ለመጀመር የ API ቁልፍ ይፍጠሩ።",
  },

  // ─── Webhooks ──────────────────────────────────────────────────────────────
  webhooks: {
    title: "ዌብሁኮች",
    subtitle: "ለጭነቶችዎ ቅጽበታዊ ማሻሻያዎችን ለመቀበል የድረ-ገጽ አድራሻዎችን ያዋቅሩ።",
    addWebhook: "ዌብሁክ ይመዝግቡ",
    activeCallbacks: "ንቁ ጥሪዎች",
    totalWebhooks: "በጠቅላላ {count} ዌብሁኮች",
    urlLabel: "የታለመ URL",
    successCreate: "ዌብሁክ በተሳካ ሁኔታ ተዋቅሯል",
    successDelete: "ዌብሁክ ተወግዷል",
    empty: "ምንም ዌብሁኮች አልተገኘም",
    emptyDesc: "ስለ ጭነትዎ ሁኔታ ለውጦች ቅጽበታዊ ማሳወቂያዎችን ለማግኘት ዌብሁክ ይመዝግቡ።",
    table: {
      url: "መድረሻ",
      status: "ሁኔታ",
      actions: "እርምጃዎች",
    },
    dialogs: {
      register: {
        title: "ዌብሁክ ይመዝግቡ",
        desc: "የጭነት ክትትል ማሳወቂያዎችን መቀበል የሚፈልጉበትን የድረ-ገጽ አድራሻ ያስገቡ።",
        note: "የእርስዎ መድረሻ ከእኛ ሰርቨሮች የ POST ጥያቄዎችን መቀበል መቻሉን ያረጋግጡ።",
        save: "ዌብሁክ አስቀምጥ",
        configuring: "በማዋቀር ላይ...",
      },
      success: {
        title: "በተሳካ ሁኔታ ተመዝግቧል",
        desc: "ዌብሁክ #{id} ተዋቅሯል። እባክዎ ከታች ያለውን የፊርማ ቁልፍ ይቅዱ፤ እንደገና አያዩትም።",
        signingKey: "የፊርማ ቁልፍ",
        securityWarning: "የደህንነት ማስጠንቀቂያ",
        securityDesc: "ይህ ቁልፍ ወደ እርስዎ URL የሚላኩ ማሳወቂያዎችን ለማረጋገጥ ያገለግላል። ከጠፋብዎት ዌብሁክን ሰርዘው እንደገና መመዝገብ አለብዎት።",
        understand: "ተረድቻለሁ",
      },
      delete: {
        title: "ዌብሁክ ሰርዝ",
        desc: "በ {id} ማሳወቂያዎችን መቀበል ማቆም እንደሚፈልጉ እርግጠኛ ነዎት? ይህ እርምጃ ቋሚ ነው።",
        confirm: "ዌብሁክ ሰርዝ",
        deleting: "በማስወገድ ላይ...",
      },
    },
  },

  // ─── Courier Details ───────────────────────────────────────────────────────
  courierDetails: {
    back: "ወደ ኩሪየሮች ተመለስ",
    partner: "የእርስዎ አጋር",
    notPartnered: "አጋር ያልሆነ",
    type: "የኩሪየር ኩባንያ",
    endPartnership: "አጋርነትን አቁም",
    addPartner: "እንደ አጋር አክል",
    ending: "በማቆም ላይ...",
    adding: "በማከል ላይ...",
    successEnd: "አጋርነት ቆሟል",
    successAdd: "ኩሪየር እንደ አጋር ታክሏል",
    errorAuth: "ማረጋገጥ አልተቻለም",
    errorAction: "የአጋርነት እርምጃ አልተሳካም",
    invalid: "የተሳሳተ የኩሪየር ሊንክ።",
    notFound: "ይህ ኩሪየር አልተገኘም።",
    loading: "ኩሪየር በመጫን ላይ...",
    sections: {
      contact: {
        title: "ግንኙነት እና ቦታ",
        subtitle: "ይህን ኩሪየር እንዴት ማግኘት እንደሚቻል",
        website: "ድረ-ገጽ",
      },
      pricing: {
        title: "ዋጋ እና አቅም",
        subtitle: "ጭነቶችን ለማቀድ የታዩ ዋጋዎች",
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
      welcome: "ወደተቀላጠፈው የ Dispatch አስተዳደር መግቢያ እንኳን ደህና መጡ።",
    },
    supervisor: {
      title: "የኩሪየር ሱፐርቫይዘር ዳሽቦርድ",
      welcome: "ወደተቀላጠፈው የ Dispatch ሱፐርቫይዘር መግቢያ እንኳን ደህና መጡ።",
    },
    returnToWebsite: "ወደ ድረ-ገጽ ተመለስ",
    logout: "ውጣ",
  },


  // ─── Common ─────────────────────────────────────────────────────────────────
  common: {
    language: "ቋንቋ",
    theme: "ገጽታ",
    darkMode: "ጨለማ ሁነታ",
    lightMode: "ብሩህ ሁነታ",
    systemMode: "የሲስተም",
  },

  // ─── Shipment Details ──────────────────────────────────────────────────────
  shipmentDetails: {
    header: "የ {code} ዝርዝሮች",
    snapshot: "የጭነት ቅጽበታዊ እይታ",
    status: "የጭነት ሁኔታ",
    code: "የጭነት ኮድ",
    confirmationCode: "የማረጋገጫ ኮድ",
    created: "የተፈጠረበት",
    lastUpdated: "መጨረሻ የተዘመነው",
    merchant: "ነጋዴ",
    refresh: "አድስ",
    cancel: "ጭነት ሰርዝ",
    cancelling: "በመሰረዝ ላይ...",
    cancelDialog: {
      title: "ይህ ጭነት ይሰረዝ?",
      desc: "ይህ እርምጃ ሊመለስ አይችልም። ይህን ጭነት መሰረዝ፡",
      list: [
        "ከዳሽቦርድዎ በቋሚነት ያስወግደዋል።",
        "ማንኛውንም ንቁ የአቅርቦት ጥያቄዎችን ይሰርዛል።",
        "ለተመደበው ኩሪየር (ካለ) የስረዛ ማሳወቂያ ይልካል።",
      ],
      remarkLabel: "ለምን እየሰረዙ ነው? (አማራጭ)",
      remarkPlaceholder: "ለምሳሌ፡ ሃሳቤን ቀይሬያለሁ፣ ሌላ ኩሪየር አግኝቻለሁ...",
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
    items: "ዕቃዎች",
    weight: "ክብደት",
    dimensions: "ልኬቶች",
    fee: "ጠቅላላ ክፍያ",
    carrier: "ኩሪየር አጋር",
    updateTitle: "ዝርዝሮችን አዘምን",
    updateSubtitle: "የመነሻ፣ የማቅረቢያ፣ የተቀባይ ወይም የጥቅል ዝርዝሮችን ይቀይሩ።",
    cannotUpdate: "ይህ ጭነት ከዚህ በኋላ ሊዘምን አይችልም (ቀድሞውኑ ተመድቧል ወይም ተጠናቅቋል)።",
    save: "ለውጦችን አስቀምጥ",
    saving: "በማስቀመጥ ላይ...",
    actions: "እርምጃዎች",
    actionsSubtitle: "ሁኔታን ለማደስ ወይም ጭነትን ለመሰረዝ እነዚህን ይጠቀሙ።",
    refreshDetails: "ዝርዝሮችን አድስ",
    newShipment: "አዲስ ጭነት",
    generateCode: "የማረጋገጫ ኮድ ፍጠር",
    regenerateCode: "የማረጋገጫ ኮድ እንደገና ፍጠር",
    generating: "በመፍጠር ላይ...",
    regenerating: "እንደገና በመፍጠር ላይ...",
    codeGenerated: "ኮድ ተፈጥሯል",
    noCouriersDesc_part1: "ጭነቶችን ለእነሱ ለመመደብ በ ",
    noCouriersDesc_part2: " ገጽ ላይ ኩሪየሮችን እንደ አጋር ያክሉ።",
    noChanges: "ምንም ለውጥ አልተገኘም።",
    successUpdate: "ጭነት በተሳካ ሁኔታ ተዘምኗል።",
    successCancel: "ጭነት በተሳካ ሁኔታ ተሰርዟል",
    successCode: "የማረጋገጫ ኮድ በተሳካ ሁኔታ ተፈጥሯል",
    errorUpdate: "የጭነት ዝርዝሮችን ማዘመን አልተሳካም።",
    errorStatus: "በ '{status}' ሁኔታ ላይ ያሉ ጭነቶች ሊዘመኑ አይችሉም።",
    notFound: "ጭነት አልተገኘም",
    notFoundDesc: "ያንን የጭነት ኮድ ማግኘት አልቻልንም።",
    backToList: "ወደ ዝርዝር ተመለስ",
    retry: "እንደገና ሞክር",
    rating: {
      title: "የአቅርቦት ልምድን ይገምግሙ",
      subtitle: "የእርስዎ ግምገማ ለሁለቱም ለኩሪየር ኩባንያው እና ለግል ሾፌሩ ይተገበራል።",
      submit: "ግምገማ አስገባ",
      submitting: "በማስገባት ላይ...",
      success: "ለግምገማዎ እናመሰግናለን! የሾፌሩ እና የኩሪየር ኩባንያው ግምገማዎች ተዘምነዋል።",
      scoreHint: "ውጤት {score} / 10 ወደ ሰርቨር ይልካል",
      selectFirst: "መጀመሪያ የኮከብ ግምገማ ይምረጡ",
    },
  },

  // ─── New Shipment Page ─────────────────────────────────────────────────────
  newShipment: {
    title: "አዲስ ጭነት",
    subtitle: "አዲስ አቅርቦት ለማስያዝ ከታች ያሉትን ዝርዝሮች ይሙሉ::",
    breadcrumb: "ነጋዴ / አዲስ ጭነት",
    successTitle: "ጭነት ተፈጥሯል!",
    successDesc: "ጭነትዎ በ '{status}' ሁኔታ ተይዟል።",
    shipmentId: "የጭነት መታወቂያ",
    dashboard: "ዳሽቦርድ",
    sections: {
      courier: "ኩሪየር",
      addresses: "አድራሻዎች",
      recipient: "ተቀባይ",
      package: "የጥቅል ዝርዝሮች",
    },
    fields: {
      partnerCourier: "አጋር ኩሪየር",
      loadingCouriers: "አጋር ኩሪየሮችን በመጫን ላይ...",
      noCouriers: "ምንም አጋር ኩሪየሮች አልተገኙም",
      chooseCourier: "አጋር ኩሪየር ይምረጡ",
      maxWeightHint: "ከፍተኛ {weight} ኪ.ግ",
      basePrice: "መነሻ ዋጋ",
      maxWeight: "ከፍተኛ ክብደት",
      pickupAddress: "የመነሻ አድራሻ",
      destinationAddress: "የመድረሻ አድራሻ",
      recipient: "ተቀባይ",
      phone: "ስልክ",
      recipientName: "የተቀባይ ስም",
      recipientPhone: "የተቀባይ ስልክ",
      packageDescription: "የጥቅል መግለጫ",
      weight: "ክብደት (ኪ.ግ)",
      dimensions: "ልኬቶች",
      items: "ዕቃዎች",
      optional: "አማራጭ",
      maxWeightForCourier: "ለዚህ ኩሪየር ከፍተኛ {weight} ኪ.ግ",
      commaSeparated: "ዕቃ 1, ዕቃ 2, ዕቃ 3",
    },
    cancel: "ሰርዝ",
    create: "ጭነት ፍጠር",
    creating: "በመፍጠር ላይ…",
    validation: {
      selectCourier: "እባክዎ ትክክለኛ አጋር ኩሪየር ይምረጡ።",
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

  // ─── Analytics ─────────────────────────────────────────────────────────────
  shipmentAnalytics: {
    title: "የጭነት ትንታኔ",
    subtitle: "የአቅርቦት አፈጻጸምዎን ይከታተሉ እና የአሰራር አዝማሚያዎችን ይለዩ።",
    filters: {
      range: "የጊዜ ገደብ",
      last24Hours: "ያለፉት 24 ሰዓታት",
      last7Days: "ያለፉት 7 ቀናት",
      last30Days: "ያለፉት 30 ቀናት",
      courier: "ኩሪየር",
      status: "ሁኔታ",
      allCouriers: "ሁሉም ኩሪየሮች",
      allStatuses: "ሁሉም ሁኔታዎች",
    },
    metrics: {
      totalShipments: "ጠቅላላ ጭነቶች",
      successRate: "የስኬት መጠን",
      avgDeliveryTime: "አማካይ የአቅርቦት ጊዜ",
      volumeOverTime: "አማካይ የጭነት መጠን",
      vsLastPeriod: "ከቀዳሚው ጊዜ ጋር ሲነጻጸር",
    },
    charts: {
      volumeLine: "የጭነት መጠን በጊዜ ሂደት",
      statusDistribution: "የሁኔታ ስርጭት",
      performanceByCourier: "አፈጻጸም በኩሪየር",
    },
    noData: "ለተመረጠው የጊዜ ገደብ ምንም መረጃ የለም።",
    error: "የትንታኔ መረጃን ማግኘት አልተቻለም።",
    todo: {
      description: "እንደ የተረጋገጠ ነጋዴ፣ የጭነት አቅርቦት አፈጻጸምን ለመገምገም እና የአሰራር አዝማሚያዎችን ለመለየት የጭነቶቼን ትንታኔ ማየት እፈልጋለሁ።",
    }
  },

  apiUsage: {
    title: "የ API አጠቃቀም መለኪያዎች",
    subtitle: "የውህደት እንቅስቃሴዎን እና የሲስተም አጠቃቀምን ይከታተሉ::",
    filters: {
      last24Hours: "ያለፉት 24 ሰዓታት",
      last7Days: "ያለፉት 7 ቀናት",
      last30Days: "ያለፉት 30 ቀናት",
    },
    metrics: {
      totalRequests: "ጠቅላላ ጥያቄዎች",
      requestsOverTime: "ጥያቄዎች በጊዜ ሂደት",
      breakdownByKey: "ዝርዝር በ API ቁልፍ",
      activeKeys: "ንቁ ቁልፎች",
      healthScore: "የጤና ሁኔታ",
      last24h: "ያለፉት 24 ሰዓታት",
      usagePerCredential: "አጠቃቀም በ API መረጃ",
      requests: "ጥያቄዎች",
    },
    empty: "ምንም የ API እንቅስቃሴ አልተገኘም።",
    error: "የ API አጠቃቀም መረጃን ማግኘት አልተቻለም።",
    unauthorized: "ይህን መረጃ ለማየት ፈቃድ የሎትም።",
    noData: "በዚህ ጊዜ ውስጥ ምንም የ API እንቅስቃሴ አልተመዘገበም።",
  },

  courierComparison: {
    title: "የኩሪየር ንፅፅር",
    subtitle: "በአፈጻጸም ላይ በመመስረት የተሻለ ውሳኔ ለማድረግ አቅራቢዎችን ያነጻጽሩ።",
    filters: {
      range: "የጊዜ ገደብ",
      last24Hours: "ያለፉት 24 ሰዓታት",
      last7Days: "ያለፉት 7 ቀናት",
      last30Days: "ያለፉት 30 ቀናት",
    },    metrics: {
      successRate: "የአቅርቦት ስኬት መጠን",
      avgTime: "አማካይ የአቅርቦት ጊዜ",
      hours: "ሰዓታት",
      success: "ስኬት",
    },
    emptyState: {
      description: "ንፅፅር ለማመንጨት ቢያንስ የሁለት የተለያዩ ኩሪየሮች መረጃ ያስፈልጋል።",
      action: "ከሌላ ኩሪየር ጋር ያስይዙ",
    },
    notPossible: "ንፅፅር ማድረግ አይቻልም፡ ቢያንስ የሁለት ኩሪየሮች መረጃ ያስፈልጋል።",
    incompleteWarning: "ማስጠንቀቂያ፡ የአንዳንድ ኩሪየሮች መረጃ ያልተሟላ ነው፣ ይህም የንፅፅር ትክክለኛነትን ሊገድብ ይችላል።",
    error: "የንፅፅር መረጃን ማግኘት አልተቻለም።",
  },
};

export default am;
