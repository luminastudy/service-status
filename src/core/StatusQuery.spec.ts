import { describe, it, expect } from 'vitest';
import { StatusQuery } from './StatusQuery.js';

describe('StatusQuery', () => {
  it('should be defined', () => {
    const query = new StatusQuery(new Map());
    expect(query).toBeDefined();
  });
});
