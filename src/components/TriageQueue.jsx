import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Copy, 
  Share2, 
  Building2, 
  Languages,
  Droplets,
  ArrowUpDown,
  Car,
  Volume2,
  Sparkles,
  Zap,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  KeyRound
} from 'lucide-react';
import { CATEGORIES, URGENCY_LEVELS } from '../data/societyData';
import { formatTimeAgo, copyToClipboard } from '../utils/formatters';
import ClusterCard from './ClusterCard';

export default function TriageQueue({ 
  complaints, 
  clusters, 
  onSelectComplaint, 
  onResolveCluster, 
  onUpdateComplaint, 
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [groupByClusters, setGroupByClusters] = useState(true);

  // Filter complaints based on user controls
  const filteredComplaints = useMemo(() => {
    const list = complaints.filter(item => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = item.rawText.toLowerCase().includes(query);
        const matchesSummary = item.aiSummary.toLowerCase().includes(query);
        const matchesFlat = item.location?.flat?.toLowerCase().includes(query);
        const matchesResident = item.residentName?.toLowerCase().includes(query);
        if (!matchesText && !matchesSummary && !matchesFlat && !matchesResident) {
          return false;
        }
      }

      if (selectedWing !== 'ALL' && item.location?.wing !== selectedWing) return false;
      if (selectedUrgency !== 'ALL' && item.urgencyTier !== selectedUrgency) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;

      return true;
    });

    const URGENCY_WEIGHT = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };

    return list.sort((a, b) => {
      // 1. Unresolved issues come before resolved issues
      const aResolved = a.status === 'RESOLVED' ? 1 : 0;
      const bResolved = b.status === 'RESOLVED' ? 1 : 0;
      if (aResolved !== bResolved) return aResolved - bResolved;

      // 2. Urgency Tier: CRITICAL > HIGH > MEDIUM > LOW
      const aTier = URGENCY_WEIGHT[a.urgencyTier] || 0;
      const bTier = URGENCY_WEIGHT[b.urgencyTier] || 0;
      if (aTier !== bTier) return bTier - aTier;

      // 3. Exact Urgency Score (0 - 100) descending
      const aScore = a.urgencyScore || 0;
      const bScore = b.urgencyScore || 0;
      if (aScore !== bScore) return bScore - aScore;

      // 4. Timestamp newest first
      return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });
  }, [complaints, searchQuery, selectedWing, selectedUrgency, selectedCategory, selectedStatus]);

  // Metric counts
  const criticalCount = complaints.filter(c => c.urgencyTier === 'CRITICAL' && c.status !== 'RESOLVED').length;
  const pendingCount = complaints.filter(c => c.status === 'INBOX').length;
  const dispatchedCount = complaints.filter(c => c.status === 'DISPATCHED').length;
  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;

  const handleCopyResidentReply = async (e, complaint) => {
    e.stopPropagation();
    const success = await copyToClipboard(complaint.whatsappDrafts.residentMsg);
    if (success) showToast(`Copied WhatsApp reply for Flat ${complaint.location.flat}!`);
  };

  const handleQuickResolve = (e, complaint) => {
    e.stopPropagation();
    onUpdateComplaint(complaint.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString()
    });
    showToast(`Ticket #${complaint.id} marked as resolved.`);
  };

  const getCategoryIcon = (catId) => {
    switch (catId) {
      case 'water': return <Droplets size={12} />;
      case 'lift': return <ArrowUpDown size={12} />;
      case 'lift-parking': return <Layers size={12} />;
      case 'parking': return <Car size={12} />;
      case 'locksmith': return <KeyRound size={12} />;
      case 'noise': return <Volume2 size={12} />;
      case 'cleaning': return <Sparkles size={12} />;
      case 'electrical': return <Zap size={12} />;
      case 'security': return <ShieldAlert size={12} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Metric Summary Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {/* Pending Triage Card */}
        <div className="panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Needs Triage
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
            {pendingCount}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>
              in inbox
            </span>
          </div>
        </div>

        {/* Critical Emergency Card */}
        <div className="panel" style={{
          padding: '16px 20px',
          borderColor: criticalCount > 0 ? 'var(--accent-emergency-border)' : 'var(--border-subtle)',
          background: criticalCount > 0 ? 'var(--accent-emergency-subtle)' : 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.775rem', color: criticalCount > 0 ? 'var(--accent-emergency-text)' : 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {criticalCount > 0 && <AlertCircle size={14} />}
            <span>Critical Issues</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: criticalCount > 0 ? 'var(--accent-emergency-text)' : 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
            {criticalCount}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>
              immediate SLA
            </span>
          </div>
        </div>

        {/* Grouped Incident Clusters */}
        <div className="panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Grouped Outages
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--text-main)', fontVariantNumeric: 'tabular-nums' }}>
            {clusters.length}
            <span style={{ fontSize: '0.8rem', color: 'var(--accent-info-text)', fontWeight: 600, marginLeft: '6px' }}>
              clusters
            </span>
          </div>
        </div>

        {/* Resolved Today */}
        <div className="panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Resolved Today
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '4px', color: 'var(--accent-success-text)', fontVariantNumeric: 'tabular-nums' }}>
            {resolvedCount}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '6px' }}>
              tickets closed
            </span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="panel" style={{ padding: '14px 18px', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px', minWidth: '220px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              id="search-complaints-input"
              type="text"
              placeholder="Search by flat, keyword, Hinglish phrase..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '34px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Wing Selector */}
          <select
            className="input-field"
            value={selectedWing}
            onChange={e => setSelectedWing(e.target.value)}
            style={{ width: 'auto', fontSize: '0.825rem', padding: '7px 10px' }}
          >
            <option value="ALL">All Wings (100 Flats)</option>
            <option value="A">Wing A (Flats A-101 to A-510)</option>
            <option value="B">Wing B (Flats B-101 to B-510)</option>
          </select>

          {/* Urgency Selector */}
          <select
            className="input-field"
            value={selectedUrgency}
            onChange={e => setSelectedUrgency(e.target.value)}
            style={{ width: 'auto', fontSize: '0.825rem', padding: '7px 10px' }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Emergency</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low / Routine</option>
          </select>

          {/* Category Selector */}
          <select
            className="input-field"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            style={{ width: 'auto', fontSize: '0.825rem', padding: '7px 10px' }}
          >
            <option value="ALL">All Categories</option>
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <option key={key} value={key}>{cat.label}</option>
            ))}
          </select>

          {/* Group by Cluster toggle */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            userSelect: 'none'
          }}>
            <input 
              type="checkbox" 
              checked={groupByClusters} 
              onChange={e => setGroupByClusters(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', width: '15px', height: '15px' }}
            />
            <span>Group Duplicate Outages</span>
          </label>
        </div>
      </div>

      {/* Clustered Incidents Section */}
      {groupByClusters && clusters.length > 0 && selectedWing === 'ALL' && selectedCategory === 'ALL' && !searchQuery && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Layers size={14} color="var(--accent-primary)" />
            <span>Grouped Master Incidents ({clusters.length})</span>
          </div>

          {clusters.map(cluster => (
            <ClusterCard 
              key={cluster.clusterId}
              cluster={cluster}
              onResolveCluster={onResolveCluster}
              onSelectComplaint={onSelectComplaint}
              showToast={showToast}
            />
          ))}
        </div>
      )}

      {/* Main Complaints Feed */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-secondary)' }}>
            Complaints Feed ({filteredComplaints.length})
          </h2>
          <span style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
            Prioritized by urgency & timestamp
          </span>
        </div>

        {filteredComplaints.length === 0 ? (
          <div className="panel" style={{ textAlign: 'center', padding: '52px 20px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'var(--accent-success-subtle)',
              border: '1px solid var(--accent-success-border)',
              color: 'var(--accent-success-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <CheckCircle2 size={26} />
            </div>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Society Triage Queue is Clear
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, maxWidth: '460px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
              No complaints in the system. When residents submit grievances via the Resident Portal, the system will automatically parse the language, score urgency, and prevent duplicate tickets in real time.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredComplaints.map(item => {
              const isCritical = item.urgencyTier === 'CRITICAL';
              const isResolved = item.status === 'RESOLVED';

              return (
                <div 
                  key={item.id}
                  className="card"
                  onClick={() => onSelectComplaint(item)}
                  style={{
                    padding: '14px 16px',
                    borderLeft: isCritical && !isResolved 
                      ? '3px solid var(--accent-emergency)' 
                      : undefined,
                    opacity: isResolved ? 0.75 : 1
                  }}
                >
                  {/* Top Line: Tags & Urgency */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        #{item.id}
                      </span>

                      {/* Flat Tag with Building icon */}
                      <span className="badge badge-flat" style={{ gap: '4px' }}>
                        <Building2 size={11} color="var(--text-muted)" />
                        <span>{item.location.flat || `Wing ${item.location.wing}` || 'General'}</span>
                      </span>

                      {/* Language Tag */}
                      <span className="badge badge-lang" style={{ gap: '4px' }}>
                        <Languages size={10} color="var(--text-muted)" />
                        <span>{item.langInfo.badge}</span>
                      </span>

                      {/* Category Badge */}
                      <span className="badge" style={{
                        background: item.categoryData.bgColor,
                        color: item.categoryData.color,
                        border: `1px solid ${item.categoryData.borderColor}`,
                        gap: '4px'
                      }}>
                        {getCategoryIcon(item.category)}
                        <span>{item.categoryData.label}</span>
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge badge-${item.urgencyTier.toLowerCase()}`}>
                        {item.urgencyTier} ({item.urgencyScore}%)
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {formatTimeAgo(item.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Summary & Raw Text */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{
                      fontSize: '0.925rem',
                      fontWeight: 600,
                      color: isResolved ? 'var(--text-muted)' : 'var(--text-main)',
                      textDecoration: isResolved ? 'line-through' : 'none',
                      lineHeight: '1.35',
                      marginBottom: '3px'
                    }}>
                      {item.aiSummary}
                    </div>

                    <div style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      lineHeight: '1.4'
                    }}>
                      "{item.rawText}"
                    </div>

                    {/* AI Deduplication indicator if duplicates absorbed */}
                    {((item.linkedReports && item.linkedReports.length > 0) || (item.followUpNotes && item.followUpNotes.length > 0)) && (
                      <div style={{
                        marginTop: '6px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.72rem',
                        color: '#10b981',
                        fontWeight: 600
                      }}>
                        <ShieldCheck size={12} />
                        <span>
                          🛡️ AI Deduplicated: {item.linkedReports?.length || 0} other resident reports & {item.followUpNotes?.length || 0} follow-ups filtered into this ticket
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Strip: Vendor and Action Buttons */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    fontSize: '0.775rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <span>Assigned:</span>
                      <strong style={{ color: 'var(--text-main)' }}>
                        {item.assignedVendor?.name.split(' (')[0]}
                      </strong>
                      <span>•</span>
                      <span>ETA {item.assignedVendor?.responseEta}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={(e) => handleCopyResidentReply(e, item)}
                        title="Copy polite WhatsApp acknowledgment"
                        style={{ padding: '3px 8px' }}
                      >
                        <Copy size={11} />
                        <span>Copy Reply</span>
                      </button>

                      <button 
                        className="btn btn-whatsapp btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(item.whatsappDrafts.encodedVendorUrl, '_blank');
                        }}
                        title="Open WhatsApp Work Order to Vendor"
                        style={{ padding: '3px 8px' }}
                      >
                        <Share2 size={11} />
                        <span>WA Vendor</span>
                      </button>

                      {!isResolved && (
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => handleQuickResolve(e, item)}
                          style={{ borderColor: 'var(--accent-success-border)', color: 'var(--accent-success-text)', padding: '3px 8px' }}
                          title="Mark ticket as resolved"
                        >
                          <CheckCircle2 size={11} />
                          <span>Resolve</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
