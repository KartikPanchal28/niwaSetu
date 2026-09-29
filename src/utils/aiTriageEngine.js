import { SOCIETY_INFO, CATEGORIES, URGENCY_LEVELS } from '../data/societyData.js';

// Keywords dictionary for multi-lingual triage (English, Hindi transliterated Hinglish, and Hindi)
const HINGLISH_MARKERS = [
  'paani', 'pani', 'nahi', 'nahin', 'subah', 'raat', 'karo', 'atka', 'phasa', 'fas', 'band', 
  'batao', 'jaldi', 'kidhar', 'kripya', 'hain', 'hai', 'aayega', 'kya', 'dekho', 'safai', 
  'badboo', 'baja', 'gaadi', 'rok', 'chahiye', 'chal', 'khol', 'bulao', 'mein', 'se', 'bhi', 
  'bahut', 'kuch', 'hoga', 'mera', 'meri', 'kisi', 'raha', 'rahi', 'arre', 'arey'
];

const CATEGORY_KEYWORDS = {
  water: {
    words: ['water', 'paani', 'pani', 'tank', 'tanker', 'tap', 'flush', 'motor', 'pipe', 'leak', 'leakage', 'pressure', 'dry', 'nal', 'nalah'],
    weight: 2
  },
  lift: {
    words: ['lift', 'elevator', 'atka', 'phasa', 'stuck', 'trapped', 'otis', 'floor', 'door', 'jammed', 'jam', 'sharma', 'drop'],
    weight: 2.5
  },
  "lift-parking": {
    words: ['lift parking', 'stack parking', 'puzzle parking', 'hydraulic', 'car lift', 'pallet', 'stack car', 'lower level', 'upper pallet', 'car stuck parking', 'parking lift', 'platform atka'],
    weight: 2.6
  },
  parking: {
    words: ['park', 'parking', 'car', 'scooter', 'bike', 'slot', 'gaadi', 'gadi', 'swift', 'creta', 'blocked', 'reverse', 'p-14', 'p-', 'vehicle', 'wheel'],
    weight: 1.8
  },
  locksmith: {
    words: ['lock', 'lockout', 'key', 'chabi', 'chaabi', 'godrej', 'deadbolt', 'door lock', 'jammed lock', 'latched', 'kundi', 'cylinder', 'digital lock', 'padlock', 'broken key'],
    weight: 2.4
  },
  noise: {
    words: ['noise', 'loud', 'music', 'sound', 'dj', 'party', 'bark', 'barking', 'awaz', 'awaaz', 'scream', 'chilla', 'late night', 'speaker', 'exam', 'sleep'],
    weight: 1.8
  },
  cleaning: {
    words: ['cleaning', 'clean', 'safai', 'garbage', 'kachra', 'waste', 'trash', 'smell', 'stink', 'badboo', 'corridor', 'cat', 'dog', 'spill', 'sweeper', 'dustbin'],
    weight: 1.7
  },
  electrical: {
    words: ['electric', 'electrical', 'power', 'meter', 'spark', 'smoke', 'fire', 'light', 'bulb', 'wire', 'generator', 'current', 'shock', 'fuse', 'burning', 'breaker'],
    weight: 2.2
  },
  security: {
    words: ['guard', 'security', 'gate', 'intercom', 'visitor', 'lock', 'barrier', 'cctv', 'sleeping', 'gate 1', 'gate 2', 'delivery'],
    weight: 1.8
  }
};

const CRITICAL_KEYWORDS = [
  'stuck', 'trapped', 'emergency', 'atka', 'phasa', 'kid', 'child', 'elderly', 'ambulance',
  'hospital', 'clinic', 'spark', 'sparks', 'fire', 'burning', 'smoke', 'shock', 'flood',
  'overflowing meter', 'danger', 'bleeding', 'urgent!!', 'help'
];

const HIGH_KEYWORDS = [
  'no water', 'paani nahi', 'pani nahi', 'bilkul band', 'tank empty', 'pressure zero',
  'both dry', 'main gate blocked', 'cannot park', 'doctor', 'school late', 'cut off'
];

