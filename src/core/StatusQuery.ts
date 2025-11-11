import type { ServiceHealthCheck } from '../types/ServiceHealthCheck.js'
import type { ServiceName } from '../types/ServiceName.js'

export class StatusQuery {
  private healthChecks: Map<string, ServiceHealthCheck>

  constructor(healthChecks: Map<string, ServiceHealthCheck>) {
    this.healthChecks = healthChecks
  }

  public getStatus(serviceName: ServiceName): ServiceHealthCheck | null {
    const healthCheck = this.healthChecks.get(serviceName)
    return healthCheck || null
  }

  public getAllStatuses(): Map<string, ServiceHealthCheck> {
    return new Map(this.healthChecks)
  }

  public getHealthyServices(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values()).filter(
      check => check.status === 'healthy'
    )
  }

  public getUnhealthyServices(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values()).filter(
      check => check.status === 'unhealthy'
    )
  }

  public getUnknownServices(): ServiceHealthCheck[] {
    return Array.from(this.healthChecks.values()).filter(
      check => check.status === 'unknown'
    )
  }

  public isAllHealthy(): boolean {
    return Array.from(this.healthChecks.values()).every(
      check => check.status === 'healthy'
    )
  }

  public getSummary(): {
    total: number
    healthy: number
    unhealthy: number
    unknown: number
  } {
    const statuses = Array.from(this.healthChecks.values())
    return {
      total: statuses.length,
      healthy: statuses.filter(s => s.status === 'healthy').length,
      unhealthy: statuses.filter(s => s.status === 'unhealthy').length,
      unknown: statuses.filter(s => s.status === 'unknown').length,
    }
  }
}
