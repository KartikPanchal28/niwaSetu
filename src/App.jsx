import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import TriageQueue from './components/TriageQueue';
import QuickTriageModal from './components/QuickTriageModal';
import ChatIngestModal from './components/ChatIngestModal';
import IncidentDetailModal from './components/IncidentDetailModal';
import KanbanView from './components/KanbanView';
import SocietyPulse from './components/SocietyPulse';
import ResidentPortal from './components/ResidentPortal';
import VendorDirectory from './components/VendorDirectory';
import MongoStatusModal from './components/MongoStatusModal';
import AIStatusModal from './components/AIStatusModal';

import { getInitialTriagedComplaints } from './data/initialComplaints';
import { clusterComplaints, mergeAITriageData } from './utils/aiTriageEngine';
import { 
  fetchComplaintsFromBackend, 
  createComplaintInBackend, 
  updateComplaintInBackend, 
  resolveClusterInBackend, 
  seedComplaintsToBackend, 
  checkBackendHealth,
  fetchAIStatus,
  processSmartComplaintApi,
  clearAllComplaintsInBackend,
  deleteComplaintInBackend
} from './services/api';

export default function App() {
  const [complaints, setComplaints] = useState([]);

  // Clear legacy demo cache on mount
  useEffect(() => {
    localStorage.removeItem('niwassetu_complaints');
  }, []);

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('niwassetu_theme') || 'dark';
  });

  // Cloud Database state
  const [backendStatus, setBackendStatus] = useState({
    isServerRunning: false,
    isDbConnected: false,
    database: 'MongoDB Atlas',
    error: null
  });
  const [mongoModalOpen, setMongoModalOpen] = useState(false);

  // Gemini AI state
  const [aiStatus, setAiStatus] = useState({
    provider: 'Google Gemini',
    model: 'gemini-3.5-flash',
    isConfigured: true,
    isReady: true
  });
  const [aiModalOpen, setAiModalOpen] = useState(false);

  // Authentication State: null = not logged in (shows LoginPage)
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('niwassetu_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error('Failed to load stored user session', e);
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState(() => {
    return currentUser?.role === 'resident' ? 'resident' : 'queue';
  });

  const [quickTriageOpen, setQuickTriageOpen] = useState(false);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [toast, setToast] = useState({ message: '', visible: false });

  // Sync theme to document body
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('niwassetu_theme', theme);
  }, [theme]);

  // Sync complaints to localStorage (for offline backup)
  useEffect(() => {
    try {
      localStorage.setItem('niwassetu_complaints', JSON.stringify(complaints));
    } catch (e) {
      console.warn('Storage sync failed', e);
    }
  }, [complaints]);

  // Check backend health & sync complaints with MongoDB
  const refreshBackendStatus = async () => {
    const status = await checkBackendHealth();
    setBackendStatus(status);

    try {
      const ai = await fetchAIStatus();
      if (ai) setAiStatus(ai);
    } catch (e) {
      console.warn('AI status check failed', e);
    }

    if (status.isServerRunning && status.isDbConnected) {
      try {
        const remoteComplaints = await fetchComplaintsFromBackend();
        setComplaints(remoteComplaints || []);
      } catch (err) {
        console.warn('Sync with MongoDB failed, using local cache:', err);
      }
    }
  };

  useEffect(() => {
    refreshBackendStatus();
    const interval = setInterval(refreshBackendStatus, 12000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (message) => {
    setToast({ message, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 2800);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('niwassetu_user', JSON.stringify(user));
    } catch (e) {
      console.warn('User session sync failed', e);
    }

    if (user.role === 'resident') {
      setActiveTab('resident');
    } else {
      setActiveTab('queue');
    }

    const titleOrFlat = user.role === 'committee' 
      ? (user.title || 'Hon. Secretary') 
      : `Flat ${user.flat}`;
    showToast(`Welcome ${user.name}! Logged in as ${titleOrFlat}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('niwassetu_user');
    showToast('Logged out successfully.');
  };

  const { clusteredList, clusters } = useMemo(() => {
    return clusterComplaints(complaints);
  }, [complaints]);

  const handleUpdateComplaint = async (id, updates) => {
    setComplaints(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    }));

    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(prev => ({ ...prev, ...updates }));
    }

    if (backendStatus.isServerRunning) {
      try {
        await updateComplaintInBackend(id, updates);
      } catch (err) {
        console.warn('Backend update failed:', err);
      }
    }
  };

  const handleDeleteComplaint = async (id) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    if (selectedComplaint && selectedComplaint.id === id) {
      setSelectedComplaint(null);
    }
    if (backendStatus.isServerRunning) {
      try {
        await deleteComplaintInBackend(id);
      } catch (err) {
        console.warn('Backend delete failed:', err);
      }
    }
    showToast(`Ticket #${id} permanently removed from database.`);
  };

  const handleResolveCluster = async (clusterId) => {
    setComplaints(prev => prev.map(item => {
      if (item.clusterId === clusterId) {
        return {
          ...item,
          status: 'RESOLVED',
          resolvedAt: new Date().toISOString()
        };
      }
      return item;
    }));

    if (backendStatus.isServerRunning) {
      try {
        await resolveClusterInBackend(clusterId);
      } catch (err) {
        console.warn('Backend resolve cluster failed:', err);
      }
    }
  };

  const handleMergeCluster = (complaint) => {
    const clusterId = `CL-${complaint.category.toUpperCase()}-${complaint.location.wing || 'GEN'}`;
    handleUpdateComplaint(complaint.id, {
      clusterId,
      status: 'TRIAGED'
    });
  };

  const handleIngestComplaints = async (newItems) => {
    setComplaints(prev => [...newItems, ...prev]);
    if (backendStatus.isServerRunning) {
      for (const item of newItems) {
        try {
          await createComplaintInBackend(item);
        } catch (err) {
          console.warn('Failed to sync ingested complaint:', err);
        }
      }
    }
  };

  const handleAddNewComplaint = async (newComplaint) => {
    try {
      // Run AI Duplicate Filter & Multilingual Triage Engine
      const aiResult = await processSmartComplaintApi(
        {
          rawText: newComplaint.rawText,
          flat: newComplaint.location?.flat,
          wing: newComplaint.location?.wing,
          residentName: newComplaint.residentName,
          category: newComplaint.category,
          timestamp: newComplaint.timestamp || new Date().toISOString()
        },
        complaints
      );

      // Handle Duplicate Filtering (Same issue reported twice on the same day)
      if (aiResult?.isDuplicate) {
        const matchedId = aiResult.matchedComplaintId;

        setComplaints(prev => prev.map(c => {
          if (c.id === matchedId) {
            const updated = { ...c };
            if (aiResult.duplicateType === 'SAME_PERSON_DUPLICATE') {
              updated.followUpNotes = [
                ...(updated.followUpNotes || []),
                {
                  text: newComplaint.rawText,
                  timestamp: new Date().toISOString(),
                  flat: newComplaint.location?.flat
                }
              ];
            } else {
              // SHARED_INCIDENT_DUPLICATE (different person, same issue)
              const existingFlats = updated.affectedFlats || [updated.location?.flat].filter(Boolean);
              const newFlat = newComplaint.location?.flat;
              if (newFlat && !existingFlats.includes(newFlat)) {
                updated.affectedFlats = [...existingFlats, newFlat];
              }
              updated.linkedReports = [
                ...(updated.linkedReports || []),
                {
                  flat: newComplaint.location?.flat,
                  resident: newComplaint.residentName,
                  text: newComplaint.rawText,
                  timestamp: new Date().toISOString()
                }
              ];
              updated.duplicateCount = (updated.duplicateCount || 0) + 1;
            }
            // Sync updated parent ticket to MongoDB
            if (backendStatus.isServerRunning) {
              updateComplaintInBackend(updated.id, updated).catch(err => {
                console.warn('Sync duplicate to MongoDB failed:', err);
              });
            }
            return updated;
          }
          return c;
        }));

        if (aiResult.duplicateType === 'SAME_PERSON_DUPLICATE') {
          showToast(`🛡️ AI Filter: Same-day follow-up appended to Ticket #${matchedId}. Suppressed queue duplication.`);
        } else {
          showToast(`🛡️ AI Filter: Shared wing issue already active (#${matchedId}). Flat linked for updates.`);
        }

        return {
          isDuplicate: true,
          duplicateType: aiResult.duplicateType,
          matchedComplaintId: matchedId,
          residentMessage: aiResult.residentMessage,
          reasoning: aiResult.reasoning
        };
      }

      // If Unique New Issue: Merge trained AI Language & Urgency data
      let finalComplaint = newComplaint;
      if (aiResult?.triage) {
        finalComplaint = mergeAITriageData(newComplaint, aiResult.triage);
      }

      setComplaints(prev => [finalComplaint, ...prev]);

      if (backendStatus.isServerRunning) {
        try {
          await createComplaintInBackend(finalComplaint);
        } catch (err) {
          console.warn('Backend create complaint failed:', err);
        }
      }

      showToast(`✨ Ticket #${finalComplaint.id} registered (${finalComplaint.urgencyTier})`);
      return {
        isDuplicate: false,
        complaint: finalComplaint
      };
    } catch (err) {
      console.warn('Smart AI processing error, using fallback:', err);
      // Fallback: add raw complaint
      setComplaints(prev => [newComplaint, ...prev]);
      if (backendStatus.isServerRunning) {
        createComplaintInBackend(newComplaint).catch(() => {});
      }
      showToast(`Submitted Ticket #${newComplaint.id}`);
      return {
        isDuplicate: false,
        complaint: newComplaint
      };
    }
  };

  const handleResetData = async () => {
    setComplaints([]);
    localStorage.removeItem('niwassetu_complaints');
    if (backendStatus.isServerRunning) {
      try {
        await clearAllComplaintsInBackend();
        showToast('Cleared all complaints from MongoDB Atlas database.');
        return;
      } catch (err) {
        console.warn('Backend clear failed:', err);
      }
    }
    showToast('All complaints removed.');
  };

  const handleSeedCloud = async () => {
    try {
      const res = await seedComplaintsToBackend(complaints, true);
      showToast(res.message || 'Synced complaints to MongoDB Atlas');
      refreshBackendStatus();
    } catch (err) {
      showToast('Error syncing to cloud MongoDB: ' + err.message);
    }
  };

  const unresolvedCount = complaints.filter(c => c.status !== 'RESOLVED').length;
  const criticalCount = complaints.filter(c => c.urgencyTier === 'CRITICAL' && c.status !== 'RESOLVED').length;

  // If not logged in, render the dedicated Login Screen
  if (!currentUser) {
    return (
      <LoginPage 
        onLogin={handleLogin}
        theme={theme}
        setTheme={setTheme}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-app)' }}>
      {/* Top Navbar */}
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenQuickTriage={() => setQuickTriageOpen(true)}
        onOpenIngest={() => setIngestOpen(true)}
        unresolvedCount={unresolvedCount}
        criticalCount={criticalCount}
        clusterCount={clusters.length}
        onResetData={handleResetData}
        theme={theme}
        setTheme={setTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Tab Content */}
      <main style={{ flex: 1, paddingBottom: '40px' }}>
        {activeTab === 'queue' && (
          <TriageQueue 
            complaints={complaints}
            clusters={clusters}
            onSelectComplaint={setSelectedComplaint}
            onResolveCluster={handleResolveCluster}
            onUpdateComplaint={handleUpdateComplaint}
            showToast={showToast}
          />
        )}

        {(activeTab === 'complaint-board' || activeTab === 'kanban') && (
          <KanbanView 
            complaints={complaints}
            onSelectComplaint={setSelectedComplaint}
            onUpdateComplaint={handleUpdateComplaint}
            showToast={showToast}
          />
        )}

        {activeTab === 'pulse' && (
          <SocietyPulse 
            complaints={complaints}
            clusters={clusters}
          />
        )}

        {activeTab === 'resident' && (
          <ResidentPortal 
            currentUser={currentUser}
            complaints={complaints}
            clusters={clusters}
            onAddNewComplaint={handleAddNewComplaint}
            showToast={showToast}
          />
        )}

        {activeTab === 'vendors' && (
          <VendorDirectory 
            showToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        background: 'var(--bg-surface)',
        padding: '14px 24px',
        fontSize: '0.775rem',
        color: 'var(--text-muted)'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <strong>NiwasSetu Operations Desk</strong> • Gokuldham Heights CHS Ltd. (100 Flats)
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Wing A & Wing B</span>
            <span>•</span>
            <span>English + Hinglish Support</span>
            <span>•</span>
            <span>Committee Volunteer SLA Desk</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <QuickTriageModal 
        isOpen={quickTriageOpen}
        onClose={() => setQuickTriageOpen(false)}
        complaints={complaints}
        onUpdateComplaint={handleUpdateComplaint}
        onMergeCluster={handleMergeCluster}
        showToast={showToast}
      />

      <ChatIngestModal 
        isOpen={ingestOpen}
        onClose={() => setIngestOpen(false)}
        onIngestComplaints={handleIngestComplaints}
        showToast={showToast}
      />

      <IncidentDetailModal 
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        onUpdateComplaint={handleUpdateComplaint}
        onDeleteComplaint={handleDeleteComplaint}
        showToast={showToast}
      />

      {/* Floating Toast Notification */}
      {toast.visible && (
        <div className="toast-notice">
          <span>{toast.message}</span>
        </div>
      )}

      {/* MongoDB Cloud Status & Connection Modal */}
      <MongoStatusModal 
        isOpen={mongoModalOpen}
        onClose={() => setMongoModalOpen(false)}
        backendStatus={backendStatus}
        onRefreshStatus={refreshBackendStatus}
        onSeedCloud={handleSeedCloud}
        showToast={showToast}
      />

      {/* Google Gemini AI Status & Test Modal */}
      <AIStatusModal 
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        aiStatus={aiStatus}
        onRefreshAI={refreshBackendStatus}
        showToast={showToast}
      />
    </div>
  );
}
