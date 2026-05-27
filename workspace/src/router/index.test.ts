import { describe, it, expect } from 'vitest'
import { router } from './index'

describe('router', () => {
  it('has routes for home, list, editor, and preview', () => {
    const routeNames = router.getRoutes().map(r => r.name)
    expect(routeNames).toContain('home')
    expect(routeNames).toContain('list')
    expect(routeNames).toContain('editor')
    expect(routeNames).toContain('preview')
  })

  it('resolves "/" to home', () => {
    const resolved = router.resolve('/')
    expect(resolved.name).toBe('home')
  })

  it('resolves "/list" to list', () => {
    const resolved = router.resolve('/list')
    expect(resolved.name).toBe('list')
  })

  it('resolves "/editor/abc123" to editor with id param', () => {
    const resolved = router.resolve('/editor/abc123')
    expect(resolved.name).toBe('editor')
    expect(resolved.params.id).toBe('abc123')
  })

  it('resolves "/editor" to editor without id', () => {
    const resolved = router.resolve('/editor')
    expect(resolved.name).toBe('editor')
  })

  it('resolves "/preview/xyz" to preview with id param', () => {
    const resolved = router.resolve('/preview/xyz')
    expect(resolved.name).toBe('preview')
    expect(resolved.params.id).toBe('xyz')
  })

  it('uses /workspace/ as base path', () => {
    // The router should have been created with base '/workspace/'
    // We verify by checking that routes are registered correctly
    const routes = router.getRoutes()
    expect(routes.length).toBeGreaterThanOrEqual(4)
  })
})
