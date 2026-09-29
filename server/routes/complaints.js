import express from 'express';
import mongoose from 'mongoose';
import { Complaint } from '../models/Complaint.js';

const router = express.Router();

// In-memory fallback cache when MongoDB Atlas is connecting or awaiting URI
let inMemoryComplaints = [];

const isConnected = () => mongoose.connection.readyState === 1;

// When MongoDB connects, flush any complaints created in staging to MongoDB Atlas
mongoose.connection.on('connected', async () => {
  console.log('[MongoDB Sync] MongoDB Atlas connected. Checking for staging complaints...');
  if (inMemoryComplaints.length > 0) {
    try {
      for (const item of inMemoryComplaints) {
        await Complaint.findOneAndUpdate({ id: item.id }, item, { upsert: true });
      }
      console.log(`[MongoDB Sync] Flushed ${inMemoryComplaints.length} staging complaints into MongoDB Atlas!`);
      inMemoryComplaints = [];
    } catch (err) {
      console.error('[MongoDB Sync] Failed to sync staging complaints:', err);
    }
  }
});

// GET /api/complaints - Retrieve all complaints
router.get('/', async (req, res) => {
  try {
    const { status, wing, category } = req.query;

    if (isConnected()) {
      const filter = {};
      if (status) filter.status = status;
      if (wing) filter['location.wing'] = wing;
      if (category) filter.category = category;

      const complaints = await Complaint.find(filter)
        .sort({ timestamp: -1 })
        .lean();

      return res.json({
        success: true,
        source: 'mongodb_atlas',
        count: complaints.length,
        data: complaints
      });
    }

    // In-memory fallback
    let list = [...inMemoryComplaints];
    if (status) list = list.filter(c => c.status === status);
    if (wing) list = list.filter(c => c.location?.wing === wing);
    if (category) list = list.filter(c => c.category === category);

    res.json({
      success: true,
      source: 'memory_staging',
      notice: 'Connected to in-memory staging. Add MONGODB_URI in .env to persist directly to MongoDB Atlas.',
      count: list.length,
      data: list
    });
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve complaints',
      details: err.message
    });
  }
});

// GET /api/complaints/:id - Retrieve single complaint
router.get('/:id', async (req, res) => {
  try {
    if (isConnected()) {
      const complaint = await Complaint.findOne({ id: req.params.id }).lean();
      if (!complaint) {
        return res.status(404).json({ success: false, error: 'Complaint not found' });
      }
      return res.json({ success: true, source: 'mongodb_atlas', data: complaint });
    }

    const item = inMemoryComplaints.find(c => c.id === req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Complaint not found' });
    }
    res.json({ success: true, source: 'memory_staging', data: item });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/complaints - Create new complaint
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    if (!data.id) {
      data.id = `T-${Date.now().toString().slice(-4)}`;
    }
    if (!data.timestamp) {
      data.timestamp = new Date().toISOString();
    }

    if (isConnected()) {
      const complaint = new Complaint(data);
      const saved = await complaint.save();
      return res.status(201).json({
        success: true,
        source: 'mongodb_atlas',
        message: `Complaint #${saved.id} registered in MongoDB Atlas`,
        data: saved
      });
    }

    // Staging mode
    inMemoryComplaints.unshift(data);
    res.status(201).json({
      success: true,
      source: 'memory_staging',
      message: `Complaint #${data.id} registered in staging memory (will sync when MongoDB connects)`,
      data
    });
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to save complaint',
      details: err.message
    });
  }
});

// PATCH /api/complaints/:id - Update complaint status/fields
router.patch('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status === 'RESOLVED' && !updates.resolvedAt) {
      updates.resolvedAt = new Date().toISOString();
    }

    if (isConnected()) {
      const updated = await Complaint.findOneAndUpdate(
        { id: req.params.id },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ success: false, error: `Complaint #${req.params.id} not found` });
      }

      return res.json({
        success: true,
        source: 'mongodb_atlas',
        message: `Complaint #${req.params.id} updated in MongoDB Atlas`,
        data: updated
      });
    }

    // Update in-memory
    const idx = inMemoryComplaints.findIndex(c => c.id === req.params.id);
    if (idx !== -1) {
      inMemoryComplaints[idx] = { ...inMemoryComplaints[idx], ...updates };
      return res.json({
        success: true,
        source: 'memory_staging',
        message: `Complaint #${req.params.id} updated in memory`,
        data: inMemoryComplaints[idx]
      });
    }

    res.status(404).json({ success: false, error: `Complaint #${req.params.id} not found` });
  } catch (err) {
    console.error('Error updating complaint:', err);
    res.status(400).json({
      success: false,
      error: 'Failed to update complaint',
      details: err.message
    });
  }
});

