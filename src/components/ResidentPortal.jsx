import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  CheckCircle2, 
  MessageSquare, 
  Droplets, 
  ArrowUpDown, 
  Car, 
  Volume2, 
  Sparkles, 
  KeyRound, 
  Layers, 
  Clock, 
  Building2, 
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Bot,
  RefreshCw
} from 'lucide-react';
import { triageRawComplaint } from '../utils/aiTriageEngine';
import { formatTimeAgo } from '../utils/formatters';
import { getContactNumberValidation, isValidContactNumber } from '../data/societyData';

export default function ResidentPortal({ 
  currentUser, 
  complaints = [], 
  clusters = [], 
  onAddNewComplaint, 
  showToast 
}) {
  const [flatNumber, setFlatNumber] = useState(currentUser?.flat || 'B-402');
  const [residentName, setResidentName] = useState(currentUser?.name || 'Rohit Mehta');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [complaintText, setComplaintText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recentTicket, setRecentTicket] = useState(null);
  const [duplicateNotice, setDuplicateNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneValidation = getContactNumberValidation(senderPhone);

  const handlePhoneChange = (e) => {
    let raw = e.target.value;
    let digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2);
    }
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }
    setSenderPhone(digits);
  };

  useEffect(() => {
    if (currentUser?.flat) setFlatNumber(currentUser.flat);
    if (currentUser?.name) setResidentName(currentUser.name);
    if (currentUser?.phone) setSenderPhone(currentUser.phone);
  }, [currentUser]);

  // Filter complaints filed by this flat
  const myComplaints = complaints.filter(c => {
    if (!flatNumber) return false;
    const cleanCurrent = flatNumber.replace(/\s+/g, '').toUpperCase();
    const cleanComp = (c.location?.flat || '').replace(/\s+/g, '').toUpperCase();
    return cleanComp.includes(cleanCurrent);
  });

  // Filter active notices for this flat's wing
  const currentWing = flatNumber.startsWith('A') ? 'A' : 'B';
  const wingNotices = clusters.filter(cl => cl.wing === currentWing);

  const samplePrompts = [
    { label: "Water Outage", icon: Droplets, text: `Subah se ${flatNumber} mein paani bilkul nahi aa raha hai. Tanker kab tak aayega please confirm karo?` },
    { label: "Lift Stalled", icon: ArrowUpDown, text: `Lift 1 Wing ${currentWing} ground floor pe atka hua hai door open nahi ho raha urgent dekho!` },
    { label: "Door Lockout", icon: KeyRound, text: `Flat ${flatNumber} main door lock jam ho gaya hai, key broken inside cylinder! Family locked outside, please send locksmith urgently!` },
    { label: "Lift Parking Jam", icon: Layers, text: `Basement hydraulic lift parking slot LP-12 in Wing ${currentWing} platform atka hua hai! My car is stuck on upper pallet, need to leave for airport urgently!` },
    { label: "Blocked Parking", icon: Car, text: `Someone parked red i20 in my slot P-08 (Flat ${flatNumber}). I cannot park my car.` },
    { label: "Late Night Noise", icon: Volume2, text: "Flat A-401 playing loud stereo music since 11:30 PM. Senior citizens cannot sleep." },
    { label: "Corridor Trash", icon: Sparkles, text: `Corridor near ${flatNumber} garbage bag leak ho gaya hai, foul smell coming.` }
  ];

  const handleSimulateVoiceNote = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setComplaintText(`Namaste Secretary ji, ${flatNumber} ${residentName} bol raha hoon. Subah se kitchen tap mein bilkul paani nahi hai. Tanker ka kuch arrangement hua hai kya?`);
      showToast('Transcribed audio voice note to text.');
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      showToast('Please enter a complaint description.');
      return;
    }

    if (!phoneValidation.isEmpty && !phoneValidation.isValid) {
      showToast('Contact number must be 10 or 11 digits in India.');
      return;
    }

    setIsSubmitting(true);
    setDuplicateNotice(null);

    const newComplaint = triageRawComplaint(complaintText, {
      residentName: residentName || 'Resident',
      senderPhone: phoneValidation.formatted || senderPhone || currentUser?.phone || '+91 98200 11999',
      location: { flat: flatNumber }
    });

    try {
      const res = await onAddNewComplaint(newComplaint);
      if (res?.isDuplicate) {
        setDuplicateNotice(res);
        setRecentTicket(null);
      } else {
        setDuplicateNotice(null);
        setRecentTicket(res?.complaint || newComplaint);
      }
      setComplaintText('');
    } catch (err) {
      console.warn('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Resident Welcome Banner */}
      <div style={{
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
            Resident Portal • Flat {flatNumber}
          </h2>
          <p style={{ margin: '2px 0 0', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Welcome, <strong>{residentName}</strong>. Lodge complaints in Hinglish, Hindi, or English and track vendor dispatch.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="badge badge-flat" style={{ fontSize: '0.75rem' }}>
            <Building2 size={12} color="var(--text-muted)" />
            <span>Wing {currentWing}</span>
          </span>
          <span className="badge" style={{ background: 'var(--accent-success-subtle)', color: 'var(--accent-success-text)' }}>
            Verified Resident
          </span>
        </div>
      </div>

      {/* Active Wing Outage Notice Banner (if any) */}
      {wingNotices.length > 0 && (
        <div className="panel" style={{
          padding: '12px 16px',
          marginBottom: '18px',
          borderLeft: '4px solid var(--accent-warning)',
          background: 'var(--accent-warning-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-warning-text)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '2px' }}>
            <AlertTriangle size={15} />
            <span>Society Outage Alert: Wing {currentWing}</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-main)' }}>
            {wingNotices[0].aiSummary}
          </p>
        </div>
      )}

      {/* Main Grid: Lodge Complaint Form + Live WhatsApp Confirmation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Lodge Form */}
        <div className="panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '12px' }}>
            Lodge a Society Complaint
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Flat Number:
                </label>
                <input 
                  type="text"
                  className="input-field"
                  value={flatNumber}
                  onChange={e => setFlatNumber(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontWeight: 600 }}>
                  Resident Name:
                </label>
                <input 
                  type="text"
                  className="input-field"
                  value={residentName}
                  onChange={e => setResidentName(e.target.value)}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Contact Number:
                  </label>
                  <span style={{ 
                    fontSize: '0.675rem', 
                    fontWeight: 600,
                    color: phoneValidation.isEmpty 
                      ? 'var(--text-muted)' 
                      : (phoneValidation.isValid ? 'var(--accent-success-text)' : 'var(--accent-emergency-text)')
                  }}>
                    {phoneValidation.digitsCount > 0 ? `${phoneValidation.digitsCount}/11 digits` : '10-11 max'}
                  </span>
                </div>
                <input 
                  type="tel"
                  inputMode="numeric"
                  maxLength={11}
                  className="input-field"
                  placeholder="e.g. 9820111223"
                  value={senderPhone}
                  onChange={handlePhoneChange}
                  style={{
                    borderColor: !phoneValidation.isEmpty && !phoneValidation.isValid 
                      ? 'var(--accent-emergency)' 
                      : undefined
                  }}
                />
              </div>
            </div>

            {/* Quick Prompts */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
                Quick Scenarios:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {samplePrompts.map((p, idx) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setComplaintText(p.text)}
                      style={{ fontSize: '0.725rem', padding: '3px 7px' }}
                    >
                      <Icon size={11} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Complaint Text */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Describe Issue (Hinglish, Hindi, or English):
                </label>
                <button
                  type="button"
                  onClick={handleSimulateVoiceNote}
                  style={{
                    background: isRecording ? 'var(--accent-emergency-subtle)' : 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    color: isRecording ? 'var(--accent-emergency-text)' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '3px 8px',
                    fontSize: '0.725rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Mic size={11} color={isRecording ? 'var(--accent-emergency)' : 'var(--text-muted)'} />
                  <span>{isRecording ? 'Listening...' : 'Voice Note'}</span>
                </button>
              </div>

              <textarea 
                className="input-field"
                rows={4}
                placeholder="e.g. 'Arey B-402 mein paani bilkul nahi aa raha...' or 'Main door lock jammed key phans gayi'"
                value={complaintText}
                onChange={e => setComplaintText(e.target.value)}
              />
            </div>

            <button 
              id="submit-resident-complaint-btn"
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="spin-animation" />
                  <span>Submitting & Triaging...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Automated WhatsApp Confirmation or AI Deduplication Card */}
        <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {duplicateNotice ? (
              /* AI Same-Day Deduplication Notice */
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '0.925rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                        AI Duplicate Prevention Notice
                      </h3>
                      <span className="badge" style={{
                        background: duplicateNotice.duplicateType === 'SAME_PERSON_DUPLICATE' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 179, 8, 0.15)',
                        color: duplicateNotice.duplicateType === 'SAME_PERSON_DUPLICATE' ? '#3b82f6' : '#eab308',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }}>
                        {duplicateNotice.duplicateType === 'SAME_PERSON_DUPLICATE' ? 'Same-Day Follow-Up' : 'Shared Society Breakdown'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Filtered duplicate complaint on same day
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  marginBottom: '12px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                    Active Ticket Reference: #{duplicateNotice.matchedComplaintId}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                    {duplicateNotice.residentMessage || 'This issue has already been logged today. Your report has been merged into the active ticket.'}
                  </p>
                </div>

                <div style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '3px', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    AI Reasoning:
                  </div>
                  <div>{duplicateNotice.reasoning}</div>
                </div>

                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '0.75rem',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Bot size={14} />
                  <span>Queue duplication prevented: No redundant card created for committee.</span>
                </div>
              </div>
            ) : (
              /* Normal WhatsApp Confirmation Receipt */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: 'var(--radius-sm)',
                    background: '#15803d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <MessageSquare size={16} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.925rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
                      Automated WhatsApp Confirmation
                    </h3>
                    <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Instant receipt with SLA and vendor details
                    </span>
                  </div>
                </div>

                {recentTicket ? (
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-main)',
                    lineHeight: '1.45'
                  }}>
                    {recentTicket.whatsappDrafts.residentMsg}
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '30px 16px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.825rem'
                  }}>
                    Submit a complaint above or tap a sample scenario to view the instant automated WhatsApp acknowledgment.
                  </div>
                )}
              </>
            )}
          </div>

          {recentTicket && !duplicateNotice && (
            <div style={{
              marginTop: '14px',
              padding: '10px 12px',
              background: 'var(--accent-primary-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--accent-primary-border)',
              fontSize: '0.775rem'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '3px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Smart Triage Summary:</span>
                <span className="badge" style={{ fontSize: '0.68rem', padding: '1px 6px', background: 'var(--bg-main)' }}>
                  {recentTicket.langInfo?.badge || 'Hinglish'}
                </span>
              </div>
              <div>Category: <strong>{recentTicket.categoryData?.label || recentTicket.category}</strong></div>
              <div>Priority: <strong>{recentTicket.urgencyTier} ({recentTicket.urgencyScore}%)</strong></div>
              <div>Assigned Vendor: <strong>{recentTicket.assignedVendor?.name?.split(' (')[0]}</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* Section: My Flat's Complaint History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
            My Active Complaints & History ({myComplaints.length})
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Flat {flatNumber}
          </span>
        </div>

        {myComplaints.length === 0 ? (
          <div className="panel" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No complaints logged for Flat {flatNumber} yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {myComplaints.map(item => (
              <div key={item.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      #{item.id}
                    </span>
                    <span className="badge" style={{
                      background: item.categoryData.bgColor,
                      color: item.categoryData.color,
                      border: `1px solid ${item.categoryData.borderColor}`,
                      fontSize: '0.7rem'
                    }}>
                      {item.categoryData.label}
                    </span>
                    <span className={`badge badge-${item.urgencyTier.toLowerCase()}`} style={{ fontSize: '0.675rem' }}>
                      {item.urgencyTier}
                    </span>
                  </div>

                  <span className="badge badge-flat" style={{ fontSize: '0.725rem' }}>
                    {item.status === 'INBOX' ? 'Under Review' : item.status === 'DISPATCHED' ? 'Vendor Dispatched' : 'Resolved'}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', margin: '4px 0 2px' }}>
                  {item.aiSummary}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '6px' }}>
                  "{item.rawText}"
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                  <div>
                    Assigned: <strong style={{ color: 'var(--text-main)' }}>{item.assignedVendor?.name.split(' (')[0]}</strong> (ETA: {item.assignedVendor?.responseEta})
                  </div>
                  <div>
                    {formatTimeAgo(item.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
