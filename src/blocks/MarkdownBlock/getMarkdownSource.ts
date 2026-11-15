import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { MarkdownBlock } from '@/payload-types'

export function getMarkdownSource(data: MarkdownBlock['content']) {
  const enterGaps = new Set<number>()
  if (!data?.root?.children?.every((node) => node.type === 'paragraph')) {
    return { source: convertLexicalToPlaintext({ data }), enterGaps }
  }

  let line = 0
  let hasContent = false
  const source = convertLexicalToPlaintext({
    data,
    converters: {
      paragraph: ({ node, nodesToPlaintext }) => {
        const text = nodesToPlaintext({ nodes: node.children }).join('').replace(/\r\n?/g, '\n')
        const separator = hasContent ? '\n\n' : ''
        if (hasContent) {
          enterGaps.add(line + 1)
          line += 2
        }
        line += text.split('\n').length - 1
        hasContent ||= text.length > 0
        return separator + text
      },
    },
  })

  return { source, enterGaps }
}
