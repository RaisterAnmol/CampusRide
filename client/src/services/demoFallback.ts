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
    phone: "+91 98765 43210"
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
    phone: "+91 98765 43212"
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
        academic: "B.Tech (CSE) • Year 3",
        phone: "+91 98765 43210",
        rating: 4.8,
        vehicleModel: "Honda City i-VTEC (Silver)",
        vehiclePlate: "4821"
      },
      passengers: [
        { name: "Rahul Sharma", department: "CSE", college: "Uttaranchal University", emergencyContact: "Father (+91 98111 22334)" },
        { name: "Tanvi Sharma", department: "ECE", college: "UPES", emergencyContact: "Parent (+91 98222 33445)" }
      ],
      pickupPoint: { text: "Premnagar Chowk Market", coordinates: [77.9620, 30.3340] },
      dropPoint: { text: "UIT Building (Uttaranchal Institute of Technology)", coordinates: [77.9448, 30.3432] },
      bridgeVia: "Nanda Ki Chowki Bridge",
      distanceKm: 8.4,
      farePerSeat: 20,
      totalCarpoolValue: 40,
      departureTime: new Date(Date.now() + 1800000).toISOString(),
      status: "active"
    },
    {
      _id: "ong_02",
      driver: {
        name: "Priya Singh",
        avatarURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        institution: "Uttaranchal University",
        academic: "B.Tech (ECE) • Year 3",
        phone: "+91 98765 43212",
        rating: 5.0,
        vehicleModel: "Maruti Swift (Red)",
        vehiclePlate: "5512"
      },
      passengers: [
        { name: "Meera Nair", department: "BBA", college: "Uttaranchal University", emergencyContact: "Mother (+91 98333 44556)" }
      ],
      pickupPoint: { text: "Suddhowala Chowk (Student PG Hub)", coordinates: [77.9320, 30.3475] },
      dropPoint: { text: "USCS Building (School of Computing Sciences)", coordinates: [77.9456, 30.3428] },
      bridgeVia: "Premnagar Flyover",
      distanceKm: 5.2,
      farePerSeat: 15,
      totalCarpoolValue: 15,
      departureTime: new Date(Date.now() + 2700000).toISOString(),
      status: "active"
    }
  ]
};
