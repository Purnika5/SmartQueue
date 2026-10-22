import React, { useState, useEffect, useRef } from 'react';
import type { QueueBoardResponse, Counter } from '../types';
import { api } from '../services/api';
import { announceToken } from '../utils/audio';
import {
  Maximize2,
  Minimize2,
  Clock,
  Radio,
  Users,
  Sparkles
} from 'lucide-react';

interface LiveDisplayBoardProps {
  counters: Counter[];
  audioEnabled: boolean;
}

export const LiveDisplayBoard: React.FC<LiveDisplayBoardProps> = ({ counters, audioEnabled }) => {
  const [board, setBoard] = useState<QueueBoardResponse | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prevCalledTokensRef = useRef<Set<string>>(new Set());

  // Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Poll queue board feed
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await api.getQueueBoard();
        setBoard(data);

        // Check if new tokens have been called
        if (data.nowServing && data.nowServing.length > 0) {
          data.nowServing.forEach((item) => {
            const key = `${item.counterId}-${item.tokenNumber}`;
            if (!prevCalledTokensRef.current.has(key)) {
              prevCalledTokensRef.current.add(key);
              // Announce token
              announceToken(item.tokenNumber, item.counterName, audioEnabled);
            }
          });
        }
      } catch (err) {
        console.error('Error fetching live board:', err);
      }
    };

    fetchBoard();
    const interval = setInterval(fetchBoard, 3000);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top TV Header Bar */}
      <div
        className="glass-panel"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
            }}
          >
            <Radio size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.45rem', letterSpacing: '-0.02em' }}>LIVE QUEUE DISPLAY</h2>
              <span className="badge badge-called" style={{ animation: 'pulse 2s infinite' }}>
                ON AIR
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              Main Waiting Hall Audio-Visual Broadcast System
            </p>
          </div>
        </div>

        {/* Live Metrics Ticker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
              {board?.totalWaiting || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Waiting</div>
          </div>

          <div style={{ height: '28px', width: '1px', background: 'var(--border-subtle)' }} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-display)' }}>
              {board?.totalServedToday || 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Served</div>
          </div>

          <div style={{ height: '28px', width: '1px', background: 'var(--border-subtle)' }} />

          {/* Big Clock */}
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-display)',
              fontSize: '1.45rem',
              fontWeight: 800,
              color: '#38bdf8',
              letterSpacing: '0.05em',
            }}
          >
            {currentTime}
          </div>

          <button className="icon-btn" onClick={toggleFullscreen} title="Toggle Fullscreen">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Grid: Left (Counters Now Serving) & Right (Next in Line) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        
        {/* Left Side: Now Serving Grid */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="#10b981" />
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff' }}>NOW SERVING AT COUNTERS</h3>
          </div>

          <div className="display-board-grid">
            {counters.map((counter) => {
              const activeItem = board?.nowServing.find((item) => item.counterId === counter.id);

              return (
                <div
                  key={counter.id}
                  className={`tv-counter-card ${activeItem ? 'active-call' : ''}`}
                >
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                    {counter.name}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#38bdf8', marginBottom: '1.25rem', height: '1.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {counter.service?.name || 'General Desk'}
                  </div>

                  {activeItem ? (
                    <div>
                      <div
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '3.6rem',
                          fontWeight: 900,
                          color: '#ffffff',
                          lineHeight: 1,
                          letterSpacing: '0.05em',
                          textShadow: '0 0 25px rgba(16, 185, 129, 0.7)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        {activeItem.tokenNumber}
                      </div>

                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                        <Clock size={12} />
                        <span>Called at {activeItem.calledAt || 'Just now'}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '1.5rem 0' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        WAITING
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Desk Available
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Next Up Tokens Column */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1.2rem' }}>Next in Queue</h3>
            </div>
            <span className="badge badge-waiting">{board?.waitingTickets.length || 0} Up Next</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(!board?.waitingTickets || board.waitingTickets.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                No visitors currently in line
              </div>
            ) : (
              board.waitingTickets.slice(0, 8).map((ticket, idx) => (
                <div
                  key={ticket.id}
                  style={{
                    padding: '0.85rem 1.15rem',
                    borderRadius: 'var(--radius-sm)',
                    background: idx === 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    border: idx === 0 ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: 'rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#ffffff', fontFamily: 'var(--font-display)' }}>
                        {ticket.tokenNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {ticket.service?.name}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${ticket.priority !== 'NORMAL' ? 'badge-skipped' : 'badge-waiting'}`} style={{ fontSize: '0.65rem' }}>
                    {ticket.priority !== 'NORMAL' ? ticket.priority : 'Next'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
