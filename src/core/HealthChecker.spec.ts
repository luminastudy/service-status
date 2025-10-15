import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HealthChecker } from './HealthChecker.js';
import type { ServiceConfig } from '../types/ServiceConfig.js';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('HealthChecker', () => {
  let healthChecker: HealthChecker;

  beforeEach(() => {
    vi.clearAllMocks();
    healthChecker = new HealthChecker(5000, 3, 1000);
  });

  afterEach(() => {
    healthChecker.cancelAll();
  });

  describe('checkService', () => {
    const mockService: ServiceConfig = {
      name: 'test-service',
      healthCheckUrl: 'http://localhost:3000/health',
      timeout: 5000,
    };

    it('should return healthy status when service responds with 200', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok', uptime: 12345 }),
      });

      const result = await healthChecker.checkService(mockService);

      expect(result.status).toBe('healthy');
      expect(result.name).toBe('test-service');
      expect(result.url).toBe('http://localhost:3000/health');
      expect(result.error).toBeNull();
      expect(result.details).toBeTruthy();
    });

    it('should return unhealthy status when service responds with error code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      });

      const result = await healthChecker.checkService(mockService);

      expect(result.status).toBe('unhealthy');
      expect(result.name).toBe('test-service');
      expect(result.error).toBeNull();
    });

    it('should retry on failure and succeed on second attempt', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ status: 'ok' }),
        });

      const result = await healthChecker.checkService(mockService);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(result.status).toBe('healthy');
    });

    it('should return unhealthy after all retry attempts fail', async () => {
      mockFetch
        .mockRejectedValueOnce(new Error('Network error 1'))
        .mockRejectedValueOnce(new Error('Network error 2'))
        .mockRejectedValueOnce(new Error('Network error 3'));

      const result = await healthChecker.checkService(mockService);

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(result.status).toBe('unhealthy');
      expect(result.error).toBe('Network error 3');
    });

    it('should include response time in details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'ok' }),
      });

      const result = await healthChecker.checkService(mockService);

      expect(result.details).toHaveProperty('responseTime');
      expect(typeof result.details.responseTime).toBe('number');
    });

    it('should handle timeout', async () => {
      const shortTimeoutChecker = new HealthChecker(100, 1, 0);
      mockFetch.mockImplementation(() => new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 200);
      }));

      const result = await shortTimeoutChecker.checkService(mockService);

      expect(result.status).toBe('unhealthy');
      expect(result.error).toContain('Timeout');
      shortTimeoutChecker.cancelAll();
    });

    it('should handle non-Error exceptions', async () => {
      mockFetch
        .mockRejectedValueOnce('String error')
        .mockRejectedValueOnce('String error')
        .mockRejectedValueOnce('String error');

      const result = await healthChecker.checkService(mockService);

      expect(result.status).toBe('unhealthy');
      expect(result.error).toBeTruthy();
    });
  });

  describe('cancelAll', () => {
    it('should cancel ongoing requests', () => {
      expect(() => healthChecker.cancelAll()).not.toThrow();
    });
  });
});
