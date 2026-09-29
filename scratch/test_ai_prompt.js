import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-3.7-flash'
];

const samplePrompt = `
You are an expert AI Triage Assistant for Indian Housing Societies (Gokuldham Heights CHS).
Analyze this resident complaint:
"Arey secretary sahab, B wing ki lift 1 ground floor pe atki hui hai, andar sharma ji phanse hue hain gate khul nahi raha please jaldi kisi ko bhejo emergency hai!"

Resident Context:
- Flat: B-302
- Resident Name: Ramesh Patel

Return JSON ONLY with this exact structure:
{
  "detectedLanguage": "Hinglish (Hindi/English)",
  "languageCode": "hi-Latn",
  "category": "lift",
  "englishSummary": "EMERGENCY: Person trapped inside Lift 1 (Wing B, Ground Floor). Immediate rescue and technician dispatch required.",
  "location": {
    "wing": "B",
    "flat": "B-302",
    "floor": "Ground Floor",
    "specificSpot": "Lift 1"
  },
  "urgencyScore": 98,
  "urgencyTier": "CRITICAL",
  "urgencyReasons": [
    "Human passenger trapped inside elevator compartment",
    "Elevator door mechanism jammed shut",
    "Immediate psychological and health risk requiring urgent technician intervention"
  ],
  "suggestedVendorCategory": "lift"
}
`;

for (const m of CANDIDATE_MODELS) {
  try {
    console.log('Testing model:', m);
    const model = genAI.getGenerativeModel({
      model: m,
      generationConfig: { responseMimeType: 'application/json' }
    });
    const res = await model.generateContent(samplePrompt);
    const text = (await res.response).text();
    console.log('✅ Model succeeded:', m);
    console.log(JSON.parse(text));
    break;
  } catch(e) {
    console.warn(`Model ${m} failed: ${e.message}`);
  }
}
