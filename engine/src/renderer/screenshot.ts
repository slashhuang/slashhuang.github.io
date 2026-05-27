import puppeteer from 'puppeteer'

const PAGE_LOAD_TIMEOUT_MS = 30_000

export interface CaptureOptions {
  /** Viewport width in CSS pixels. Default: 1080 */
  width?: number
  /** Viewport height in CSS pixels. Default: 1440 */
  height?: number
  /** Device scale factor for output resolution. Default: 2 (retina) */
  deviceScaleFactor?: number
}

/**
 * Renders an HTML string in a headless Chromium browser and captures a PNG screenshot.
 * Each call launches a fresh browser instance — for batch rendering, reuse a browser externally.
 *
 * @param html - The HTML content to render
 * @param options - Optional viewport dimensions
 * @returns PNG image as a Node.js Buffer
 */
export async function captureCard(html: string, options: CaptureOptions = {}): Promise<Buffer> {
  const {
    width = 1080,
    height = 1440,
    deviceScaleFactor = 2,
  } = options

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setViewport({ width, height, deviceScaleFactor })

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: PAGE_LOAD_TIMEOUT_MS })
    const buffer = Buffer.from(await page.screenshot({ type: 'png' }))

    return buffer
  } finally {
    await browser.close()
  }
}
