import { test, expect } from '@playwright/test'

// Common device sizes
const deviceSizes = [
  { width: 320, height: 568, name: 'Mobile Small' }, // iPhone SE
  { width: 375, height: 667, name: 'Mobile Medium' }, // iPhone 6/7/8
  { width: 414, height: 896, name: 'Mobile Large' }, // iPhone 11 Pro Max
  { width: 768, height: 1024, name: 'Tablet' }, // iPad
  { width: 1024, height: 768, name: 'Tablet Landscape' },
  { width: 1280, height: 800, name: 'Desktop Small' },
  { width: 1920, height: 1080, name: 'Desktop Large' },
]

// Pages to test
const pagesToTest = [
  { path: '/', name: 'Home' },
  { path: '/login', name: 'Login' },
  { path: '/profile', name: 'Profile' },
  { path: '/dashboard', name: 'Dashboard' },
  { path: '/register', name: 'Register' },
]

for (const device of deviceSizes) {
  for (const page of pagesToTest) {
    test(`${page.name} page is responsive on ${device.name}`, async ({ page: testPage }) => {
      // Set viewport size
      await testPage.setViewportSize({
        width: device.width,
        height: device.height,
      })

      // Navigate to the page
      await testPage.goto(page.path)

      // Wait for the page to load
      await testPage.waitForLoadState('networkidle')

      // Check for horizontal scrollbar (indicates potential responsiveness issues)
      const hasHorizontalScrollbar = await testPage.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth
      })

      expect(hasHorizontalScrollbar).toBeFalsy()

      // Check if important elements are visible
      const header = await testPage.locator('header').first()
      await expect(header).toBeVisible()

      // Take a screenshot for visual comparison
      await testPage.screenshot({
        path: `test-results/responsive/${page.name.toLowerCase()}-${device.name.toLowerCase().replace(' ', '-')}.png`,
      })

      // Check for common responsive issues
      const overlappingElements = await testPage.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'))
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        return elements.some(el => {
          const rect = el.getBoundingClientRect()
          return rect.right > viewportWidth || rect.bottom > viewportHeight
        })
      })

      expect(overlappingElements).toBeFalsy()

      // Check for minimum touch target sizes on mobile
      if (device.width <= 414) {
        const smallTouchTargets = await testPage.evaluate(() => {
          const interactiveElements = Array.from(
            document.querySelectorAll('button, a, input, select, textarea')
          )
          return interactiveElements.some(el => {
            const rect = el.getBoundingClientRect()
            return rect.width < 44 || rect.height < 44
          })
        })

        expect(smallTouchTargets).toBeFalsy()
      }

      // Check form elements fit within viewport on mobile
      if (device.width <= 414) {
        const formElements = await testPage.evaluate(() => {
          const elements = Array.from(document.querySelectorAll('form, input, select, textarea'))
          const viewportWidth = window.innerWidth

          return elements.some(el => {
            const rect = el.getBoundingClientRect()
            return rect.width > viewportWidth - 20 // Allow some margin
          })
        })

        expect(formElements).toBeFalsy()
      }
    })
  }
}
