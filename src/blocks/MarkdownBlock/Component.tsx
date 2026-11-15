import type { MarkdownBlock as MarkdownBlockProps } from 'src/payload-types'

import { cn } from '@/utilities/ui'
import React, { isValidElement, useId } from 'react'

import Markdown from 'react-markdown'

// autolink literals, footnotes, strikethrough, tables, tasklists
import remarkGfm from 'remark-gfm'
import { remarkLineBreaks } from './remarkLineBreaks'
import { remarkTableRows } from './remarkTableRows'
import { getMarkdownSource } from './getMarkdownSource'

// math
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import 'katex/dist/katex.min.css'

// html whitelist
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema, type Options as SanitizeOptions } from 'rehype-sanitize'

import { Code as CodeHighlighter } from '../Code/Component.client'
import { Checkbox } from '@/components/ui/checkbox'
import { MermaidDiagram } from './MermaidDiagram'

import './style.scss'

type Props = {
  className?: string
} & MarkdownBlockProps

const classNamePattern = /^[A-Za-z0-9_:\-\s/.[\]]+$/

const markdownHtmlSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'iframe'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), ['className', classNamePattern]],
    iframe: [
      'allow',
      'allowFullScreen',
      'height',
      'loading',
      'referrerPolicy',
      'src',
      'title',
      'width',
    ],
  },
  protocols: {
    ...defaultSchema.protocols,
    src: ['https'],
  },
} satisfies SanitizeOptions

const sanitizedIdPrefix = defaultSchema.clobberPrefix ?? 'user-content-'
const footnoteLabelId = `${sanitizedIdPrefix}footnote-label`

export const MarkdownBlock: React.FC<Props> = ({ className, content }) => {
  const footnotePrefix = `markdown-${useId()}-`
  const localFootnoteLabelId = `${sanitizedIdPrefix}${footnotePrefix}footnote-label`
  const withClassName = cn(className, 'markdown')
  const { source, enterGaps } = getMarkdownSource(content)
  const markdownElement = (
    <Markdown
      remarkPlugins={[remarkMath, remarkGfm, [remarkTableRows, enterGaps], remarkLineBreaks]}
      remarkRehypeOptions={{ clobberPrefix: footnotePrefix }}
      rehypePlugins={[rehypeRaw, [rehypeSanitize, markdownHtmlSchema], rehypeKatex]}
      components={{
        a({ node, href, 'aria-describedby': label, ...props }) {
          const properties = node?.properties
          const isFootnote =
            properties?.dataFootnoteRef !== undefined ||
            properties?.dataFootnoteBackref !== undefined
          const target =
            isFootnote && href?.startsWith('#')
              ? `#${encodeURIComponent(sanitizedIdPrefix + href.slice(1))}`
              : href
          const description = isFootnote && label === footnoteLabelId ? localFootnoteLabelId : label
          return <a {...props} href={target} aria-describedby={description} />
        },
        h2({ node: _node, id, ...props }) {
          return <h2 {...props} id={id === footnoteLabelId ? localFootnoteLabelId : id} />
        },
        pre({ node: _node, children, ...props }) {
          if (isValidElement<{ className?: string; children?: React.ReactNode }>(children) &&
              children.type === 'code' && typeof children.props.children === 'string') {
            const language = children.props.className?.match(/(?:^|\s)language-([\w+-]+)/)?.[1]
            const code = children.props.children.replace(/\n$/, '')
            if (language === 'mermaid') return <MermaidDiagram chart={code} />
            if (language) {
              return <CodeHighlighter code={code} language={language} preserveWhitespace />
            }
          }
          return <pre {...props}>{children}</pre>
        },
        input(props) {
          if (props.type === 'checkbox') {
            const { checked, disabled } = props
            return <Checkbox checked={checked} disabled={disabled} className="relative top-[3px]" />
          }
          return <input {...props} />
        },
        table(props) {
          return (
            <div className="table-container overflow-auto table-scroll">
              <table {...props} />
            </div>
          )
        },
      }}
    >
      {source}
    </Markdown>
  )

  return <div className={withClassName}>{markdownElement}</div>
}