// Detect language
export function detectLanguage(text = '') {
  const lower = text.toLowerCase();
  
  // Check for Devanagari script characters
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasDevanagari) return { lang: 'Hindi (Devanagari)', isHinglish: true, badge: 'हिंदी' };

  let hinglishCount = 0;
  const words = lower.split(/[\s,?.!]+/);
  for (const word of words) {
    if (HINGLISH_MARKERS.includes(word)) {
      hinglishCount++;
    }
  }

  if (hinglishCount >= 2) {
    return { lang: 'Hinglish (Mixed Hindi/English)', isHinglish: true, badge: 'Hinglish' };
  } else if (hinglishCount === 1) {
    return { lang: 'Mixed English / Hindi', isHinglish: true, badge: 'Mixed' };
  }
  return { lang: 'English', isHinglish: false, badge: 'English' };
}

// Extract Flat & Wing entity
export function extractLocationEntities(text = '') {
  let flat = null;
  let wing = null;
  let floor = null;
  let specificSpot = null;

  // Regex for flat like A-302, B 402, B-105, A301, Flat 204
  const flatRegex = /(?:flat|apt|room)?\s*([a-bA-B])[\s\-]?([1-5][0-9]{2})\b/i;
  const flatMatch = text.match(flatRegex);
  if (flatMatch) {
    wing = flatMatch[1].toUpperCase();
    flat = `${wing}-${flatMatch[2]}`;
    const floorDigit = parseInt(flatMatch[2].charAt(0), 10);
    floor = `${floorDigit}${floorDigit === 1 ? 'st' : floorDigit === 2 ? 'nd' : floorDigit === 3 ? 'rd' : 'th'} Floor`;
  } else {
    // Check for raw flat number without wing prefix e.g. "Flat 204"
    const simpleFlat = /(?:flat|room)\s*([1-5][0-9]{2})\b/i.exec(text);
    if (simpleFlat) {
      flat = `Flat ${simpleFlat[1]}`;
    }
  }

  // Check explicit Wing if not already deduced
  if (!wing) {
    if (/wing\s*a\b/i.test(text) || /a[\s\-]wing\b/i.test(text)) wing = 'A';
    else if (/wing\s*b\b/i.test(text) || /b[\s\-]wing\b/i.test(text)) wing = 'B';
  }

  // Floor extraction if mentioned separately
  if (!floor) {
    if (/ground\s*floor/i.test(text)) floor = 'Ground Floor';
    else if (/basement/i.test(text)) floor = 'Basement';
    else if (/(\d+)(?:st|nd|rd|th)\s*floor/i.test(text)) {
      const match = text.match(/(\d+)(?:st|nd|rd|th)\s*floor/i);
      floor = `${match[1]}th Floor`;
    }
  }

  // Specific spot extraction
  if (/lift\s*[-]?\s*([12])/i.test(text)) {
    const lMatch = text.match(/lift\s*[-]?\s*([12])/i);
    specificSpot = `Lift ${lMatch[1]}`;
  } else if (/parking\s*(?:slot)?\s*(p[\s\-]?\d+)/i.test(text)) {
    const pMatch = text.match(/parking\s*(?:slot)?\s*(p[\s\-]?\d+)/i);
    specificSpot = `Slot ${pMatch[1].toUpperCase()}`;
  } else if (/meter\s*box|meter\s*room/i.test(text)) {
    specificSpot = 'Meter Room';
  } else if (/clubhouse|gym/i.test(text)) {
    specificSpot = 'Clubhouse / Gym';
  } else if (/gate\s*([12])/i.test(text)) {
    const gMatch = text.match(/gate\s*([12])/i);
    specificSpot = `Gate ${gMatch[1]}`;
  }

  return { flat, wing: wing || 'General', floor, specificSpot };
}

// Classify category based on text
export function classifyCategory(text = '') {
  const lower = text.toLowerCase();
  let bestCategory = 'cleaning'; // fallback default
  let highestScore = 0;

  for (const [catKey, data] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const word of data.words) {
      if (lower.includes(word)) {
        score += data.weight;
      }
    }
    if (score > highestScore) {
      highestScore = score;
      bestCategory = catKey;
    }
  }

  return {
    category: bestCategory,
    confidence: Math.min(100, Math.round((highestScore / 5) * 100) || 75)
  };
}

