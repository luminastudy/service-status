import { describe, it, expect } from 'vitest';
import { ServiceManager } from './ServiceManager.js';
import { HealthChecker } from './HealthChecker.js';

describe('ServiceManager', () => {
  it('should be defined', () => {
    const healthChecker = new HealthChecker(5000, 3, 1000);
    const manager = new ServiceManager([], healthChecker, new Map());
    expect(manager).toBeDefined();
  });
});
