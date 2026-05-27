import puppeteer from 'puppeteer'

export interface CaptureOptions {
  width?: number
  height?: number
  deviceScaleFactor?: number
}

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

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 })
    const buffer = Buffer.from(await page.screenshot({ type: 'png' }))

    return buffer
  } finally {
    await browser.close()
  }
}
