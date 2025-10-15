import type { ServicesStatusConfig } from '../types/ServicesStatusConfig.js';
import type { ServiceUrls } from '../types/ServiceUrls.js';
import { CustomError } from '../errors/CustomError.js';
import { TimeoutError } from '../errors/TimeoutError.js';
import { ValidationError } from '../errors/ValidationError.js';

const REQUIRED_SERVICES: ReadonlyArray<keyof ServiceUrls> = [
  'knowledge-base',
  'auth-service',
] as const;

export class ConfigValidator {
  public static validate(config: ServicesStatusConfig): void {
    if (!config) {
      throw new CustomError('ServicesStatus configuration is required');
    }

    if (!config.serviceUrls) {
      throw new CustomError('Service URLs are required');
    }

    if (typeof config.serviceUrls !== 'object') {
      throw new CustomError('Service URLs must be an object');
    }

    if (!config.defaultTimeout || typeof config.defaultTimeout !== 'number' || config.defaultTimeout <= 0) {
      throw new TimeoutError('Valid defaultTimeout (positive number) is required');
    }

    if (!config.checkInterval || typeof config.checkInterval !== 'number' || config.checkInterval <= 0) {
      throw new CustomError('Valid checkInterval (positive number) is required');
    }

    if (typeof config.retryAttempts !== 'number' || config.retryAttempts < 0) {
      throw new CustomError('Valid retryAttempts (non-negative number) is required');
    }

    if (typeof config.retryDelay !== 'number' || config.retryDelay < 0) {
      throw new CustomError('Valid retryDelay (non-negative number) is required');
    }

    ConfigValidator.validateServiceUrls(config.serviceUrls);
  }

  private static validateServiceUrls(serviceUrls: ServiceUrls): void {
    for (const serviceName of REQUIRED_SERVICES) {
      const url = ConfigValidator.getServiceUrl(serviceUrls, serviceName);

      if (!url) {
        throw new ValidationError(`URL is required for service: ${serviceName}`);
      }

      if (typeof url !== 'string') {
        throw new ValidationError(`URL must be a string for service: ${serviceName}`);
      }

      try {
        new URL(url);
      } catch {
        throw new ValidationError(`Invalid URL for service ${serviceName}: ${url}`);
      }
    }
  }

  private static getServiceUrl(serviceUrls: ServiceUrls, serviceName: keyof ServiceUrls): string {
    if (serviceName === 'knowledge-base') {
      return serviceUrls['knowledge-base'];
    }

    return serviceUrls['auth-service'];
  }
}
