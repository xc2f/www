'use client'

import { Button, useDocumentInfo, useField } from '@payloadcms/ui'
import { useEffect, useState } from 'react'

import './subscription-link.scss'

type Subscription = { id: string; label: string }

export function SubscriptionLink() {
  const { id } = useDocumentInfo()
  const { value: visibility } = useField<string>({ path: 'visibility' })

  if (!id || visibility !== 'private') return null
  return <SubscriptionLinks key={id} endpoint={`/api/feeds/${id}/subscriptions`} />
}

function SubscriptionLinks({ endpoint }: { endpoint: string }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [issued, setIssued] = useState<(Subscription & { url: string }) | null>(null)
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    async function loadSubscriptions() {
      try {
        const response = await fetch(endpoint, { signal: controller.signal })
        if (!response.ok) throw new Error()
        const data: Subscription[] = await response.json()
        if (!controller.signal.aborted) setSubscriptions(data)
      } catch {
        if (!controller.signal.aborted) setError('Could not load subscription links.')
      } finally {
        if (!controller.signal.aborted) setPending(false)
      }
    }
    void loadSubscriptions()
    return () => controller.abort()
  }, [endpoint])

  async function createSubscription() {
    setPending(true)
    setError('')
    setIssued(null)
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      if (response.status === 404) throw new Error('Publish the private feed before creating a link.')
      if (!response.ok) throw new Error('Could not create the subscription link.')
      const data: Subscription & { url: string } = await response.json()
      setIssued(data)
      setSubscriptions((current) => [...current, { id: data.id, label: data.label }])
      setLabel('')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Could not create the subscription link.')
    } finally {
      setPending(false)
    }
  }

  async function revokeSubscription(id: string) {
    setPending(true)
    setError('')
    try {
      const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 404) throw new Error()
      setSubscriptions((current) => current.filter((subscription) => subscription.id !== id))
      if (issued?.id === id) setIssued(null)
    } catch {
      setError('Could not revoke the subscription link.')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="feed-subscriptions">
      <div className="field-type text feed-subscriptions__field">
        <label htmlFor="feed-subscription-label">Subscriber name</label>
        <input
          id="feed-subscription-label"
          value={label}
          maxLength={120}
          onChange={(event) => setLabel(event.target.value)}
        />
      </div>
      <Button
        type="button"
        buttonStyle="secondary"
        size="small"
        margin={false}
        disabled={pending || !label.trim()}
        onClick={createSubscription}
      >
        Create link
      </Button>
      {error && (
        <p className="feed-subscriptions__error" role="alert">
          {error}
        </p>
      )}
      {issued && (
        <div className="field-type text feed-subscriptions__field feed-subscriptions__issued">
          <label htmlFor="feed-subscription-url">Subscription URL</label>
          <input
            id="feed-subscription-url"
            aria-describedby="feed-subscription-url-help"
            readOnly
            value={issued.url}
            onFocus={(event) => event.currentTarget.select()}
          />
          <p id="feed-subscription-url-help" role="status">
            Copy this URL now. It only appears once.
          </p>
        </div>
      )}
      {subscriptions.length > 0 && (
        <ul className="feed-subscriptions__list" aria-label="Active subscription links">
          {subscriptions.map(({ id, label }) => (
            <li key={id} className="feed-subscriptions__row">
              <span>{label}</span>
              <Button
                aria-label={`Revoke subscription for ${label}`}
                type="button"
                buttonStyle="subtle"
                size="xsmall"
                margin={false}
                disabled={pending}
                onClick={() => revokeSubscription(id)}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
