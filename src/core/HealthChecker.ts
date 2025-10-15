import type { ServiceHealthCheck } from '../types/ServiceHealthCheck.js';
import type { ServiceConfig } from '../types/ServiceConfig.js';

export class HealthChecker {
  private abortControllers: Map<string, AbortController>;
  private defaultTimeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(defaultTimeout: number, retryAttempts: number, retryDelay: number) {
    this.abortControllers = new Map();
    this.defaultTimeout = defaultTimeout;
    this.retryAttempts = retryAttempts;
    this.retryDelay = retryDelay;
  }

  public async checkService(service: ServiceConfig): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    const existingController = this.abortControllers.get(service.name);
    if (existingController) {
      existingController.abort();
    }

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await this.attemptHealthCheck(service);
        this.abortControllers.delete(service.name);
        return result;
      } catch (error) {
        const errorInstance = error instanceof Error ? error : new Error(String(error));
        lastError = errorInstance;

        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay);
        }
      }
    }

    const responseTime = Date.now() - startTime;
    this.abortControllers.delete(service.name);

    return {
      url: service.healthCheckUrl,
      name: service.name,
      status: 'unhealthy',
      lastChecked: new Date(),
      details: {
        responseTime,
        attempts: this.retryAttempts,
      },
      error: lastError ? lastError.message : 'Unknown error',
    };
  }

  private async attemptHealthCheck(service: ServiceConfig): Promise<ServiceHealthCheck> {
    const startTime = Date.now();
    const controller = new AbortController();
    this.abortControllers.set(service.name, controller);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, service.timeout || this.defaultTimeout);

    const response = await fetch(service.healthCheckUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      url: service.healthCheckUrl,
      name: service.name,
      status: response.ok ? 'healthy' : 'unhealthy',
      lastChecked: new Date(),
      details: {
        ...data,
        responseTime,
        statusCode: response.status,
      },
      error: null,
    };
  }

  public cancelAll(): void {
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
