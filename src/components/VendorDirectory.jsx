import React from 'react';
import { 
  Phone, 
  Share2, 
  Star, 
  Wrench, 
  Droplets,
  ArrowUpDown,
  Car,
  Sparkles,
  Zap,
  ShieldAlert,
  KeyRound,
  Layers
} from 'lucide-react';
import { SOCIETY_INFO } from '../data/societyData';

export default function VendorDirectory({ showToast }) {
  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'water': return <Droplets size={16} color="var(--accent-info-text)" />;
      case 'lift': return <ArrowUpDown size={16} color="var(--accent-emergency-text)" />;
      case 'lift-parking': return <Layers size={16} color="var(--accent-info-text)" />;
      case 'parking': return <Car size={16} color="var(--accent-warning-text)" />;
      case 'locksmith': return <KeyRound size={16} color="var(--accent-warning-text)" />;
      case 'cleaning': return <Sparkles size={16} color="var(--accent-success-text)" />;
      case 'electrical': return <Zap size={16} color="var(--accent-warning-text)" />;
      case 'security': return <ShieldAlert size={16} color="var(--accent-emergency-text)" />;
      default: return <Wrench size={16} />;
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
          Approved Vendors & AMC Contacts
        </h2>
        <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Emergency contacts and authorized maintenance personnel for Gokuldham Heights CHS (100 Flats)
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '14px'
      }}>
        {SOCIETY_INFO.vendors.map(vendor => (
          <div 
            key={vendor.id}
            className="panel"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getCategoryIcon(vendor.category)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                      {vendor.name}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {vendor.trade}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  background: 'var(--bg-subtle)',
                  padding: '2px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <Star size={10} fill="currentColor" color="var(--accent-warning-text)" />
                  <span>{vendor.rating}</span>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-subtle)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.775rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                marginTop: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <strong style={{ color: 'var(--accent-success-text)' }}>{vendor.status}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Response ETA:</span>
                  <span style={{ color: 'var(--text-main)' }}>{vendor.responseEta}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <span style={{ fontFamily: 'monospace', color: 'var(--accent-info-text)' }}>{vendor.phone}</span>
                </div>
                {vendor.specialization && (
                  <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border-subtle)', fontSize: '0.725rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Services: </span>
                    <span>{vendor.specialization}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => window.open(`tel:${vendor.phone}`, '_self')}
                style={{ flex: 1, padding: '6px' }}
              >
                <Phone size={11} />
                <span>Call</span>
              </button>

              <button 
                className="btn btn-whatsapp btn-sm"
                onClick={() => {
                  const url = `https://wa.me/${vendor.phone.replace(/[^0-9]/g, '')}?text=Namaste%20from%20Gokuldham%20RWA%20Committee`;
                  window.open(url, '_blank');
                }}
                style={{ flex: 1, padding: '6px' }}
              >
                <Share2 size={11} />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
