import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Share2, 
  CheckCircle2, 
  Phone, 
  Building2, 
  Languages, 
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Trash2
} from 'lucide-react';
import { SOCIETY_INFO, CATEGORIES, URGENCY_LEVELS } from '../data/societyData';
import { copyToClipboard, formatDateTime } from '../utils/formatters';

export default function IncidentDetailModal({ 
  complaint, 
  isOpen, 
  onClose, 
  onUpdateComplaint, 
  onDeleteComplaint,
  showToast 
}) {
  if (!isOpen || !complaint) return null;

  const [activeTab, setActiveTab] = useState('resident');
  const [internalNote, setInternalNote] = useState(complaint.resolutionNotes || '');
  const [selectedVendorId, setSelectedVendorId] = useState(complaint.assignedVendor?.id || '');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleStatusChange = (newStatus) => {
    onUpdateComplaint(complaint.id, {
      status: newStatus,
      resolutionNotes: internalNote,
      resolvedAt: newStatus === 'RESOLVED' ? new Date().toISOString() : complaint.resolvedAt
    });
    showToast(`Ticket #${complaint.id} status updated to ${newStatus}.`);
  };

  const handleVendorChange = (e) => {
    const vId = e.target.value;
    setSelectedVendorId(vId);
    const vendor = SOCIETY_INFO.vendors.find(v => v.id === vId);
    if (vendor) {
      onUpdateComplaint(complaint.id, { assignedVendor: vendor });
      showToast(`Assigned to ${vendor.name}.`);
    }
  };

  const handleCopyWhatsApp = async (text, label) => {
    const success = await copyToClipboard(text);
    if (success) showToast(`Copied ${label}.`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '740px', padding: 0 }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                Ticket #{complaint.id}
              </span>
              <span className={`badge badge-${complaint.urgencyTier.toLowerCase()}`}>
                {complaint.urgencyData.name} ({complaint.urgencyScore}%)
              </span>
              <span className="badge badge-flat">
                {complaint.status}
              </span>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
              Reported: {formatDateTime(complaint.timestamp)} • SLA: {complaint.urgencyData.sla}
            </div>
          </div>

          <button 
            id="close-detail-modal"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* Section 1: Raw Resident Message */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Resident Message
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="badge badge-lang" style={{ fontSize: '0.7rem' }}>
                  <Languages size={10} color="var(--text-muted)" />
                  <span>{complaint.langInfo.lang}</span>
                </span>
                <button 
                  onClick={() => handleCopyWhatsApp(complaint.rawText, 'Original message')}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.725rem' }}
                >
                  <Copy size={11} /> Copy
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontStyle: 'italic',
              fontSize: '0.95rem',
              color: 'var(--text-main)',
              lineHeight: '1.45'
            }}>
              "{complaint.rawText}"
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              <span>Resident: <strong style={{ color: 'var(--text-main)' }}>{complaint.residentName}</strong></span>
              <span>•</span>
              <span>Phone: <strong>{complaint.senderPhone}</strong></span>
            </div>
          </div>

          {/* Section 2: Standardized Action Item */}
          <div className="panel" style={{
            padding: '14px',
            marginBottom: '16px',
            background: 'var(--accent-primary-subtle)',
            border: '1px solid var(--accent-primary-border)'
          }}>
            <div style={{
              fontSize: '0.725rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--accent-primary)',
              marginBottom: '4px'
            }}>
              Standardized Action Summary
            </div>

            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
              {complaint.aiSummary}
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '10px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '10px',
              fontSize: '0.775rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Location:</span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {complaint.location.flat || 'Common Area'} {complaint.location.floor ? `(${complaint.location.floor})` : ''}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Category:</span>
                <strong style={{ color: 'var(--text-main)' }}>
                  {complaint.categoryData.label}
                </strong>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block' }}>Urgency Reason:</span>
                <span style={{ color: 'var(--accent-emergency-text)' }}>
                  {complaint.reasons[0]}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Vendor Routing */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Assigned Vendor / Service Provider:
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select 
                className="input-field" 
                value={selectedVendorId} 
                onChange={handleVendorChange}
                style={{ flex: 1, minWidth: '220px', fontSize: '0.825rem' }}
              >
                {SOCIETY_INFO.vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.trade}) - ETA: {v.responseEta}
                  </option>
                ))}
              </select>

              <button 
                className="btn btn-secondary"
                onClick={() => window.open(`tel:${complaint.assignedVendor?.phone}`, '_self')}
                style={{ fontSize: '0.8rem', padding: '8px 12px' }}
              >
                <Phone size={13} />
                <span>Call Vendor</span>
              </button>
            </div>
          </div>

          {/* AI Deduplication & Follow-Up Reports Log */}
          {((complaint.linkedReports && complaint.linkedReports.length > 0) || (complaint.followUpNotes && complaint.followUpNotes.length > 0)) && (
            <div className="panel" style={{
              padding: '14px',
              marginBottom: '16px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '0.8rem', marginBottom: '8px' }}>
                <ShieldCheck size={16} />
                <span>AI Deduplication Log: Filtered Same-Day Reports</span>
              </div>

              {complaint.linkedReports && complaint.linkedReports.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Linked Flats Experiencing Same Outage:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                    {complaint.linkedReports.map((r, i) => (
                      <span key={i} className="badge badge-flat" style={{ fontSize: '0.75rem' }}>
                        Flat {r.flat} ({r.resident || 'Resident'})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {complaint.followUpNotes && complaint.followUpNotes.length > 0 && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Follow-Up Messages From Resident:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {complaint.followUpNotes.map((n, i) => (
                      <div key={i} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', background: 'var(--bg-main)', padding: '6px 10px', borderRadius: 'var(--radius-sm)' }}>
                        "{n.text}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 4: WhatsApp Messages */}
          <div className="panel" style={{ padding: '14px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} color="var(--accent-success-text)" />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                  WhatsApp Dispatch Text
                </span>
              </div>

              <div style={{ display: 'flex', gap: '4px' }}>
                <button 
                  className={`btn btn-sm ${activeTab === 'resident' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('resident')}
                >
                  Resident Reply
                </button>
                <button 
                  className={`btn btn-sm ${activeTab === 'vendor' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('vendor')}
                >
                  Vendor Work Order
                </button>
                <button 
                  className={`btn btn-sm ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('broadcast')}
                >
                  Group Notice
                </button>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '0.825rem',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-main)',
              maxHeight: '120px',
              overflowY: 'auto',
              marginBottom: '10px'
            }}>
              {activeTab === 'resident' && complaint.whatsappDrafts.residentMsg}
              {activeTab === 'vendor' && complaint.whatsappDrafts.vendorMsg}
              {activeTab === 'broadcast' && complaint.whatsappDrafts.broadcastMsg}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  const text = activeTab === 'resident' 
                    ? complaint.whatsappDrafts.residentMsg 
                    : activeTab === 'vendor' 
                    ? complaint.whatsappDrafts.vendorMsg 
                    : complaint.whatsappDrafts.broadcastMsg;
                  handleCopyWhatsApp(text, 'WhatsApp draft');
                }}
              >
                <Copy size={11} />
                <span>Copy</span>
              </button>

              <button 
                className="btn btn-whatsapp btn-sm"
                onClick={() => {
                  const url = activeTab === 'vendor' 
                    ? complaint.whatsappDrafts.encodedVendorUrl 
                    : complaint.whatsappDrafts.encodedResidentUrl;
                  window.open(url, '_blank');
                }}
              >
                <Share2 size={11} />
                <span>Send WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Section 5: Internal Volunteer Notes */}
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '4px' }}>
              Internal Committee Notes:
            </label>
            <input 
              type="text"
              className="input-field"
              placeholder="e.g. Tanker arriving by 3 PM, notified security guard Ramu"
              value={internalNote}
              onChange={e => setInternalNote(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 20px',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>

            {onDeleteComplaint && (
              !isConfirmingDelete ? (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setIsConfirmingDelete(true)}
                  style={{ color: 'var(--accent-emergency-text)', borderColor: 'var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '5px' }}
                  title="Permanently remove this ticket from database"
                >
                  <Trash2 size={13} />
                  <span>Delete Ticket</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button 
                    className="btn btn-emergency"
                    onClick={() => {
                      onDeleteComplaint(complaint.id);
                      setIsConfirmingDelete(false);
                    }}
                    style={{ fontSize: '0.775rem', padding: '6px 12px' }}
                  >
                    Confirm Delete
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setIsConfirmingDelete(false)}
                    style={{ fontSize: '0.775rem', padding: '6px 10px' }}
                  >
                    Cancel
                  </button>
                </div>
              )
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {complaint.status !== 'INBOX' && (
              <button 
                className="btn btn-secondary"
                onClick={() => handleStatusChange('INBOX')}
              >
                Move to Inbox
              </button>
            )}

            {complaint.status !== 'DISPATCHED' && (
              <button 
                className="btn btn-secondary"
                onClick={() => handleStatusChange('DISPATCHED')}
              >
                Mark Dispatched
              </button>
            )}

            {complaint.status !== 'RESOLVED' && (
              <button 
                id="resolve-complaint-btn"
                className="btn btn-success"
                onClick={() => handleStatusChange('RESOLVED')}
              >
                <CheckCircle2 size={14} />
                <span>Mark Resolved</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
