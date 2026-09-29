import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Droplets, 
  AlertTriangle, 
  Volume2, 
  Check, 
  Building2,
  Languages,
  ArrowRight
} from 'lucide-react';
import { DEMO_PRESETS } from '../data/initialComplaints';
import { triageRawComplaint } from '../utils/aiTriageEngine';

export default function ChatIngestModal({ 
  isOpen, 
  onClose, 
  onIngestComplaints, 
  showToast 
}) {
  const [rawText, setRawText] = useState('');
  const [previewItems, setPreviewItems] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  if (!isOpen) return null;

  const handleLoadPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setRawText(preset.rawFeed);
    parseFeed(preset.rawFeed);
  };

  const parseFeed = (textToParse) => {
    const lines = textToParse
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);

    const parsed = lines.map((line) => {
      const waMatch = line.match(/^\[(.*?)\]\s*(.*?):\s*(.*)$/);
      let sender = 'Resident';
      let content = line;
      let timestamp = new Date().toISOString();

      if (waMatch) {
        sender = waMatch[2].trim();
        content = waMatch[3].trim();
      }

      return triageRawComplaint(content, {
        id: `T-${Math.floor(900 + Math.random() * 900)}`,
        residentName: sender,
        timestamp
      });
    });

    setPreviewItems(parsed);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setRawText(val);
    setSelectedPresetId(null);
    if (val.trim()) {
      parseFeed(val);
    } else {
      setPreviewItems([]);
    }
  };

  const handleConfirmIngest = () => {
    if (previewItems.length === 0) {
      showToast('No valid messages detected to import.');
      return;
    }

    onIngestComplaints(previewItems);
    showToast(`Imported ${previewItems.length} complaints.`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '800px', padding: 0 }}
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
            <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
              Ingest WhatsApp & Chat Dump
            </h2>
            <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Batch-import messages in mixed English & Hindi (Hinglish)
            </span>
          </div>

          <button 
            id="close-ingest-modal"
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {/* Preset Scenarios */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Sample Society Chat Scenarios:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
              {DEMO_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset)}
                  className="btn btn-secondary"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '10px 12px',
                    textAlign: 'left',
                    background: selectedPresetId === preset.id ? 'var(--accent-primary-subtle)' : 'var(--bg-subtle)',
                    borderColor: selectedPresetId === preset.id ? 'var(--accent-primary)' : 'var(--border-subtle)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.825rem', color: 'var(--text-main)' }}>
                    {preset.id === 'water_surge' && <Droplets size={13} color="var(--accent-info-text)" />}
                    {preset.id === 'lift_emergency' && <AlertTriangle size={13} color="var(--accent-emergency-text)" />}
                    {preset.id === 'weekend_parking_noise' && <Volume2 size={13} color="var(--accent-warning-text)" />}
                    <span>{preset.title}</span>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: '1.3' }}>
                    {preset.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Raw Text Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Raw Messages (1 complaint per line):
            </label>
            <textarea
              id="raw-chat-input"
              className="input-field"
              rows={4}
              placeholder="e.g.&#10;[08:05 AM] B-402: Subah se paani band hai tanker kab aayega?&#10;Flat 102: Someone parked car in my slot P-14 call security.&#10;Lift-2 Wing B stuck on 3rd floor emergency!!"
              value={rawText}
              onChange={handleTextChange}
              style={{ fontFamily: 'monospace', fontSize: '0.825rem' }}
            />
          </div>

          {/* Real-time Parser Preview */}
          {previewItems.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Detected Complaints ({previewItems.length}):
              </div>

              <div style={{
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'var(--bg-subtle)',
                padding: '8px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                {previewItems.map((item, i) => (
                  <div 
                    key={i} 
                    style={{
                      background: 'var(--bg-card)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                        <span className="badge badge-flat" style={{ fontSize: '0.7rem' }}>
                          <Building2 size={10} color="var(--text-muted)" />
                          <span>{item.location.flat || `Wing ${item.location.wing}`}</span>
                        </span>
                        <span className="badge badge-lang" style={{ fontSize: '0.65rem' }}>
                          {item.langInfo.badge}
                        </span>
                        <span className={`badge badge-${item.urgencyTier.toLowerCase()}`} style={{ fontSize: '0.65rem' }}>
                          {item.urgencyTier}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600 }}>
                          {item.categoryData.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        "{item.rawText}"
                      </div>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      ➔ {item.assignedVendor?.name.split(' ')[0]}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              id="confirm-ingest-btn"
              className="btn btn-primary"
              onClick={handleConfirmIngest}
              disabled={previewItems.length === 0}
              style={{ opacity: previewItems.length === 0 ? 0.5 : 1 }}
            >
              <Check size={14} />
              <span>Import {previewItems.length} Complaints</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
