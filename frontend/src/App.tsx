import { useState, useEffect, useCallback } from 'react';
import type { QueueService, Counter, Ticket } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { CustomerPortal } from './components/CustomerPortal';
import { StaffTerminal } from './components/StaffTerminal';
import { LiveDisplayBoard } from './components/LiveDisplayBoard';
import { AdminDashboard } from './components/AdminDashboard';
import { AiCopilot } from './components/AiCopilot';
import { Layers, Database, Cpu, ShieldCheck } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<'customer' | 'staff' | 'display' | 'admin'>('customer');
  const [services, setServices] = useState<QueueService[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadInitialData = useCallback(async () => {
    try {
      const [servicesData, countersData] = await Promise.all([
        api.getServices(),
        api.getCounters(),
      ]);
      setServices(servicesData);
      setCounters(countersData);
    } catch (err) {
      console.error('Failed to connect to SmartQueue Backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
    const interval = setInterval(loadInitialData, 8000);
    return () => clearInterval(interval);
  }, [loadInitialData]);

  const handleTokenGenerated = (ticket: Ticket) => {
    localStorage.setItem('smartqueue_active_ticket', JSON.stringify(ticket));
    setActiveTab('customer');
    loadInitialData();
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        audioEnabled={audioEnabled}
        setAudioEnabled={setAudioEnabled}
      />

      <main className="main-content" style={{ flex: 1 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem 1rem' }}>
            <div className="pulse-dot" style={{ width: 24, height: 24, marginBottom: '1.5rem' }}></div>
            <h3 style={{ fontSize: '1.25rem', color: '#e2e8f0' }}>Connecting to SmartQueue Backend...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.5rem' }}>
              Communicating with Spring Boot REST Services & PostgreSQL database.
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'customer' && (
              <CustomerPortal
                services={services}
                audioEnabled={audioEnabled}
                onTokenGenerated={handleTokenGenerated}
              />
            )}

            {activeTab === 'staff' && (
              <StaffTerminal
                counters={counters}
                services={services}
                audioEnabled={audioEnabled}
                onCounterUpdated={loadInitialData}
              />
            )}

            {activeTab === 'display' && (
              <LiveDisplayBoard
                counters={counters}
                audioEnabled={audioEnabled}
              />
            )}

            {activeTab === 'admin' && (
              <AdminDashboard
                services={services}
                counters={counters}
                onRefreshAll={loadInitialData}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Gemini AI Copilot */}
      <AiCopilot
        services={services}
        onTokenGenerated={handleTokenGenerated}
      />

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '1.75rem 2rem',
          background: 'rgba(9, 13, 22, 0.9)',
          marginTop: 'auto',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Layers size={13} color="#ffffff" />
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>SmartQueue</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} Intelligent Queue Management System
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Cpu size={14} color="#6366f1" /> Java 21 / Spring Boot 4
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Database size={14} color="#06b6d4" /> PostgreSQL 18
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={14} color="#10b981" /> React 19 + TypeScript
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
