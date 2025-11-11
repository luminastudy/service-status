import { describe, it, expect } from 'vitest'
import { CustomError } from './CustomError.js'

describe('CustomError', () => {
  it('should create error with message', () => {
    const error = new CustomError('Test error')
    expect(error.message).toBe('Test error')
    expect(error.name).toBe('CustomError')
  })

  it('should be instance of Error', () => {
    const error = new CustomError('Test')
    expect(error).toBeInstanceOf(Error)
  })

  it('should be instance of CustomError', () => {
    const error = new CustomError('Test')
    expect(error).toBeInstanceOf(CustomError)
  })

  it('should have stack trace', () => {
    const error = new CustomError('Test')
    expect(error.stack).toBeDefined()
  })

  it('should preserve error message in different scenarios', () => {
    const messages = [
      'Simple message',
      'Message with special chars: !@#$%^&*()',
      'Multi\nline\nmessage',
      '',
    ]

    for (const message of messages) {
      const error = new CustomError(message)
      expect(error.message).toBe(message)
    }
  })
})
