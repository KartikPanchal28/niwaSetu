import React, { useState } from 'react';
import { 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Users, 
  Building2,
  Copy,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES } from '../data/societyData';
import { copyToClipboard } from '../utils/formatters';

export default function ClusterCard({ 
  cluster, 
  onResolveCluster, 
  onSelectComplaint, 
  showToast 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyBroadcast = async (e) => {
    e.stopPropagation();
    const leadMember = cluster.members[0];
    if (leadMember) {
      const success = await copyToClipboard(leadMember.whatsappDrafts.broadcastMsg);
      if (success) showToast('Copied Society Group Broadcast notice.');
    }
  };

  const handleResolveAll = (e) => {
    e.stopPropagation();
    onResolveCluster(cluster.clusterId);
    showToast(`Resolved all ${cluster.count} complaints in this incident.`);
  };

  return (
    <div className="panel" style={{
      borderLeft: '4px solid var(--accent-primary)',
      padding: '16px 18px',
      marginBottom: '12px'
    }}>
      {/* Cluster Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--accent-primary-subtle)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary-border)', fontWeight: 700 }}>
                Grouped Service Outage
              </span>
              <span className={`badge badge-${cluster.highestUrgencyTier.toLowerCase()}`}>
                {cluster.highestUrgencyTier}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                {cluster.clusterId}
              </span>
            </div>
            <h3 style={{ fontSize: '1.05rem', margin: '4px 0 2px 0', color: 'var(--text-main)', fontWeight: 700 }}>
              {cluster.title}
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={handleCopyBroadcast}
            title="Copy pre-drafted notice for society WhatsApp group"
          >
            <Copy size={12} />
            <span>Copy Group Notice</span>
          </button>

          <button 
            className="btn btn-success btn-sm"
            onClick={handleResolveAll}
          >
            <CheckCircle2 size={12} />
            <span>Resolve All ({cluster.count})</span>
          </button>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: '1.4' }}>
        {cluster.aiSummary}
      </p>

      {/* Affected Flats List */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        marginBottom: '10px',
        padding: '6px 10px',
        background: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
          <Users size={12} />
          <span>{cluster.count} Flats Affected:</span>
        </div>

        {cluster.affectedFlats.map((flat, idx) => (
          <span key={idx} className="badge badge-flat" style={{ fontSize: '0.75rem', padding: '2px 6px', gap: '3px' }}>
            <Building2 size={10} color="var(--text-muted)" />
            <span>{flat}</span>
          </span>
        ))}
      </div>

      {/* Expand/Collapse Toggle */}
      <div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '0.775rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: 0
          }}
        >
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          <span>
            {isExpanded ? 'Hide' : 'Inspect'} {cluster.count} Linked Resident Messages
          </span>
        </button>

        {isExpanded && (
          <div style={{
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            paddingLeft: '8px',
            borderLeft: '2px solid var(--border-strong)'
          }}>
            {cluster.members.map((member) => (
              <div 
                key={member.id}
                onClick={() => onSelectComplaint(member)}
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {member.location.flat || member.residentName}
                    </span>
                    <span className="badge badge-lang" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                      {member.langInfo.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    "{member.rawText}"
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                  View
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
