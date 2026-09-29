import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Wrench, 
  Inbox, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  Languages
} from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

export default function KanbanView({ 
  complaints, 
  onSelectComplaint, 
  onUpdateComplaint, 
  showToast 
}) {
  const sortByUrgency = (list) => {
    const weights = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...list].sort((a, b) => {
      const aTier = weights[a.urgencyTier] || 0;
      const bTier = weights[b.urgencyTier] || 0;
      if (aTier !== bTier) return bTier - aTier;
      return (b.urgencyScore || 0) - (a.urgencyScore || 0);
    });
  };

  const columns = [
    {
      id: 'INBOX',
      title: 'Inbox / Needs Triage',
      icon: Inbox,
      color: 'var(--text-muted)',
      items: sortByUrgency(complaints.filter(c => c.status === 'INBOX'))
    },
    {
      id: 'TRIAGED',
      title: 'Triaged & Assigned',
      icon: Clock,
      color: 'var(--accent-info-text)',
      items: sortByUrgency(complaints.filter(c => c.status === 'TRIAGED'))
    },
    {
      id: 'DISPATCHED',
      title: 'Vendor Dispatched',
      icon: Wrench,
      color: 'var(--accent-warning-text)',
      items: sortByUrgency(complaints.filter(c => c.status === 'DISPATCHED'))
    },
    {
      id: 'RESOLVED',
      title: 'Resolved & Closed',
      icon: CheckCircle2,
      color: 'var(--accent-success-text)',
      items: sortByUrgency(complaints.filter(c => c.status === 'RESOLVED'))
    }
  ];

  const handleMove = (e, complaintId, nextStatus) => {
    e.stopPropagation();
    onUpdateComplaint(complaintId, {
      status: nextStatus,
      resolvedAt: nextStatus === 'RESOLVED' ? new Date().toISOString() : null
    });
    showToast(`Moved to ${nextStatus}.`);
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
          Complaint Board
        </h2>
        <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Visual board to track and resolve complaints across Inbox, Triaged, Dispatched, and Resolved columns
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px',
        alignItems: 'start'
      }}>
        {columns.map(col => {
          const Icon = col.icon;
          return (
            <div 
              key={col.id}
              className="panel"
              style={{
                padding: '14px',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Column Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                paddingBottom: '8px',
                borderBottom: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon size={14} color={col.color} />
                  <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {col.title}
                  </span>
                </div>
                <span className="badge badge-flat" style={{ fontSize: '0.7rem' }}>
                  {col.items.length}
                </span>
              </div>

              {/* Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {col.items.length === 0 ? (
                  <div style={{
                    padding: '24px 12px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    No complaints in this stage
                  </div>
                ) : (
                  col.items.map(item => (
                    <div
                      key={item.id}
                      className="card"
                      onClick={() => onSelectComplaint(item)}
                      style={{
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        borderLeft: item.urgencyTier === 'CRITICAL' ? '3px solid var(--accent-emergency)' : undefined
                      }}
                    >
                      {/* Tags */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="badge badge-flat" style={{ fontSize: '0.675rem' }}>
                            <Building2 size={10} color="var(--text-muted)" />
                            <span>{item.location.flat || `Wing ${item.location.wing}`}</span>
                          </span>
                          <span className="badge badge-lang" style={{ fontSize: '0.65rem' }}>
                            {item.langInfo.badge}
                          </span>
                        </div>
                        <span className={`badge badge-${item.urgencyTier.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {item.urgencyTier}
                        </span>
                      </div>

                      {/* Summary */}
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: 'var(--text-main)',
                        lineHeight: '1.3'
                      }}>
                        {item.aiSummary}
                      </div>

                      {/* Raw text */}
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        "{item.rawText}"
                      </div>

                      {/* Bottom row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        paddingTop: '6px',
                        borderTop: '1px solid var(--border-subtle)',
                        fontSize: '0.725rem'
                      }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          {item.assignedVendor?.name.split(' (')[0]}
                        </span>

                        <div style={{ display: 'flex', gap: '4px' }}>
                          {col.id !== 'INBOX' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => handleMove(e, item.id, col.id === 'RESOLVED' ? 'DISPATCHED' : 'INBOX')}
                              style={{ padding: '2px 5px', fontSize: '0.675rem' }}
                              title="Move back"
                            >
                              <ArrowLeft size={10} />
                            </button>
                          )}

                          {col.id !== 'RESOLVED' && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={(e) => handleMove(e, item.id, col.id === 'INBOX' ? 'DISPATCHED' : 'RESOLVED')}
                              style={{ padding: '2px 7px', fontSize: '0.675rem' }}
                              title="Advance status"
                            >
                              <span>{col.id === 'DISPATCHED' ? 'Resolve' : 'Dispatch'}</span>
                              <ArrowRight size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
