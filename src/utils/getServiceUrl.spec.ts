import { describe, it, expect } from 'vitest'
import type { ServiceUrls } from '../types/ServiceUrls'
import { ValidationError } from '../errors/ValidationError'
import { getServiceUrl } from './getServiceUrl'

describe('getServiceUrl', () => {
  const serviceUrls: ServiceUrls = {
    'knowledge-base': 'http://localhost:4200/health',
    'auth-service': 'http://localhost:2500/health',
    'user-service': 'http://localhost:6700/health',
    'feedback-service': 'http://localhost:7500/health',
    'courses-service': 'http://localhost:7688/health',
  }

  it('should return knowledge-base URL', () => {
    const url = getServiceUrl(serviceUrls, 'knowledge-base')
    expect(url).toBe('http://localhost:4200/health')
  })

  it('should return auth-service URL', () => {
    const url = getServiceUrl(serviceUrls, 'auth-service')
    expect(url).toBe('http://localhost:2500/health')
  })

  it('should return user-service URL', () => {
    const url = getServiceUrl(serviceUrls, 'user-service')
    expect(url).toBe('http://localhost:6700/health')
  })

  it('should return feedback-service URL', () => {
    const url = getServiceUrl(serviceUrls, 'feedback-service')
    expect(url).toBe('http://localhost:7500/health')
  })

  it('should return courses-service URL', () => {
    const url = getServiceUrl(serviceUrls, 'courses-service')
    expect(url).toBe('http://localhost:7688/health')
  })

  it('should throw ValidationError for unknown service', () => {
    expect(() => {
      // @ts-expect-error - Testing with invalid service name
      getServiceUrl(serviceUrls, 'unknown')
    }).toThrow(ValidationError)
  })
})
