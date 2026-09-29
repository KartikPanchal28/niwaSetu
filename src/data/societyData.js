// Society configuration & vendor master for 100-flat community
export const SOCIETY_INFO = {
  name: "Gokuldham Heights CHS Ltd.",
  registration: "MH/BOM/HSG/2019/8821",
  address: "Sector 14, Plot 22, Palm Beach Link Road, Navi Mumbai",
  totalFlats: 100,
  wings: [
    { id: "A", name: "Wing A (Sun)", totalFlats: 50, floors: 5, flatsPerFloor: 10 },
    { id: "B", name: "Wing B (Moon)", totalFlats: 50, floors: 5, flatsPerFloor: 10 }
  ],
  committeeMembers: [
    { id: "cm1", name: "Rajesh Shah", role: "Hon. Secretary", flat: "B-304", phone: "+91 98201 44550", avatar: "👨‍💼" },
    { id: "cm2", name: "Priya Iyer", role: "Treasurer", flat: "A-202", phone: "+91 98332 77112", avatar: "👩‍💼" },
    { id: "cm3", name: "Vikram Deshmukh", role: "Managing Committee Member", flat: "A-405", phone: "+91 98210 99334", avatar: "👨‍💻" }
  ],
  vendors: [
    {
      id: "v-plumber",
      name: "Ramesh Kumar (Shree Plumbing)",
      trade: "Plumbing & Water Supply",
      category: "water",
      phone: "+91 98201 11223",
      rating: 4.8,
      status: "Available",
      responseEta: "20-30 mins"
    },
    {
      id: "v-lift",
      name: "Otis Express 24x7 AMC Care",
      trade: "Elevators & Lifts",
      category: "lift",
      phone: "+91 98334 55667",
      rating: 4.9,
      status: "On Call (24x7 Emergency)",
      responseEta: "15-25 mins"
    },
    {
      id: "v-security",
      name: "Ramu & Bahadur (Main Gate Desk)",
      trade: "Security & Vehicle Parking",
      category: "parking",
      phone: "+91 98190 22334",
      rating: 4.6,
      status: "On Duty (Gate 1 Intercom 001)",
      responseEta: "Instant (< 5 mins)"
    },
    {
      id: "v-cleaning",
      name: "Sunita Supervisor (Swachh Facility)",
      trade: "Housekeeping & Waste Management",
      category: "cleaning",
      phone: "+91 98212 99881",
      rating: 4.7,
      status: "On Campus (8 AM - 6 PM)",
      responseEta: "15 mins"
    },
    {
      id: "v-electrician",
      name: "Manoj Electricals",
      trade: "Electricals & Generator Backup",
      category: "electrical",
      phone: "+91 98700 44556",
      rating: 4.8,
      status: "Available",
      responseEta: "30 mins",
      specialization: "Meter room tripping, generator backup switchover, corridor lights, MCB replacement"
    },
    {
      id: "v-locksmith",
      name: "Bharat Key & Locksmith (24x7 Emergency)",
      trade: "Locksmith & Digital Door Security",
      category: "locksmith",
      phone: "+91 98204 88990",
      rating: 4.9,
      status: "On Call (24x7 Emergency Lockouts)",
      responseEta: "15-20 mins",
      specialization: "Emergency door lockout release, Godrej / Yale deadbolts, duplicate keys, broken key extraction"
    },
    {
      id: "v-lift-parking",
      name: "Apex Hydraulic Lift Parking AMC",
      trade: "Hydraulic Multi-Level & Stack Car Parking AMC",
      category: "lift-parking",
      phone: "+91 98336 77889",
      rating: 4.8,
      status: "Contracted AMC (24x7 Breakdown)",
      responseEta: "20-30 mins",
      specialization: "Hydraulic car lift platform jamming, stuck vehicles on upper/lower pallet, motor oil pressure, sensor calibration"
    }
  ]
};

// Generates the strict list of 50 flats per wing: 101-110, 201-210, 301-310, 401-410, 501-510
export const VALID_FLAT_NUMBERS = (() => {
  const flats = [];
  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 10; unit++) {
      flats.push(`${floor * 100 + unit}`);
    }
  }
  return flats;
})();

/**
 * Validates whether a flat number is a real registered apartment in Gokuldham Heights.
 * Range: 101 to 510 (Floors 1-5, flats 01-10 per floor).
 * Example: 511, 100, 111, 600, etc. will return false.
 */
export function isValidFlatNumber(val) {
  if (!val) return false;
  const clean = val.toString().trim().replace(/^[AB]-?/i, '');
  const num = parseInt(clean, 10);
  if (isNaN(num)) return false;
  if (num < 101 || num > 510) return false;
  const floor = Math.floor(num / 100);
  const unit = num % 100;
  if (floor < 1 || floor > 5) return false;
  if (unit < 1 || unit > 10) return false;
  return true;
}

/**
 * Provides rich descriptive feedback on flat validity for UI forms.
 */
export function getFlatValidation(val) {
  if (!val || !val.toString().trim()) {
    return {
      isValid: false,
      isEmpty: true,
      message: 'Enter flat number (101 to 510)'
    };
  }
  const clean = val.toString().trim().replace(/^[AB]-?/i, '');
  const num = parseInt(clean, 10);
  if (isNaN(num)) {
    return {
      isValid: false,
      isEmpty: false,
      message: 'Flat number must contain digits between 101 and 510'
    };
  }
  if (num < 101) {
    return {
      isValid: false,
      isEmpty: false,
      message: `Flat ${num} is invalid. Lowest flat in society is 101 (Floor 1).`
    };
  }
  if (num > 510) {
    return {
      isValid: false,
      isEmpty: false,
      message: `Flat ${num} does not exist. Society only has 5 floors up to Flat 510 (flats above 510 are invalid).`
    };
  }
  const floor = Math.floor(num / 100);
  const unit = num % 100;
  if (unit < 1 || unit > 10) {
    return {
      isValid: false,
      isEmpty: false,
      message: `Flat ${num} is invalid. Floor ${floor} only has flats from ${floor}01 to ${floor}10 (10 flats per floor).`
    };
  }
  return {
    isValid: true,
    isEmpty: false,
    floor,
    unit,
    message: `Verified: Floor ${floor} • Unit ${unit.toString().padStart(2, '0')}`
  };
}

