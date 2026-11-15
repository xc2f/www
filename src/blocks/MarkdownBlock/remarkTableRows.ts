type MarkdownNode = {
  type: string
  position?: { start: { line: number; column: number }; end: { line: number } }
  children?: MarkdownNode[]
}

const quotePrefix = /^(?: {0,3}>[ \t]?)+/
const delimiterRow = /^ {0,3}\|?[ \t]*:?-+:?[ \t]*(?:\|[ \t]*:?-+:?[ \t]*)*\|?[ \t]*$/
const pipe = /(?:^|[^\\])(?:\\\\)*\|/
const fence = /^(?:`{3,}|~{3,})/

// Compact structural lines separated by Enter while retaining Markdown paragraph breaks.
export function remarkTableRows(
  this: { parse: (source: string) => unknown },
  enterGaps?: ReadonlySet<number>,
) {
  return (tree: MarkdownNode, file: { value: unknown }) => {
    if (typeof file.value !== 'string') return

    const lines = file.value.split(/\r\n|\n|\r/)
    const eligibleLines = new Set<number>()
    const gaps = new Set<number>()
    const quoteGaps: number[] = []
    const isEnter = (line: number) => enterGaps?.has(line) ?? lines[line] === ''
    const isSingleGap = (line: number) => lines[line] === '' && isEnter(line)

    function visit(node: MarkdownNode) {
      if (node.position) {
        const { start, end } = node.position
        if (node.type === 'paragraph' || node.type === 'table') {
          for (let line = start.line - 1; line < end.line; line++) eligibleLines.add(line)
        }
        if (node.type === 'code' && enterGaps && fence.test(lines[start.line - 1].slice(start.column - 1))) {
          for (let line = start.line; line < end.line - 1; line++) {
            if (isEnter(line)) gaps.add(line)
          }
        }
      }

      let previous: MarkdownNode | undefined
      for (const child of node.children ?? []) {
        if (previous?.position && child.position && previous.type === child.type) {
          const gap = previous.position.end.line
          const adjacent = child.position.start.line === gap + 2 && isSingleGap(gap)
          if (adjacent && node.type === 'list' && child.type === 'listItem') gaps.add(gap)
          if (adjacent && child.type === 'blockquote' &&
              quotePrefix.test(lines[gap - 1]) && quotePrefix.test(lines[gap + 1])) {
            quoteGaps.push(gap)
          }
        }
        visit(child)
        previous = child
      }
    }

    visit(tree)

    const rowContent = (line: number) => lines[line]?.replace(quotePrefix, '') ?? ''
    const quoteDepth = (line: number) => lines[line]?.match(quotePrefix)?.[0].match(/>/g)?.length ?? 0
    const isRow = (line: number) => eligibleLines.has(line) && pipe.test(rowContent(line))
    const nextRow = (line: number) => line + (isSingleGap(line + 1) ? 2 : 1)
    const isHeader = (line: number) => {
      const delimiter = nextRow(line)
      if (!isRow(line) || !isRow(delimiter) || !delimiterRow.test(rowContent(delimiter)) ||
          quoteDepth(line) !== quoteDepth(delimiter)) return false

      const parsed = this.parse(`${rowContent(line)}\n${rowContent(delimiter)}`) as MarkdownNode
      return parsed.children?.[0]?.type === 'table'
    }

    for (let line = 0; line < lines.length; line++) {
      if (!isHeader(line)) continue

      const depth = quoteDepth(line)
      let row = nextRow(line)
      if (row === line + 2) gaps.add(line + 1)

      let next = nextRow(row)
      while (isRow(next) && quoteDepth(next) === depth && !(next === row + 2 && isHeader(next))) {
        if (next === row + 2) gaps.add(row + 1)
        row = next
        next = nextRow(row)
      }
      line = row
    }

    for (const gap of quoteGaps) {
      // Keep a blank line before each separate table in a quote.
      if (!isHeader(gap + 1)) gaps.add(gap)
    }

    if (gaps.size) {
      const source = lines.filter((_, index) => !gaps.has(index)).join('\n')
      file.value = source
      return this.parse(source)
    }
  }
}
