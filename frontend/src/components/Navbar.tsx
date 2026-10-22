import React from 'react';
import { Layers, Monitor, UserCheck, ShieldCheck, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'customer' | 'staff' | 'display' | 'admin';
  setActiveTab: (tab: 'customer' | 'staff' | 'display' | 'admin') => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  audioEnabled,
  setAudioEnabled,
}) => {
  return (
    <header className="navbar">
      <div className="brand" onClick={() => setActiveTab('customer')}>
        <div className="brand-icon-wrap">
          <Layers size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">SmartQueue</span>
            <span className="brand-badge">PRO</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot"></span>
            <span>Live System Connected</span>
          </div>
        </div>
      </div>

      <nav className="nav-tabs">
        <button
          className={`nav-tab-btn ${activeTab === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveTab('customer')}
        >
          <Sparkles size={16} />
          <span>Customer Kiosk</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <UserCheck size={16} />
          <span>Staff Counter</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'display' ? 'active' : ''}`}
          onClick={() => setActiveTab('display')}
        >
          <Monitor size={16} />
          <span>Live Display Board</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <ShieldCheck size={16} />
          <span>Admin & Analytics</span>
        </button>
      </nav>

      <div className="nav-actions">
        <button
          className="icon-btn"
          title={audioEnabled ? 'Voice announcements enabled (Click to mute)' : 'Voice announcements muted (Click to unmute)'}
          onClick={() => setAudioEnabled(!audioEnabled)}
        >
          {audioEnabled ? <Volume2 size={18} color="#10b981" /> : <VolumeX size={18} color="#94a3b8" />}
        </button>
      </div>
    </header>
  );
};
