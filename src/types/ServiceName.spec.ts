import { describe, it, expect } from 'vitest'
import type { ServiceName } from './ServiceName.js'

describe('ServiceName', () => {
  it('should be a valid type for service names', () => {
    const validNames: ServiceName[] = [
      'knowledge-base',
      'auth-service',
      'user-service',
      'feedback-service',
      'courses-service',
    ]
    expect(validNames.length).toBe(5)
  })

  it('should accept knowledge-base as valid service name', () => {
    const name: ServiceName = 'knowledge-base'
    expect(name).toBe('knowledge-base')
  })

  it('should accept auth-service as valid service name', () => {
    const name: ServiceName = 'auth-service'
    expect(name).toBe('auth-service')
  })

  it('should accept user-service as valid service name', () => {
    const name: ServiceName = 'user-service'
    expect(name).toBe('user-service')
  })

  it('should accept feedback-service as valid service name', () => {
    const name: ServiceName = 'feedback-service'
    expect(name).toBe('feedback-service')
  })

  it('should accept courses-service as valid service name', () => {
    const name: ServiceName = 'courses-service'
    expect(name).toBe('courses-service')
  })
})
