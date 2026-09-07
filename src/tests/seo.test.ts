import { describe, expect, it } from 'vitest'
import { canonicalUrl, normalizePath, routePathVariants, seoForPath } from '@/data/seo'

describe('seo helpers', () => {
  it('normalizes trailing slashes', () => {
    expect(normalizePath('/')).toBe('/')
    expect(normalizePath('/milling')).toBe('/milling')
    expect(normalizePath('/milling/')).toBe('/milling')
    expect(normalizePath('/milling///')).toBe('/milling')
  })

  it('builds canonical URLs with trailing slash on sections', () => {
    expect(canonicalUrl('/')).toBe('https://syncore54.ru/')
    expect(canonicalUrl('/milling')).toBe('https://syncore54.ru/milling/')
    expect(canonicalUrl('/milling/')).toBe('https://syncore54.ru/milling/')
  })

  it('resolves known page metadata', () => {
    expect(seoForPath('/milling/').title).toContain('Фрезерование')
    expect(seoForPath('/usage').robots).toBe('noindex,nofollow')
  })

  it('exposes router path variants for GitHub Pages', () => {
    expect(routePathVariants('/')).toEqual(['/'])
    expect(routePathVariants('/laser')).toEqual(['/laser', '/laser/'])
  })
})
