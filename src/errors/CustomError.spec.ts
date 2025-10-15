import { describe, it, expect } from 'vitest';
import { CustomError } from './CustomError.js';

describe('CustomError', () => {
  it('should create error with message', () => {
    const error = new CustomError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('CustomError');
  });
});
