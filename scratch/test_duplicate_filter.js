import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-3.5-flash-lite',
  generationConfig: { responseMimeType: 'application/json' }
});

const existingComplaints = [
  {
    id: "T-2001",
    flat: "B-402",
    category: "water",
    aiSummary: "Total water supply outage reported in Wing B. Supply dried up, tanker status queried.",
    timestamp: "2026-09-29T08:30:00.000Z",
    status: "IN_PROGRESS"
  },
  {
    id: "T-2002",
    flat: "A-101",
    category: "lift",
    aiSummary: "Lift 1 in Wing A making grinding sound and vibrating.",
    timestamp: "2026-09-29T09:15:00.000Z",
    status: "TRIAGED"
  }
];

// Test 1: Same person follow-up duplicate
const test1 = {
  flat: "B-402",
  residentName: "Sanjay Gupta",
  rawText: "Arey secretary ji 2 ghante ho gaye paani kab tak aayega plumber aaya kya?",
  timestamp: "2026-09-29T10:45:00.000Z"
};

// Test 2: Different person reporting same shared issue
const test2 = {
  flat: "B-205",
  residentName: "Pooja Mehta",
  rawText: "Paani bilkul band hai B wing mein koi tanker mangwaya hai kya please update",
  timestamp: "2026-09-29T11:00:00.000Z"
};

// Test 3: Completely distinct new issue
const test3 = {
  flat: "A-502",
  residentName: "Anil K",
  rawText: "Main door lock cylinder broken, need locksmith",
  timestamp: "2026-09-29T11:15:00.000Z"
};

const duplicateCheckPrompt = `
You are the Society AI Duplicate Prevention Filter.
Rules:
1. If the SAME PERSON / FLAT reports on the SAME DAY about the SAME problem:
   -> isDuplicate: true, duplicateType: "SAME_PERSON_DUPLICATE"
2. If a DIFFERENT PERSON / FLAT reports on the SAME DAY about the SAME shared breakdown (e.g. same wing water outage, same elevator breakdown):
   -> isDuplicate: true, duplicateType: "SHARED_INCIDENT_DUPLICATE"
3. If it is a DIFFERENT issue or different area:
   -> isDuplicate: false, duplicateType: "UNIQUE_NEW_ISSUE"

Existing Complaints Logged Today:
${JSON.stringify(existingComplaints, null, 2)}

Incoming Complaint:
${JSON.stringify(test1, null, 2)}

Return JSON:
{
  "isDuplicate": boolean,
  "duplicateType": "SAME_PERSON_DUPLICATE" | "SHARED_INCIDENT_DUPLICATE" | "UNIQUE_NEW_ISSUE",
  "matchedComplaintId": "T-XXXX" | null,
  "confidence": number,
  "reasoning": string,
  "residentMessage": string
}
`;

const res = await model.generateContent(duplicateCheckPrompt);
console.log('Duplicate Filter Test 2 Output:');
console.log(JSON.parse((await res.response).text()));
