export interface ServiceHealthCheck {
  url: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  lastChecked: Date | null;
  details: unknown;
  error: string | null;
}

interface ServiceConfig {
  name: string;
  healthCheckUrl: string;
  timeout: number;
}

export type ServiceUrls = {
  'knowledge-base': string;
  'auth-service': string;
};

export interface ServicesStatusConfig {
  serviceUrls: ServiceUrls;
  defaultTimeout: number;
  checkInterval: number;
  retryAttempts: number;
  retryDelay: number;
}

export class ServicesStatus {
  private static readonly REQUIRED_SERVICES: (keyof ServiceUrls)[] = [
    'knowledge-base',
    'auth-service',
  ];

  private readonly services: ServiceConfig[];
  private config: ServicesStatusConfig;
  private healthChecks: Map<string, ServiceHealthCheck>;
  private checkIntervalId: NodeJS.Timeout | null;
  private abortControllers: Map<string, AbortController>;

  constructor(config: ServicesStatusConfig) {
    // Validate required configuration
    if (!config) {
      throw new Error('ServicesStatus configuration is required');
    }

    // Validate service URLs
    if (!config.serviceUrls) {
      throw new Error('Service URLs are required');
    }

    if (typeof config.serviceUrls !== 'object') {
      throw new Error('Service URLs must be an object');
    }

    // Validate all required services have URLs
    for (const serviceName of ServicesStatus.REQUIRED_SERVICES) {
      const url = config.serviceUrls[serviceName];

      if (!url) {
        throw new Error(`URL is required for service: ${serviceName}`);
      }

      if (typeof url !== 'string') {
        throw new Error(`URL must be a string for service: ${serviceName}`);
      }

      // Validate URL format
      try {
        new URL(url);
      } catch {
        throw new Error(`Invalid URL for service ${serviceName}: ${url}`);
      }
    }

    // Validate required configuration values
    if (!config.defaultTimeout || typeof config.defaultTimeout !== 'number' || config.defaultTimeout <= 0) {
      throw new Error('Valid defaultTimeout (positive number) is required');
    }

    if (!config.checkInterval || typeof config.checkInterval !== 'number' || config.checkInterval <= 0) {
      throw new Error('Valid checkInterval (positive number) is required');
    }

    if (!config.retryAttempts || typeof config.retryAttempts !== 'number' || config.retryAttempts < 0) {
      throw new Error('Valid retryAttempts (non-negative number) is required');
    }

    if (!config.retryDelay || typeof config.retryDelay !== 'number' || config.retryDelay < 0) {
      throw new Error('Valid retryDelay (non-negative number) is required');
    }

    // Build services array from provided URLs
    this.services = ServicesStatus.REQUIRED_SERVICES.map(serviceName => ({
      name: serviceName,
      healthCheckUrl: config.serviceUrls[serviceName],
      timeout: config.defaultTimeout,
    }));

    this.config = config;
    this.healthChecks = new Map();
    this.checkIntervalId = null;
    this.abortControllers = new Map();

    // Initialize health checks for all services
    this.initializeHealthChecks();
  }

  private initializeHealthChecks(): void {
    for (const service of this.services) {
      this.healthChecks.set(service.name, {
        url: service.healthCheckUrl,
        name: service.name,
        status: 'unknown',
        lastChecked: null,
        details: null,
        error: null,
      });
    }
  }

  public async start(): Promise<void> {
    // Perform initial health check
    await this.checkAllServices();

    // Set up periodic checks
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
    }

    this.checkIntervalId = setInterval(async () => {
      await this.checkAllServices();
    }, this.config.checkInterval);
  }

  public stop(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }

    // Cancel any ongoing requests
    for (const controller of this.abortControllers.values()) {
      controller.abort();
    }
    this.abortControllers.clear();
  }

  public async checkAllServices(): Promise<Map<string, ServiceHealthCheck>> {
    const promises = this.services.map((service) =>
      this.checkServiceHealth(service)
    );

    await Promise.allSettled(promises);
    return this.healthChecks;
  }

  private async checkServiceHealth(service: ServiceConfig): Promise<void> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    // Cancel any existing request for this service
    const existingController = this.abortControllers.get(service.name);
    if (existingController) {
      existingController.abort();
    }

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        this.abortControllers.set(service.name, controller);

        const timeoutId = setTimeout(() => {
          controller.abort();
        }, service.timeout || this.config.defaultTimeout);

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

        this.healthChecks.set(service.name, {
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
        });

        this.abortControllers.delete(service.name);
        return;
      } catch (error) {
        lastError = error as Error;

        // If this is not the last attempt, wait before retrying
        if (attempt < this.config.retryAttempts) {
          await this.delay(this.config.retryDelay);
        }
      }
    }

    // If all attempts failed, record the error
    const responseTime = Date.now() - startTime;
    this.healthChecks.set(service.name, {
      url: service.healthCheckUrl,
      name: service.name,
      status: 'unhealthy',
      lastChecked: new Date(),
      details: {
        responseTime,
        attempts: this.config.retryAttempts,
      },
      error: lastError?.message || 'Unknown error',
    });

    this.abortControllers.delete(service.name);
  }

  public async checkService(serviceName: string): Promise<ServiceHealthCheck | null> {
    const service = this.services.find((s) => s.name === serviceName);
    if (!service) {
      return null;
    }

    await this.checkServiceHealth(service);
    return this.healthChecks.get(serviceName) || null;
  }

  public getStatus(serviceName: string): ServiceHealthCheck | null {
    return this.healthChecks.get(serviceName) || null;
  }

  public getAllStatuses(): Map<string, ServiceHealthCheck> {
    return new Map(this.healthChecks);
  }

  public getHealthyServices(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values()).filter(
      (check) => check.status === 'healthy'
    );
  }

  public getUnhealthyServices(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values()).filter(
      (check) => check.status === 'unhealthy'
    );
  }

  public getUnknownServices(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values()).filter(
      (check) => check.status === 'unknown'
    );
  }

  public isAllHealthy(): boolean {
    return Array.from(this.healthChecks.values()).every(
      (check) => check.status === 'healthy'
    );
  }

  public getSummary(): {
    total: number;
    healthy: number;
    unhealthy: number;
    unknown: number;
  } {
    const statuses = Array.from(this.healthChecks.values());
    return {
      total: statuses.length,
      healthy: statuses.filter((s) => s.status === 'healthy').length,
      unhealthy: statuses.filter((s) => s.status === 'unhealthy').length,
      unknown: statuses.filter((s) => s.status === 'unknown').length,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}