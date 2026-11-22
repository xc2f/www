'use client'

import { Button, useConfig, useDocumentInfo, useFormFields } from '@payloadcms/ui'
import type { UIFieldClientComponent } from 'payload'
import { useId, useState } from 'react'

const MailDeliveryResolution = () => {
  const { id, data } = useDocumentInfo()
  const {
    config: {
      routes: { api },
    },
  } = useConfig()
  const status = useFormFields(([fields]) => fields.sendStatus?.value)
  const noteId = useId()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (status !== 'uncertain' || !id) return null

  const resolve = async (outcome: 'sent' | 'failed') => {
    if (
      !window.confirm(
        outcome === 'sent'
          ? '已核实这封邮件已发送？'
          : '已核实这封邮件未发送？确认后仍需重新发布才能发送。',
      )
    )
      return
    setBusy(true)
    setError('')
    try {
      const response = await fetch(
        `${api}/mails/${encodeURIComponent(String(id))}/resolve-delivery`,
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ outcome, note, deliveryToken: data?.deliveryToken ?? null }),
        },
      )
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.errors?.[0]?.message ?? result.message ?? '确认失败，请刷新后重试。')
      }
      window.location.reload()
    } catch (error) {
      setError(error instanceof Error ? error.message : '确认失败，请稍后重试。')
      setBusy(false)
    }
  }

  return (
    <div style={{ marginBlock: 'var(--base)' }}>
      <p>请先核实邮件服务记录或收件情况。确认操作只记录结果，不会发送邮件。</p>
      <label htmlFor={noteId}>核实说明</label>
      <textarea
        id={noteId}
        value={note}
        maxLength={2000}
        disabled={busy}
        onChange={(event) => setNote(event.target.value)}
        style={{
          width: '100%',
          minHeight: '6em',
          background: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          border: '1px solid var(--theme-elevation-200)',
        }}
      />
      <Button
        type="button"
        size="small"
        disabled={busy || !note.trim()}
        onClick={() => void resolve('sent')}
      >
        确认已发送
      </Button>
      <Button
        type="button"
        size="small"
        buttonStyle="secondary"
        disabled={busy || !note.trim()}
        onClick={() => void resolve('failed')}
      >
        确认未发送
      </Button>
      {busy && <p role="status">正在保存核实结果…</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  )
}

export default MailDeliveryResolution satisfies UIFieldClientComponent
