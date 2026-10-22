export interface User {
  id: number;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN' | string;
}

export interface QueueService {
  id: number;
  name: string;
  description: string;
  averageServiceTime: number;
  active: boolean;
}

export interface Counter {
  id: number;
  name: string;
  service?: QueueService | null;
  staffId?: number | null;
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE' | string;
}

export interface Ticket {
  id: number;
  tokenNumber: string;
  user?: User;
  service?: QueueService;
  counter?: Counter;
  status: 'WAITING' | 'CALLED' | 'COMPLETED' | 'SKIPPED';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt?: string;
  calledAt?: string;
  completedAt?: string;
}

export interface TicketStatusResponse {
  ticket: Ticket;
  positionAhead: number;
  estimatedWaitMinutes: number;
  serviceName: string;
  counterName: string | null;
  status: string;
}

export interface NowServingItem {
  counterId: number;
  counterName: string;
  tokenNumber: string;
  serviceName: string;
  calledAt: string;
}

export interface QueueBoardResponse {
  nowServing: NowServingItem[];
  waitingTickets: Ticket[];
  totalWaiting: number;
  totalServedToday: number;
  activeCountersCount: number;
}

export interface QueueStatsResponse {
  totalTickets: number;
  waitingCount: number;
  calledCount: number;
  completedCount: number;
  skippedCount: number;
  activeCounters: number;
  avgWaitTimeMinutes: number;
  serviceQueueCounts: Record<string, number>;
}

export interface AiChatRequest {
  message: string;
  userId?: number;
  serviceId?: number;
  apiKey?: string;
}

export interface AiChatResponse {
  reply: string;
  recommendedServiceId?: number | null;
  recommendedServiceName?: string | null;
  action?: 'JOIN_QUEUE' | 'INFO_ONLY' | string;
  source: 'GEMINI_AI' | 'SMART_KNOWLEDGE_BASE' | string;
  estimatedWaitMinutes: number;
}
