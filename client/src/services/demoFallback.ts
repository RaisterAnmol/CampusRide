// Automatic zero-backend fallback for standalone Vercel previews & demo evaluations
export const DEMO_FALLBACK_USERS: Record<string, any> = {
  "aditya.kumar@college.edu": {
    _id: "usr_aditya_1001",
    name: "Aditya Kumar",
    email: "aditya.kumar@college.edu",
    college: "Uttaranchal University",
    department: "CSE",
    course: "B.Tech",
    year: 3,
    semester: 6,
    role: "student",
    verificationStatus: "verified",
    rating: 4.8,
    totalRides: 42,
    gender: "male",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: false },
    avatarURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    phone: "+91 98765 43210",
    vehicle: { model: "Honda City i-VTEC (Silver)", plateLast4: "4821", type: "car" }
  },
  "rahul.sharma@college.edu": {
    _id: "usr_rahul_1002",
    name: "Rahul Sharma",
    email: "rahul.sharma@college.edu",
    college: "Uttaranchal University",
    department: "CSE",
    course: "B.Tech",
    year: 2,
    semester: 4,
    role: "student",
    verificationStatus: "verified",
    rating: 4.9,
    totalRides: 18,
    gender: "male",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: false },
    avatarURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    phone: "+91 98765 43211"
  },
  "priya.singh@college.edu": {
    _id: "usr_priya_1003",
    name: "Priya Singh",
    email: "priya.singh@college.edu",
    college: "Graphic Era University",
    department: "ECE",
    course: "B.Tech",
    year: 3,
    semester: 6,
    role: "student",
    verificationStatus: "verified",
    rating: 5.0,
    totalRides: 24,
    gender: "female",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: true },
    avatarURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    phone: "+91 98765 43212",
    vehicle: { model: "Maruti Swift (Red)", plateLast4: "5512", type: "car" }
  },
  "admin@campusride.edu": {
    _id: "usr_admin_1000",
    name: "Dean Office & SOC Security",
    email: "admin@campusride.edu",
    college: "Uttaranchal University",
    role: "super_admin",
    verificationStatus: "verified",
    rating: 5.0,
    totalRides: 0,
    gender: "other",
    avatarURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    phone: "+91 135 277 0000"
  }
};

export const DEMO_FALLBACK_RIDES = [
  {
    _id: "ride_uu_01",
    creator: {
      _id: "usr_aditya_1001",
      name: "Aditya Kumar",
      college: "Uttaranchal University",
      department: "CSE",
      course: "B.Tech",
      year: 3,
      semester: 6,
      rating: 4.8,
      totalRides: 42,
      verificationStatus: "verified",
      avatarURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
    },
    vehicle: { type: "car", model: "Honda City (Silver)", plateLast4: "4821" },
    origin: { text: "Premnagar Chowk Market", coordinates: [77.9620, 30.3340] },
    destination: { text: "UIT Building (Uttaranchal Institute of Technology)", coordinates: [77.9448, 30.3432] },
    departureTime: new Date(Date.now() + 3600000).toISOString(),
    availableSeats: 3,
    totalSeats: 4,
    pricePerSeat: 20,
    status: "active",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: false },
    recurring: true,
    detourMins: 3,
    routeOverlapPercent: 95
  },
  {
    _id: "ride_uu_02",
    creator: {
      _id: "usr_rohan_1004",
      name: "Rohan Mehta",
      college: "Uttaranchal University",
      department: "CSE",
      course: "B.Tech",
      year: 3,
      semester: 6,
      rating: 4.9,
      totalRides: 31,
      verificationStatus: "verified",
      avatarURL: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
    },
    vehicle: { type: "car", model: "Hyundai i20", plateLast4: "9102" },
    origin: { text: "Suddhowala Chowk (Student PG Hub)", coordinates: [77.9320, 30.3475] },
    destination: { text: "USCS Building (School of Computing Sciences)", coordinates: [77.9456, 30.3428] },
    departureTime: new Date(Date.now() + 5400000).toISOString(),
    availableSeats: 2,
    totalSeats: 4,
    pricePerSeat: 15,
    status: "active",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: false },
    recurring: true,
    detourMins: 2,
    routeOverlapPercent: 98
  },
  {
    _id: "ride_uu_03",
    creator: {
      _id: "usr_priya_1003",
      name: "Priya Singh",
      college: "Uttaranchal University",
      department: "ECE",
      course: "B.Tech",
      year: 3,
      semester: 6,
      rating: 5.0,
      totalRides: 24,
      verificationStatus: "verified",
      avatarURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
    },
    vehicle: { type: "car", model: "Maruti Swift (Red)", plateLast4: "5512" },
    origin: { text: "Selaqui Industrial & Institutional Hub", coordinates: [77.8540, 30.3685] },
    destination: { text: "Campus Gate 1 (Main Entrance, Premnagar Road)", coordinates: [77.9440, 30.3415] },
    departureTime: new Date(Date.now() + 7200000).toISOString(),
    availableSeats: 3,
    totalSeats: 4,
    pricePerSeat: 25,
    status: "active",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: true },
    recurring: true,
    detourMins: 4,
    routeOverlapPercent: 92
  },
  {
    _id: "ride_uu_04",
    creator: {
      _id: "usr_ananya_1005",
      name: "Ananya Verma",
      college: "Uttaranchal University",
      department: "Management",
      course: "BBA",
      year: 2,
      semester: 4,
      rating: 4.8,
      totalRides: 19,
      verificationStatus: "verified",
      avatarURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
    },
    vehicle: { type: "car", model: "Tata Nexon EV", plateLast4: "3310" },
    origin: { text: "Ballupur Chowk (City Entrance)", coordinates: [78.0125, 30.3395] },
    destination: { text: "BBA Building (Uttaranchal Institute of Management)", coordinates: [77.9461, 30.3420] },
    departureTime: new Date(Date.now() + 9000000).toISOString(),
    availableSeats: 3,
    totalSeats: 4,
    pricePerSeat: 30,
    status: "active",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: false },
    recurring: true,
    detourMins: 5,
    routeOverlapPercent: 91
  },
  {
    _id: "ride_uu_05",
    creator: {
      _id: "usr_kabir_1006",
      name: "Kabir Sharma",
      college: "Uttaranchal University",
      department: "Mechanical",
      course: "B.Tech",
      year: 4,
      semester: 8,
      rating: 4.7,
      totalRides: 38,
      verificationStatus: "verified",
      avatarURL: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
    },
    vehicle: { type: "car", model: "Honda Amaze", plateLast4: "7721" },
    origin: { text: "Vikasnagar Bus Terminal", coordinates: [77.7710, 30.4350] },
    destination: { text: "Central Academic Library & Law Block", coordinates: [77.9450, 30.3425] },
    departureTime: new Date(Date.now() + 10800000).toISOString(),
    availableSeats: 2,
    totalSeats: 4,
    pricePerSeat: 35,
    status: "active",
    preferences: { musicAllowed: true, smokingAllowed: false, womenOnlyDriver: false },
    recurring: true,
    detourMins: 6,
    routeOverlapPercent: 88
  }
];