// POST /api/complaints/resolve-cluster - Bulk resolve all complaints in a cluster
router.post('/resolve-cluster', async (req, res) => {
  try {
    const { clusterId } = req.body;
    if (!clusterId) {
      return res.status(400).json({ success: false, error: 'clusterId is required' });
    }

    if (isConnected()) {
      const result = await Complaint.updateMany(
        { clusterId },
        { 
          $set: { 
            status: 'RESOLVED',
            resolvedAt: new Date()
          } 
        }
      );

      return res.json({
        success: true,
        source: 'mongodb_atlas',
        message: `Cluster ${clusterId} resolved across ${result.modifiedCount} complaints in MongoDB Atlas`,
        modifiedCount: result.modifiedCount
      });
    }

    // In-memory cluster resolve
    let modifiedCount = 0;
    inMemoryComplaints = inMemoryComplaints.map(c => {
      if (c.clusterId === clusterId) {
        modifiedCount++;
        return {
          ...c,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString()
        };
      }
      return c;
    });

    res.json({
      success: true,
      source: 'memory_staging',
      message: `Cluster ${clusterId} resolved across ${modifiedCount} complaints in memory`,
      modifiedCount
    });
  } catch (err) {
    console.error('Error resolving cluster:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve cluster',
      details: err.message
    });
  }
});

// POST /api/complaints/seed - Seed initial dataset
router.post('/seed', async (req, res) => {
  try {
    const { complaints = [], force = false } = req.body;

    if (isConnected()) {
      const count = await Complaint.countDocuments();
      if (count > 0 && !force) {
        return res.json({
          success: true,
          source: 'mongodb_atlas',
          message: `Database already contains ${count} complaints in MongoDB Atlas.`,
          count
        });
      }

      if (force) {
        await Complaint.deleteMany({});
      }

      if (complaints.length > 0) {
        const inserted = await Complaint.insertMany(complaints);
        return res.json({
          success: true,
          source: 'mongodb_atlas',
          message: `Seeded ${inserted.length} complaints into MongoDB Atlas`,
          count: inserted.length
        });
      }

      return res.json({ success: true, message: 'No complaints provided to seed', count: 0 });
    }

    // In-memory seed
    inMemoryComplaints = [...complaints];
    res.json({
      success: true,
      source: 'memory_staging',
      message: `Seeded ${complaints.length} complaints into staging memory`,
      count: complaints.length
    });
  } catch (err) {
    console.error('Error seeding complaints:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to seed complaints',
      details: err.message
    });
  }
});

// DELETE /api/complaints - Clear all complaints (wipe database)
router.delete('/', async (req, res) => {
  try {
    if (isConnected()) {
      const result = await Complaint.deleteMany({});
      return res.json({
        success: true,
        source: 'mongodb_atlas',
        message: `Deleted all complaints from MongoDB Atlas (${result.deletedCount} removed)`,
        deletedCount: result.deletedCount
      });
    }

    const count = inMemoryComplaints.length;
    inMemoryComplaints = [];
    res.json({
      success: true,
      source: 'memory_staging',
      message: `Cleared all complaints from staging memory (${count} removed)`,
      deletedCount: count
    });
  } catch (err) {
    console.error('Error clearing complaints:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to clear complaints',
      details: err.message
    });
  }
});

// DELETE /api/complaints/all - Alias for clearing all complaints
router.delete('/all', async (req, res) => {
  try {
    if (isConnected()) {
      const result = await Complaint.deleteMany({});
      return res.json({
        success: true,
        source: 'mongodb_atlas',
        message: `Cleared ${result.deletedCount} complaints from MongoDB Atlas`,
        deletedCount: result.deletedCount
      });
    }
    inMemoryComplaints = [];
    res.json({ success: true, message: 'Cleared in-memory complaints', deletedCount: 0 });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/complaints/:id - Delete a single complaint by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      const deleted = await Complaint.findOneAndDelete({ id });
      if (!deleted) {
        return res.status(404).json({ success: false, error: `Complaint #${id} not found` });
      }
      return res.json({
        success: true,
        source: 'mongodb_atlas',
        message: `Complaint #${id} deleted from MongoDB Atlas`,
        data: deleted
      });
    }

    const idx = inMemoryComplaints.findIndex(c => c.id === id);
    if (idx !== -1) {
      const [removed] = inMemoryComplaints.splice(idx, 1);
      return res.json({
        success: true,
        source: 'memory_staging',
        message: `Complaint #${id} deleted from memory`,
        data: removed
      });
    }

    res.status(404).json({ success: false, error: `Complaint #${id} not found` });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