// Calculate Urgency & Severity
export function calculateUrgency(text = '', category = 'cleaning') {
  const lower = text.toLowerCase();
  let score = 30; // base score (Medium)
  const matchedReasons = [];

  // Check critical keywords
  for (const cw of CRITICAL_KEYWORDS) {
    if (lower.includes(cw)) {
      score += 45;
      matchedReasons.push(`Safety / Hazard keyword: "${cw}"`);
      break;
    }
  }

  // Category specific risk amplifiers
  if (category === 'lift' && (lower.includes('stuck') || lower.includes('inside') || lower.includes('atka') || lower.includes('trapped'))) {
    score = 98;
    matchedReasons.push('Person reported trapped/stuck in elevator');
  }

  if (category === 'electrical' && (lower.includes('spark') || lower.includes('burning') || lower.includes('smoke'))) {
    score = 95;
    matchedReasons.push('Potential fire/spark hazard in electrical infrastructure');
  }

  // Check high priority keywords
  for (const hw of HIGH_KEYWORDS) {
    if (lower.includes(hw)) {
      score += 25;
      matchedReasons.push(`Service outage indicator: "${hw}"`);
      break;
    }
  }

  // Score clamping
  score = Math.min(100, Math.max(15, score));

  let tier = 'LOW';
  if (score >= 85) tier = 'CRITICAL';
  else if (score >= 65) tier = 'HIGH';
  else if (score >= 40) tier = 'MEDIUM';
  else tier = 'LOW';

  return {
    urgencyScore: score,
    urgencyTier: tier,
    urgencyData: URGENCY_LEVELS[tier],
    reasons: matchedReasons.length > 0 ? matchedReasons : ['Routine society maintenance issue']
  };
}

// Standard English Normalized Summary Generation
export function generateAiSummary(text = '', category = 'water', location = {}) {
  const lower = text.toLowerCase();
  const locStr = location.flat ? `(${location.flat})` : location.wing ? `(Wing ${location.wing})` : '';

  if (category === 'lift') {
    if (lower.includes('stuck') || lower.includes('trapped') || lower.includes('atka') || lower.includes('phasa')) {
      return `EMERGENCY: Resident trapped in elevator ${location.specificSpot || 'Wing Lift'} ${locStr}. Immediate rescue required.`;
    }
    return `Elevator operational breakdown or door jam reported at ${location.specificSpot || 'Lift'} ${locStr}.`;
  }

  if (category === 'water') {
    if (lower.includes('tanker') || lower.includes('bilkul') || lower.includes('dry') || lower.includes('empty')) {
      return `Total water supply outage reported in ${locStr || 'Wing flats'}. Supply dried up, tanker status queried.`;
    }
    return `Low water pressure / supply irregularity reported at ${locStr || 'residential flat'}.`;
  }

  if (category === 'lift-parking') {
    return `Hydraulic stack car parking failure at ${location.specificSpot || 'Basement parking'} ${locStr}. Mechanical pallet jammed, vehicle access blocked.`;
  }

  if (category === 'locksmith') {
    if (lower.includes('broken') || lower.includes('toot') || lower.includes('phasa')) {
      return `LOCKOUT EMERGENCY: Key broken inside door lock cylinder at ${locStr}. Resident locked outside, emergency extraction needed.`;
    }
    return `Door latch / deadbolt lock mechanism jammed at ${locStr}. Locksmith inspection requested.`;
  }

  if (category === 'parking') {
    return `Unauthorized vehicle obstruction reported at ${location.specificSpot || 'resident parking slot'} ${locStr}.`;
  }

  if (category === 'noise') {
    return `High-decibel late-night noise / loud music disturbance originating from ${locStr || 'apartment floor'}.`;
  }

  if (category === 'cleaning') {
    return `Housekeeping alert: Garbage spillage and foul odor in corridor/common area ${locStr}.`;
  }

  if (category === 'electrical') {
    if (lower.includes('spark') || lower.includes('smoke') || lower.includes('burn')) {
      return `ELECTRICAL HAZARD: Sparks / burning smell observed near ${location.specificSpot || 'meter box'} ${locStr}.`;
    }
    return `Common area lighting / electrical fixture failure reported at ${locStr}.`;
  }

  return `Maintenance request logged by resident ${locStr}: ${text.slice(0, 70)}...`;
}

