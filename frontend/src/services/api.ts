import type {
  User,
  QueueService,
  Counter,
  Ticket,
  TicketStatusResponse,
  QueueBoardResponse,
  QueueStatsResponse,
  AiChatResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Services
  async getServices(): Promise<QueueService[]> {
    const res = await fetch(`${API_BASE}/services`);
    return handleResponse<QueueService[]>(res);
  },

  async createService(data: Partial<QueueService>): Promise<QueueService> {
    const res = await fetch(`${API_BASE}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<QueueService>(res);
  },

  // Counters
  async getCounters(): Promise<Counter[]> {
    const res = await fetch(`${API_BASE}/counters`);
    return handleResponse<Counter[]>(res);
  },

  async createCounter(data: { name: string; serviceId?: number; staffId?: number; status?: string }): Promise<Counter> {
    const res = await fetch(`${API_BASE}/counters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Counter>(res);
  },

  async updateCounterStatus(counterId: number, status: string): Promise<Counter> {
    const res = await fetch(`${API_BASE}/counters/${counterId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
    });
    return handleResponse<Counter>(res);
  },

  // Queue & Customer Tickets
  async joinQueue(data: {
    serviceId: number;
    userId?: number;
    userName?: string;
    userEmail?: string;
    priority?: string;
  }): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<Ticket>(res);
  },

  async getTicketStatus(ticketId: number): Promise<TicketStatusResponse> {
    const res = await fetch(`${API_BASE}/queue/ticket/${ticketId}`);
    return handleResponse<TicketStatusResponse>(res);
  },

  async getUserTickets(userId: number): Promise<Ticket[]> {
    const res = await fetch(`${API_BASE}/queue/user/${userId}`);
    return handleResponse<Ticket[]>(res);
  },

  async getQueueBoard(): Promise<QueueBoardResponse> {
    const res = await fetch(`${API_BASE}/queue/board`);
    return handleResponse<QueueBoardResponse>(res);
  },

  async getWaitingTickets(serviceId?: number): Promise<Ticket[]> {
    const url = serviceId ? `${API_BASE}/queue/waiting?serviceId=${serviceId}` : `${API_BASE}/queue/waiting`;
    const res = await fetch(url);
    return handleResponse<Ticket[]>(res);
  },

  // Staff Actions
  async callNext(serviceId: number, counterId: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/staff/next?serviceId=${serviceId}&counterId=${counterId}`, {
      method: 'POST',
    });
    return handleResponse<Ticket>(res);
  },

  async completeTicket(ticketId: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/staff/complete/${ticketId}`, {
      method: 'POST',
    });
    return handleResponse<Ticket>(res);
  },

  async skipTicket(ticketId: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/staff/skip/${ticketId}`, {
      method: 'POST',
    });
    return handleResponse<Ticket>(res);
  },

  async recallTicket(ticketId: number): Promise<Ticket> {
    const res = await fetch(`${API_BASE}/staff/recall/${ticketId}`, {
      method: 'POST',
    });
    return handleResponse<Ticket>(res);
  },

  // Auth
  async login(email: string, password: string): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<User>(res);
  },

  async register(data: { name: string; email: string; password: string; role?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Admin & Stats
  async getAdminStats(): Promise<QueueStatsResponse> {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return handleResponse<QueueStatsResponse>(res);
  },

  // AI Copilot
  async askAiCopilot(data: { message: string; apiKey?: string; serviceId?: number }): Promise<AiChatResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AiChatResponse>(res);
  },
};
