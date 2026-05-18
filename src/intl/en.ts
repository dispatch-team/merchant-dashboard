/**
 * English translations for Dispatch
 */

export const en = {
  // ─── Brand ──────────────────────────────────────────────────────────────────
  brand: {
    name: "Dispatch",
    tagline: "The Unified Logistics Platform",
    description:
      "Dispatch connects merchants with courier providers, simplifying shipment creation, courier selection, and delivery tracking in one powerful dashboard.",
  },

  // ─── Navigation ─────────────────────────────────────────────────────────────
  nav: {
    features: "Features",
    howItWorks: "How it Works",
    portals: "Portals",
    login: "Log In",
    getStarted: "Get Started",
  },

  // ─── Merchant Navigation ────────────────────────────────────────────────────
  nav_merchant: {
    dashboard: "Dashboard",
    shipments: "Shipments",
    couriers: "Couriers",
    shipmentAnalytics: "Shipment Analytics",
    apiUsage: "API Usage",
    courierComparison: "Courier Comparison",
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
  },

  // ─── Features ───────────────────────────────────────────────────────────────
  features: {
    title: "Why Dispatch?",
    subtitle: "Everything you need to scale your delivery operations in Ethiopia.",
    items: {
      unified: {
        title: "Unified Courier API",
        desc: "Connect once, reach every courier. Our single API abstracts the complexity of multiple providers.",
      },
      automated: {
        title: "Automated Selection",
        desc: "Choose the best courier for every shipment based on price, speed, and reliability.",
      },
      tracking: {
        title: "Real-time Tracking",
        desc: "Keep your customers informed with precise, real-time tracking for every single package.",
      },
    },
  },

  // ─── How It Works ───────────────────────────────────────────────────────────
  howItWorks: {
    title: "How It Works",
    subtitle: "Three simple steps to streamline your logistics.",
    steps: {
      connect: {
        title: "Connect",
        desc: "Register as a merchant and integrate our lightweight API or use our intuitive dashboard.",
      },
      ship: {
        title: "Ship",
        desc: "Create shipments and instantly see available courier partners with transparent pricing.",
      },
      track: {
        title: "Track",
        desc: "Monitor your deliveries in real-time and receive automated status updates via webhooks.",
      },
    },
  },

  // ─── Portals ───────────────────────────────────────────────────────────────
  portals: {
    title: "Explore our Portals",
    subtitle: "Tailored experiences for every stakeholder in the ecosystem.",
    merchant: {
      title: "Merchant Portal",
      desc: "Manage orders, partners, and business analytics.",
      action: "Merchant Login",
    },
    supervisor: {
      title: "Supervisor Portal",
      desc: "Oversee courier operations and driver management.",
      action: "Supervisor Login",
    },
    admin: {
      title: "Admin Portal",
      desc: "Global system configuration and platform monitoring.",
      action: "Admin Login",
    },
  },

  // ─── CTA ───────────────────────────────────────────────────────────────────
  cta: {
    title: "Ready to simplify your deliveries?",
    subtitle: "Join the growing network of merchants using Dispatch to reach their customers faster.",
    button: "Create Your Account",
  },

  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: {
    rights: "© {year} Dispatch. All rights reserved.",
    links: {
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      contact: "Contact Support",
    },
  },

  // ─── Login ─────────────────────────────────────────────────────────────────
  login: {
    merchant: {
      title: "Merchant Login",
      subtitle: "Access your logistics dashboard",
    },
    admin: {
      title: "Admin Login",
      subtitle: "System administration and monitoring",
    },
    supervisor: {
      title: "Supervisor Login",
      subtitle: "Courier operations management",
    },
    username: "Username",
    password: "Password",
    submit: "Log In",
    loggingIn: "Logging in...",
    error: "Invalid credentials or server error.",
    noAccount: "Don't have an account?",
    register: "Register now",
    welcomeBack: "Welcome Back",
    platformDescription: "Dispatch connects merchants with courier providers, simplifying shipment creation, courier selection, and delivery tracking in one powerful dashboard.",
    back: "Back to Home",
    roles: {
      merchant: {
        label: "Merchant Portal",
        subtitle: "Access your logistics dashboard",
      },
      admin: {
        label: "Admin Portal",
        subtitle: "System administration and monitoring",
      },
      supervisor: {
        label: "Supervisor Portal",
        subtitle: "Courier operations management",
      },
    },
    lockout: {
      message: "Too many failed attempts. Locked out for {time}.",
    },
    emailLabel: "Email Address",
    emailPlaceholder: "name@company.com",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    signingIn: "Signing in...",
    signIn: "Sign In",
    switchPortal: "Switch Portal",
    validation: {
      emailRequired: "Email address is required.",
      emailInvalid: "Please enter a valid email address.",
      emailTooLong: "Email address is too long.",
      passwordRequired: "Password is required.",
      passwordTooShort: "Password must be at least 8 characters.",
    },
  },

  // ─── Register ──────────────────────────────────────────────────────────────
  register: {
    title: "Create Merchant Account",
    subtitle: "Start shipping with Dispatch today",
    username: "Username",
    email: "Email Address",
    password: "Password",
    companyName: "Company Name",
    submit: "Register",
    registering: "Registering...",
    error: "Registration failed. Please try again.",
    hasAccount: "Already have an account?",
    login: "Log in here",
    success: "Registration successful! You can now log in.",
    headline: "Create Merchant Account",
    subheadline: "Start shipping with Dispatch today",
    steps: {
      account: {
        title: "Create Account",
        desc: "Sign up and set up your merchant profile.",
      },
      courier: {
        title: "Connect Couriers",
        desc: "Partner with top delivery providers in Addis Ababa.",
      },
      shipping: {
        title: "Start Shipping",
        desc: "Book deliveries and track them in real-time.",
      },
    },
    fields: {
      firstName: "First Name",
      lastName: "Last Name",
      businessName: "Company Name",
      address: "Company Address",
      industry: "Industry",
      phone: "Phone Number",
      email: "Email Address",
      website: "Website URL (Optional)",
      description: "Business Description (Optional)",
      password: "Password",
      confirmPassword: "Confirm Password",
    },
    placeholders: {
      firstName: "John",
      lastName: "Doe",
      businessName: "Acme Corp",
      address: "Bole, Addis Ababa",
      industry: "E-commerce",
      phone: "+2519xxxxxxxx",
      email: "name@company.com",
      website: "https://example.com",
      description: "Tell us about your business...",
    },
    creating: "Creating account...",
    button: "Register",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Log in here",
    validation: {
      firstName: "First name is required.",
      lastName: "Last name is required.",
      businessName: "Business name is required.",
      address: "Business address is required.",
      industry: "Industry is required.",
      phoneRequired: "Phone number is required.",
      phoneInvalid: "Please enter a valid phone number (e.g. +2519xxxxxxxx).",
      emailInvalid: "Please enter a valid email address.",
      passwordShort: "Password must be at least 8 characters.",
      passwordMismatch: "Passwords do not match.",
    },
  },

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  merchantDashboard: {
    welcome: "Welcome back",
    defaultUser: "Merchant",
    at: "at",
    liveOverview: "Live Overview",
    welcomeSubtitle: "Here's what's happening with your business today.",
    syncData: "Sync Data",
    stats: {
      totalShipments: "Total Shipments",
      activeDeliveries: "Active Deliveries",
      deliveredToday: "Delivered Today",
      pendingPickups: "Pending Pickups",
      activeShipments: "Active Shipments",
      totalCreated: "Total Created",
      pendingReview: "Pending Review",
      deliveryRate: "Delivery Success",
      actionNeeded: "Action Needed",
    },
    recentShipments: "Recent Shipments",
    viewAll: "View All",
    quickActions: {
      subtitle: "Quick Actions",
      title: "Next Steps",
      newShipment: {
        label: "New Shipment",
        desc: "Book a new delivery with a courier partner."
      },
      manageCouriers: {
        label: "Manage Couriers",
        desc: "View and connect with courier providers."
      },
      apiUsage: {
        label: "API Usage",
        desc: "Monitor your integration metrics."
      },
      shipments: {
        label: "Shipments",
        desc: "View your delivery history."
      },
      couriers: {
        label: "Couriers",
        desc: "Manage your partner network."
      }
    },
    latestDeparture: {
      subtitle: "Last Activity",
      title: "Latest Shipment",
      viewAll: "See History",
      loading: "Loading latest shipment...",
      retry: "Retry",
      createdAt: "Created",
      trackingId: "Tracking ID",
      noDescription: "No description provided",
      route: "Route",
      originUnset: "Origin not set",
      destinationUnset: "Destination not set",
      carrier: "Courier",
      unassigned: "Unassigned",
      details: "Package Details",
      weightUnspecified: "Weight unspecified",
      dimensionsNA: "Dimensions N/A",
      contents: "Contents",
      noItems: "No items listed",
      fee: "Total Fee",
      currency: "ETB",
      noShipments: "No Shipments Yet",
      noShipmentsSubtitle: "Your latest shipment will appear here once you start sending.",
      createFirst: "Create First Shipment",
    }
  },

  // ─── Courier List ──────────────────────────────────────────────────────────
  couriers: {
    title: "Courier Partners",
    subtitle: "Manage your relationships with delivery providers.",
    all: "All Providers",
    partners: "My Partners",
    searchPlaceholder: "Search couriers...",
    searchLabel: "Search",
    filters: "Filters",
    empty: "No couriers found matching your criteria.",
    stats: {
      network: "Total Network",
      partners: "Your Partners",
      notPartnered: "Not Partnered"
    },
    tabs: {
      all: "All Couriers",
      partners: "My Partners"
    },
    filterActive: "Filter active: {query}",
    availableCouriers: "Available Couriers",
    partnerCouriers: "Partner Couriers",
    results: "{count} Results",
    connecting: "Connecting to network...",
    loadingPartners: "Loading partner data...",
    noResultsSearch: "No couriers match your search query.",
    noResultsAvailable: "No couriers are currently available.",
    noResultsPartners: "You haven't added any partner couriers yet.",
    card: {
      partnerBadge: "Partner",
      availableBadge: "Available",
      privateEmail: "Private Email",
      feesLimits: "Fees & Limits",
      basePrice: "Base Price",
      distance: "Distance",
      weight: "Weight",
      perKm: "/km",
      perKg: "/kg",
      capacity: "Capacity",
      maxLoad: "Max Load: {weight}kg",
      visitSite: "Visit Website",
      viewDetails: "View Details"
    },
    partnership: {
      active: "Partnered",
      inactive: "Not Partnered",
    },
    viewProfile: "View Profile",
  },

  // ─── Merchant Profile ──────────────────────────────────────────────────────
  profile: {
    title: "Account Settings",
    subtitle: "Manage your merchant profile and business details.",
    tabs: {
      general: "General",
      business: "Business",
      security: "Security",
    },
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
    empty: "No shipments found",
    emptyDesc: "It looks like you haven't created any shipments yet. Start your first delivery to see it here.",
    loading: "Loading shipments...",
    prev: "Prev",
    next: "Next",
    showing: "Showing {count} of {total} shipments",
    pageOf: "Page {current} of {total}",
    errorAuth: "Missing authentication context",
    errorLoad: "Unable to load shipments",
    statuses: {
      pending: "Pending",
      assigned_to_courier: "Assigned to Courier",
      assigned_to_driver: "Assigned to Driver",
      picked_up: "Picked Up",
      in_transit: "In Transit",
      delivered: "Delivered",
      cancelled: "Cancelled",
      failed: "Failed",
      unknown: "Unknown",
    },
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
      name: "Key ID",
      key: "API Key",
      status: "Status",
      createdAt: "Created At",
      lastActivity: "Last Used",
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
    empty: "No API keys found",
    emptyDesc: "Generate an API key to start integrating Dispatch with your own systems.",
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
    empty: "No webhooks found",
    emptyDesc: "Register a webhook to receive real-time notifications about your shipment status changes.",
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
    regenerateCode: "Regenerate Confirmation Code",
    generating: "Generating...",
    regenerating: "Regenerating...",
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

  // ─── Analytics ─────────────────────────────────────────────────────────────
  shipmentAnalytics: {
    title: "Shipment Analytics",
    subtitle: "Monitor your delivery performance and identification operational trends.",
    filters: {
      range: "Time Range",
      last24Hours: "Last 24 Hours",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
      courier: "Courier",
      status: "Status",
      allCouriers: "All Couriers",
      allStatuses: "All Statuses",
    },
    metrics: {
      totalShipments: "Total Shipments",
      successRate: "Success Rate",
      avgDeliveryTime: "Avg. Delivery Time",
      volumeOverTime: "Average Shipment Volume",
      vsLastPeriod: "vs last period",
    },
    charts: {
      volumeLine: "Shipment Volume Over Time",
      statusDistribution: "Status Distribution",
      performanceByCourier: "Performance by Courier",
    },
    noData: "No data available for the selected range.",
    error: "Unable to retrieve analytics data.",
    todo: {
      description: "As an authenticated merchant, I want to view analytical summaries of my shipments, so that I can assess delivery performance and identify operational trends.",
    }
  },

  apiUsage: {
    title: "API Usage Metrics",
    subtitle: "Monitor your integration activity and system consumption.",
    filters: {
      last24Hours: "Last 24 Hours",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
    },
    metrics: {
      totalRequests: "Total Requests",
      requestsOverTime: "Requests Over Time",
      breakdownByKey: "Breakdown by API Key",
      activeKeys: "Active Keys",
      healthScore: "Health Score",
      last24h: "Last 24h",
      usagePerCredential: "Usage per API credential",
      requests: "Requests",
    },
    empty: "No API activity found.",
    error: "Unable to retrieve API usage data.",
    unauthorized: "You do not have permission to view these metrics.",
    noData: "No API activity recorded in this period.",
  },

  courierComparison: {
    title: "Courier Comparison",
    subtitle: "Compare providers based on performance to make informed decisions.",
    filters: {
      range: "Time Range",
      last24Hours: "Last 24 Hours",
      last7Days: "Last 7 Days",
      last30Days: "Last 30 Days",
    },
    metrics: {
      successRate: "Delivery Success Rate",
      avgTime: "Avg. Delivery Time",
      hours: "hours",
      success: "Success",
    },
    emptyState: {
      description: "You need data from at least two different courier providers to generate a comparison report.",
      action: "Book with another courier",
    },
    notPossible: "Comparison not possible: at least two couriers with data are required.",
    incompleteWarning: "Warning: Data for some couriers is incomplete, which may limit comparison accuracy.",
    error: "Unable to retrieve comparison data.",
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
