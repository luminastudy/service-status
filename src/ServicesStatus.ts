import type { ServiceHealthCheck } from './types/ServiceHealthCheck.js';
import type { ServiceUrls } from './types/ServiceUrls.js';
import type { ServicesStatusConfig } from './types/ServicesStatusConfig.js';
import type { ServiceConfig } from './types/ServiceConfig.js';
import type { ServiceName } from './types/ServiceName.js';
import { ConfigValidator } from './validators/ConfigValidator.js';
import { HealthChecker } from './core/HealthChecker.js';
import { StatusQuery } from './core/StatusQuery.js';
import { ServiceManager } from './core/ServiceManager.js';

const REQUIRED_SERVICES: ReadonlyArray<ServiceName> = ['knowledge-base', 'auth-service'] as const;

function getServiceUrl(serviceUrls: ServiceUrls, serviceName: ServiceName): string {
  return serviceName === 'knowledge-base' ? serviceUrls['knowledge-base'] : serviceUrls['auth-service'];
}

function buildServices(config: ServicesStatusConfig): ServiceConfig[] {
  const services: ServiceConfig[] = [];
  for (const serviceName of REQUIRED_SERVICES) {
    services.push({
      name: serviceName,
      healthCheckUrl: getServiceUrl(config.serviceUrls, serviceName),
      timeout: config.defaultTimeout,
    });
  }
  return services;
}

function initHealthChecks(services: ServiceConfig[], healthChecks: Map<string, ServiceHealthCheck>): void {
  for (const service of services) {
    healthChecks.set(service.name, {
      url: service.healthCheckUrl,
      name: service.name,
      status: 'unknown',
      lastChecked: null,
      details: null,
      error: null,
    });
  }
}

export class ServicesStatus {
  private readonly healthChecks: Map<string, ServiceHealthCheck>;
  private readonly statusQuery: StatusQuery;
  private readonly serviceManager: ServiceManager;
  private checkIntervalId: NodeJS.Timeout | null;
  private checkInterval: number;

  constructor(config: ServicesStatusConfig) {
    ConfigValidator.validate(config);

    this.healthChecks = new Map();
    this.checkIntervalId = null;
    this.checkInterval = config.checkInterval;

    const healthChecker = new HealthChecker(config.defaultTimeout, config.retryAttempts, config.retryDelay);
    const services = buildServices(config);
    initHealthChecks(services, this.healthChecks);

    this.statusQuery = new StatusQuery(this.healthChecks);
    this.serviceManager = new ServiceManager(services, healthChecker, this.healthChecks);
  }

  public async start(): Promise<void> {
    await this.serviceManager.checkAllServices();
    if (this.checkIntervalId) clearInterval(this.checkIntervalId);
    this.checkIntervalId = setInterval(async () => {
      await this.serviceManager.checkAllServices();
    }, this.checkInterval);
  }

  public stop(): void {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    this.serviceManager.cancelAll();
  }

  public async checkAllServices(): Promise<Map<string, ServiceHealthCheck>> {
    await this.serviceManager.checkAllServices();
    return this.healthChecks;
  }

  public async checkService(serviceName: ServiceName): Promise<ServiceHealthCheck | null> {
    return this.serviceManager.checkService(serviceName);
  }

  public getStatus(serviceName: ServiceName): ServiceHealthCheck | null {
    return this.statusQuery.getStatus(serviceName);
  }

  public getAllStatuses(): Map<string, ServiceHealthCheck> {
    return this.statusQuery.getAllStatuses();
  }

  public getHealthyServices(): ServiceHealthCheck[] {
    return this.statusQuery.getHealthyServices();
  }

  public getUnhealthyServices(): ServiceHealthCheck[] {
    return this.statusQuery.getUnhealthyServices();
  }

  public getUnknownServices(): ServiceHealthCheck[] {
    return this.statusQuery.getUnknownServices();
  }

  public isAllHealthy(): boolean {
    return this.statusQuery.isAllHealthy();
  }

  public getSummary(): { total: number; healthy: number; unhealthy: number; unknown: number } {
    return this.statusQuery.getSummary();
  }
}
