import { cn } from './utils'

describe('cn utility function', () => {
  it('joins class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('merges Tailwind class names', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('returns empty string when no inputs are provided', () => {
    expect(cn()).toBe('')
  })
})