export const DEMO_FALLBACK_OPERATIONS = {
  kpis: {
    totalRevenue: 16800,
    totalRides: 14,
    co2SavedKg: 215.4,
    ongoingRidesCount: 15
  },
  pricingConfig: {
    minPricePerSeat: 10,
    basePrice: 15,
    pricePerKm: 4.5,
    localTransitComparison: "Dehradun Vikram shared rate: ₹15–₹20, E-rickshaw: ₹10–₹15",
    updatedBy: "Dean of Student Affairs",
    updatedAt: new Date().toISOString()
  },
  ongoingRides: [
    {
      _id: "ong_01",
      driver: {
        name: "Aditya Kumar",
        avatarURL: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
        institution: "Uttaranchal University",
        college: "Uttaranchal University",
        department: "CSE",
        course: "B.Tech",
        academic: "B.Tech (CSE) • Year 3",
        phone: "+91 98765 43210",
        rating: 4.8,
        vehicle: { model: "Honda City i-VTEC (Silver)", plateLast4: "4821", type: "car" },
        vehicleModel: "Honda City i-VTEC (Silver)",
        vehiclePlate: "4821"
      },
      passengers: [
        { id: "p1", name: "Rahul Sharma", department: "CSE", college: "Uttaranchal University", emergencyContact: { name: "Father", relation: "Parent", phone: "+91 98111 22334" } },
        { id: "p2", name: "Tanvi Sharma", department: "ECE", college: "UPES", emergencyContact: { name: "Mother", relation: "Parent", phone: "+91 98222 33445" } }
      ],
      origin: { text: "Premnagar Chowk Market", coordinates: [77.9620, 30.3340] },
      destination: { text: "UIT Building (Uttaranchal Institute of Technology)", coordinates: [77.9448, 30.3432] },
      pickupPoint: { text: "Premnagar Chowk Market", coordinates: [77.9620, 30.3340] },
      dropPoint: { text: "UIT Building (Uttaranchal Institute of Technology)", coordinates: [77.9448, 30.3432] },
      bridgeVia: "Nanda Ki Chowki Bridge",
      distanceKm: 8.4,
      pricePerSeat: 20,
      totalValue: 40,
      farePerSeat: 20,
      totalCarpoolValue: 40,
      availableSeats: 2,
      departureTime: new Date(Date.now() + 1800000).toISOString(),
      status: "active"
    },
    {
      _id: "ong_02",
      driver: {
        name: "Priya Singh",
        avatarURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        institution: "Uttaranchal University",
        college: "Uttaranchal University",
        department: "ECE",
        course: "B.Tech",
        academic: "B.Tech (ECE) • Year 3",
        phone: "+91 98765 43212",
        rating: 5.0,
        vehicle: { model: "Maruti Swift (Red)", plateLast4: "5512", type: "car" },
        vehicleModel: "Maruti Swift (Red)",
        vehiclePlate: "5512"
      },
      passengers: [
        { id: "p3", name: "Meera Nair", department: "BBA", college: "Uttaranchal University", emergencyContact: { name: "Mother", relation: "Parent", phone: "+91 98333 44556" } }
      ],
      origin: { text: "Suddhowala Chowk (Student PG Hub)", coordinates: [77.9320, 30.3475] },
      destination: { text: "USCS Building (School of Computing Sciences)", coordinates: [77.9456, 30.3428] },
      pickupPoint: { text: "Suddhowala Chowk (Student PG Hub)", coordinates: [77.9320, 30.3475] },
      dropPoint: { text: "USCS Building (School of Computing Sciences)", coordinates: [77.9456, 30.3428] },
      bridgeVia: "Premnagar Flyover",
      distanceKm: 5.2,
      pricePerSeat: 15,
      totalValue: 15,
      farePerSeat: 15,
      totalCarpoolValue: 15,
      availableSeats: 3,
      departureTime: new Date(Date.now() + 2700000).toISOString(),
      status: "active"
    }
  ]
};

