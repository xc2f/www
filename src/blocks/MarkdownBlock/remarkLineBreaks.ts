type MarkdownNode = {
  type: string
  value?: string
  children?: MarkdownNode[]
}

// Lexical serializes Enter as a blank line and Shift+Enter as a single newline.
// Convert soft breaks after parsing so Markdown syntax can still use single newlines.
export function remarkLineBreaks() {
  return (tree: MarkdownNode) => {
    function visit(node: MarkdownNode, inParagraph = false): void {
      if (!node.children) return

      const renderBreaks = inParagraph || node.type === 'paragraph'
      node.children = node.children.flatMap((child) => {
        if (renderBreaks && child.type === 'text' && child.value?.includes('\n')) {
          return child.value.split('\n').flatMap((line, index) => {
            const text = line ? [{ type: 'text', value: line }] : []
            return index === 0 ? text : [{ type: 'break' }, ...text]
          })
        }

        visit(child, renderBreaks)
        return [child]
      })
    }

    visit(tree)
  }
}
