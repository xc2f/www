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
        const isDark = theme === 'dark'

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            darkMode: isDark,
            fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, sans-serif',
            background: isDark ? '#06080A' : '#f8fbfc',
            mainBkg: isDark ? '#0a1017' : '#f8fbfc',
            primaryColor: isDark ? '#0a1017' : '#ffffff',
            primaryBorderColor: isDark ? 'rgba(125, 215, 255, 0.26)' : 'rgba(15, 23, 42, 0.14)',
            primaryTextColor: isDark ? 'rgba(255, 255, 255, 0.78)' : 'rgba(15, 23, 42, 0.86)',
            secondaryColor: isDark ? '#101821' : '#eef3f6',
            secondaryBorderColor: isDark
              ? 'rgba(255, 143, 114, 0.22)'
              : 'rgba(255, 143, 114, 0.24)',
            secondaryTextColor: isDark
              ? 'rgba(255, 255, 255, 0.72)'
              : 'rgba(15, 23, 42, 0.78)',
            tertiaryColor: isDark ? '#111820' : '#f3f7fa',
            tertiaryBorderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(15, 23, 42, 0.1)',
            tertiaryTextColor: isDark
              ? 'rgba(255, 255, 255, 0.66)'
              : 'rgba(71, 85, 105, 0.96)',
            lineColor: isDark ? 'rgba(125, 215, 255, 0.38)' : 'rgba(51, 65, 85, 0.38)',
            textColor: isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.82)',
            nodeTextColor: isDark ? 'rgba(255, 255, 255, 0.78)' : 'rgba(15, 23, 42, 0.86)',
            edgeLabelBackground: isDark ? '#0a1017' : '#f8fbfc',
            clusterBkg: isDark ? 'rgba(255, 255, 255, 0.025)' : 'rgba(248, 251, 252, 0.72)',
            clusterBorder: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)',
            defaultLinkColor: isDark ? 'rgba(125, 215, 255, 0.38)' : 'rgba(51, 65, 85, 0.38)',
            titleColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(15, 23, 42, 0.88)',
            actorBkg: isDark ? '#0a1017' : '#ffffff',
            actorBorder: isDark ? 'rgba(125, 215, 255, 0.24)' : 'rgba(15, 23, 42, 0.14)',
            actorTextColor: isDark ? 'rgba(255, 255, 255, 0.78)' : 'rgba(15, 23, 42, 0.86)',
            actorLineColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(15, 23, 42, 0.12)',
            signalColor: isDark ? 'rgba(125, 215, 255, 0.46)' : 'rgba(14, 116, 144, 0.42)',
            signalTextColor: isDark ? 'rgba(255, 255, 255, 0.78)' : 'rgba(15, 23, 42, 0.86)',
            labelBoxBkgColor: isDark ? '#0a1017' : '#f8fbfc',
            labelBoxBorderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(15, 23, 42, 0.1)',
            labelTextColor: isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(15, 23, 42, 0.82)',
            noteBkgColor: isDark ? 'rgba(255, 212, 121, 0.08)' : 'rgba(255, 212, 121, 0.18)',
            noteBorderColor: isDark ? 'rgba(255, 212, 121, 0.22)' : 'rgba(180, 83, 9, 0.18)',
            noteTextColor: isDark ? 'rgba(255, 255, 255, 0.72)' : 'rgba(71, 85, 105, 0.96)',
            classText: isDark ? 'rgba(255, 255, 255, 0.76)' : 'rgba(15, 23, 42, 0.84)',
            fillType0: isDark ? '#0a1017' : '#ffffff',
            fillType1: isDark ? '#101821' : '#f3f7fa',
            fillType2: isDark ? '#111820' : '#eef3f6',
            fillType3: isDark ? '#0b1118' : '#ffffff',
            fillType4: isDark ? '#0d151d' : '#f8fbfc',
            fillType5: isDark ? '#121a23' : '#eef3f6',
            fillType6: isDark ? '#0b1118' : '#ffffff',
            fillType7: isDark ? '#101821' : '#f3f7fa',
          },
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
