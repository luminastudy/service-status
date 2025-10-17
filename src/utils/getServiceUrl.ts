import type { ServiceUrls } from '../types/ServiceUrls.js';
import type { ServiceName } from '../types/ServiceName.js';
import { ValidationError } from '../errors/ValidationError.js';

export function getServiceUrl(serviceUrls: ServiceUrls, serviceName: ServiceName): string {
  if (serviceName === 'knowledge-base') {
    return serviceUrls['knowledge-base'];
  }
  if (serviceName === 'auth-service') {
    return serviceUrls['auth-service'];
  }
  if (serviceName === 'recommendation-service') {
    return serviceUrls['recommendation-service'];
  }
  throw new ValidationError(`Unknown service: ${serviceName}`);
}
