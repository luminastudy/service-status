import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthChecker } from './HealthChecker.js';

describe('HealthChecker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    const checker = new HealthChecker(5000, 3, 1000);
    expect(checker).toBeDefined();
  });
});
