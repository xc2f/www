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

// html
import rehypeRaw from 'rehype-raw'

import { Code as CodeHighlighter } from '../Code/Component.client'
import { Checkbox } from '@/components/ui/checkbox'

import './style.scss'

type Props = {
  className?: string
} & MarkdownBlockProps

export const MarkdownBlock: React.FC<Props> = ({ className, content }) => {
  const withClassName = cn(className, 'markdown')
  const markdownContent = (
    <Markdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      components={{
        // 拦截 pre 标签
        pre(props) {
          const { children, ...rest } = props
          return <>{children}</>
        },
        // 代码高亮逻辑
        code(props) {
          const { children, className, ...rest } = props
          const match = /language-(\w+)/.exec(className || '')
          if (match) {
            const content = String(children).trim()
            return <CodeHighlighter code={content} language={match[1]} />
          }
          return (
            <code {...rest} className={className}>
              {children}
            </code>
          )
        },
        input(props) {
          if (props.type === 'checkbox') {
            const { checked, disabled } = props
            return <Checkbox checked={checked} disabled={disabled} className="relative top-[3px]" />
          }
          return <input {...props} />
        },
        table(props) {
          const { node, ...rest } = props
          return (
            <div className="table-container overflow-auto table-scroll">
              <table {...rest} />
            </div>
          )
        },
      }}
    >
      {convertLexicalToPlaintext({ data: content })}
    </Markdown>
  )

  return <div className={withClassName}>{markdownContent}</div>
}
