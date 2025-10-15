import { describe, it, expect } from 'vitest';
import { ServiceUrlExtractor } from './ServiceUrlExtractor.js';

describe('ServiceUrlExtractor', () => {
  it('should extract knowledge-base URL', () => {
    const urls = {
      'knowledge-base': 'http://localhost:4200',
      'auth-service': 'http://localhost:2500',
    };
    const url = ServiceUrlExtractor.getUrl(urls, 'knowledge-base');
    expect(url).toBe('http://localhost:4200');
  });

  it('should extract auth-service URL', () => {
    const urls = {
      'knowledge-base': 'http://localhost:4200',
      'auth-service': 'http://localhost:2500',
    };
    const url = ServiceUrlExtractor.getUrl(urls, 'auth-service');
    expect(url).toBe('http://localhost:2500');
  });
});
