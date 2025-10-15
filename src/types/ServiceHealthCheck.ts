export interface ServiceHealthCheck {
  url: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: Date | null;
  details: unknown;
  error: string | null;
}
