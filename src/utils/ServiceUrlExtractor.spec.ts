import { describe, it, expect } from 'vitest'
import { ServiceUrlExtractor } from './ServiceUrlExtractor.js'
import { ValidationError } from '../errors/ValidationError.js'

describe('ServiceUrlExtractor', () => {
  const mockUrls = {
    'knowledge-base': 'http://localhost:4200/health',
    'auth-service': 'http://localhost:2500/health',
  }

  describe('getUrl', () => {
    it('should extract knowledge-base URL', () => {
      const url = ServiceUrlExtractor.getUrl(mockUrls, 'knowledge-base')
      expect(url).toBe('http://localhost:4200/health')
    })

    it('should extract auth-service URL', () => {
      const url = ServiceUrlExtractor.getUrl(mockUrls, 'auth-service')
      expect(url).toBe('http://localhost:2500/health')
    })

    it('should work with different URL formats', () => {
      const urls = {
        'knowledge-base': 'https://api.example.com:8080/v1/health',
        'auth-service': 'http://192.168.1.1:3000/status',
      }

      expect(ServiceUrlExtractor.getUrl(urls, 'knowledge-base')).toBe(
        'https://api.example.com:8080/v1/health'
      )
      expect(ServiceUrlExtractor.getUrl(urls, 'auth-service')).toBe(
        'http://192.168.1.1:3000/status'
      )
    })

    it('should handle URLs with query parameters', () => {
      const urls = {
        'knowledge-base': 'http://localhost:4200/health?detailed=true',
        'auth-service': 'http://localhost:2500/health?format=json',
      }

      expect(ServiceUrlExtractor.getUrl(urls, 'knowledge-base')).toContain(
        '?detailed=true'
      )
      expect(ServiceUrlExtractor.getUrl(urls, 'auth-service')).toContain(
        '?format=json'
      )
    })

    it('should throw ValidationError for unknown service', () => {
      // This shouldn't happen in normal usage due to TypeScript types,
      // but we test the runtime behavior
      // @ts-expect-error Testing invalid input
      expect(() =>
        ServiceUrlExtractor.getUrl(mockUrls, 'unknown-service')
      ).toThrow(ValidationError)
    })
  })
})
