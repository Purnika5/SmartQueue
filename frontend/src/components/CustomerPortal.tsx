import React, { useState, useEffect, useRef } from 'react';
import type { QueueService, Ticket, TicketStatusResponse } from '../types';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  FileText,
  CreditCard,
  Receipt,
  GraduationCap,
  Clock,
  AlertCircle,
  RefreshCw,
  Printer,
  User,
  Zap,
  ArrowRight,
  Sparkles,
  Bot
} from 'lucide-react';

interface CustomerPortalProps {
  services: QueueService[];
  onTokenGenerated?: (ticket: Ticket) => void;
  audioEnabled?: boolean;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ services, onTokenGenerated }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Assistant Search State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState<{ name: string; wait: number; note: string } | null>(null);
  const [aiSearching, setAiSearching] = useState(false);

  // Active Ticket state
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(() => {
    const saved = localStorage.getItem('smartqueue_active_ticket');
    return saved ? JSON.parse(saved) : null;
  });
  const [ticketStatus, setTicketStatus] = useState<TicketStatusResponse | null>(null);
  const [userHistory, setUserHistory] = useState<Ticket[]>([]);

  const previousStatusRef = useRef<string | null>(null);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setAiSearching(true);
    try {
      const res = await api.askAiCopilot({ message: aiPrompt });
      if (res.recommendedServiceId) {
        setSelectedServiceId(res.recommendedServiceId);
        setAiRecommendation({
          name: res.recommendedServiceName || 'Recommended Service',
          wait: res.estimatedWaitMinutes,
          note: res.reply.replace(/###/g, '').split('\n')[0].trim(),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiSearching(false);
    }
  };

  // Auto-select first service if none selected
  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  // Save active ticket to localStorage
  useEffect(() => {
    if (activeTicket) {
      localStorage.setItem('smartqueue_active_ticket', JSON.stringify(activeTicket));
    } else {
      localStorage.removeItem('smartqueue_active_ticket');
    }
  }, [activeTicket]);

  // Poll active ticket status
  useEffect(() => {
    if (!activeTicket) return;

    const fetchStatus = async () => {
      try {
        const statusData = await api.getTicketStatus(activeTicket.id);
        setTicketStatus(statusData);

        // Check if status transitioned to CALLED
        if (
          previousStatusRef.current === 'WAITING' &&
          statusData.ticket.status === 'CALLED'
        ) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        previousStatusRef.current = statusData.ticket.status;
      } catch (err) {
        console.error('Error polling ticket status:', err);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [activeTicket]);

  // Fetch user history if user email/id available
  useEffect(() => {
    if (activeTicket?.user?.id) {
      api.getUserTickets(activeTicket.user.id)
        .then(setUserHistory)
        .catch(console.error);
    }
  }, [activeTicket]);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId) {
      setError('Please select a service first.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ticket = await api.joinQueue({
        serviceId: selectedServiceId,
        userName: userName.trim() || 'Visitor',
        userEmail: userEmail.trim() || `guest_${Date.now()}@smartqueue.com`,
        priority,
      });

      setActiveTicket(ticket);
      previousStatusRef.current = ticket.status;
      onTokenGenerated?.(ticket);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate token.');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('bonafide') || lower.includes('certificate')) return <FileText size={24} color="#6366f1" />;
    if (lower.includes('id') || lower.includes('card')) return <CreditCard size={24} color="#06b6d4" />;
    if (lower.includes('fee') || lower.includes('pay') || lower.includes('account')) return <Receipt size={24} color="#10b981" />;
    return <GraduationCap size={24} color="#8b5cf6" />;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Welcome Banner */}
      <div
        className="glass-panel"
        style={{
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className="pulse-dot"></span>
            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Active Online Kiosk</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.4rem' }}>Digital Queue Service</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '640px' }}>
            Select your required college or office service, obtain an instant digital token, and track your live queue position without waiting in line.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#06b6d4', fontFamily: 'var(--font-display)' }}>
              {services.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Services</div>
          </div>

          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-display)' }}>
              ~6 min
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Wait Time</div>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--status-skipped-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Side (Token Form / Active Pass) & Right Side (Service Details) */}
      <div style={{ display: 'grid', gridTemplateColumns: activeTicket ? '1.2fr 1fr' : '1.4fr 1fr', gap: '2rem' }}>
        
        {/* Active Ticket Card View */}
        {activeTicket ? (
          <div className="token-card" style={{ padding: '2.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a5b4fc', fontWeight: 700 }}>
                  SmartQueue Digital Pass
                </span>
                <h3 style={{ fontSize: '1.35rem', marginTop: '2px' }}>
                  {ticketStatus?.serviceName || activeTicket.service?.name}
                </h3>
              </div>

              <span className={`badge badge-${(ticketStatus?.status || activeTicket.status).toLowerCase()}`}>
                {ticketStatus?.status || activeTicket.status}
              </span>
            </div>

            {/* Token Hero Section */}
            <div
              style={{
                textAlign: 'center',
                padding: '2rem 1.5rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '1.75rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                YOUR TOKEN NUMBER
              </div>
              <div className="token-number-hero">{activeTicket.tokenNumber}</div>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                Holder: <strong style={{ color: '#ffffff' }}>{activeTicket.user?.name || 'Visitor'}</strong>
              </div>
            </div>

            {/* Live Queue Status Information */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <User size={14} color="#06b6d4" />
                  <span>Queue Position</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#ffffff' }}>
                  {ticketStatus?.status === 'CALLED'
                    ? 'Now Serving!'
                    : ticketStatus?.status === 'COMPLETED'
                    ? 'Completed'
                    : `${ticketStatus?.positionAhead || 0} Ahead`}
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} color="#f59e0b" />
                  <span>Estimated Wait</span>
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#f59e0b' }}>
                  {ticketStatus?.status === 'CALLED'
                    ? 'Immediate'
                    : ticketStatus?.status === 'COMPLETED'
                    ? '0 min'
                    : `~${ticketStatus?.estimatedWaitMinutes || 5} min`}
                </div>
              </div>
            </div>

            {/* Counter Call Banner */}
            {ticketStatus?.status === 'CALLED' && (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '2px solid #10b981',
                  marginBottom: '1.75rem',
                  textAlign: 'center',
                  animation: 'pulse 2s infinite',
                }}
              >
                <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>
                  YOUR TURN HAS ARRIVED!
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
                  Please proceed to {ticketStatus.counterName || 'Counter'}
                </div>
              </div>
            )}

            {/* Ticket Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-secondary" onClick={handlePrint} style={{ flex: 1 }}>
                <Printer size={16} />
                <span>Print Token</span>
              </button>

              <button
                className="btn btn-secondary"
                onClick={() => {
                  if (activeTicket) {
                    api.getTicketStatus(activeTicket.id).then(setTicketStatus);
                  }
                }}
                style={{ flex: 1 }}
              >
                <RefreshCw size={16} />
                <span>Refresh Status</span>
              </button>

              <button
                className="btn btn-primary"
                onClick={() => setActiveTicket(null)}
                style={{ width: '100%' }}
              >
                <span>Join Another Service Queue</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Join Queue Form View */
          <div className="glass-panel">
            <h2 style={{ fontSize: '1.45rem', marginBottom: '0.5rem' }}>Get Your Digital Token</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
              Enter your details and select a service to immediately reserve your slot.
            </p>

            <form onSubmit={handleJoinQueue}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Alex Johnson"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email or Student ID</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. alex@college.edu"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Priority Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {(['NORMAL', 'HIGH', 'URGENT'] as const).map((p) => (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPriority(p)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        background: priority === p ? 'rgba(99, 102, 241, 0.25)' : 'rgba(15, 23, 42, 0.8)',
                        border: priority === p ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                        color: priority === p ? '#ffffff' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {p === 'NORMAL' ? 'Standard' : p === 'HIGH' ? 'Senior / Medical' : 'Urgent'}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Smart Service Finder */}
              <div
                style={{
                  margin: '1.25rem 0',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#c084fc', fontSize: '0.82rem', fontWeight: 700 }}>
                  <Sparkles size={14} />
                  <span>AI Smart Service Finder:</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.55rem 0.85rem', fontSize: '0.85rem' }}
                    placeholder="Describe what you need (e.g. 'Bonafide for passport' or 'Pay exam fee')..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: '0.55rem 1rem', fontSize: '0.82rem', flexShrink: 0 }}
                    onClick={handleAiSearch}
                    disabled={aiSearching || !aiPrompt.trim()}
                  >
                    {aiSearching ? 'Analyzing...' : 'Ask AI'}
                  </button>
                </div>

                {aiRecommendation && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#a7f3d0',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Bot size={16} color="#34d399" />
                    <span>
                      Selected <strong>{aiRecommendation.name}</strong> (~{aiRecommendation.wait} min wait) — {aiRecommendation.note}
                    </span>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Choose Service</label>
                <div className="service-grid">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className={`service-card ${selectedServiceId === s.id ? 'selected' : ''}`}
                      onClick={() => setSelectedServiceId(s.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getServiceIcon(s.name)}
                        </div>
                        <div style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8' }}>
                          <Clock size={12} />
                          <span>~{s.averageServiceTime} min</span>
                        </div>
                      </div>

                      <h4 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{s.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1, lineHeight: 1.4 }}>
                        {s.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '1.75rem' }}
                disabled={loading}
              >
                {loading ? (
                  <span>Generating Digital Token...</span>
                ) : (
                  <>
                    <Zap size={18} />
                    <span>Generate Digital Token</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Right Side: How it works & Service Overview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>How SmartQueue Works</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Join the Digital Queue</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Pick your service category and instantly receive a uniquely numbered token.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>AI-Estimated Wait Time</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Track live queue movement and know exactly when your turn approaches.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', marginBottom: '2px' }}>Proceed to Assigned Counter</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    When staff calls your token, your screen will alert you with the assigned counter number.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Info */}
          <div
            className="glass-panel"
            style={{
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: '#e2e8f0' }}>Important Notice</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Please keep your browser tab open or note your token number. Voice announcements are broadcast automatically through the waiting hall screens.
            </p>
          </div>

          {userHistory.length > 0 && (
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', color: '#cbd5e1' }}>Your Recent Tokens</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {userHistory.slice(0, 4).map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.4rem 0.6rem', borderRadius: 6, background: 'rgba(15, 23, 42, 0.6)' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff' }}>{t.tokenNumber}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.service?.name}</span>
                    <span className={`badge badge-${t.status.toLowerCase()}`} style={{ fontSize: '0.62rem' }}>{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
