import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  Cpu, 
  Bot, 
  X,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react';
import { testAIConnectionApi } from '../services/api';

export default function AIStatusModal({
  isOpen,
  onClose,
  aiStatus,
  onRefreshAI,
  showToast
}) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  if (!isOpen) return null;

  const handleTestAI = async () => {
    setTesting(true);
    setTestError(null);
    try {
      const res = await testAIConnectionApi();
      setTestResult(res.data?.reply || 'AI connection successful!');
      showToast?.('Gemini AI answered successfully!');
    } catch (err) {
      setTestError(err.message || 'AI request failed');
      showToast?.('AI test failed: ' + err.message);
    } finally {
      setTesting(false);
    }
  };

  const isReady = aiStatus?.isReady || aiStatus?.isConfigured;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '580px', width: '92%' }}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: isReady ? 'rgba(99, 102, 241, 0.15)' : 'var(--accent-warning-subtle)',
              border: `1px solid ${isReady ? 'rgba(99, 102, 241, 0.35)' : 'var(--accent-warning-border)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isReady ? '#818cf8' : 'var(--accent-warning-text)'
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Google Gemini AI Model
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Next-Gen Society Intelligence & Triage Engine
              </p>
            </div>
          </div>

          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Current Connection Status Card */}
        <div style={{
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: isReady ? 'rgba(99, 102, 241, 0.08)' : 'var(--accent-warning-subtle)',
          border: `1px solid ${isReady ? 'rgba(99, 102, 241, 0.25)' : 'var(--accent-warning-border)'}`,
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isReady ? (
                <CheckCircle2 size={18} color="#22c55e" />
              ) : (
                <AlertTriangle size={18} color="var(--accent-warning-text)" />
              )}
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                {isReady 
                  ? 'Model Integrated & Connected' 
                  : 'AI Key Awaiting Setup'}
              </span>
            </div>
            <span className="badge" style={{
              background: isReady ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)',
              color: isReady ? '#22c55e' : '#eab308',
              border: `1px solid ${isReady ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              {isReady ? 'ACTIVE' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Provider</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>Google AI</div>
            </div>
            <div style={{ background: 'var(--bg-main)', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Model</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginTop: '2px' }}>
                {aiStatus?.model || 'gemini-3.5-flash'}
              </div>
            </div>
          </div>
        </div>

        {/* Live Test Console */}
        <div style={{
          background: 'var(--bg-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          border: '1px solid var(--border-subtle)',
          marginBottom: '18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot size={16} color="#818cf8" />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>Live Model Ping Test</span>
            </div>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleTestAI}
              disabled={testing || !isReady}
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                padding: '6px 12px'
              }}
            >
              {testing ? <RefreshCw size={12} className="spin-animation" /> : <Zap size={12} />}
              <span>{testing ? 'Contacting Model...' : 'Test AI Ping'}</span>
            </button>
          </div>

          {testResult ? (
            <div style={{
              background: 'var(--bg-main)',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              marginTop: '10px'
            }}>
              <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Check size={12} /> Gemini Response Received:
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5, fontStyle: 'italic' }}>
                "{testResult}"
              </p>
            </div>
          ) : testError ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.8rem',
              marginTop: '10px'
            }}>
              Error: {testError}
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Click <strong>Test AI Ping</strong> to send a real-time prompt to your integrated Gemini model and verify live response latency.
            </p>
          )}
        </div>

        {/* Ready for Training / Next Phase Notice */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '14px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#3b82f6', fontWeight: 600, fontSize: '0.82rem', marginBottom: '4px' }}>
            <Cpu size={14} /> Next Phase: Prompt Training & Custom Rules
          </div>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            The raw Gemini model is integrated. In the next step, we will train/configure it with society domain rules: Hinglish parsing, critical risk detection, automated vendor matching, and resident updates.
          </p>
        </div>

        {/* Modal Footer Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px'
        }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
