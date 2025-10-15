import { describe, it, expect } from 'vitest';
import { ValidationError } from './ValidationError.js';

describe('ValidationError', () => {
  it('should create error with message', () => {
    const error = new ValidationError('Validation failed');
    expect(error.message).toBe('Validation failed');
    expect(error.name).toBe('ValidationError');
  });

  it('should be instance of Error', () => {
    const error = new ValidationError('Test');
    expect(error).toBeInstanceOf(Error);
  });

  it('should be instance of ValidationError', () => {
    const error = new ValidationError('Test');
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should have stack trace', () => {
    const error = new ValidationError('Test');
    expect(error.stack).toBeDefined();
  });

  it('should handle validation-specific error messages', () => {
    const errorMessages = [
      'URL is required for service: knowledge-base',
      'Invalid URL for service auth-service',
      'URL must be a string for service: test',
    ];

    for (const message of errorMessages) {
      const error = new ValidationError(message);
      expect(error.message).toBe(message);
      expect(error.name).toBe('ValidationError');
    }
  });
});
