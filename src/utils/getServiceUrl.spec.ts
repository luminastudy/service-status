import { describe, it, expect } from 'vitest'
import { getServiceUrl } from './getServiceUrl'
import type { ServiceUrls } from '../types/ServiceUrls'
import { ValidationError } from '../errors/ValidationError'

describe('getServiceUrl', () => {
  const serviceUrls: ServiceUrls = {
    'knowledge-base': 'http://localhost:4200/health',
    'auth-service': 'http://localhost:2500/health',
    'recommendation-service': 'http://localhost:3500/health',
  }

  it('should return knowledge-base URL', () => {
    const url = getServiceUrl(serviceUrls, 'knowledge-base')
    expect(url).toBe('http://localhost:4200/health')
  })

  it('should return auth-service URL', () => {
    const url = getServiceUrl(serviceUrls, 'auth-service')
    expect(url).toBe('http://localhost:2500/health')
  })

  it('should return recommendation-service URL', () => {
    const url = getServiceUrl(serviceUrls, 'recommendation-service')
    expect(url).toBe('http://localhost:3500/health')
  })

  it('should throw ValidationError for unknown service', () => {
    expect(() => {
      // @ts-expect-error - Testing with invalid service name
      getServiceUrl(serviceUrls, 'unknown')
    }).toThrow(ValidationError)
  })
})
