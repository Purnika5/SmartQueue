import React, { useState, useRef, useEffect } from 'react';
import type { QueueService, Ticket } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Key,
  Volume2,
  Zap
} from 'lucide-react';

interface AiCopilotProps {
  services?: QueueService[];
  onTokenGenerated: (ticket: Ticket) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedServiceId?: number | null;
  recommendedServiceName?: string | null;
  action?: string;
  source?: string;
  timestamp: string;
}

export const AiCopilot: React.FC<AiCopilotProps> = ({ onTokenGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('smartqueue_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your **SmartQueue Gemini Copilot** 🤖.

I can help answer your questions about:
- 📄 **Required documents** for Bonafide certificates, ID cards, and receipts
- 🏢 **Counter locations** and service desks
- ⏱️ **Wait times & queue speed**
- ⚡ **Instant token generation**

Ask me anything or choose a quick question below!`,
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('smartqueue_gemini_key', key);
    setShowKeyInput(false);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setLoading(true);

    try {
      const response = await api.askAiCopilot({
        message: textToSend,
        apiKey: apiKey.trim() || undefined,
      });

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        recommendedServiceId: response.recommendedServiceId,
        recommendedServiceName: response.recommendedServiceName,
        action: response.action,
        source: response.source,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered an issue connecting to the AI service. Please make sure the backend is active or verify your Gemini API key.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRecommended = async (serviceId: number) => {
    try {
      setLoading(true);
      const ticket = await api.joinQueue({
        serviceId,
        userName: 'Visitor (via AI Copilot)',
        userEmail: `ai_visitor_${Date.now()}@smartqueue.com`,
        priority: 'NORMAL',
      });
      onTokenGenerated(ticket);
      setIsOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Strip markdown symbols for natural speech
      const cleanText = text
        .replace(/###/g, '')
        .replace(/\*\*/g, '')
        .replace(/-/g, '')
        .replace(/🤖/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ fontSize: '1rem', fontWeight: 700, margin: '8px 0 4px', color: '#67e8f9' }}>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ')) {
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '3px', fontSize: '0.85rem' }}>
            {renderBoldText(line.replace('- ', ''))}
          </li>
        );
      }
      return (
        <p key={idx} style={{ marginBottom: line ? '6px' : '3px', fontSize: '0.88rem', lineHeight: 1.5 }}>
          {renderBoldText(line)}
        </p>
      );
    });
  };

  const renderBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#ffffff' }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 90,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            padding: '0.85rem 1.45rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.5)',
            fontFamily: 'var(--font-body)',
            fontWeight: 700,
            fontSize: '0.95rem',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <div style={{ position: 'relative' }}>
            <Sparkles size={20} />
          </div>
          <span>Ask Gemini AI Copilot</span>
          <span
            style={{
              fontSize: '0.65rem',
              padding: '2px 6px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.25)',
              textTransform: 'uppercase',
            }}
          >
            Live
          </span>
        </button>
      )}

      {/* Slide-out AI Assistant Drawer */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 48px)',
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeInUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.15rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'var(--primary-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                <Sparkles size={18} color="#ffffff" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Gemini AI Copilot</h3>
                  <span
                    style={{
                      fontSize: '0.62rem',
                      padding: '1px 6px',
                      borderRadius: 10,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      fontWeight: 700,
                    }}
                  >
                    READY
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Intelligent SmartQueue Assistant
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                className="icon-btn"
                style={{ width: 32, height: 32 }}
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="Configure Gemini API Key"
              >
                <Key size={14} color={apiKey ? '#10b981' : '#94a3b8'} />
              </button>
              <button
                className="icon-btn"
                style={{ width: 32, height: 32 }}
                onClick={() => setIsOpen(false)}
                title="Close AI Copilot"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* API Key Banner / Input */}
          {showKeyInput && (
            <div
              style={{
                padding: '0.85rem 1rem',
                background: 'rgba(30, 41, 59, 0.9)',
                borderBottom: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#cbd5e1' }}>
                <span>Custom Google Gemini API Key (Optional):</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="password"
                  className="form-input"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                  onClick={() => handleSaveKey(apiKey)}
                >
                  Save
                </button>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Leave blank to use the built-in Intelligent Knowledge Engine.
              </div>
            </div>
          )}

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              padding: '1.25rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'flex-start',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: msg.sender === 'user' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(16, 185, 129, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  {msg.sender === 'user' ? <User size={14} color="#a5b4fc" /> : <Bot size={14} color="#34d399" />}
                </div>

                <div style={{ maxWidth: '82%' }}>
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                        : 'rgba(30, 41, 59, 0.75)',
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                      color: '#f8fafc',
                    }}
                  >
                    {formatMessageText(msg.text)}

                    {/* Direct Action: Join Recommended Queue */}
                    {msg.recommendedServiceId && (
                      <div
                        style={{
                          marginTop: '0.85rem',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          background: 'rgba(15, 23, 42, 0.8)',
                          border: '1px solid rgba(99, 102, 241, 0.3)',
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                          ⚡ Instant Queue Booking:
                        </div>
                        <button
                          className="btn btn-primary"
                          style={{ width: '100%', padding: '0.5rem 0.8rem', fontSize: '0.82rem' }}
                          onClick={() => handleJoinRecommended(msg.recommendedServiceId!)}
                          disabled={loading}
                        >
                          <Zap size={14} />
                          <span>Join Queue: {msg.recommendedServiceName}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message timestamp and text-to-speech button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.68rem',
                      color: 'var(--text-muted)',
                      marginTop: '3px',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.source && (
                      <span style={{ color: msg.source === 'GEMINI_AI' ? '#818cf8' : '#34d399' }}>
                        • {msg.source === 'GEMINI_AI' ? 'Google Gemini' : 'Queue Engine'}
                      </span>
                    )}
                    {msg.sender === 'ai' && (
                      <button
                        onClick={() => handleSpeak(msg.text)}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                        title="Listen to this response"
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="#34d399" />
                </div>
                <div style={{ padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-md)', background: 'rgba(30, 41, 59, 0.6)' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Gemini is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: 'rgba(15, 23, 42, 0.8)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {[
              '📄 Bonafide Documents',
              '💳 Lost ID Card',
              '💰 Fee Payment Dues',
              '⏱️ Wait Times',
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                style={{
                  padding: '4px 9px',
                  borderRadius: 14,
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  color: '#cbd5e1',
                  fontSize: '0.74rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.85rem 1rem',
              background: 'rgba(15, 23, 42, 0.95)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              className="form-input"
              style={{ padding: '0.65rem 0.9rem', fontSize: '0.88rem' }}
              placeholder="Ask about certificates, fees, documents..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem 0.9rem' }}
              disabled={loading || !inputMessage.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
