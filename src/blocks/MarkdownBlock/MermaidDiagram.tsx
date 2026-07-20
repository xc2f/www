'use client'

import React, { useEffect, useId, useMemo, useState } from 'react'

type Props = {
  chart: string
}

type RenderState =
  | {
      status: 'idle' | 'loading'
      svg?: never
      error?: never
    }
  | {
      status: 'ready'
      svg: string
      error?: never
    }
  | {
      status: 'error'
      svg?: never
      error: string
    }

const getMermaidTheme = () => {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

export const MermaidDiagram: React.FC<Props> = ({ chart }) => {
  const reactId = useId()
  const diagramId = useMemo(() => `mermaid-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [reactId])
  const [renderState, setRenderState] = useState<RenderState>({ status: 'idle' })

  useEffect(() => {
    let cancelled = false

    const renderDiagram = async () => {
      const source = chart.trim()

      if (!source) {
        setRenderState({ status: 'idle' })
        return
      }

      setRenderState({ status: 'loading' })

      try {
        const mermaid = (await import('mermaid')).default
        const theme = getMermaidTheme()

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: theme === 'dark' ? 'dark' : 'default',
        })

        const { svg } = await mermaid.render(diagramId, source)

        if (!cancelled) {
          setRenderState({ status: 'ready', svg })
        }
      } catch (error) {
        if (!cancelled) {
          setRenderState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Unable to render Mermaid diagram.',
          })
        }
      }
    }

    void renderDiagram()

    const observer = new MutationObserver(() => {
      void renderDiagram()
    })

    observer.observe(document.documentElement, { attributeFilter: ['data-theme'] })

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [chart, diagramId])

  if (renderState.status === 'error') {
    return (
      <figure className="mermaid-diagram mermaid-diagram--error not-prose">
        <figcaption>Mermaid render error</figcaption>
        <pre>
          <code>{renderState.error}</code>
        </pre>
      </figure>
    )
  }

  return (
    <figure className="mermaid-diagram not-prose">
      {renderState.status === 'ready' ? (
        <div
          className="mermaid-diagram__canvas"
          dangerouslySetInnerHTML={{ __html: renderState.svg }}
        />
      ) : (
        <div className="mermaid-diagram__placeholder">Rendering diagram...</div>
      )}
    </figure>
  )
}
