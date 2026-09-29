import app, { ensureDbConnected } from './app.js';

const PORT = process.env.PORT || 5000;

// Connect to database on server start
ensureDbConnected();

// Start Express server
app.listen(PORT, () => {
  console.log(`\n🚀 NiwasSetu Backend Server running at http://localhost:${PORT}`);
  console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/complaints`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health\n`);
});
