import React, { useState, useEffect } from 'react';
import type { QueueStatsResponse, QueueService, Counter } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Layers,
  Plus,
  RefreshCw,
  Building
} from 'lucide-react';

interface AdminDashboardProps {
  services: QueueService[];
  counters: Counter[];
  onRefreshAll: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  counters,
  onRefreshAll,
}) => {
  const [stats, setStats] = useState<QueueStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // New Service Modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServiceAvgTime, setNewServiceAvgTime] = useState(5);

  // New Counter Modal state
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [newCounterName, setNewCounterName] = useState('');
  const [newCounterServiceId, setNewCounterServiceId] = useState<number | ''>('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName) return;
    try {
      await api.createService({
        name: newServiceName,
        description: newServiceDesc,
        averageServiceTime: Number(newServiceAvgTime),
        active: true,
      });
      setShowServiceModal(false);
      setNewServiceName('');
      setNewServiceDesc('');
      onRefreshAll();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCounterName) return;
    try {
      await api.createCounter({
        name: newCounterName,
        serviceId: newCounterServiceId ? Number(newCounterServiceId) : undefined,
        status: 'AVAILABLE',
      });
      setShowCounterModal(false);
      setNewCounterName('');
      setNewCounterServiceId('');
      onRefreshAll();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateSampleTicket = async (serviceId: number) => {
    try {
      const names = ['Priya Patel', 'Aarav Mehta', 'Sneha Roy', 'Vikram Singh', 'Ananya Sharma'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      await api.joinQueue({
        serviceId,
        userName: randomName,
        userEmail: `${randomName.toLowerCase().replace(' ', '.')}@example.com`,
        priority: 'NORMAL',
      });
      fetchStats();
      onRefreshAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Admin Title Bar */}
      <div
        className="glass-panel"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.35)',
            }}
          >
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem' }}>Queue Administration & Analytics</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              Real-time operational throughput, service counter allocations, and queue health.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowServiceModal(true)}>
            <Plus size={16} />
            <span>Add Service</span>
          </button>

          <button className="btn btn-secondary" onClick={() => setShowCounterModal(true)}>
            <Plus size={16} />
            <span>Add Counter</span>
          </button>

          <button className="btn btn-primary" onClick={fetchStats} disabled={loading}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.totalTickets || 0}</div>
            <div className="metric-label">Total Tokens Issued</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.waitingCount || 0}</div>
            <div className="metric-label">Currently Waiting</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.completedCount || 0}</div>
            <div className="metric-label">Successfully Completed</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Building size={24} />
          </div>
          <div>
            <div className="metric-val">{stats?.activeCounters || counters.length}</div>
            <div className="metric-label">Active Desks / Counters</div>
          </div>
        </div>
      </div>

      {/* Services Load & Management */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
        
        {/* Services Table & Simulator */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Configured Services</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Service catalog and instant customer test simulator
              </p>
            </div>
            <span className="badge badge-waiting">{services.length} Total</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {services.map((s) => {
              const queueCount = stats?.serviceQueueCounts?.[s.name] || 0;

              return (
                <div
                  key={s.id}
                  style={{
                    padding: '1.15rem 1.35rem',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(30, 41, 59, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 style={{ fontSize: '1.05rem', color: '#ffffff' }}>{s.name}</h4>
                      <span className="badge badge-completed" style={{ fontSize: '0.65rem' }}>
                        ~{s.averageServiceTime} min avg
                      </span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      {s.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', fontFamily: 'var(--font-display)' }}>
                        {queueCount}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Waiting</div>
                    </div>

                    <button
                      className="btn btn-secondary"
                      onClick={() => handleGenerateSampleTicket(s.id)}
                      title="Issue a quick test token for this service"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      <Plus size={14} />
                      <span>Simulate Token</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Counters Management */}
        <div className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Physical Counters</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                Desks and assigned service mapping
              </p>
            </div>
            <span className="badge badge-called">{counters.length} Desks</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {counters.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.98rem', color: '#ffffff' }}>{c.name}</h4>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8' }}>
                    {c.service?.name || 'General Inquiries'}
                  </div>
                </div>

                <span
                  className={`badge ${
                    c.status === 'BUSY'
                      ? 'badge-waiting'
                      : c.status === 'AVAILABLE'
                      ? 'badge-called'
                      : 'badge-skipped'
                  }`}
                >
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal: Create Service */}
      {showServiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Add Service Category</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Create a new student or customer queue offering.
            </p>

            <form onSubmit={handleCreateService}>
              <div className="form-group">
                <label className="form-label">Service Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Migration Certificate"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Service Description</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Request migration and transfer certificates"
                  value={newServiceDesc}
                  onChange={(e) => setNewServiceDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Average Service Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="form-input"
                  value={newServiceAvgTime}
                  onChange={(e) => setNewServiceAvgTime(Number(e.target.value))}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowServiceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Counter */}
      {showCounterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Add Service Counter</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Set up a physical service window or counter desk.
            </p>

            <form onSubmit={handleCreateCounter}>
              <div className="form-group">
                <label className="form-label">Counter Label / Desk Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Counter 05 - Special Assistance"
                  value={newCounterName}
                  onChange={(e) => setNewCounterName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Service</label>
                <select
                  className="form-select"
                  value={newCounterServiceId}
                  onChange={(e) => setNewCounterServiceId(e.target.value ? Number(e.target.value) : '')}
                >
                  <option value="">Select a service category...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCounterModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
