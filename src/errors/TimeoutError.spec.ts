import { describe, it, expect } from 'vitest'
import { TimeoutError } from './TimeoutError.js'

describe('TimeoutError', () => {
  it('should create error with message', () => {
    const error = new TimeoutError('Timeout occurred')
    expect(error.message).toBe('Timeout occurred')
    expect(error.name).toBe('TimeoutError')
  })

  it('should be instance of Error', () => {
    const error = new TimeoutError('Test')
    expect(error).toBeInstanceOf(Error)
  })

  it('should be instance of TimeoutError', () => {
    const error = new TimeoutError('Test')
    expect(error).toBeInstanceOf(TimeoutError)
  })

  it('should have stack trace', () => {
    const error = new TimeoutError('Test')
    expect(error.stack).toBeDefined()
  })

  it('should be distinguishable from CustomError', () => {
    const error = new TimeoutError('Test')
    expect(error.name).not.toBe('CustomError')
    expect(error.name).toBe('TimeoutError')
  })
})
