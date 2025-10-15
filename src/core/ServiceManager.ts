import type { ServiceHealthCheck } from '../types/ServiceHealthCheck.js';
import type { ServiceConfig } from '../types/ServiceConfig.js';
import { HealthChecker } from './HealthChecker.js';

export class ServiceManager {
  private services: ServiceConfig[];
  private healthChecker: HealthChecker;
  private healthChecks: Map<string, ServiceHealthCheck>;

  constructor(
    services: ServiceConfig[],
    healthChecker: HealthChecker,
    healthChecks: Map<string, ServiceHealthCheck>
  ) {
    this.services = services;
    this.healthChecker = healthChecker;
    this.healthChecks = healthChecks;
  }

  public async checkService(serviceName: string): Promise<ServiceHealthCheck | null> {
    if (!this.hasService(serviceName)) {
      return null;
    }

    return this.performServiceCheck(serviceName);
  }

  private hasService(serviceName: string): boolean {
    return this.services.some((s) => s.name === serviceName);
  }

  private async performServiceCheck(serviceName: string): Promise<ServiceHealthCheck | null> {
    for (const service of this.services) {
      if (service.name !== serviceName) {
        continue;
      }

      return this.checkAndStoreResult(service);
    }
    return null;
  }

  private async checkAndStoreResult(service: ServiceConfig): Promise<ServiceHealthCheck | null> {
    const result = await this.healthChecker.checkService(service);
    this.healthChecks.set(service.name, result);
    const healthCheck = this.healthChecks.get(service.name);
    return healthCheck || null;
  }

  public async checkAllServices(): Promise<void> {
    const promises = this.services.map(async (service) => {
      const result = await this.healthChecker.checkService(service);
      this.healthChecks.set(service.name, result);
    });

    await Promise.allSettled(promises);
  }

  public cancelAll(): void {
    this.healthChecker.cancelAll();
  }
}
