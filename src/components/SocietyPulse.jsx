import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Droplets,
  ArrowUpDown,
  Car,
  Wrench,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIES } from '../data/societyData';

export default function SocietyPulse({ complaints, clusters }) {
  const categoryCounts = {};
  Object.keys(CATEGORIES).forEach(k => categoryCounts[k] = 0);
  complaints.forEach(c => {
    if (categoryCounts[c.category] !== undefined) {
      categoryCounts[c.category]++;
    }
  });

  const wingACount = complaints.filter(c => c.location?.wing === 'A').length;
  const wingBCount = complaints.filter(c => c.location?.wing === 'B').length;

  const hinglishCount = complaints.filter(c => c.langInfo?.isHinglish).length;
  const englishCount = complaints.length - hinglishCount;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 700, color: 'var(--text-main)' }}>
          Society Operations Analytics & Recurring Hotspots
        </h2>
        <p style={{ margin: 0, fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Root-cause trends and maintenance diagnostics for committee management
        </p>
      </div>

      {/* Top Value Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div className="panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Clock size={14} />
            <span>Volunteer Committee Time Saved</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
            3.5 Hours <span style={{ fontSize: '0.825rem', color: 'var(--accent-success-text)', fontWeight: 600 }}>Saved Today</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Automated entity parsing and deduplicated clusters reduced manual WhatsApp coordination time.
          </p>
        </div>

        <div className="panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <ShieldCheck size={14} />
            <span>Critical Emergency SLA</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
            4 Minutes <span style={{ fontSize: '0.825rem', color: 'var(--accent-info-text)', fontWeight: 600 }}>Average Dispatch</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Elevator entrapments and electrical hazards highlighted immediately for instant technician callout.
          </p>
        </div>

        <div className="panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.775rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <TrendingUp size={14} />
            <span>Multilingual Parse Rate</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '6px', color: 'var(--text-main)' }}>
            96.8% <span style={{ fontSize: '0.825rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Accuracy</span>
          </div>
          <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
            Successfully mapped flat numbers and urgency from mixed English and Hindi messages.
          </p>
        </div>
      </div>

      {/* Chronic Issue Warnings */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-main)' }}>
          <AlertTriangle size={15} color="var(--accent-warning-text)" />
          <span>Active Maintenance Hotspots</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Lift AMC */}
          <div className="panel" style={{
            padding: '14px 16px',
            borderLeft: '3px solid var(--accent-emergency)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                Elevator Sensor Breakdown: Wing B (Lift-1)
              </div>
              <span className="badge badge-critical">3 Failures This Month</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 6px 0' }}>
              Lift-1 door sensor reported 3 failures in 14 days. 
              <strong> Recommendation:</strong> Invoke Otis AMC Contract clause for car door sensor replacement and apply service credit.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Assigned AMC: Otis Express Tech (+91 98334 55667)
            </div>
          </div>

          {/* Water Pressure */}
          <div className="panel" style={{
            padding: '14px 16px',
            borderLeft: '3px solid var(--accent-info)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                Municipal Water Pressure Drop: Wing B
              </div>
              <span className="badge" style={{ background: 'var(--accent-info-subtle)', color: 'var(--accent-info-text)' }}>4 Flats Impacted</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 6px 0' }}>
              Flats B-201, B-303, B-402, and B-504 report supply drops between 7:30 AM - 8:30 AM on weekday mornings.
              <strong> Recommendation:</strong> Set automated booster pump to activate at 6:45 AM.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Assigned Plumber: Ramesh Kumar (+91 98201 11223)
            </div>
          </div>

          {/* Parking Encroachment */}
          <div className="panel" style={{
            padding: '14px 16px',
            borderLeft: '3px solid var(--accent-warning)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                Parking Obstruction at Slot P-14 (Wing A)
              </div>
              <span className="badge badge-high">Repeat Incident</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: '4px 0 6px 0' }}>
              Silver Swift vehicle continues to obstruct slot P-14 allotted to Flat A-102.
              <strong> Recommendation:</strong> Instruct Gate 1 security guard Ramu to enforce parking penalty notice.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Domain Breakdown and Wing Distribution */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '14px'
      }}>
        <div className="panel" style={{ padding: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)' }}>
            Category Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(CATEGORIES).map(([key, cat]) => {
              const count = categoryCounts[key] || 0;
              const percent = complaints.length > 0 ? Math.round((count / complaints.length) * 100) : 0;
              return (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', marginBottom: '3px' }}>
                    <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{cat.label}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} ({percent}%)</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: cat.color, borderRadius: '3px' }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>
              Wing Distribution (100 Flats Total)
            </h4>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <div style={{ flex: 1, background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Wing A (50 Flats)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{wingACount}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)' }}>Complaints</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Wing B (50 Flats)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>{wingBCount}</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--accent-warning-text)' }}>Water Outage Impact</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Language Distribution:
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
              <span className="badge badge-lang">
                Hinglish / Hindi: {hinglishCount} ({Math.round((hinglishCount / complaints.length) * 100 || 0)}%)
              </span>
              <span className="badge badge-lang">
                English: {englishCount} ({Math.round((englishCount / complaints.length) * 100 || 0)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
