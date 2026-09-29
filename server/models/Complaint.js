import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  residentName: {
    type: String,
    required: true
  },
  senderPhone: {
    type: String,
    default: ''
  },
  rawText: {
    type: String,
    required: true
  },
  languageDetected: {
    type: String,
    default: 'Hinglish'
  },
  category: {
    type: String,
    default: 'general',
    index: true
  },
  urgencyTier: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
    index: true
  },
  urgencyScore: {
    type: Number,
    default: 50,
    index: true
  },
  urgencyReasons: {
    type: [String],
    default: []
  },
  location: {
    flat: { type: String, default: '' },
    wing: { type: String, default: '' },
    floor: { type: mongoose.Schema.Types.Mixed, default: '' }
  },
  actionItem: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['NEW', 'INBOX', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED'],
    default: 'NEW',
    index: true
  },
  assignedVendor: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  clusterId: {
    type: String,
    default: null,
    index: true
  },
  whatsappDraft: {
    english: { type: String, default: '' },
    hindi: { type: String, default: '' }
  },
  notes: {
    type: String,
    default: ''
  },
  resolvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  strict: false
});

export const Complaint = mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
