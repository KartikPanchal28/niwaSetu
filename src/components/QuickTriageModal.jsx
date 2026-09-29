import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  Zap, 
  ArrowRight, 
  Layers, 
  Copy, 
  CheckCircle2, 
  Share2, 
  Building2,
  Languages,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CATEGORIES, URGENCY_LEVELS, SOCIETY_INFO } from '../data/societyData';
import { copyToClipboard } from '../utils/formatters';

export default function QuickTriageModal({ 
  isOpen, 
  onClose, 
  complaints, 
  onUpdateComplaint, 
  onMergeCluster, 
  showToast 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedVendorId, setSelectedVendorId] = useState(null);

  const unTriagedList = complaints.filter(c => c.status === 'INBOX');
  const currentComplaint = unTriagedList[currentIndex];

  useEffect(() => {
    if (currentIndex >= unTriagedList.length && unTriagedList.length > 0) {
      setCurrentIndex(0);
    }
  }, [unTriagedList.length, currentIndex]);

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
      setCompletedCount(0);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (currentComplaint) {
      setSelectedVendorId(currentComplaint.assignedVendor?.id || null);
    }
  }, [currentComplaint]);

  useEffect(() => {
    if (!isOpen || !currentComplaint) return;

    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.key === '1') {
        e.preventDefault();
        handleAcceptAndDispatch();
      } else if (e.key === '2') {
        e.preventDefault();
        handleClusterMerge();
      } else if (e.key === '3') {
        e.preventDefault();
        handleMarkResolved();
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentComplaint, currentIndex, unTriagedList.length]);

  if (!isOpen) return null;

  const formatTimer = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleNext = () => {
    if (currentIndex < unTriagedList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleAcceptAndDispatch = () => {
    if (!currentComplaint) return;
    const vendor = SOCIETY_INFO.vendors.find(v => v.id === selectedVendorId) || currentComplaint.assignedVendor;
    
    onUpdateComplaint(currentComplaint.id, {
      status: 'DISPATCHED',
      assignedVendor: vendor
    });
    setCompletedCount(prev => prev + 1);
    showToast(`Triaged & dispatched to ${vendor?.name.split(' ')[0] || 'vendor'}.`);

    if (unTriagedList.length <= 1) {
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleClusterMerge = () => {
    if (!currentComplaint) return;
    onMergeCluster(currentComplaint);
    setCompletedCount(prev => prev + 1);
    showToast(`Merged into Wing ${currentComplaint.location.wing || 'Society'} cluster.`);
  };

  const handleMarkResolved = () => {
    if (!currentComplaint) return;
    onUpdateComplaint(currentComplaint.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString()
    });
    setCompletedCount(prev => prev + 1);
    showToast(`Ticket #${currentComplaint.id} marked as resolved.`);

    if (unTriagedList.length <= 1) {
      try {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleCopyResidentMsg = async () => {
    if (!currentComplaint) return;
    const success = await copyToClipboard(currentComplaint.whatsappDrafts.residentMsg);
    if (success) showToast('Copied WhatsApp resident response.');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '780px', padding: 0 }}
      >
        {/* Top Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                2-Minute Volunteer Triage Deck
              </h2>
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                Keyboard-driven rapid queue processing for committee volunteers
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Shift timer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-surface)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <Clock size={12} />
              <span>Shift Time: <strong style={{ color: 'var(--text-main)' }}>{formatTimer(timeElapsed)}</strong></span>
            </div>

            <button 
              id="close-quick-triage"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              style={{ padding: '6px' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px' }}>
          {unTriagedList.length === 0 ? (
            /* Queue empty state */
            <div style={{ textAlign: 'center', padding: '48px 16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent-success-subtle)',
                color: 'var(--accent-success-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--text-main)' }}>
                All Complaints Triaged
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.875rem' }}>
                You processed {completedCount} issues in {formatTimer(timeElapsed)}. The society inbox is clear.
              </p>
              <button className="btn btn-primary" onClick={onClose}>
                Return to Dashboard
              </button>
            </div>
          ) : (
            <div>
              {/* Progress and Keycap shortcuts */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress:</span>
                  <strong style={{ color: 'var(--text-main)' }}>
                    {currentIndex + 1} of {unTriagedList.length}
                  </strong>
                  <span className="badge badge-flat" style={{ fontSize: '0.7rem' }}>
                    {unTriagedList.length} Remaining
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.725rem' }}>
                  <span><kbd>1</kbd> Accept & Dispatch</span>
                  <span><kbd>2</kbd> Merge</span>
                  <span><kbd>Space</kbd> Skip</span>
                </div>
              </div>

              {/* Active Complaint Panel */}
              <div className="panel" style={{
                padding: '18px',
                marginBottom: '18px',
                borderLeft: currentComplaint.urgencyTier === 'CRITICAL' 
                  ? '3px solid var(--accent-emergency)' 
                  : '3px solid var(--accent-primary)'
              }}>
                {/* Meta Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  flexWrap: 'wrap',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      #{currentComplaint.id}
                    </span>

                    <span className="badge badge-flat">
                      <Building2 size={11} color="var(--text-muted)" />
                      <span>{currentComplaint.location.flat || `Wing ${currentComplaint.location.wing}`}</span>
                    </span>

                    <span className="badge badge-lang">
                      <Languages size={10} color="var(--text-muted)" />
                      <span>{currentComplaint.langInfo.badge}</span>
                    </span>

                    <span className="badge" style={{
                      background: currentComplaint.categoryData.bgColor,
                      color: currentComplaint.categoryData.color,
                      border: `1px solid ${currentComplaint.categoryData.borderColor}`
                    }}>
                      {currentComplaint.categoryData.label}
                    </span>
                  </div>

                  <div>
                    <span className={`badge badge-${currentComplaint.urgencyTier.toLowerCase()}`}>
                      {currentComplaint.urgencyData.name} ({currentComplaint.urgencyScore}%)
                    </span>
                  </div>
                </div>

                {/* Raw Resident Quote */}
                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Original Resident Message ({currentComplaint.residentName}):
                  </div>
                  <div style={{ fontSize: '0.925rem', color: 'var(--text-main)', fontStyle: 'italic', lineHeight: '1.45' }}>
                    "{currentComplaint.rawText}"
                  </div>
                </div>

                {/* AI Triage & Standardized Action */}
                <div style={{
                  background: 'var(--accent-primary-subtle)',
                  border: '1px solid var(--accent-primary-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginBottom: '14px'
                }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Standardized Action Item
                  </div>
                  <div style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    {currentComplaint.aiSummary}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    Urgency trigger: <span>{currentComplaint.reasons[0]}</span>
                  </div>
                </div>

                {/* Vendor Routing & WhatsApp Quick Actions */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '10px'
                }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      Assigned Vendor:
                    </label>
                    <select 
                      className="input-field" 
                      value={selectedVendorId || ''} 
                      onChange={e => setSelectedVendorId(e.target.value)}
                      style={{ fontSize: '0.825rem', padding: '6px 10px' }}
                    >
                      {SOCIETY_INFO.vendors.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.name} ({v.trade}) - ETA: {v.responseEta}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                      WhatsApp Auto-Responders:
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={handleCopyResidentMsg}
                        style={{ flex: 1, padding: '6px' }}
                      >
                        <Copy size={11} />
                        <span>Copy Reply</span>
                      </button>
                      <button 
                        className="btn btn-whatsapp btn-sm"
                        onClick={() => window.open(currentComplaint.whatsappDrafts.encodedVendorUrl, '_blank')}
                        style={{ flex: 1, padding: '6px' }}
                      >
                        <Share2 size={11} />
                        <span>WA Vendor</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <button 
                  className="btn btn-secondary"
                  onClick={handleNext}
                >
                  <span>Skip</span>
                  <ArrowRight size={13} />
                </button>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleClusterMerge}
                    title="Merge with cluster (Key: 2)"
                  >
                    <Layers size={13} />
                    <span>Merge (2)</span>
                  </button>

                  <button 
                    className="btn btn-secondary"
                    onClick={handleMarkResolved}
                    style={{ borderColor: 'var(--accent-success-border)', color: 'var(--accent-success-text)' }}
                    title="Mark resolved directly (Key: 3)"
                  >
                    <CheckCircle2 size={13} />
                    <span>Resolve (3)</span>
                  </button>

                  <button 
                    id="accept-dispatch-btn"
                    className="btn btn-primary"
                    onClick={handleAcceptAndDispatch}
                    title="Accept & Dispatch (Key: 1)"
                  >
                    <Check size={14} />
                    <span>Accept & Dispatch (1)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
