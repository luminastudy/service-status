import { describe, it, expect } from 'vitest';
import { ConfigValidator } from './ConfigValidator.js';
import { CustomError } from '../errors/CustomError.js';
import { TimeoutError } from '../errors/TimeoutError.js';
import { ValidationError } from '../errors/ValidationError.js';

describe('ConfigValidator', () => {
  const validConfig = {
    serviceUrls: {
      'knowledge-base': 'http://localhost:4200/health',
      'auth-service': 'http://localhost:2500/health',
    },
    defaultTimeout: 5000,
    checkInterval: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  };

  describe('validate', () => {
    it('should validate valid config', () => {
      expect(() => ConfigValidator.validate(validConfig)).not.toThrow();
    });

    it('should throw CustomError when config is null', () => {
      // @ts-expect-error Testing invalid input
      expect(() => ConfigValidator.validate(null)).toThrow(CustomError);
      // @ts-expect-error Testing invalid input
      expect(() => ConfigValidator.validate(null)).toThrow('ServicesStatus configuration is required');
    });

    it('should throw CustomError when config is undefined', () => {
      // @ts-expect-error Testing invalid input
      expect(() => ConfigValidator.validate(undefined)).toThrow(CustomError);
    });

    it('should throw CustomError when serviceUrls is missing', () => {
      const config = { ...validConfig };
      // @ts-expect-error Testing invalid input
      delete config.serviceUrls;
      expect(() => ConfigValidator.validate(config)).toThrow(CustomError);
      expect(() => ConfigValidator.validate(config)).toThrow('Service URLs are required');
    });

    it('should throw CustomError when serviceUrls is not an object', () => {
      const config = { ...validConfig, serviceUrls: 'not-an-object' };
      // @ts-expect-error Testing invalid input
      expect(() => ConfigValidator.validate(config)).toThrow(CustomError);
      expect(() => ConfigValidator.validate(config)).toThrow('Service URLs must be an object');
    });

    it('should throw TimeoutError when defaultTimeout is invalid', () => {
      const config = { ...validConfig, defaultTimeout: 0 };
      expect(() => ConfigValidator.validate(config)).toThrow(TimeoutError);
      expect(() => ConfigValidator.validate(config)).toThrow('Valid defaultTimeout (positive number) is required');
    });

    it('should throw TimeoutError when defaultTimeout is negative', () => {
      const config = { ...validConfig, defaultTimeout: -1 };
      expect(() => ConfigValidator.validate(config)).toThrow(TimeoutError);
    });

    it('should throw CustomError when checkInterval is invalid', () => {
      const config = { ...validConfig, checkInterval: 0 };
      expect(() => ConfigValidator.validate(config)).toThrow(CustomError);
      expect(() => ConfigValidator.validate(config)).toThrow('Valid checkInterval (positive number) is required');
    });

    it('should throw CustomError when retryAttempts is negative', () => {
      const config = { ...validConfig, retryAttempts: -1 };
      expect(() => ConfigValidator.validate(config)).toThrow(CustomError);
      expect(() => ConfigValidator.validate(config)).toThrow('Valid retryAttempts (non-negative number) is required');
    });

    it('should throw CustomError when retryDelay is negative', () => {
      const config = { ...validConfig, retryDelay: -1 };
      expect(() => ConfigValidator.validate(config)).toThrow(CustomError);
      expect(() => ConfigValidator.validate(config)).toThrow('Valid retryDelay (non-negative number) is required');
    });

    it('should accept zero retryAttempts', () => {
      const config = { ...validConfig, retryAttempts: 0 };
      expect(() => ConfigValidator.validate(config)).not.toThrow();
    });

    it('should accept zero retryDelay', () => {
      const config = { ...validConfig, retryDelay: 0 };
      expect(() => ConfigValidator.validate(config)).not.toThrow();
    });
  });

  describe('service URL validation', () => {
    it('should throw ValidationError when knowledge-base URL is missing', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': '',
          'auth-service': 'http://localhost:2500/health',
        },
      };
      expect(() => ConfigValidator.validate(config)).toThrow(ValidationError);
      expect(() => ConfigValidator.validate(config)).toThrow('URL is required for service: knowledge-base');
    });

    it('should throw ValidationError when auth-service URL is missing', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': 'http://localhost:4200/health',
          'auth-service': '',
        },
      };
      expect(() => ConfigValidator.validate(config)).toThrow(ValidationError);
      expect(() => ConfigValidator.validate(config)).toThrow('URL is required for service: auth-service');
    });

    it('should throw ValidationError when URL is not a string', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': 123,
          'auth-service': 'http://localhost:2500/health',
        },
      };
      // @ts-expect-error Testing invalid input
      expect(() => ConfigValidator.validate(config)).toThrow(ValidationError);
      // @ts-expect-error Testing invalid input
      expect(() => ConfigValidator.validate(config)).toThrow('URL must be a string for service');
    });

    it('should throw ValidationError when URL format is invalid', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': 'not-a-valid-url',
          'auth-service': 'http://localhost:2500/health',
        },
      };
      expect(() => ConfigValidator.validate(config)).toThrow(ValidationError);
      expect(() => ConfigValidator.validate(config)).toThrow('Invalid URL for service knowledge-base: not-a-valid-url');
    });

    it('should accept valid HTTP URLs', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': 'http://localhost:4200/health',
          'auth-service': 'http://localhost:2500/health',
        },
      };
      expect(() => ConfigValidator.validate(config)).not.toThrow();
    });

    it('should accept valid HTTPS URLs', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': 'https://api.example.com/health',
          'auth-service': 'https://auth.example.com/health',
        },
      };
      expect(() => ConfigValidator.validate(config)).not.toThrow();
    });

    it('should accept URLs with ports', () => {
      const config = {
        ...validConfig,
        serviceUrls: {
          'knowledge-base': 'http://localhost:4200/health',
          'auth-service': 'http://192.168.1.1:8080/health',
        },
      };
      expect(() => ConfigValidator.validate(config)).not.toThrow();
    });
  });
});
