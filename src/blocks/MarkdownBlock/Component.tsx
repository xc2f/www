import type { MarkdownBlock as MarkdownBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

import Markdown from 'react-markdown'

// autolink literals, footnotes, strikethrough, tables, tasklists
import remarkGfm from 'remark-gfm'

// math
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

import { Code as CodeHighlighter } from '../Code/Component.client'

type Props = {
  className?: string
} & MarkdownBlockProps

export const MarkdownBlock: React.FC<Props> = ({ className, content }) => {
  const withClassName = cn(className)
  const markdownContent = (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // 1. 拦截 pre 标签
        pre(props) {
          const { children, ...rest } = props
          return <>{children}</>
        },
        // 2. 代码高亮逻辑
        code(props) {
          const { children, className, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          if (match) {
            const content = String(children).replace(/\n$/, '')
            return <CodeHighlighter code={content} language={match[1]} />
          }
          return (
            <code {...rest} className={className}>
              {children}
            </code>
          )
        },
      }}
    >
      {convertLexicalToPlaintext({ data: content })}
    </Markdown>
  )

  if (withClassName) {
    return <div className={withClassName}>{markdownContent}</div>
  } else {
    return markdownContent
  }
}
