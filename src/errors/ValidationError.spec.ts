import { describe, it, expect } from 'vitest';
import { ValidationError } from './ValidationError.js';

describe('ValidationError', () => {
  it('should create error with message', () => {
    const error = new ValidationError('Validation failed');
    expect(error.message).toBe('Validation failed');
    expect(error.name).toBe('ValidationError');
  });
});