// Match Vendor
export function matchVendor(category = 'water') {
  const vendor = SOCIETY_INFO.vendors.find(v => v.category === category) || SOCIETY_INFO.vendors[0];
  return vendor;
}

// 1-Click WhatsApp Ready Messages Generator
export function generateWhatsAppDrafts(complaint) {
  const { id, rawText, aiSummary, category, location, urgencyTier, assignedVendor } = complaint;
  const flat = location?.flat || 'Resident';
  const catLabel = CATEGORIES[category]?.label || 'Maintenance';
  const vendorName = assignedVendor?.name || 'Authorized Society Technician';
  const vendorPhone = assignedVendor?.phone || 'Society Office';

  // 1. Polite Resident Auto-Responder (Bilingual Hindi + English)
  const residentMsg = `*Namaste Flat ${flat}*,\nYour complaint regarding *${catLabel}* has been triaged by the Managing Committee.\n\n📋 *Ticket ID:* #${id}\n🚨 *Priority:* ${urgencyTier}\n🛠️ *Assigned To:* ${vendorName} (${vendorPhone})\n⏱️ *Status:* Dispatched / In Progress\n\n_Thank you for your patience. Committee volunteers are tracking this until resolution._\n- *Hon. Secretary, Gokuldham Heights CHS*`;

  // 2. Vendor Work Order Dispatch
  const vendorMsg = `*RWA WORK ORDER #${id}*\n*To:* ${vendorName}\n*Location:* Flat ${flat} (${location?.wing ? `Wing ${location.wing}` : 'Common Area'})\n*Issue:* ${aiSummary}\n*Urgency:* ${urgencyTier}\n*Resident Reported:* "${rawText.slice(0, 100)}..."\n\n*Action Required:* Please inspect and resolve immediately. Confirm on WhatsApp when completed.`;

  // 3. Society Community Group Broadcast (For clusters / outages)
  const broadcastMsg = `📢 *SOCIETY MAINTENANCE UPDATE*\n*Area:* Wing ${location?.wing || 'B'} Residents\n*Issue:* ${catLabel} Outage / Disruption\n*Action Taken:* Committee has logged issues from multiple flats (${flat}). ${vendorName} is actively inspecting the site.\n*Estimated Fix:* 1-2 hours. Inconvenience is deeply regretted.\n- *Managing Committee, Gokuldham Heights*`;

  return {
    residentMsg,
    vendorMsg,
    broadcastMsg,
    encodedResidentUrl: `https://wa.me/?text=${encodeURIComponent(residentMsg)}`,
    encodedVendorUrl: `https://wa.me/${vendorPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(vendorMsg)}`
  };
}

// Master Triage Runner for a single raw complaint text
export function triageRawComplaint(rawText, metadata = {}) {
  const id = metadata.id || `T-${Math.floor(1000 + Math.random() * 9000)}`;
  const timestamp = metadata.timestamp || new Date().toISOString();
  const residentName = metadata.residentName || 'Resident';
  const senderPhone = metadata.senderPhone || '+91 98XXX XXXXX';

  const langInfo = detectLanguage(rawText);
  const location = extractLocationEntities(rawText);
  const { category, confidence } = classifyCategory(rawText);
  const { urgencyScore, urgencyTier, urgencyData, reasons } = calculateUrgency(rawText, category);
  const aiSummary = generateAiSummary(rawText, category, location);
  const assignedVendor = matchVendor(category);

  const complaint = {
    id,
    timestamp,
    residentName,
    senderPhone,
    rawText,
    langInfo,
    location,
    category,
    categoryData: CATEGORIES[category],
    confidence,
    urgencyScore,
    urgencyTier,
    urgencyData,
    reasons,
    aiSummary,
    assignedVendor,
    status: 'INBOX', // 'INBOX' | 'TRIAGED' | 'DISPATCHED' | 'RESOLVED'
    clusterId: null,
    clusterMaster: false,
    resolutionNotes: '',
    resolvedAt: null,
    linkedReports: [], // Absorbed duplicate reports from other residents today
    followUpNotes: [], // Follow-up messages from the same resident
    duplicateCount: 0
  };

  complaint.whatsappDrafts = generateWhatsAppDrafts(complaint);
  return complaint;
}

