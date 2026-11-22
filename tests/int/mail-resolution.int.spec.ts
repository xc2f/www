import { createElement, type ButtonHTMLAttributes } from 'react'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MailDeliveryResolution from '@/components/MailDeliveryResolution'

const state = vi.hoisted(() => ({ status: 'uncertain' }))
vi.mock('@payloadcms/ui', () => ({
  useDocumentInfo: () => ({ id: 42, data: { deliveryToken: 'plan-42' } }),
  useConfig: () => ({ config: { routes: { api: '/api' } } }),
  useFormFields: () => state.status,
  Button: ({ children, type, disabled, onClick }: ButtonHTMLAttributes<HTMLButtonElement>) =>
    createElement('button', { type, disabled, onClick }, children),
}))

afterEach(() => {
  cleanup()
  state.status = 'uncertain'
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('mail delivery resolution', () => {
  it('requires a note and explicit confirmation before submitting a decision', () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(createElement(MailDeliveryResolution))
    const button = screen.getByRole('button', { name: '确认未发送' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('核实说明'), { target: { value: '服务端无发送记录。' } })
    expect(button.disabled).toBe(false)
    fireEvent.click(button)
    expect(confirm).toHaveBeenCalledOnce()
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows server conflicts, preserves the note, and lets the administrator retry', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ errors: [{ message: '状态已更新，请刷新。' }] }), {
          status: 409,
        }),
      )
    vi.stubGlobal('fetch', fetch)
    render(createElement(MailDeliveryResolution))
    const note = screen.getByLabelText('核实说明') as HTMLTextAreaElement
    fireEvent.change(note, { target: { value: '邮件服务确认已接收。' } })
    fireEvent.click(screen.getByRole('button', { name: '确认已发送' }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('状态已更新，请刷新。'))
    expect(note.value).toBe('邮件服务确认已接收。')
    expect(fetch).toHaveBeenCalledWith(
      '/api/mails/42/resolve-delivery',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          outcome: 'sent',
          note: '邮件服务确认已接收。',
          deliveryToken: 'plan-42',
        }),
      }),
    )
    expect((screen.getByRole('button', { name: '确认已发送' }) as HTMLButtonElement).disabled).toBe(
      false,
    )
  })

  it('only displays resolution controls for mail awaiting verification', () => {
    state.status = 'sent'
    render(createElement(MailDeliveryResolution))
    expect(screen.queryByRole('button')).toBeNull()
  })
})
