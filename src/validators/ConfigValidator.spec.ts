import { describe, it, expect } from 'vitest';
import { ConfigValidator } from './ConfigValidator.js';

describe('ConfigValidator', () => {
  it('should validate valid config', () => {
    const config = {
      serviceUrls: {
        'knowledge-base': 'http://localhost:4200/health',
        'auth-service': 'http://localhost:2500/health',
      },
      defaultTimeout: 5000,
      checkInterval: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    };

    expect(() => ConfigValidator.validate(config)).not.toThrow();
  });

  it('should throw on missing config', () => {
    // @ts-expect-error Testing invalid input
    expect(() => ConfigValidator.validate(null)).toThrow();
  });
});
