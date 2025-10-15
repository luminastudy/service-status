import { describe, it, expect } from 'vitest';
import { TimeoutError } from './TimeoutError.js';

describe('TimeoutError', () => {
  it('should create error with message', () => {
    const error = new TimeoutError('Timeout occurred');
    expect(error.message).toBe('Timeout occurred');
    expect(error.name).toBe('TimeoutError');
  });
});