/**
 * Validates whether an Indian contact number has strictly 10 or 11 digits.
 * - Standard Indian mobile: 10 digits (e.g. 98201 11223)
 * - Indian landline / STD format: 11 digits (e.g. 022 2845 1234)
 */
export function isValidContactNumber(val) {
  if (!val) return false;
  let digits = val.toString().replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  return digits.length === 10 || digits.length === 11;
}

/**
 * Provides live UI validation, digit count tracking, and formatting for Indian phone numbers.
 */
export function getContactNumberValidation(val) {
  if (!val || !val.toString().trim()) {
    return {
      isValid: false,
      isEmpty: true,
      digitsCount: 0,
      cleanDigits: '',
      formatted: '',
      message: 'Enter 10 or 11 digit contact number'
    };
  }

  const raw = val.toString().trim();
  let digits = raw.replace(/\D/g, '');

  // Strip leading 91 if user entered +91 with 10 digit number
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  const count = digits.length;

  if (count < 10) {
    return {
      isValid: false,
      isEmpty: false,
      digitsCount: count,
      cleanDigits: digits,
      formatted: digits,
      message: `Too short (${count}/10 digits). Contact number must be 10 or 11 digits.`
    };
  }

  if (count > 11) {
    return {
      isValid: false,
      isEmpty: false,
      digitsCount: count,
      cleanDigits: digits,
      formatted: digits,
      message: `Too long (${count} digits). Maximum 10 to 11 digits allowed.`
    };
  }

  const formatted = count === 10
    ? `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`
    : digits;

  return {
    isValid: true,
    isEmpty: false,
    digitsCount: count,
    cleanDigits: digits,
    formatted,
    message: count === 10 ? '✓ Valid 10-digit Indian Mobile' : '✓ Valid 11-digit Contact Number'
  };
}

export const CATEGORIES = {
  water: {
    id: "water",
    label: "Water Supply",
    icon: "Droplets",
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.12)",
    borderColor: "rgba(2, 132, 199, 0.3)"
  },
  lift: {
    id: "lift",
    label: "Lifts & Elevators",
    icon: "ArrowUpDown",
    color: "#dc2626",
    bgColor: "rgba(220, 38, 38, 0.12)",
    borderColor: "rgba(220, 38, 38, 0.3)"
  },
  "lift-parking": {
    id: "lift-parking",
    label: "Lift & Stack Parking",
    icon: "Layers",
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.12)",
    borderColor: "rgba(2, 132, 199, 0.3)"
  },
  parking: {
    id: "parking",
    label: "Parking & Vehicles",
    icon: "Car",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.3)"
  },
  locksmith: {
    id: "locksmith",
    label: "Locksmith & Doors",
    icon: "KeyRound",
    color: "#d97706",
    bgColor: "rgba(217, 119, 6, 0.12)",
    borderColor: "rgba(217, 119, 6, 0.3)"
  },
  noise: {
    id: "noise",
    label: "Noise & Disturbance",
    icon: "Volume2",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.12)",
    borderColor: "rgba(139, 92, 246, 0.3)"
  },
  cleaning: {
    id: "cleaning",
    label: "Cleanliness & Waste",
    icon: "Sparkles",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.3)"
  },
  electrical: {
    id: "electrical",
    label: "Electrical & Lights",
    icon: "Zap",
    color: "#f97316",
    bgColor: "rgba(249, 115, 22, 0.12)",
    borderColor: "rgba(249, 115, 22, 0.3)"
  },
  security: {
    id: "security",
    label: "Security & Gates",
    icon: "ShieldAlert",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.12)",
    borderColor: "rgba(236, 72, 153, 0.3)"
  }
};

export const URGENCY_LEVELS = {
  CRITICAL: {
    id: "CRITICAL",
    name: "Critical Emergency",
    level: 4,
    badgeColor: "#ef4444",
    badgeBg: "rgba(239, 68, 68, 0.18)",
    badgeBorder: "rgba(239, 68, 68, 0.4)",
    sla: "< 15 Mins",
    pulse: true
  },
  HIGH: {
    id: "HIGH",
    name: "High Priority",
    level: 3,
    badgeColor: "#f97316",
    badgeBg: "rgba(249, 115, 22, 0.18)",
    badgeBorder: "rgba(249, 115, 22, 0.4)",
    sla: "< 2 Hours",
    pulse: false
  },
  MEDIUM: {
    id: "MEDIUM",
    name: "Medium Priority",
    level: 2,
    badgeColor: "#eab308",
    badgeBg: "rgba(234, 179, 8, 0.18)",
    badgeBorder: "rgba(234, 179, 8, 0.4)",
    sla: "< 12 Hours",
    pulse: false
  },
  LOW: {
    id: "LOW",
    name: "Low / Routine",
    level: 1,
    badgeColor: "#10b981",
    badgeBg: "rgba(16, 185, 129, 0.18)",
    badgeBorder: "rgba(16, 185, 129, 0.4)",
    sla: "< 48 Hours",
    pulse: false
  }
};
