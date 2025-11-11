import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServiceManager } from './ServiceManager.js'
import { HealthChecker } from './HealthChecker.js'
import type { ServiceConfig } from '../types/ServiceConfig.js'
import type { ServiceHealthCheck } from '../types/ServiceHealthCheck.js'

describe('ServiceManager', () => {
  let serviceManager: ServiceManager
  let healthChecker: HealthChecker
  let healthChecks: Map<string, ServiceHealthCheck>
  let services: ServiceConfig[]

  beforeEach(() => {
    healthChecker = new HealthChecker(5000, 3, 1000)
    healthChecks = new Map()
    services = [
      {
        name: 'knowledge-base',
        healthCheckUrl: 'http://localhost:4200/health',
        timeout: 5000,
      },
      {
        name: 'auth-service',
        healthCheckUrl: 'http://localhost:2500/health',
        timeout: 5000,
      },
    ]
    serviceManager = new ServiceManager(services, healthChecker, healthChecks)
  })

  describe('checkService', () => {
    it('should return null for non-existent service', async () => {
      const result = await serviceManager.checkService('non-existent')
      expect(result).toBeNull()
    })

    it('should check existing service and update health checks map', async () => {
      vi.spyOn(healthChecker, 'checkService').mockResolvedValueOnce({
        url: 'http://localhost:4200/health',
        name: 'knowledge-base',
        status: 'healthy',
        lastChecked: new Date(),
        details: { statusCode: 200 },
        error: null,
      })

      const result = await serviceManager.checkService('knowledge-base')

      expect(result).toBeTruthy()
      if (result) {
        expect(result.status).toBe('healthy')
        expect(result.name).toBe('knowledge-base')
      }
      expect(healthChecks.has('knowledge-base')).toBe(true)
    })

    it('should handle service with unhealthy status', async () => {
      vi.spyOn(healthChecker, 'checkService').mockResolvedValueOnce({
        url: 'http://localhost:2500/health',
        name: 'auth-service',
        status: 'unhealthy',
        lastChecked: new Date(),
        details: { statusCode: 500 },
        error: 'Service unavailable',
      })

      const result = await serviceManager.checkService('auth-service')

      expect(result).toBeTruthy()
      if (result) {
        expect(result.status).toBe('unhealthy')
        expect(result.error).toBe('Service unavailable')
      }
    })
  })

  describe('checkAllServices', () => {
    it('should check all services concurrently', async () => {
      const checkServiceSpy = vi.spyOn(healthChecker, 'checkService')
      checkServiceSpy.mockResolvedValue({
        url: 'http://localhost:4200/health',
        name: 'test',
        status: 'healthy',
        lastChecked: new Date(),
        details: {},
        error: null,
      })

      await serviceManager.checkAllServices()

      expect(checkServiceSpy).toHaveBeenCalledTimes(2)
      expect(healthChecks.size).toBe(2)
    })

    it('should handle mixed results from multiple services', async () => {
      const checkServiceSpy = vi.spyOn(healthChecker, 'checkService')
      checkServiceSpy
        .mockResolvedValueOnce({
          url: 'http://localhost:4200/health',
          name: 'knowledge-base',
          status: 'healthy',
          lastChecked: new Date(),
          details: {},
          error: null,
        })
        .mockResolvedValueOnce({
          url: 'http://localhost:2500/health',
          name: 'auth-service',
          status: 'unhealthy',
          lastChecked: new Date(),
          details: {},
          error: 'Connection failed',
        })

      await serviceManager.checkAllServices()

      const kbCheck = healthChecks.get('knowledge-base')
      const authCheck = healthChecks.get('auth-service')
      expect(kbCheck).toBeTruthy()
      expect(authCheck).toBeTruthy()
      if (kbCheck && authCheck) {
        expect(kbCheck.status).toBe('healthy')
        expect(authCheck.status).toBe('unhealthy')
      }
    })

    it('should handle errors gracefully with Promise.allSettled', async () => {
      const checkServiceSpy = vi.spyOn(healthChecker, 'checkService')
      checkServiceSpy
        .mockResolvedValueOnce({
          url: 'http://localhost:4200/health',
          name: 'knowledge-base',
          status: 'healthy',
          lastChecked: new Date(),
          details: {},
          error: null,
        })
        .mockRejectedValueOnce(new Error('Network failure'))

      await expect(serviceManager.checkAllServices()).resolves.not.toThrow()
      expect(healthChecks.size).toBeGreaterThan(0)
    })
  })

  describe('cancelAll', () => {
    it('should call healthChecker cancelAll', () => {
      const cancelSpy = vi.spyOn(healthChecker, 'cancelAll')
      serviceManager.cancelAll()
      expect(cancelSpy).toHaveBeenCalledTimes(1)
    })
  })
})
