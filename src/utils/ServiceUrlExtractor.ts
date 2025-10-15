import type { ServiceUrls } from '../types/ServiceUrls.js';
import { ValidationError } from '../errors/ValidationError.js';

export class ServiceUrlExtractor {
  public static getUrl(serviceUrls: ServiceUrls, serviceName: keyof ServiceUrls): string {
    if (serviceName === 'knowledge-base') {
      return serviceUrls['knowledge-base'];
    }

    if (serviceName === 'auth-service') {
      return serviceUrls['auth-service'];
    }

    throw new ValidationError(`Unknown service: ${serviceName}`);
  }
}
