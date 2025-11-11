import { describe, it, expect } from 'vitest'
import type { ServiceName } from './ServiceName.js'

describe('ServiceName', () => {
  it('should be a valid type for service names', () => {
    const validNames: ServiceName[] = ['knowledge-base', 'auth-service']
    expect(validNames.length).toBe(2)
  })

  it('should accept knowledge-base as valid service name', () => {
    const name: ServiceName = 'knowledge-base'
    expect(name).toBe('knowledge-base')
  })

  it('should accept auth-service as valid service name', () => {
    const name: ServiceName = 'auth-service'
    expect(name).toBe('auth-service')
  })
})
