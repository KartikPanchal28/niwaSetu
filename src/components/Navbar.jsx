import React from 'react';
import { 
  Building2, 
  Zap, 
  Plus, 
  User, 
  Shield,
  Clock, 
  AlertCircle, 
  Layers, 
  RotateCcw,
  Sun,
  Moon,
  Kanban,
  BarChart3,
  MessageSquare,
  Wrench,
  LogOut
} from 'lucide-react';
import { SOCIETY_INFO } from '../data/societyData';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenQuickTriage, 
  onOpenIngest, 
  unresolvedCount, 
  criticalCount,
  clusterCount,
  onResetData,
  theme,
  setTheme,
  currentUser,
  onLogout,
  backendStatus,
  onOpenMongoStatus,
  aiStatus,
  onOpenAIStatus
}) {
  const isCommittee = currentUser?.role === 'committee';

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(8px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand & Society details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Building2 size={20} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                NiwasSetu
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                निवाससेतु
              </span>
              <span className="badge badge-flat" style={{ fontSize: '0.7rem' }}>
                {isCommittee ? 'Committee Admin' : `Flat ${currentUser?.flat || 'Resident'}`}
              </span>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              {SOCIETY_INFO.name} • 100 Flats RWA
            </div>
          </div>
        </div>

        {/* User Identity, Role Switcher & Primary Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* User Profile Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-subtle)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem'
          }}>
            {isCommittee ? <Shield size={13} color="var(--accent-primary)" /> : <User size={13} color="var(--accent-success-text)" />}
            <span style={{ color: 'var(--text-secondary)' }}>{isCommittee ? 'Official:' : 'Resident:'}</span>
            <strong style={{ color: 'var(--text-main)' }}>{currentUser?.name || 'User'}</strong>
            <span style={{ 
              color: isCommittee ? 'var(--accent-primary)' : 'var(--accent-success-text)', 
              background: isCommittee ? 'var(--accent-primary-subtle)' : 'var(--accent-success-subtle)', 
              padding: '1px 6px', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.7rem',
              fontWeight: 600,
              marginLeft: '2px'
            }}>
              {isCommittee ? (currentUser?.title || 'Secretary') : currentUser?.flat}
            </span>
          </div>


          {/* Theme switcher */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            style={{ padding: '7px' }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Committee specific action buttons */}
          {isCommittee && (
            <>
              <button 
                id="quick-triage-btn"
                className="btn btn-primary"
                onClick={onOpenQuickTriage}
                style={{ fontWeight: 600 }}
              >
                <Zap size={14} />
                <span>2-Min Rapid Triage</span>
                {unresolvedCount > 0 && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.22)',
                    color: '#ffffff',
                    borderRadius: 'var(--radius-sm)',
                    padding: '1px 6px',
                    fontSize: '0.725rem',
                    fontWeight: 700,
                    marginLeft: '4px'
                  }}>
                    {unresolvedCount}
                  </span>
                )}
              </button>

              <button 
                id="ingest-chat-btn"
                className="btn btn-secondary"
                onClick={onOpenIngest}
              >
                <Plus size={14} />
                <span>Ingest Chat Log</span>
              </button>
            </>
          )}

          {/* Logout Button */}
          <button
            id="logout-btn"
            className="btn btn-secondary btn-sm"
            onClick={onLogout}
            title="Log out of NiwasSetu"
            style={{ gap: '6px' }}
          >
            <LogOut size={13} color="var(--text-muted)" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '10px auto 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '8px',
        overflowX: 'auto',
        gap: '8px'
      }}>
        <nav style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {isCommittee ? (
            /* Committee Tabs */
            <>
              <button 
                id="tab-triage-queue"
                className={`btn btn-sm ${activeTab === 'queue' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('queue')}
              >
                <Layers size={13} />
                <span>Triage Feed</span>
                <span style={{
                  background: activeTab === 'queue' ? 'rgba(255,255,255,0.2)' : 'var(--bg-muted)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.7rem'
                }}>
                  {unresolvedCount}
                </span>
              </button>

              <button 
                id="tab-complaint-board"
                className={`btn btn-sm ${activeTab === 'complaint-board' || activeTab === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('complaint-board')}
              >
                <Kanban size={13} />
                <span>Complaint Board</span>
              </button>

              <button 
                id="tab-pulse"
                className={`btn btn-sm ${activeTab === 'pulse' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('pulse')}
              >
                <BarChart3 size={13} />
                <span>Society Analytics</span>
              </button>

              <button 
                id="tab-vendors"
                className={`btn btn-sm ${activeTab === 'vendors' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('vendors')}
              >
                <Wrench size={13} />
                <span>Vendor Contacts</span>
              </button>

              <button 
                id="tab-resident-portal"
                className={`btn btn-sm ${activeTab === 'resident' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('resident')}
              >
                <MessageSquare size={13} />
                <span>Resident Simulator</span>
              </button>
            </>
          ) : (
            /* Resident Tabs */
            <>
              <button 
                id="tab-resident-portal"
                className={`btn btn-sm ${activeTab === 'resident' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('resident')}
              >
                <MessageSquare size={13} />
                <span>Lodge & Track Complaints</span>
              </button>

              <button 
                id="tab-vendors"
                className={`btn btn-sm ${activeTab === 'vendors' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('vendors')}
              >
                <Wrench size={13} />
                <span>Emergency Vendor Directory</span>
              </button>

              <button 
                id="tab-pulse"
                className={`btn btn-sm ${activeTab === 'pulse' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveTab('pulse')}
              >
                <BarChart3 size={13} />
                <span>Society Notices & Trends</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {criticalCount > 0 && isCommittee && (
            <div className="badge badge-critical pulse-indicator" style={{ fontWeight: 700 }}>
              <AlertCircle size={13} />
              <span>{criticalCount} Critical Issue{criticalCount > 1 ? 's' : ''}</span>
            </div>
          )}

          <button 
            title="Clear All Complaints"
            className="btn btn-secondary btn-sm"
            onClick={onResetData}
            style={{ color: 'var(--text-muted)', padding: '4px 8px', fontSize: '0.75rem' }}
          >
            <RotateCcw size={12} />
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </header>
  );
}
