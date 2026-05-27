import { describe, it, expect } from 'vitest'
import { captureCard } from './screenshot.js'

describe('captureCard', () => {
  it('returns a PNG buffer from HTML input', async () => {
    const html = `<div style="width: 1080px; height: 1440px; background: white; display: flex; align-items: center; justify-content: center; font-size: 48px;">Test Card</div>`
    const buffer = await captureCard(html, { width: 1080, height: 1440, deviceScaleFactor: 2 })

    expect(buffer).toBeInstanceOf(Buffer)
    expect(buffer.length).toBeGreaterThan(0)
    // PNG magic number
    expect(buffer[0]).toBe(0x89)
    expect(buffer[1]).toBe(0x50)
    expect(buffer[2]).toBe(0x4e)
    expect(buffer[3]).toBe(0x47)
  })
})
