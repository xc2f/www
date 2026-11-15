import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { describe, expect, it } from 'vitest'

import { remarkLineBreaks } from '@/blocks/MarkdownBlock/remarkLineBreaks'
import { remarkTableRows } from '@/blocks/MarkdownBlock/remarkTableRows'

function render(source: string) {
  return renderToStaticMarkup(
    createElement(Markdown, {
      children: source,
      remarkPlugins: [remarkGfm, remarkTableRows, remarkLineBreaks],
    }),
  )
}

describe('Markdown table rows', () => {
  const header = '| Name | Value |'
  const delimiter = '| --- | ---: |'
  const row = '| Example | 42 |'

  it.each(['\n', '\n\n'])('renders rows separated by %j', (separator) => {
    const html = render([header, delimiter, row].join(separator))

    expect(html).toContain('<th>Name</th>')
    expect(html).toContain('<td style="text-align:right">42</td>')
  })

  it('keeps prose breaks and fenced examples intact', () => {
    const source = [header, delimiter, row].join('\n\n')
    const html = render(`First\nline\n\nSecond\n\n\`\`\`md\n${source}\n\`\`\``)

    expect(html).toMatch(/<p>First<br\/>\s*line<\/p>/)
    expect(html).toContain('<p>Second</p>')
    expect(html).toContain(source)
    expect(html).not.toContain('<table>')
  })

  it('keeps adjacent tables separate', () => {
    const source = [header, delimiter, row, header, delimiter, row].join('\n\n')

    expect(render(source).match(/<table>/g)).toHaveLength(2)
  })
})
