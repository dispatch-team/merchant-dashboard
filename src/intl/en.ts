/**
 * English translations for Dispatch
 *
 * HOW TO EDIT:
 *  - All user-facing strings live here.
 *  - Add a matching key in `am.ts` for every key you add here.
 *  - Nest keys by feature/page so the file stays easy to navigate.
 *  - Never use em dashes (--) in strings; use commas or colons instead.
 */

const en = {
  // ─── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Dispatch",
    tagline: "Unified Logistics Platform",
    description:
      "The middleware that bridges merchants with courier providers, simplifying shipment creation, courier selection, and delivery tracking through one powerful platform.",
  },

  // ─── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    features: "Features",
    howItWorks: "How It Works",
    portals: "Portals",
    login: "Log in",
    getStarted: "Get Started",
  },

  // ─── Merchant Navigation ────────────────────────────────────────────────────
  nav_merchant: {
    dashboard: "Dashboard",
    shipments: "Shipments",
    couriers: "Couriers",
    apiKeys: "API Keys",
    webhooks: "Webhooks",
    profile: "Profile",
    settings: "System Settings",
    logout: "Log Out",
  },
  
  // ─── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    sessionExpired: "Your session has expired. Please log in again.",
  },

  // ─── Landing Hero ───────────────────────────────────────────────────────────
  hero: {
    badge: "Built for Addis Ababa's logistics",
    headline1: "Your shortcut to",
    headline2: "every delivery.",
    downloadDriverApp: "Download Driver App",
    merchantLogin: "Merchant Log In",
    scroll: "Scroll",
  },

  // ─── Stats ──────────────────────────────────────────────────────────────────
  stats: {
    courierPartners: "Courier Partners",
    activeMerchants: "Active Merchants",
    deliveriesCompleted: "Deliveries Completed",
    avgDeliveryTime: "Avg Delivery Time",
  },

  // ─── Features Section ────────────────────────────────────────────────────────
  features: {
    sectionLabel: "Platform",
    headline1: "Everything you need.",
    headline2: "Nothing you don't.",
    shipmentManagement: {
      title: "Shipment Management",
      description:
        "Create, track, and manage shipments across multiple courier providers from one unified dashboard.",
    },
    fleetCoordination: {
      title: "Fleet Coordination",
      description:
        "Real-time driver tracking, intelligent route management, and delivery confirmation workflows.",
    },
    performanceAnalytics: {
      title: "Performance Analytics",
      description:
        "Compare courier performance, delivery times, and success rates with interactive analytics.",
    },
    apiIntegration: {
      title: "API Integration",
      description:
        "RESTful API with key management for seamless e-commerce platform integration.",
    },
    locationIntelligence: {
      title: "Location Intelligence",
      description:
        "Landmark-based location resolution tailored for Addis Ababa's unique addressing system.",
    },
    courierRatings: {
      title: "Courier Ratings",
      description:
        "Rate and compare courier providers based on real delivery performance data.",
    },
  },

  // ─── How It Works ───────────────────────────────────────────────────────────
  howItWorks: {
    sectionLabel: "Process",
    headline: "Get started in minutes.",
    step1: {
      title: "Register",
      description:
        "Create your merchant account with business details and get instant platform access.",
    },
    step2: {
      title: "Choose Courier",
      description:
        "Browse available couriers, compare pricing, performance metrics, and delivery zones.",
    },
    step3: {
      title: "Ship and Track",
      description:
        "Create shipments, track in real-time, get proof of delivery, and analyze logistics.",
    },
  },

  // ─── Portals Section ────────────────────────────────────────────────────────
  portals: {
    sectionLabel: "Portals",
    headline: "Built for every role.",
    subheading:
      "Dedicated dashboards tailored to each stakeholder in the delivery chain.",
    merchant: {
      title: "Merchant",
      description: "Create shipments, compare couriers, and track deliveries.",
    },
    supervisor: {
      title: "Courier Supervisor",
      description: "Manage drivers, assign shipments, and monitor fleet.",
    },
    admin: {
      title: "Administrator",
      description: "Oversee the platform, couriers, and system metrics.",
    },
  },

  // ─── CTA Section ────────────────────────────────────────────────────────────
  cta: {
    headline1: "Ready to streamline",
    headline2: "your logistics?",
    subheading:
      "Join Dispatch and connect your business to Addis Ababa's courier network today.",
    createAccount: "Create Merchant Account",
    courierLogin: "Courier Login",
  },

  // ─── Footer ─────────────────────────────────────────────────────────────────
  footer: {
    copyright: "© 2026 Dispatch. Built for Addis Ababa.",
    merchant: "Merchant",
    supervisor: "Supervisor",
    downloadDriverApp: "Download Driver App",
    admin: "Admin",
  },

  // ─── Login Page ─────────────────────────────────────────────────────────────
  login: {
    welcomeBack: "Welcome back",
    platformDescription:
      "Unified logistics platform connecting merchants and courier providers in Addis Ababa.",
    back: "Back",
    emailLabel: "Email",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    signIn: "Sign In",
    signingIn: "Signing in...",
    switchPortal: "Switch portal",

    // Role labels and subtitles
    roles: {
      merchant: {
        label: "Merchant",
        subtitle: "Manage shipments and track deliveries",
      },
      supervisor: {
        label: "Courier Supervisor",
        subtitle: "Manage drivers and fleet operations",
      },
      admin: {
        label: "Administrator",
        subtitle: "Oversee platform operations and metrics",
      },
    },

    // Validation errors
    validation: {
      emailRequired: "Email is required.",
      emailInvalid: "Please enter a valid email address.",
      emailTooLong: "Email must be less than 255 characters.",
      passwordRequired: "Password is required.",
      passwordTooShort: "Password must be at least 8 characters.",
    },

    // Lockout
    lockout: {
      message: "Too many failed attempts. Please try again in {time}.",
    },
  },

  // ─── Register Page ──────────────────────────────────────────────────────────
  register: {
    title: "Join Dispatch",
    subtitle: "Register your business and start managing shipments with the best couriers in Addis Ababa.",
    headline: "Create Merchant Account",
    subheadline: "Register your business to start using Dispatch",
    steps: {
      account: {
        title: "Create your account",
        desc: "Register with your business details",
      },
      courier: {
        title: "Choose a courier",
        desc: "Browse and compare courier providers",
      },
      shipping: {
        title: "Start shipping",
        desc: "Create shipments and track deliveries",
      },
    },
    fields: {
      firstName: "First Name",
      lastName: "Last Name",
      businessName: "Business Name",
      address: "Company Address",
      industry: "Industry",
      phone: "Phone Number",
      email: "Email",
      website: "Website URL (Optional)",
      description: "Business Description (Optional)",
      password: "Password",
      confirmPassword: "Confirm Password",
    },
    placeholders: {
      firstName: "John",
      lastName: "Doe",
      businessName: "Your Company Ltd.",
      address: "Bole Road, Addis Ababa, Ethiopia",
      industry: "Logistics",
      phone: "+2519xxxxxxxx",
      email: "you@business.com",
      website: "https://example.com",
      description: "Describe your business...",
    },
    validation: {
      firstName: "First name is required",
      lastName: "Last name is required",
      businessName: "Business name is required",
      address: "Address is required",
      industry: "Industry is required",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Phone must be in +251XXXXXXXXX format",
      emailInvalid: "Valid email is required",
      passwordShort: "Password must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
    },
    button: "Create Account",
    creating: "Creating Account...",
    success: "Account created successfully!",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  merchantDashboard: {
    title: "Merchant",
    welcome: "Welcome back",
    welcomeSubtitle: "Here is what is happening with your shipments today.",
    at: "at",
    liveOverview: "Live Overview",
    syncData: "Sync Data",
    errorAuth: "Missing authentication token",
    errorLoadOverview: "Failed to load shipment overview",
    defaultUser: "Merchant",
    stats: {
      activeShipments: "Active Shipments",
      totalCreated: "Total Created",
      pendingReview: "Pending Review",
      deliveryRate: "Delivery Rate",
      actionNeeded: "Action Needed",
    },
    latestDeparture: {
      title: "Latest Departure",
      subtitle: "Recent activity",
      viewAll: "View All",
      trackingId: "Tracking ID",
      route: "Route",
      carrier: "Carrier partner",
      details: "Package details",
      contents: "Contents",
      noShipments: "No shipments yet",
      noShipmentsSubtitle: "Your latest shipment will appear here once created.",
      createFirst: "Create your first shipment",
      loading: "Retrieving shipment data...",
      noDescription: "No description provided",
      originUnset: "Origin unset",
      destinationUnset: "Destination unset",
      unassigned: "Unassigned",
      weightUnspecified: "Weight unspecified",
      dimensionsNA: "Dimensions N/A",
      noItems: "No items listed",
      createdAt: "Created",
      fee: "Fee",
      currency: "ETB ",
      retry: "Retry Connection",
    },
    quickActions: {
      title: "Quick Actions",
      subtitle: "Shortcuts",
      newShipment: {
        label: "New Shipment",
        desc: "Create and dispatch shipments in seconds",
      },
      shipments: {
        label: "Shipments",
        desc: "View tracking and delivery reports",
      },
      couriers: {
        label: "Couriers",
        desc: "Compare courier partners and fees",
      },
    },
  },

  // ─── Couriers ───────────────────────────────────────────────────────────────
  couriers: {
    title: "Courier partnerships",
    subtitle: "Discover delivery networks and manage partners across Addis Ababa.",
    searchPlaceholder: "Search couriers…",
    searchLabel: "Search couriers",
    filters: "Filters",
    stats: {
      network: "Couriers in network",
      partners: "Your partners",
      notPartnered: "Not partnered yet",
    },
    tabs: {
      all: "All couriers",
      partners: "Partners",
    },
    filterActive: "Filter: \"{query}\"",
    availableCouriers: "Available couriers",
    partnerCouriers: "Partner couriers",
    results: "{count} results",
    connecting: "Connecting to courier network...",
    loadingPartners: "Loading partners...",
    noResultsSearch: "No couriers match your search. Change the query and press the search button.",
    noResultsAvailable: "No couriers are available right now.",
    noResultsPartners: "You have not added any courier partners yet. Browse all couriers to add one.",
    card: {
      partnerBadge: "Partner",
      availableBadge: "Available",
      privateEmail: "Private",
      feesLimits: "Fees & limits",
      basePrice: "Base price",
      distance: "Distance",
      weight: "Weight",
      perKm: "/km",
      perKg: "/kg",
      capacity: "Capacity",
      maxLoad: "{weight} kg max load",
      visitSite: "Visit site",
      viewDetails: "View details",
    },
    errorAuth: "Unable to authenticate courier network",
    errorLoad: "Failed to load couriers",
  },

  // ─── Profile ────────────────────────────────────────────────────────────────
  profile: {
    title: "Account Profile",
    subtitle: "Manage your personal and business information.",
    personalInfo: "Personal Information",
    businessInfo: "Business Information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    phoneNumber: "Phone Number",
    companyName: "Company Name",
    companyAddress: "Company Address",
    companyLogo: "Company Logo",
    logoRecommended: "Recommended: Square JPG or PNG, max 2MB.",
    changeLogo: "Change Logo",
    uploadLogo: "Upload Logo",
    industry: "Industry",
    description: "Business Description",
    websiteUrl: "Website URL",
    saveChanges: "Save Changes",
    saving: "Saving...",
    cancel: "Cancel",
    successUpdate: "Profile updated successfully!",
    errorUpdate: "Failed to update profile.",
    success: "Profile updated successfully",
    error: "Failed to update profile",
    errorLoad: "Failed to load profile",
    phonePlaceholder: "+2519xxxxxxxx",
  },

  // ─── Shipments ──────────────────────────────────────────────────────────────
  shipments: {
    title: "Manage deliveries",
    subtitle: "Track shipments, filter statuses, and drill into every fulfillment.",
    overview: "Shipment overview",
    newShipment: "New shipment",
    refresh: "Refresh",
    stats: {
      total: "Total shipments",
      active: "Active dispatches",
      pending: "Pending review",
    },
    searchPlaceholder: "Search by code or description",
    columns: {
      code: "Code",
      pickup: "Pickup",
      destination: "Destination",
      status: "Status",
      created: "Created",
      actions: "Actions",
    },
    viewDetails: "View Details",
    empty: "No shipments found. Create a shipment to get started.",
    loading: "Loading shipments...",
    prev: "Prev",
    next: "Next",
    showing: "Showing {count} of {total} shipments",
    pageOf: "Page {current} of {total}",
    errorAuth: "Missing authentication context",
    errorLoad: "Unable to load shipments",
  },

  // ─── API Keys ──────────────────────────────────────────────────────────────
  apiKeys: {
    title: "API Keys",
    subtitle: "Manage your authentication tokens for direct API integration.",
    newKey: "Generate New Key",
    nameLabel: "Key Name",
    placeholder: "Production Key",
    generate: "Generate Key",
    table: {
      name: "Key Name",
      key: "API Key",
      status: "Status",
      created: "Created",
      actions: "Actions",
    },
    active: "Active",
    revoked: "Revoked",
    copy: "Copy",
    delete: "Delete Key",
    confirmDelete: "Are you sure you want to delete this API key? This action cannot be undone.",
    deleting: "Deleting...",
    confirm: "Delete Key",
    authorizedCredentials: "Authorized Credentials",
    totalKeys: "{count} Keys total",
    verifyTitle: "Verify API Key",
    verifyDesc: "Paste an API key string below to check if it is still valid and active.",
    verifyLabel: "API Key String",
    isValid: "Key is Valid",
    isInvalid: "Invalid Key",
    validDesc: "This API key is active and can be used for integrations.",
    invalidDesc: "This key is either incorrect or has been revoked.",
    warning: "Note",
    criticalWarning: "Critical Warning",
    criticalDesc: "This key is only displayed once. If you lose it, you will need to generate a new one and update your integrations. Store it securely in a password manager or vault.",
    savedKey: "I've saved the key",
    successCreate: "API key generated successfully!",
    successDelete: "API key deleted successfully!",
  },

  // ─── Webhooks ──────────────────────────────────────────────────────────────
  webhooks: {
    title: "Webhooks",
    subtitle: "Configure URLs to receive real-time updates for your shipments.",
    addWebhook: "Register Webhook",
    activeCallbacks: "Active Callbacks",
    totalWebhooks: "{count} Webhooks total",
    urlLabel: "Target URL",
    successCreate: "Webhook configured successfully",
    successDelete: "Webhook removed",
    table: {
      url: "Endpoint",
      status: "Status",
      actions: "Actions",
    },
    dialogs: {
      register: {
        title: "Register Webhook",
        desc: "Enter the endpoint URL where you want to receive shipment tracking notifications.",
        note: "Ensure your endpoint is publicly accessible and can handle POST requests from our servers.",
        save: "Save Webhook",
        configuring: "Configuring...",
      },
      success: {
        title: "Successfully Registered",
        desc: "Webhook #{id} has been configured. Please copy the signing key below; you won't see it again.",
        signingKey: "Signing Key",
        securityWarning: "Security Warning",
        securityDesc: "This key is used to sign notifications sent to your URL. If you lose it, you must delete and re-register the webhook to get a new one.",
        understand: "I understand",
      },
      delete: {
        title: "Delete Webhook",
        desc: "Are you sure you want to stop receiving notifications at {id}? This action is permanent.",
        confirm: "Delete Webhook",
        deleting: "Removing...",
      },
    },
  },

  // ─── Courier Details ───────────────────────────────────────────────────────
  courierDetails: {
    back: "Back to couriers",
    partner: "Your partner",
    notPartnered: "Not partnered",
    type: "Courier company",
    endPartnership: "End partnership",
    addPartner: "Add as partner",
    ending: "Ending...",
    adding: "Adding...",
    successEnd: "Partnership ended",
    successAdd: "Courier added as partner",
    errorAuth: "Unable to authenticate",
    errorAction: "Partner action failed",
    invalid: "Invalid courier link.",
    notFound: "This courier could not be found.",
    loading: "Loading courier...",
    sections: {
      contact: {
        title: "Contact & location",
        subtitle: "How to reach this courier",
        website: "Website",
      },
      pricing: {
        title: "Pricing & capacity",
        subtitle: "Rates shown for planning shipments",
        base: "Base price",
        distance: "Distance",
        weight: "Weight",
        time: "Time",
        maxWeight: "Max weight",
        perKm: "/km",
        perKg: "/kg",
      },
    },
  },

  // ─── Dashboards (Admin & Supervisor) ──────────────────────────────────────
  dashboards: {
    admin: {
      title: "Administrator Dashboard",
      welcome: "Welcome to the streamlined Dispatch Administration portal.",
    },
    supervisor: {
      title: "Courier Supervisor Dashboard",
      welcome: "Welcome to the streamlined Dispatch Supervisor portal.",
    },
    returnToWebsite: "Return to Website",
    logout: "Sign Out",
  },


  // ─── Common ─────────────────────────────────────────────────────────────────
  common: {
    language: "Language",
    theme: "Theme",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    systemMode: "System",
  },

  // ─── Shipment Details ──────────────────────────────────────────────────────
  shipmentDetails: {
    header: "Details for {code}",
    snapshot: "Shipment snapshot",
    status: "Shipment status",
    code: "Shipment code",
    confirmationCode: "Confirmation Code",
    created: "Created",
    lastUpdated: "Last updated",
    merchant: "Merchant",
    refresh: "Refresh",
    cancel: "Cancel shipment",
    cancelling: "Cancelling...",
    cancelDialog: {
      title: "Cancel this shipment?",
      desc: "This action cannot be undone. Cancelling this shipment will:",
      list: [
        "Permanently remove it from your dashboard.",
        "Cancel any active delivery requests.",
        "Notify the assigned courier (if any) of the cancellation.",
      ],
      remarkLabel: "Why are you cancelling? (Optional)",
      remarkPlaceholder: "e.g. Changed my mind, found another courier...",
      keep: "No, keep it",
      confirm: "Confirm Cancellation",
    },
    locations: "Locations",
    pickup: "Pickup",
    destination: "Destination",
    package: "Package & recipient",
    recipient: "Recipient",
    phone: "Phone",
    notes: "Notes",
    items: "Items",
    weight: "Weight",
    dimensions: "Dimensions",
    fee: "Total fee",
    carrier: "Courier partner",
    updateTitle: "Update details",
    updateSubtitle: "Change the pickup, delivery, recipient, or package details.",
    cannotUpdate: "This shipment can no longer be updated (already assigned or completed).",
    save: "Save changes",
    saving: "Saving...",
    actions: "Actions",
    actionsSubtitle: "Use these to refresh status or cancel the shipment.",
    refreshDetails: "Refresh details",
    newShipment: "New Shipment",
    generateCode: "Generate Confirmation Code",
    generating: "Generating...",
    codeGenerated: "Code Generated",
    noCouriersDesc_part1: "Add carriers as partners on the ",
    noCouriersDesc_part2: " page to assign shipments to them.",
    noChanges: "No changes detected.",
    successUpdate: "Shipment updated successfully.",
    successCancel: "Shipment cancelled successfully",
    successCode: "Confirmation code generated successfully",
    errorUpdate: "Failed to update shipment details.",
    errorStatus: "Shipments in '{status}' state cannot be updated.",
    notFound: "Shipment not found",
    notFoundDesc: "We couldn't locate that shipment code.",
    backToList: "Back to list",
    retry: "Retry",
    rating: {
      title: "Rate delivery experience",
      subtitle: "Your rating will be applied to both the courier company and the individual driver.",
      submit: "Submit rating",
      submitting: "Submitting...",
      success: "Thank you for your rating! Both driver and courier company ratings have been updated.",
      scoreHint: "Sends {score} / 10 to the server",
      selectFirst: "Select a star rating first",
    },
  },

  // ─── New Shipment Page ─────────────────────────────────────────────────────
  newShipment: {
    title: "New Shipment",
    subtitle: "Fill in the details below to book a new delivery.",
    breadcrumb: "Merchant / New Shipment",
    successTitle: "Shipment Created!",
    successDesc: "Your shipment has been booked with status {status}.",
    shipmentId: "Shipment ID",
    dashboard: "Dashboard",
    sections: {
      courier: "Courier",
      addresses: "Addresses",
      recipient: "Recipient",
      package: "Package Details",
    },
    fields: {
      partnerCourier: "Partner courier",
      loadingCouriers: "Loading partner couriers...",
      noCouriers: "No partner couriers found",
      chooseCourier: "Choose a courier partner",
      maxWeightHint: "max {weight} kg",
      basePrice: "Base Price",
      maxWeight: "Max Weight",
      pickupAddress: "Pickup Address",
      destinationAddress: "Destination Address",
      recipient: "Recipient",
      phone: "Phone",
      recipientName: "Recipient Name",
      recipientPhone: "Recipient Phone",
      packageDescription: "Package Description",
      weight: "Weight (kg)",
      dimensions: "Dimensions",
      items: "Items",
      optional: "Optional",
      maxWeightForCourier: "Max {weight} kg for this courier",
      commaSeparated: "Item 1, Item 2, Item 3",
    },
    cancel: "Cancel",
    create: "Create Shipment",
    creating: "Creating…",
    validation: {
      selectCourier: "Please select a valid partner courier.",
      pickupRequired: "Pickup address is required.",
      destRequired: "Destination address is required.",
      nameRequired: "Recipient name is required.",
      phoneRequired: "Recipient phone number is required.",
      phoneInvalid: "Enter a valid phone number.",
      descRequired: "Package description is required.",
      weightPositive: "Weight must be a positive number.",
      weightExceeds: "Weight exceeds {name}'s maximum of {weight} kg.",
    },
  },
} as const;

// DeepStringify converts all leaf string literals to `string`,
// so am.ts can satisfy this type with different string values.
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends readonly string[]
    ? readonly string[]
    : T[K] extends Record<string, unknown>
    ? DeepStringify<T[K]>
    : T[K];
};

export type Messages = DeepStringify<typeof en>;
export default en;
