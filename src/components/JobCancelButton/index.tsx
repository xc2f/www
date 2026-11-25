'use client'

import { Button, useConfig, useDocumentInfo } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useState } from 'react'

const JobCancelButton = () => {
  const { id, data } = useDocumentInfo()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // 已完成（成功/失败/取消）的 job 不再需要取消按钮。
  const isFinished = Boolean(data?.completedAt)
  const hasError = Boolean(data?.hasError)

  if (!id || isFinished || hasError) return null

  const cancel = async () => {
    if (!window.confirm('确定要取消这个任务吗？')) return

    setBusy(true)
    setError('')
    try {
      const response = await fetch(`${api}/payload-jobs/${encodeURIComponent(String(id))}/cancel`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as {
          errors?: { message?: string }[]
          message?: string
        }
        throw new Error(result.errors?.[0]?.message ?? result.message ?? '取消失败，请刷新后重试。')
      }

      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : '取消失败，请稍后重试。')
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBlock: 'var(--base)' }}>
      <Button
        type="button"
        size="medium"
        buttonStyle="secondary"
        disabled={busy}
        onClick={() => void cancel()}
      >
        取消任务
      </Button>
      {busy && <p role="status">正在取消…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

export default JobCancelButton satisfies UIFieldClientComponent
