import { triageRawComplaint } from '../utils/aiTriageEngine.js';

// All fake/demo complaints removed - system operates with zero complaints until real complaints are lodged
export const RAW_SAMPLE_COMPLAINTS = [];

// Initialize complaints array (empty clean slate)
export function getInitialTriagedComplaints() {
  return [];
}

// Preset batch scenarios for demoing real-world committee surges (used optionally in Chat Ingest)
export const DEMO_PRESETS = [
  {
    id: "water_surge",
    title: "Morning Water Crisis Wave (Wing B)",
    icon: "Droplets",
    description: "5 panic messages in Hinglish across Wing B. Tests duplicate clustering into 1 Master Incident.",
    rawFeed: `[08:05 AM] Manish B-402: Subah se B-402 mein paani bilkul band hai. Tanker ka kuch pata hai kya? Office ke liye late ho raha hai!
[08:12 AM] Deepak B-201: Paani nahi aa raha B-201 mein bhi. Kitchen aur washroom dono dry hain. Please check motor.
[08:19 AM] Ananya B-303: Is municipal water supply delayed today? Whole B-Wing 3rd floor (B-303 here) has no tap water since 7 AM.
[08:24 AM] Harish B-504: Water pressure zero in B-504 top floor. Water tank empty lag raha hai.
[08:30 AM] Rakesh B-102: Paani bandh hai B wing mein koi batao kab aayega!`
  },
  {
    id: "lift_emergency",
    title: "Lift Entrapment Emergency",
    icon: "AlertTriangle",
    description: "Resident & child stuck inside elevator. Tests instant Critical Priority escalation & Otis dispatch.",
    rawFeed: `[07:42 AM] Kavita A-203: Lift 1 Wing B ground floor pe atka hua hai! Mrs. Sharma and her 5 year kid are stuck inside please emergency Otis ko bulao koi!`
  },
  {
    id: "weekend_parking_noise",
    title: "Weekend Parking & Party Clashes",
    icon: "Volume2",
    description: "Wrong vehicle blocking parking slot + midnight loud music complaint + corridor trash spillage.",
    rawFeed: `[08:35 AM] Dr. Suresh A-102: Wing A parking slot P-14 (allotted to A-102) is blocked by a silver Swift MH02-BK-9912. I need to take elderly mother to clinic immediately! Pls call security.
[08:42 AM] Pooja A-301: Flat A-301 played very loud DJ music till 12:30 AM last night. Weekday night pe yeh sab band karao please, kids have school exams.
[09:02 AM] Sanjay A-204: Corridor on 2nd floor Wing A ke paas garbage spill ho gaya hai stray cat ki wajah se. Foul smell throughout floor. Send sweeper.`
  }
];
