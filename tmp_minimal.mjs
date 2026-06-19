import { chromium } from 'playwright'

const run = async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  page.on('pageerror', e => console.log('PAGEERROR:', e.message))
  page.on('console', m => { if (m.type()==='error') console.log('CONSOLE ERROR:', m.text()) })
  page.on('crash', () => console.log('CRASH'))
  await page.goto('http://localhost:5216/students')
  await page.waitForTimeout(1000)
  console.log('loaded ok, title:', await page.title())
  await browser.close()
}
run().catch(e => console.error('ERR', e))
