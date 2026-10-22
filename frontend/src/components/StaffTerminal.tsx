import React, { useState, useEffect } from 'react';
import type { Counter, Ticket, QueueService } from '../types';
import { api } from '../services/api';
import { announceToken } from '../utils/audio';
import {
  UserCheck,
  CheckCircle2,
  SkipForward,
  Megaphone,
  Clock,
  Users,
  AlertCircle,
  Play
} from 'lucide-react';

interface StaffTerminalProps {
  counters: Counter[];
  services?: QueueService[];
  audioEnabled: boolean;
  onCounterUpdated: () => void;
}

export const StaffTerminal: React.FC<StaffTerminalProps> = ({
  counters,
  audioEnabled,
  onCounterUpdated,
}) => {
  const [selectedCounterId, setSelectedCounterId] = useState<number | null>(() => {
    return counters.length > 0 ? counters[0].id : null;
  });

  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [waitingQueue, setWaitingQueue] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceTimer, setServiceTimer] = useState<number>(0);

  // Sync selectedCounterId if not set
  useEffect(() => {
    if (counters.length > 0 && !selectedCounterId) {
      setSelectedCounterId(counters[0].id);
    }
  }, [counters, selectedCounterId]);

  const activeCounter = counters.find((c) => c.id === selectedCounterId);

  // Fetch waiting tickets and current active called ticket for this counter
  const fetchQueueData = async () => {
    if (!activeCounter?.service?.id) return;
    try {
      const waiting = await api.getWaitingTickets(activeCounter.service.id);
      setWaitingQueue(waiting);

      // Check live board to see if this counter has a current ticket
      const board = await api.getQueueBoard();
      const currentServing = board.nowServing.find((item) => item.counterId === activeCounter.id);
      if (!currentServing && currentTicket?.status === 'CALLED') {
        // Was finished elsewhere or reset
      }
    } catch (err) {
      console.error('Error fetching staff queue data:', err);
    }
  };

  useEffect(() => {
    fetchQueueData();
    const interval = setInterval(fetchQueueData, 3000);
    return () => clearInterval(interval);
  }, [activeCounter?.service?.id, activeCounter?.id]);

  // Elapsed timer when serving
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (currentTicket && currentTicket.status === 'CALLED') {
      setServiceTimer(0);
      timer = setInterval(() => {
        setServiceTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setServiceTimer(0);
    }
    return () => clearInterval(timer);
  }, [currentTicket]);

  const handleCallNext = async () => {
    if (!activeCounter || !activeCounter.service) {
      setError('Please select an active counter with an assigned service.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ticket = await api.callNext(activeCounter.service.id, activeCounter.id);
      setCurrentTicket(ticket);
      onCounterUpdated();
      fetchQueueData();

      // Announce token
      announceToken(ticket.tokenNumber, activeCounter.name, audioEnabled);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'No waiting tickets for this service.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!currentTicket) return;
    try {
      setLoading(true);
      setError(null);
      await api.completeTicket(currentTicket.id);
      setCurrentTicket(null);
      onCounterUpdated();
      fetchQueueData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to complete ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!currentTicket) return;
    try {
      setLoading(true);
      setError(null);
      await api.skipTicket(currentTicket.id);
      setCurrentTicket(null);
      onCounterUpdated();
      fetchQueueData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to skip ticket.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!currentTicket || !activeCounter) return;
    try {
      await api.recallTicket(currentTicket.id);
      announceToken(currentTicket.tokenNumber, activeCounter.name, audioEnabled);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Counter Selection Header */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)',
            }}
          >
            <UserCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem' }}>Staff Counter Terminal</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Operate your assigned desk, call the next ticket, and mark services as completed.
            </p>
          </div>
        </div>

        {/* Counter Dropdown Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <label className="form-label">Active Counter Desk</label>
            <select
              className="form-select"
              value={selectedCounterId || ''}
              onChange={(e) => {
                setSelectedCounterId(Number(e.target.value));
                setCurrentTicket(null);
              }}
              style={{ minWidth: '240px' }}
            >
              {counters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.service?.name || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: 'right', marginTop: '1.25rem' }}>
            <span
              className={`badge ${
                activeCounter?.status === 'BUSY'
                  ? 'badge-waiting'
                  : activeCounter?.status === 'AVAILABLE'
                  ? 'badge-called'
                  : 'badge-skipped'
              }`}
            >
              {activeCounter?.status || 'AVAILABLE'}
            </span>
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

      {/* Main Grid: Counter Operations Card & Waiting List */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '2rem' }}>
        
        {/* Left: Active Ticket Serving Terminal */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Desk Assignment
              </span>
              <h3 style={{ fontSize: '1.25rem', color: '#ffffff' }}>{activeCounter?.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#38bdf8' }}>
                Assigned Service: {activeCounter?.service?.name || 'All Services'}
              </p>
            </div>

            {/* Call Next Button */}
            <button
              className="btn btn-success btn-lg"
              onClick={handleCallNext}
              disabled={loading || waitingQueue.length === 0}
              style={{
                boxShadow: waitingQueue.length > 0 ? '0 0 25px rgba(16, 185, 129, 0.4)' : 'none',
              }}
            >
              <Play size={18} />
              <span>Call Next Customer</span>
            </button>
          </div>

          {/* Currently Serving Display */}
          {currentTicket ? (
            <div
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
                border: '2px solid rgba(16, 185, 129, 0.4)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-glow-called)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span className="badge badge-called">NOW SERVING AT THIS COUNTER</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
                  <Clock size={16} />
                  <span>Time at Desk: {formatTimer(serviceTimer)}</span>
                </div>
              </div>

              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '4.5rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '0.05em',
                  textShadow: '0 0 35px rgba(16, 185, 129, 0.6)',
                  lineHeight: 1,
                  margin: '1rem 0',
                }}
              >
                {currentTicket.tokenNumber}
              </div>

              <div style={{ fontSize: '1.05rem', color: '#e2e8f0', marginBottom: '0.35rem' }}>
                Customer: <strong>{currentTicket.user?.name || 'Visitor'}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.75rem' }}>
                Email: {currentTicket.user?.email} | Priority: <strong>{currentTicket.priority}</strong>
              </div>

              {/* Action Buttons for current ticket */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                <button
                  className="btn btn-success"
                  onClick={handleComplete}
                  disabled={loading}
                >
                  <CheckCircle2 size={18} />
                  <span>Complete Service</span>
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleRecall}
                  disabled={loading}
                  title="Play audio chime and re-announce token"
                >
                  <Megaphone size={18} />
                  <span>Re-Announce</span>
                </button>

                <button
                  className="btn btn-danger"
                  onClick={handleSkip}
                  disabled={loading}
                >
                  <SkipForward size={18} />
                  <span>Skip Customer</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                padding: '3rem 2rem',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px dashed var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                <Users size={48} strokeWidth={1.5} />
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>Desk is Currently Idle</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                {waitingQueue.length > 0
                  ? `There are currently ${waitingQueue.length} customers in the queue waiting for this service.`
                  : 'No customers are currently in the queue for this service.'}
              </p>

              {waitingQueue.length > 0 && (
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleCallNext}
                  disabled={loading}
                >
                  <Play size={18} />
                  <span>Call Next Token ({waitingQueue[0].tokenNumber})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Waiting Queue for this Counter's Service */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Waiting Line</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Next in line for {activeCounter?.service?.name || 'this service'}
              </p>
            </div>

            <span className="badge badge-waiting">
              {waitingQueue.length} Waiting
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', maxHeight: '480px' }}>
            {waitingQueue.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No waiting tokens in line
              </div>
            ) : (
              waitingQueue.map((ticket, idx) => (
                <div
                  key={ticket.id}
                  style={{
                    padding: '0.9rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    background: idx === 0 ? 'rgba(99, 102, 241, 0.12)' : 'rgba(30, 41, 59, 0.4)',
                    border: idx === 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#cbd5e1',
                      }}
                    >
                      #{idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                        {ticket.tokenNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {ticket.user?.name || 'Visitor'}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {ticket.priority !== 'NORMAL' ? (
                      <span className="badge badge-skipped" style={{ fontSize: '0.65rem' }}>
                        {ticket.priority}
                      </span>
                    ) : (
                      <span className="badge badge-waiting" style={{ fontSize: '0.65rem' }}>
                        Waiting
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
