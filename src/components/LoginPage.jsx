import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  User, 
  ArrowRight, 
  KeyRound, 
  Check, 
  Phone, 
  Sun, 
  Moon, 
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  SOCIETY_INFO, 
  isValidFlatNumber, 
  getFlatValidation,
  isValidContactNumber,
  getContactNumberValidation
} from '../data/societyData';

export default function LoginPage({ onLogin, theme, setTheme }) {
  const [selectedRole, setSelectedRole] = useState('committee'); // 'committee' | 'resident'

  // Committee form state
  const [selectedMemberId, setSelectedMemberId] = useState(SOCIETY_INFO.committeeMembers[0].id);
  const [committeePin, setCommitteePin] = useState('');

  // Resident form state
  const [wing, setWing] = useState('B');
  const [flatNum, setFlatNum] = useState('');
  const [residentName, setResidentName] = useState('');
  const [residentPhone, setResidentPhone] = useState('');
  const [flatSubmitted, setFlatSubmitted] = useState(false);

  const flatValidation = getFlatValidation(flatNum);
  const phoneValidation = getContactNumberValidation(residentPhone);

  const handlePhoneChange = (e) => {
    let raw = e.target.value;
    let digits = raw.replace(/\D/g, '');

    // If pasted with leading 91 (e.g. 919820111223), strip country code
    if (digits.startsWith('91') && digits.length === 12) {
      digits = digits.slice(2);
    }

    // Strictly limit to 11 digits max
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }

    setResidentPhone(digits);
  };

  const handleCommitteeSubmit = (e) => {
    e?.preventDefault();
    const member = SOCIETY_INFO.committeeMembers.find(m => m.id === selectedMemberId) || SOCIETY_INFO.committeeMembers[0];
    onLogin({
      role: 'committee',
      id: member.id,
      name: member.name,
      title: member.role,
      flat: member.flat,
      phone: member.phone
    });
  };

  const handleResidentSubmit = (e) => {
    e?.preventDefault();
    setFlatSubmitted(true);
    const cleanNum = flatNum.trim();
    const validation = getFlatValidation(cleanNum);
    if (!validation.isValid) {
      return;
    }
    const phoneVal = getContactNumberValidation(residentPhone);
    if (!phoneVal.isEmpty && !phoneVal.isValid) {
      return;
    }
    const fullFlat = `${wing}-${cleanNum}`;
    onLogin({
      role: 'resident',
      name: residentName.trim() || `Resident ${fullFlat}`,
      flat: fullFlat,
      wing,
      phone: phoneVal.formatted || (residentPhone.trim() ? `+91 ${residentPhone.trim()}` : '+91 98200 11999')
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      background: 'var(--bg-app)'
    }}>
      {/* Top Society Brand & Theme Bar */}
      <div style={{
        width: '100%',
        maxWidth: '540px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              NiwasSetu
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {SOCIETY_INFO.name} • 100 Flats RWA
            </div>
          </div>
        </div>

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          style={{ padding: '6px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="panel" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '28px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
            Select Portal Access
          </h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Choose whether you are entering as a resident or society committee volunteer
          </p>
        </div>

        {/* Role Segment Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          background: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)'
        }}>
          {/* Committee tab */}
          <button
            id="role-committee-tab"
            type="button"
            onClick={() => setSelectedRole('committee')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedRole === 'committee' ? 'var(--bg-surface)' : 'transparent',
              color: selectedRole === 'committee' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: selectedRole === 'committee' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Shield size={16} color={selectedRole === 'committee' ? 'var(--accent-primary)' : 'currentColor'} />
            <span>Building Committee</span>
          </button>

          {/* Resident tab */}
          <button
            id="role-resident-tab"
            type="button"
            onClick={() => setSelectedRole('resident')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: selectedRole === 'resident' ? 'var(--bg-surface)' : 'transparent',
              color: selectedRole === 'resident' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: selectedRole === 'resident' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} color={selectedRole === 'resident' ? 'var(--accent-primary)' : 'currentColor'} />
            <span>Flat Resident</span>
          </button>
        </div>

        {/* ROLE 1: Building Committee Login View */}
        {selectedRole === 'committee' && (
          <form onSubmit={handleCommitteeSubmit}>
            <div style={{
              background: 'var(--accent-primary-subtle)',
              border: '1px solid var(--accent-primary-border)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '18px'
            }}>
              <strong style={{ color: 'var(--accent-primary)', display: 'block', marginBottom: '2px' }}>
                Managing Committee Access:
              </strong>
              Access 2-minute rapid triage, duplicate cluster resolution, vendor dispatch, and society pulse diagnostics.
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Select Committee Official:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SOCIETY_INFO.committeeMembers.map(member => (
                  <label
                    key={member.id}
                    onClick={() => setSelectedMemberId(member.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      border: selectedMemberId === member.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      background: selectedMemberId === member.id ? 'var(--bg-subtle)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.12s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="radio" 
                        name="committee_member" 
                        checked={selectedMemberId === member.id}
                        onChange={() => setSelectedMemberId(member.id)}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {member.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {member.role} • Flat {member.flat}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-flat" style={{ fontSize: '0.7rem' }}>
                      {member.flat}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Volunteer Passcode (Optional for demo):
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Default: 1234
                </span>
              </div>
              <input 
                type="password"
                className="input-field"
                placeholder="Enter 4-digit passcode or proceed"
                value={committeePin}
                onChange={e => setCommitteePin(e.target.value)}
                style={{ fontSize: '0.875rem' }}
              />
            </div>

            <button 
              id="committee-login-btn"
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', fontWeight: 700 }}
            >
              <span>Enter Committee Triage Desk</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* ROLE 2: Flat Resident Login View */}
        {selectedRole === 'resident' && (
          <form onSubmit={handleResidentSubmit}>
            <div style={{
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 14px',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              marginBottom: '18px'
            }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '2px' }}>
                Resident Self-Service Portal:
              </strong>
              Submit complaints in Hinglish/English, track ticket status, and access emergency vendor contacts.
            </div>

            {/* Flat & Resident Details Input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Flat Identification:
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Wing:
                  </label>
                  <select 
                    className="input-field" 
                    value={wing} 
                    onChange={e => setWing(e.target.value)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    <option value="A">Wing A</option>
                    <option value="B">Wing B</option>
                  </select>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Flat Number (101-510):
                    </label>
                    <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                      Floors 1-5 • Units 01-10
                    </span>
                  </div>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="e.g. 101, 204, 402, 510"
                    value={flatNum}
                    onChange={e => {
                      setFlatNum(e.target.value);
                      if (flatSubmitted) setFlatSubmitted(false);
                    }}
                    style={{
                      borderColor: (!flatValidation.isValid && (flatNum.trim().length > 0 || flatSubmitted))
                        ? 'var(--accent-emergency)'
                        : (flatValidation.isValid ? 'var(--accent-success)' : undefined),
                      boxShadow: (!flatValidation.isValid && (flatNum.trim().length > 0 || flatSubmitted))
                        ? '0 0 0 1px var(--accent-emergency)'
                        : undefined
                    }}
                    required
                  />

                  {/* Immediate Validation Error Message */}
                  {!flatValidation.isValid && (flatNum.trim().length > 0 || flatSubmitted) && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      color: 'var(--accent-emergency-text)',
                      background: 'var(--accent-emergency-subtle)',
                      border: '1px solid var(--accent-emergency-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '6px 8px',
                      fontSize: '0.725rem',
                      marginTop: '6px',
                      lineHeight: 1.35
                    }}>
                      <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{flatValidation.message}</span>
                    </div>
                  )}

                  {/* Verified Flat Confirmation */}
                  {flatValidation.isValid && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--accent-success-text)',
                      background: 'var(--accent-success-subtle)',
                      border: '1px solid var(--accent-success-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '5px 8px',
                      fontSize: '0.725rem',
                      marginTop: '6px'
                    }}>
                      <CheckCircle2 size={13} style={{ flexShrink: 0 }} />
                      <span>{flatValidation.message} in Wing {wing}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Your Name (Optional):
                  </label>
                  <input 
                    type="text"
                    className="input-field"
                    placeholder="e.g. Rohit Mehta"
                    value={residentName}
                    onChange={e => setResidentName(e.target.value)}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Contact Number:
                    </label>
                    <span style={{ 
                      fontSize: '0.7rem', 
                      fontWeight: 600,
                      color: phoneValidation.isEmpty 
                        ? 'var(--text-muted)' 
                        : (phoneValidation.isValid ? 'var(--accent-success-text)' : 'var(--accent-emergency-text)')
                    }}>
                      {phoneValidation.digitsCount > 0 
                        ? `${phoneValidation.digitsCount}/11 digits ${phoneValidation.isValid ? '✓' : '(Must be 10–11)'}` 
                        : '10–11 digits max'}
                    </span>
                  </div>
                  <input 
                    id="resident-phone-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    className="input-field"
                    placeholder="e.g. 9820111223 or 02228451234"
                    value={residentPhone}
                    onChange={handlePhoneChange}
                    style={{
                      borderColor: !phoneValidation.isEmpty && !phoneValidation.isValid 
                        ? 'var(--accent-emergency)' 
                        : undefined
                    }}
                  />
                  {!phoneValidation.isEmpty && !phoneValidation.isValid && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-emergency-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertCircle size={11} />
                      <span>{phoneValidation.message}</span>
                    </div>
                  )}
                  {!phoneValidation.isEmpty && phoneValidation.isValid && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--accent-success-text)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={11} />
                      <span>{phoneValidation.message}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(() => {
              const isPhoneValidForSubmit = phoneValidation.isEmpty || phoneValidation.isValid;
              const isResidentFormValid = flatValidation.isValid && isPhoneValidForSubmit;

              let buttonLabel = `Enter Resident Portal (${wing}-${flatNum.trim()})`;
              if (!flatNum.trim()) {
                buttonLabel = 'Enter Flat Number (101 - 510)';
              } else if (!flatValidation.isValid) {
                buttonLabel = `Invalid Room (${flatNum.trim()}) — Allowed 101 to 510`;
              } else if (!isPhoneValidForSubmit) {
                buttonLabel = `Invalid Contact (${phoneValidation.digitsCount}/10 digits) — Enter 10 or 11 Digits`;
              }

              return (
                <button 
                  id="resident-login-btn"
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ 
                    width: '100%', 
                    fontWeight: 700,
                    opacity: isResidentFormValid ? 1 : 0.55,
                    cursor: isResidentFormValid ? 'pointer' : 'not-allowed'
                  }}
                  disabled={!isResidentFormValid}
                  title={isResidentFormValid ? 'Enter Resident Portal' : 'Please check flat number (101-510) and contact number (10-11 digits)'}
                >
                  <span>{buttonLabel}</span>
                  <ArrowRight size={16} />
                </button>
              );
            })()}
          </form>
        )}
      </div>

      {/* Security notice footer */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        Gokuldham Heights Co-operative Housing Society Ltd. • Sector 14, Navi Mumbai
      </div>
    </div>
  );
}
