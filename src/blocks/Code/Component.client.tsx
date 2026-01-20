'use client'
import { Highlight, themes, Prism } from 'prism-react-renderer'
import React, { useEffect, useState } from 'react'
import { CopyButton } from './CopyButton'

if (typeof window !== 'undefined') {
  ;(window as any).Prism = Prism
  require('prismjs/components/prism-bash')
}

type Props = {
  code: string
  language?: string
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  const [mounted, setMounted] = useState(false)

  // 只有在客户端挂载后才设置为 true
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!code) return null

  if (!mounted) {
    // 在 Hydration 完成前，返回一个简单的占位符（或者不带高亮的源代码）
    // 这样服务器和客户端初始渲染的 HTML 就会完全匹配
    return (
      <pre className="bg-black p-4 border text-xs border-border rounded overflow-x-auto">
        <code className="text-white">{code.trim()}</code>
      </pre>
    )
  }

  return (
    <Highlight prism={Prism} code={code.trim()} language={language} theme={themes.vsDark}>
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre className="bg-black p-4 border text-xs border-border rounded overflow-x-auto">
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ className: 'table-row', line })}>
              <span className="table-cell select-none text-right text-white/25">{i + 1}</span>
              <span className="table-cell pl-4">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
