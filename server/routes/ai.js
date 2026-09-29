import express from 'express';
import { 
  getAIStatus, 
  testAIConnection, 
  trainAndTriageComplaintWithAI,
  filterAndDeduplicateWithAI,
  processSmartComplaint
} from '../services/aiService.js';

const router = express.Router();

// GET /api/ai/status - Return AI model configuration & readiness status
router.get('/status', (req, res) => {
  try {
    const status = getAIStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/ai/test - Test live model connectivity
router.post('/test', async (req, res) => {
  try {
    const result = await testAIConnection();
    res.json({
      success: true,
      message: 'Gemini AI model is active and responding!',
      data: result
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: 'Gemini AI test call failed',
      details: err.message
    });
  }
});

// POST /api/ai/triage - Language understanding, entity extraction & urgency scoring
router.post('/triage', async (req, res) => {
  try {
    const { text, metadata = {} } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'Complaint text is required' });
    }
    const result = await trainAndTriageComplaintWithAI(text, metadata);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/ai/filter-duplicates - Same-day duplicate & shared incident filtering
router.post('/filter-duplicates', async (req, res) => {
  try {
    const { incoming, existing = [] } = req.body;
    if (!incoming) {
      return res.status(400).json({ success: false, error: 'Incoming complaint is required' });
    }
    const result = await filterAndDeduplicateWithAI(incoming, existing);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// POST /api/ai/smart-process - Master pipeline: Duplicate Filter -> Language Parsing -> Urgency Scoring
router.post('/smart-process', async (req, res) => {
  try {
    const { incoming, existing = [] } = req.body;
    if (!incoming || !incoming.rawText) {
      return res.status(400).json({ success: false, error: 'Incoming complaint with rawText is required' });
    }
    const result = await processSmartComplaint(incoming, existing);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
