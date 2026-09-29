import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

// Robust candidate models for instant failover if any model experiences temporary high-demand spikes
const CANDIDATE_MODELS = [
  DEFAULT_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.7-flash'
];

let genAI = null;
if (API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(API_KEY);
    console.log(`🤖 [Gemini AI] Initialized client with primary model: ${DEFAULT_MODEL}`);
  } catch (err) {
    console.error('❌ [Gemini AI] Error initializing model client:', err.message);
  }
} else {
  console.warn('⚠️  [Gemini AI] GEMINI_API_KEY not configured in .env file.');
}

/**
 * Robust caller with automatic candidate model failover
 */
async function callGeminiWithFallback(prompt, options = {}) {
  if (!API_KEY || !genAI) {
    throw new Error('GEMINI_API_KEY is not configured in .env');
  }

  let lastError = null;
  const modelsToTry = [...new Set([options.model || DEFAULT_MODEL, ...CANDIDATE_MODELS])];

  for (const modelName of modelsToTry) {
    try {
      const config = options.jsonMode 
        ? { responseMimeType: 'application/json' }
        : {};
      const model = genAI.getGenerativeModel({ model: modelName, generationConfig: config });
      const result = await model.generateContent(prompt);
      const text = (await result.response).text();
      return { text, modelUsed: modelName };
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini AI] Model ${modelName} returned error: ${err.message}. Trying next available model...`);
    }
  }

  throw new Error(`All Gemini candidate models failed: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Check AI status
 */
export function getAIStatus() {
  const isConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  return {
    provider: 'Google Gemini',
    model: DEFAULT_MODEL,
    candidateModels: CANDIDATE_MODELS,
    isConfigured,
    isReady: Boolean(isConfigured && genAI),
    instructions: isConfigured 
      ? 'Gemini Multilingual Triage & Duplicate Filtering engine is online and ready.'
      : 'Add your free GEMINI_API_KEY in .env (Get free key at https://aistudio.google.com/app/apikey)'
  };
}

/**
 * Quick ping test
 */
export async function testAIConnection() {
  const { text, modelUsed } = await callGeminiWithFallback(
    'Hello! Briefly introduce yourself in 1 sentence as the NiwasSetu Society Complaint AI Assistant trained on Indian languages and smart duplicate prevention.'
  );
  return {
    success: true,
    provider: 'Google Gemini',
    model: modelUsed,
    reply: text.trim(),
    timestamp: new Date().toISOString()
  };
}

/**
 * 1. AI Language Training & Urgency Scoring Engine
 * Analyzes Hindi, Hinglish, Marathi, and English text, extracts entities,
 * assigns precise urgency (0-100) with reasons, and produces technician work order.
 */
export async function trainAndTriageComplaintWithAI(rawText, metadata = {}) {
  const prompt = `
You are the expert Society Complaint AI Engine for "Gokuldham Heights CHS" (100 flats across Wings A & B).
You are trained on Indian society communication patterns:
- Languages: Hindi (Devanagari), Romanized Hinglish ("paani nahi aa raha", "bijli gul", "lift atki hai", "kachra phail gaya"), Marathi phrases, and Indian English idioms.
- Tone: colloquial, urgent, informal voice notes, emotional WhatsApp messages.

Task:
Perform complete linguistic analysis, entity extraction, category classification, and urgency scoring.

Complaint Text:
"${rawText}"

Resident Info Provided:
- Flat: ${metadata.flat || 'Unknown'}
- Wing: ${metadata.wing || 'Unknown'}
- Resident Name: ${metadata.residentName || metadata.name || 'Resident'}

Urgency Scoring Rules:
- CRITICAL (85-100): Immediate danger to human life or safety (person trapped inside elevator, electrical sparks/fire/smoke hazard, gas smell, water flooding electrical meter rooms, ambulance or emergency access blocked).
- HIGH (65-84): Direct habitability breakdown (complete water supply outage to wing/flat, main elevator completely dead, hydraulic car lift stuck trapping vehicle needed for commute, security gate unmanned at night).
- MEDIUM (40-64): Inconvenience with workarounds (low water pressure, single room tap leak, corridor garbage odor, unauthorized parking slot blockage, late-night noise disturbance, door lock cylinder stiff).
- LOW (10-39): Minor cosmetic or routine maintenance (corridor bulb flickering, garden leaf sweeping delayed, parking line repaint request).

Categories allowed: "water", "lift", "lift-parking", "locksmith", "electrical", "security", "cleaning", "noise", "parking".

Return a strictly valid JSON object with this exact schema:
{
  "detectedLanguage": "Hinglish (Hindi/English)" | "Hindi (Devanagari)" | "English" | "Marathi / Regional",
  "languageBadge": "Hinglish" | "हिंदी" | "English" | "मराठी",
  "category": "water" | "lift" | "lift-parking" | "locksmith" | "electrical" | "security" | "cleaning" | "noise" | "parking",
  "confidence": number,
  "englishSummary": string,
  "location": {
    "wing": "A" | "B" | "General",
    "flat": string,
    "floor": string,
    "specificSpot": string
  },
  "urgencyScore": number,
  "urgencyTier": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "urgencyReasons": [string],
  "technicianActionRequired": string
}
`;

  try {
    const { text, modelUsed } = await callGeminiWithFallback(prompt, { jsonMode: true });
    const parsed = JSON.parse(text);
    return {
      aiAvailable: true,
      modelUsed,
      ...parsed
    };
  } catch (err) {
    console.error('❌ [Gemini AI] Triage analysis failed:', err.message);
    throw err;
  }
}

/**
 * 2. Smart Duplicate & Same-Day Filtering Engine
 * Evaluates whether an incoming complaint is:
 * - A duplicate reported twice on the same day by the SAME PERSON (follow-up inquiry)
 * - A duplicate reported on the same day by a DIFFERENT PERSON for the same shared breakdown
 * - A unique, distinct new issue
 */
export async function filterAndDeduplicateWithAI(incomingComplaint, existingComplaintsToday = []) {
  if (!existingComplaintsToday || existingComplaintsToday.length === 0) {
    return {
      isDuplicate: false,
      duplicateType: 'UNIQUE_NEW_ISSUE',
      matchedComplaintId: null,
      confidence: 1.0,
      reasoning: 'No existing complaints registered today; ticket is completely unique.',
      residentMessage: null
    };
  }

  // Pre-filter today's candidates (limit to relevant category or recent 15 active tickets)
  const candidatePool = existingComplaintsToday.slice(0, 15).map(c => ({
    id: c.id,
    flat: c.location?.flat || c.flat || 'Unknown',
    wing: c.location?.wing || c.wing || 'General',
    category: c.category,
    status: c.status,
    aiSummary: c.aiSummary || c.rawText,
    timestamp: c.timestamp,
    affectedFlats: c.affectedFlats || [c.location?.flat].filter(Boolean)
  }));

  const prompt = `
You are the Society AI Duplicate Prevention Filter for Gokuldham Heights CHS.
Your goal is to eliminate duplicate queue clutter and prevent the same issue from being displayed multiple times in the committee queue.

Strict Rules for Same-Day Duplicate Filtering:
1. SAME PERSON / FLAT DUPLICATE:
   If the SAME resident/flat reports about the SAME problem on the SAME DAY (e.g. repeated messages, follow-up "plumber aaya kya?", impatience):
   -> isDuplicate: true
   -> duplicateType: "SAME_PERSON_DUPLICATE"
   -> Action: Suppress from queue, append note to their existing ticket.

2. SHARED SOCIETY BREAKDOWN DUPLICATE (DIFFERENT PERSON):
   If a DIFFERENT resident/flat reports on the SAME DAY about the SAME shared infrastructure failure (e.g. Wing B water outage, Wing A Lift 1 stuck, gate 1 barrier breakdown, common pump failure):
   -> isDuplicate: true
   -> duplicateType: "SHARED_INCIDENT_DUPLICATE"
   -> Action: Suppress from queue, link this resident's flat to the existing master incident ticket.

3. UNIQUE NEW ISSUE:
   If the complaint is about a separate issue, a different private flat problem, or an unrelated malfunction:
   -> isDuplicate: false
   -> duplicateType: "UNIQUE_NEW_ISSUE"
   -> Action: Allow new ticket creation.

Existing Active Complaints Logged Today:
${JSON.stringify(candidatePool, null, 2)}

Incoming Complaint:
- Flat: ${incomingComplaint.flat || incomingComplaint.location?.flat || 'Unknown'}
- Resident Name: ${incomingComplaint.residentName || 'Resident'}
- Text: "${incomingComplaint.rawText}"
- Timestamp: ${incomingComplaint.timestamp || new Date().toISOString()}

Return JSON matching:
{
  "isDuplicate": boolean,
  "duplicateType": "SAME_PERSON_DUPLICATE" | "SHARED_INCIDENT_DUPLICATE" | "UNIQUE_NEW_ISSUE",
  "matchedComplaintId": string | null,
  "confidence": number,
  "reasoning": string,
  "residentMessage": string,
  "recommendedAction": "SUPPRESS_AND_APPEND_NOTE" | "SUPPRESS_AND_LINK_FLAT" | "CREATE_NEW_TICKET"
}
`;

  try {
    const { text, modelUsed } = await callGeminiWithFallback(prompt, { jsonMode: true });
    const parsed = JSON.parse(text);
    return {
      aiAvailable: true,
      modelUsed,
      ...parsed
    };
  } catch (err) {
    console.error('❌ [Gemini AI] Duplicate filtering failed:', err.message);
    // Safe heuristic fallback if AI is offline
    return heuristicDuplicateCheck(incomingComplaint, existingComplaintsToday);
  }
}

/**
 * 3. Unified Smart Processor
 * Orchestrates Duplicate Filtering -> Language Training -> Urgency Scoring
 */
export async function processSmartComplaint(incoming, existingComplaints = []) {
  // Step 1: Run Same-Day Duplicate Filter
  const dupCheck = await filterAndDeduplicateWithAI(incoming, existingComplaints);

  if (dupCheck.isDuplicate) {
    return {
      isDuplicate: true,
      duplicateType: dupCheck.duplicateType,
      matchedComplaintId: dupCheck.matchedComplaintId,
      reasoning: dupCheck.reasoning,
      residentMessage: dupCheck.residentMessage,
      action: dupCheck.recommendedAction,
      notice: dupCheck.duplicateType === 'SAME_PERSON_DUPLICATE'
        ? `Duplicate suppressed: You already logged this issue today (Ticket #${dupCheck.matchedComplaintId}). Follow-up added.`
        : `Duplicate filtered: Issue already reported for your wing (Ticket #${dupCheck.matchedComplaintId}). Your flat is linked for updates.`
    };
  }

  // Step 2: If unique, run Multilingual Triage & Urgency Scoring
  const triageResult = await trainAndTriageComplaintWithAI(incoming.rawText, {
    flat: incoming.flat || incoming.location?.flat,
    wing: incoming.wing || incoming.location?.wing,
    residentName: incoming.residentName
  });

  return {
    isDuplicate: false,
    duplicateType: 'UNIQUE_NEW_ISSUE',
    triage: triageResult
  };
}

/**
 * Client / Offline Fallback Heuristics for duplicate checking
 */
function heuristicDuplicateCheck(incoming, existing = []) {
  const incomingText = (incoming.rawText || '').toLowerCase();
  const incomingFlat = (incoming.flat || incoming.location?.flat || '').toUpperCase().trim();
  const incomingWing = incomingFlat.startsWith('A') ? 'A' : (incomingFlat.startsWith('B') ? 'B' : null);

  for (const item of existing) {
    const itemFlat = (item.location?.flat || item.flat || '').toUpperCase().trim();
    const itemWing = item.location?.wing || (itemFlat.startsWith('A') ? 'A' : 'B');
    const itemText = (item.rawText || '').toLowerCase();

    // Check same flat same day
    if (incomingFlat && itemFlat && incomingFlat === itemFlat) {
      if (item.category === incoming.category || incomingText.includes('paani') || incomingText.includes('water')) {
        return {
          isDuplicate: true,
          duplicateType: 'SAME_PERSON_DUPLICATE',
          matchedComplaintId: item.id,
          confidence: 0.88,
          reasoning: `Same flat (${incomingFlat}) already reported an active complaint #${item.id} today.`,
          residentMessage: `We noticed you already logged Ticket #${item.id} today. Your note has been appended.`,
          recommendedAction: 'SUPPRESS_AND_APPEND_NOTE'
        };
      }
    }

    // Check shared wing outage
    if (incomingWing && itemWing && incomingWing === itemWing) {
      const isWater = incomingText.includes('paani') || incomingText.includes('water') || incomingText.includes('tanker');
      const isLift = incomingText.includes('lift') || incomingText.includes('elevator') || incomingText.includes('atka');
      if ((isWater && item.category === 'water') || (isLift && item.category === 'lift')) {
        return {
          isDuplicate: true,
          duplicateType: 'SHARED_INCIDENT_DUPLICATE',
          matchedComplaintId: item.id,
          confidence: 0.90,
          reasoning: `Active Wing ${incomingWing} shared breakdown already logged in Ticket #${item.id}.`,
          residentMessage: `This issue has already been reported for Wing ${incomingWing} today (Ticket #${item.id}). Your flat has been linked!`,
          recommendedAction: 'SUPPRESS_AND_LINK_FLAT'
        };
      }
    }
  }

  return {
    isDuplicate: false,
    duplicateType: 'UNIQUE_NEW_ISSUE',
    matchedComplaintId: null,
    confidence: 1.0,
    reasoning: 'No matching duplicate found.',
    residentMessage: null,
    recommendedAction: 'CREATE_NEW_TICKET'
  };
}
