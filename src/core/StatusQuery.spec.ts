import { describe, it, expect, beforeEach } from 'vitest';
import { StatusQuery } from './StatusQuery.js';
import type { ServiceHealthCheck } from '../types/ServiceHealthCheck.js';

describe('StatusQuery', () => {
  let statusQuery: StatusQuery;
  let healthChecks: Map<string, ServiceHealthCheck>;

  beforeEach(() => {
    healthChecks = new Map();
    healthChecks.set('knowledge-base', {
      url: 'http://localhost:4200/health',
      name: 'knowledge-base',
      status: 'healthy',
      lastChecked: new Date(),
      details: { statusCode: 200 },
      error: null,
    });
    healthChecks.set('auth-service', {
      url: 'http://localhost:2500/health',
      name: 'auth-service',
      status: 'unhealthy',
      lastChecked: new Date(),
      details: { statusCode: 500 },
      error: 'Connection timeout',
    });
    healthChecks.set('unknown-service', {
      url: 'http://localhost:3000/health',
      name: 'unknown-service',
      status: 'unknown',
      lastChecked: null,
      details: null,
      error: null,
    });

    statusQuery = new StatusQuery(healthChecks);
  });

  describe('getStatus', () => {
    it('should return status for existing service', () => {
      const status = statusQuery.getStatus('knowledge-base');
      expect(status).toBeTruthy();
      if (status) {
        expect(status.name).toBe('knowledge-base');
        expect(status.status).toBe('healthy');
      }
    });

    it('should return null for non-existent service', () => {
      const status = statusQuery.getStatus('non-existent');
      expect(status).toBeNull();
    });
  });

  describe('getAllStatuses', () => {
    it('should return a copy of all statuses', () => {
      const allStatuses = statusQuery.getAllStatuses();
      expect(allStatuses.size).toBe(3);
      expect(allStatuses.has('knowledge-base')).toBe(true);
      expect(allStatuses.has('auth-service')).toBe(true);
    });

    it('should return a new Map instance', () => {
      const allStatuses = statusQuery.getAllStatuses();
      expect(allStatuses).not.toBe(healthChecks);
    });
  });

  describe('getHealthyServices', () => {
    it('should return only healthy services', () => {
      const healthy = statusQuery.getHealthyServices();
      expect(healthy).toHaveLength(1);
      expect(healthy[0].name).toBe('knowledge-base');
      expect(healthy[0].status).toBe('healthy');
    });

    it('should return empty array when no healthy services', () => {
      healthChecks.clear();
      healthChecks.set('service1', {
        url: 'http://localhost:4200/health',
        name: 'service1',
        status: 'unhealthy',
        lastChecked: new Date(),
        details: {},
        error: 'Error',
      });
      const healthy = statusQuery.getHealthyServices();
      expect(healthy).toHaveLength(0);
    });
  });

  describe('getUnhealthyServices', () => {
    it('should return only unhealthy services', () => {
      const unhealthy = statusQuery.getUnhealthyServices();
      expect(unhealthy).toHaveLength(1);
      expect(unhealthy[0].name).toBe('auth-service');
      expect(unhealthy[0].status).toBe('unhealthy');
    });
  });

  describe('getUnknownServices', () => {
    it('should return only unknown services', () => {
      const unknown = statusQuery.getUnknownServices();
      expect(unknown).toHaveLength(1);
      expect(unknown[0].name).toBe('unknown-service');
      expect(unknown[0].status).toBe('unknown');
    });
  });

  describe('isAllHealthy', () => {
    it('should return false when some services are not healthy', () => {
      expect(statusQuery.isAllHealthy()).toBe(false);
    });

    it('should return true when all services are healthy', () => {
      healthChecks.clear();
      healthChecks.set('service1', {
        url: 'http://localhost:4200/health',
        name: 'service1',
        status: 'healthy',
        lastChecked: new Date(),
        details: {},
        error: null,
      });
      healthChecks.set('service2', {
        url: 'http://localhost:4200/health',
        name: 'service2',
        status: 'healthy',
        lastChecked: new Date(),
        details: {},
        error: null,
      });
      expect(statusQuery.isAllHealthy()).toBe(true);
    });

    it('should return true for empty health checks', () => {
      healthChecks.clear();
      expect(statusQuery.isAllHealthy()).toBe(true);
    });
  });

  describe('getSummary', () => {
    it('should return correct summary counts', () => {
      const summary = statusQuery.getSummary();
      expect(summary.total).toBe(3);
      expect(summary.healthy).toBe(1);
      expect(summary.unhealthy).toBe(1);
      expect(summary.unknown).toBe(1);
    });

    it('should return zeros for empty health checks', () => {
      healthChecks.clear();
      const summary = statusQuery.getSummary();
      expect(summary.total).toBe(0);
      expect(summary.healthy).toBe(0);
      expect(summary.unhealthy).toBe(0);
      expect(summary.unknown).toBe(0);
    });
  });
});