/**
 * Merge trained AI Triage output from Gemini into Complaint
 */
export function mergeAITriageData(baseComplaint, aiTriage) {
  if (!aiTriage) return baseComplaint;

  const category = aiTriage.category || baseComplaint.category || 'cleaning';
  const assignedVendor = matchVendor(category);
  const location = {
    ...baseComplaint.location,
    ...(aiTriage.location || {})
  };

  const updated = {
    ...baseComplaint,
    category,
    categoryData: CATEGORIES[category] || baseComplaint.categoryData,
    confidence: Math.round((aiTriage.confidence || 0.95) * 100),
    aiSummary: aiTriage.englishSummary || baseComplaint.aiSummary,
    langInfo: {
      lang: aiTriage.detectedLanguage || 'Hinglish',
      badge: aiTriage.languageBadge || 'Hinglish',
      isHinglish: (aiTriage.detectedLanguage || '').toLowerCase().includes('hindi') || (aiTriage.detectedLanguage || '').toLowerCase().includes('hinglish')
    },
    location,
    urgencyScore: aiTriage.urgencyScore || baseComplaint.urgencyScore,
    urgencyTier: aiTriage.urgencyTier || baseComplaint.urgencyTier,
    urgencyData: URGENCY_LEVELS[aiTriage.urgencyTier || 'MEDIUM'] || baseComplaint.urgencyData,
    reasons: aiTriage.urgencyReasons || baseComplaint.reasons,
    technicianActionRequired: aiTriage.technicianActionRequired,
    assignedVendor,
    aiPowered: true
  };

  updated.whatsappDrafts = generateWhatsAppDrafts(updated);
  return updated;
}


// Duplicate & Cluster Detection Engine
export function clusterComplaints(complaintList = []) {
  const clusters = [];
  const processedIds = new Set();

  for (let i = 0; i < complaintList.length; i++) {
    const primary = complaintList[i];
    if (processedIds.has(primary.id)) continue;

    // Look for matching peers in same category and same wing/location
    const matchingPeers = complaintList.filter(other => {
      if (other.id === primary.id || processedIds.has(other.id)) return false;

      const sameCategory = other.category === primary.category;
      const sameWing = other.location.wing && primary.location.wing && other.location.wing === primary.location.wing;
      const sameSpot = other.location.specificSpot && primary.location.specificSpot && other.location.specificSpot === primary.location.specificSpot;

      return sameCategory && (sameWing || sameSpot);
    });

    if (matchingPeers.length > 0) {
      // Create a Master Incident Cluster
      const clusterId = `CL-${primary.category.toUpperCase()}-${primary.location.wing || 'GEN'}`;
      const allClusterMembers = [primary, ...matchingPeers];
      
      allClusterMembers.forEach(item => {
        processedIds.add(item.id);
        item.clusterId = clusterId;
        item.clusterMaster = (item.id === primary.id);
      });

      const affectedFlats = allClusterMembers
        .map(m => m.location.flat)
        .filter(Boolean);

      const maxUrgency = allClusterMembers.reduce((highest, curr) => {
        return curr.urgencyScore > highest.urgencyScore ? curr : highest;
      }, primary);

      clusters.push({
        clusterId,
        category: primary.category,
        wing: primary.location.wing,
        count: allClusterMembers.length,
        affectedFlats,
        leadComplaintId: primary.id,
        highestUrgencyTier: maxUrgency.urgencyTier,
        title: `Wing ${primary.location.wing} ${CATEGORIES[primary.category]?.label || 'Issue'} Incident`,
        aiSummary: `Aggregated Incident: ${allClusterMembers.length} flats in Wing ${primary.location.wing} reported ${CATEGORIES[primary.category]?.label}. Likely centralized outage or valve/motor failure.`,
        members: allClusterMembers
      });
    } else {
      processedIds.add(primary.id);
    }
  }

  return {
    clusteredList: complaintList,
    clusters
  };
}
