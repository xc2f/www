import { createElement, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { MarkdownBlock } from '@/blocks/MarkdownBlock/Component'
import type { MarkdownBlock as MarkdownBlockData } from '@/payload-types'

vi.mock('@/blocks/Code/CopyButton', () => ({ CopyButton: () => null }))

function block(...paragraphs: string[]) {
  const content: MarkdownBlockData['content'] = {
    root: {
      type: 'root',
      version: 1,
      direction: null,
      format: '',
      indent: 0,
      children: paragraphs.map((paragraph) => ({
        type: 'paragraph',
        version: 1,
        children: paragraph.split('\n').flatMap((text, index) => {
          const node = { type: 'text', text, version: 1 }
          return index ? [{ type: 'linebreak', version: 1 }, node] : [node]
        }),
      })),
    },
  }

  return createElement(MarkdownBlock, { blockType: 'markdown', content })
}

describe('Markdown block rendering', () => {
  it('renders tables with optional outer pipes, including within a quote', () => {
    const rows = ['Name | Value', '--- | ---:', 'Example | first<br>second']
    const html = renderToStaticMarkup(
      createElement(Fragment, null, block(...rows), block(...rows.map((row) => '> ' + row))),
    )
    const document = new DOMParser().parseFromString(html, 'text/html')

    expect(document.querySelectorAll('table')).toHaveLength(2)
    expect(document.querySelector('blockquote table td:last-child')?.innerHTML).toBe(
      'first<br>second',
    )
  })

  it('retains native code blocks and the indentation of highlighted code', () => {
    const plain = renderToStaticMarkup(block('```\n  first\nsecond\n```'))
    const highlighted = renderToStaticMarkup(block('```python', '  first', 'second', '```'))

    expect(plain).toContain('<pre><code>  first\nsecond\n</code></pre>')
    expect(highlighted).toContain('>  first\nsecond</code></pre>')
  })

  it('keeps an explicit blank line within code', () => {
    const html = renderToStaticMarkup(block('```', 'first', '', 'second\n\nthird', '```'))

    expect(html).toContain('<pre><code>first\n\nsecond\n\nthird\n</code></pre>')
  })

  it('keeps footnote links and accessible labels scoped to each block', () => {
    const html = renderToStaticMarkup(
      createElement(Fragment, null,
        block('甲[^注]乙[^注]', '[^注]: 说明'),
        block('丙[^注]', '[^注]: 另一条'),
      ),
    )
    const document = new DOMParser().parseFromString(html, 'text/html')
    const links = [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]

    expect(links).toHaveLength(6)
    for (const link of links) {
      const target = document.getElementById(decodeURIComponent(link.hash.slice(1)))
      expect(target?.closest('.markdown')).toBe(link.closest('.markdown'))
      const label = link.getAttribute('aria-describedby')
      if (label) expect(document.getElementById(label)?.closest('.markdown')).toBe(link.closest('.markdown'))
    }
  })

  it('joins consecutive quote lines and keeps consecutive list items compact', () => {
    const html = renderToStaticMarkup(block(
      '> first', '> second', '', '- one', '- two', '', 'paragraph\nline', 'next paragraph',
    ))

    expect(html).toContain('<blockquote>\n<p>first<br/>\nsecond</p>\n</blockquote>')
    expect(html).toContain('<ul>\n<li>one</li>\n<li>two</li>\n</ul>')
    expect(html).toContain('<p>paragraph<br/>\nline</p>\n<p>next paragraph</p>')
  })
})
