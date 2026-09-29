import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Server, 
  Cloud,
  X
} from 'lucide-react';

export default function MongoStatusModal({ 
  isOpen, 
  onClose, 
  backendStatus, 
  onRefreshStatus,
  onSeedCloud,
  showToast 
}) {
  const [copied, setCopied] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  if (!isOpen) return null;

  const sampleUri = "mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/niwassetu?retryWrites=true&w=majority";

  const handleCopyUri = () => {
    navigator.clipboard?.writeText(sampleUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await onSeedCloud();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '580px', width: '92%' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-sm)',
              background: backendStatus.isDbConnected ? 'var(--accent-success-subtle)' : 'var(--accent-warning-subtle)',
              border: `1px solid ${backendStatus.isDbConnected ? 'var(--accent-success-border)' : 'var(--accent-warning-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: backendStatus.isDbConnected ? 'var(--accent-success-text)' : 'var(--accent-warning-text)'
            }}>
              <Database size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                MongoDB Atlas Cloud Database
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Online NoSQL document storage for society complaints
              </p>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Live Status Card */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Cloud Backend State:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: backendStatus.isDbConnected 
                  ? 'var(--accent-success)' 
                  : (backendStatus.isServerRunning ? 'var(--accent-warning)' : 'var(--accent-emergency)')
              }} />
              <span style={{
                fontSize: '0.775rem',
                fontWeight: 700,
                color: backendStatus.isDbConnected 
                  ? 'var(--accent-success-text)' 
                  : (backendStatus.isServerRunning ? 'var(--accent-warning-text)' : 'var(--accent-emergency-text)')
              }}>
                {backendStatus.isDbConnected 
                  ? 'Connected to MongoDB Atlas' 
                  : (backendStatus.isServerRunning ? 'Server Active (Awaiting MongoDB URI)' : 'Backend Server Offline')}
              </span>
            </div>
          </div>

          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {backendStatus.isDbConnected ? (
              <span style={{ color: 'var(--accent-success-text)' }}>
                All complaint lodgings, status transitions, and cluster resolutions are persisting online in your MongoDB Atlas cluster.
              </span>
            ) : (
              <span>
                Backend server is listening at <code>http://localhost:5000</code>. To store complaints in MongoDB Atlas, add your free M0 connection string in <code>.env</code>.
              </span>
            )}
          </div>
        </div>

        {/* 3 Step Quick Setup Guide for Free MongoDB Atlas */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cloud size={14} color="var(--accent-primary)" />
            <span>How to connect your Free MongoDB Atlas Cluster (2 Mins):</span>
          </div>

          <ol style={{
            margin: 0,
            paddingLeft: '20px',
            fontSize: '0.775rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <li>
              Sign up for free at <a href="https://www.mongodb.com/atlas/database" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>mongodb.com/atlas</a> and deploy a free <strong>M0 (Free forever, no credit card)</strong> cluster.
            </li>
            <li>
              In <strong>Database Access</strong>, create a database username & password. Under <strong>Network Access</strong>, allow access from anywhere (<code>0.0.0.0/0</code>).
            </li>
            <li>
              Click <strong>Connect → Drivers (Node.js)</strong>, copy the connection string, and paste it into your <code>.env</code> file:
            </li>
          </ol>

          {/* URI Snippet Box */}
          <div style={{
            marginTop: '10px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <code style={{ fontSize: '0.72rem', color: 'var(--text-main)', wordBreak: 'break-all', fontFamily: 'monospace' }}>
              MONGODB_URI={sampleUri}
            </code>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleCopyUri}
              title="Copy format"
              style={{ flexShrink: 0, padding: '4px 8px', fontSize: '0.7rem' }}
            >
              {copied ? <Check size={13} color="var(--accent-success-text)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRefreshStatus}
            style={{ gap: '6px' }}
          >
            <RefreshCw size={13} />
            <span>Check Connection</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSeed}
              disabled={isSeeding}
              style={{ gap: '6px' }}
            >
              <Server size={13} />
              <span>{isSeeding ? 'Seeding MongoDB...' : 'Sync Demo Data to Cloud'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
