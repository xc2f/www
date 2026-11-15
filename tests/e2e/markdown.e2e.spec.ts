import { expect, test } from '@playwright/test'

test('negotiates Markdown and HTML at the same public URL', async ({ request }) => {
  const url = new URL('/en', process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000').href
  const markdown = await request.get(url, { headers: { Accept: 'text/markdown' } })
  expect(markdown.ok()).toBe(true)
  expect(markdown.headers()['content-type']).toMatch(/^text\/markdown\b/)
  expect(markdown.headers()['vary']?.split(/,\s*/).map((value) => value.toLowerCase())).toContain(
    'accept',
  )
  expect(await markdown.text()).toMatch(/^# .+\n[\s\S]*\]\(\/en\/posts\)/)

  for (const accept of ['*/*', 'text/html, text/markdown;q=0']) {
    const html = await request.get(url, { headers: { Accept: accept } })
    expect(html.ok()).toBe(true)
    expect(html.headers()['content-type']).toMatch(/^text\/html\b/)
    expect(html.headers()['vary']?.split(/,\s*/).map((value) => value.toLowerCase())).toContain(
      'accept',
    )
  }
})