export const DEMO_FALLBACK_INCIDENTS = [
  {
    _id: "inc_01",
    tripId: "trip_demo_101",
    reporterId: "usr_priya_1003",
    reporterName: "Priya Singh",
    reporterPhone: "+91 98765 43212",
    incidentType: "route_divergence_warning",
    status: "RESOLVED",
    priority: "MEDIUM",
    location: { text: "Premnagar Flyover Bypass", coordinates: [77.9500, 30.3380] },
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    resolutionNotes: "Route divergence verified by security desk: driver took bypass to avoid road construction."
  }
];

export const DEMO_FALLBACK_VERIFICATIONS = [
  {
    _id: "verif_01",
    user: {
      _id: "usr_rahul_1002",
      name: "Rahul Sharma",
      email: "rahul.sharma@college.edu",
      college: "Uttaranchal University",
      department: "CSE",
      year: 2
    },
    studentIdCardURL: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    status: "approved",
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const DEMO_FALLBACK_ANALYTICS = {
  totalEmissionsSavedKg: 215.4,
  totalSharedKilometers: 1260,
  campusTrafficReductionPercent: 24,
  activeVehiclesCount: 8,
  popularCorridors: [
    { corridor: "Premnagar Chowk ⇄ Uttaranchal University", sharePercent: 42 },
    { corridor: "Suddhowala PG Hub ⇄ UIT / USCS Buildings", sharePercent: 35 },
    { corridor: "Selaqui Institutional Hub ⇄ Campus Gate 1", sharePercent: 23 }
  ]
};

export const DEMO_FALLBACK_HUBS = [
  { _id: "hub_01", name: "UIT Building (Uttaranchal Institute of Technology)", code: "UU-UIT", coordinates: [77.9448, 30.3432], activeRidesCount: 4 },
  { _id: "hub_02", name: "USCS Building (School of Computing Sciences)", code: "UU-USCS", coordinates: [77.9456, 30.3428], activeRidesCount: 3 },
  { _id: "hub_03", name: "BBA Building (Uttaranchal Institute of Management)", code: "UU-BBA", coordinates: [77.9461, 30.3420], activeRidesCount: 3 },
  { _id: "hub_04", name: "Central Academic Library & Law Block", code: "UU-LIB", coordinates: [77.9450, 30.3425], activeRidesCount: 2 },
  { _id: "hub_05", name: "Campus Gate 1 (Main Entrance, Premnagar Road)", code: "UU-GATE1", coordinates: [77.9440, 30.3415], activeRidesCount: 5 }
];

export const DEMO_FALLBACK_AUDIT_LOGS = [
  {
    _id: "log_01",
    action: "FARE_POLICY_UPDATE",
    actor: "Dean of Student Affairs",
    details: "Minimum price per seat standard verified at ₹10 per seat.",
    timestamp: new Date().toISOString()
  },
  {
    _id: "log_02",
    action: "STUDENT_VERIFICATION",
    actor: "Campus Registrar",
    details: "Student identity credentials verified for 12 campus commuters.",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];
