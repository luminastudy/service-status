import type { ServiceUrls } from '../types/ServiceUrls.js'
import type { ServiceName } from '../types/ServiceName.js'
import { ValidationError } from '../errors/ValidationError.js'

export class ServiceUrlExtractor {
  public static getUrl(
    serviceUrls: ServiceUrls,
    serviceName: ServiceName
  ): string {
    if (serviceName === 'knowledge-base') {
      return serviceUrls['knowledge-base']
    }

    if (serviceName === 'auth-service') {
      return serviceUrls['auth-service']
    }

    throw new ValidationError(`Unknown service: ${serviceName}`)
  }
}
