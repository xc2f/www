import { randomUUID } from 'node:crypto'
import {
  APIError,
  commitTransaction,
  createLocalReq,
  initTransaction,
  killTransaction,
  type Payload,
  type PayloadRequest,
} from 'payload'
import type { Mail } from '@/payload-types'
import { isAdminUser } from '../access/roles'

export const MAIL_SEND_TIMEOUT_MS = 2 * 60 * 1000
export const MAIL_STALE_AFTER_MS = 15 * 60 * 1000
const processStartedAt = Date.now() - process.uptime() * 1000

export class MailDeliveryTimeout extends Error {
  constructor() {
    super('邮件服务响应超时，发送结果待核实。')
    this.name = 'MailDeliveryTimeout'
  }
}

export async function withMailTransaction<T>(
  req: PayloadRequest,
  action: () => Promise<T>,
): Promise<T> {
  const ownsTransaction = await initTransaction(req)
  try {
    const result = await action()
    if (ownsTransaction) await commitTransaction(req)
    return result
  } catch (error) {
    if (ownsTransaction) await killTransaction(req)
    throw error
  }
}

export async function sendWithTimeout<T>(
  send: () => Promise<T>,
  timeout = MAIL_SEND_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      send(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new MailDeliveryTimeout()), timeout)
      }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export function hasUncertainOutcome(error: unknown): boolean {
  if (error instanceof MailDeliveryTimeout) return true
  if (!error || typeof error !== 'object') return false
  const details = error as { name?: string; code?: string }
  return (
    ['TimeoutError', 'RequestTimeout'].includes(details.name ?? '') ||
    ['ETIMEDOUT', 'ECONNRESET', 'ESOCKET'].includes(details.code ?? '')
  )
}

type Attempt = NonNullable<Mail['deliveryHistory']>[number]

/** Preserve all attempts, and never let a late response override a newer plan or manual decision. */
export async function recordMailAttempt(
  req: PayloadRequest,
  id: number,
  attempt: Attempt,
): Promise<Mail> {
  return withMailTransaction(req, async () => {
    const mail = await req.payload.findByID({ collection: 'mails', id, depth: 0, req })
    const history = [...(mail.deliveryHistory ?? [])]
    const index = history.findIndex((entry) => entry.attemptId === attempt.attemptId)
    const previous = index >= 0 ? history[index] : undefined
    if (mail.activeAttempt !== attempt.attemptId || previous?.resolution) return mail
    const entry = { ...previous, ...attempt }
    if (index >= 0) history[index] = entry
    else history.push(entry)
    const isCurrent =
      mail.activeAttempt === attempt.attemptId &&
      ['sending', 'uncertain'].includes(mail.sendStatus) &&
      !entry.resolution
    return req.payload.update({
      collection: 'mails',
      id,
      req,
      context: { skipEmailQueue: true },
      data: {
        deliveryHistory: history,
        activeAttempt: mail.activeAttempt,
        sendStartedAt: mail.sendStartedAt,
        deliveryToken: mail.deliveryToken,
        ...(isCurrent
          ? {
              sendStatus: entry.outcome,
              messageId: entry.messageId ?? null,
              sentAt: entry.acceptedAt ?? mail.sentAt,
              result: `${entry.finishedAt ?? entry.startedAt}\n${entry.error || (entry.outcome === 'sent' ? '邮件服务已接收。' : '发送中。')}`,
            }
          : {}),
      },
    })
  })
}

/** Startup detects interrupted sends; cron ticks also detect sends older than fifteen minutes. */
export async function recoverMailDeliveries(payload: Payload, now = Date.now()): Promise<void> {
  if (
    process.env.DISABLE_BACKGROUND_JOBS === 'true' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  )
    return
  const cutoff = new Date(Math.max(processStartedAt, now - MAIL_STALE_AFTER_MS)).toISOString()
  const candidates = await payload.find({
    collection: 'mails',
    depth: 0,
    pagination: false,
    overrideAccess: true,
    where: {
      and: [
        { sendStatus: { equals: 'sending' } },
        {
          or: [
            { sendStartedAt: { less_than: cutoff } },
            { and: [{ sendStartedAt: { exists: false } }, { updatedAt: { less_than: cutoff } }] },
          ],
        },
      ],
    },
  })
  for (const candidate of candidates.docs) {
    const req = await createLocalReq({}, payload)
    await withMailTransaction(req, async () => {
      const mail = await payload.findByID({ collection: 'mails', id: candidate.id, depth: 0, req })
      if (
        mail.sendStatus !== 'sending' ||
        new Date(mail.sendStartedAt ?? mail.updatedAt).getTime() >= new Date(cutoff).getTime()
      )
        return
      const attemptId = mail.activeAttempt || randomUUID()
      if (!mail.activeAttempt) {
        await payload.update({
          collection: 'mails',
          id: mail.id,
          req,
          context: { skipEmailQueue: true },
          data: {
            activeAttempt: attemptId,
            sendStatus: 'sending',
            sendStartedAt: mail.sendStartedAt ?? mail.updatedAt,
          },
        })
      }
      await recordMailAttempt(req, mail.id, {
        attemptId,
        startedAt: mail.sendStartedAt ?? mail.updatedAt,
        finishedAt: new Date(now).toISOString(),
        outcome: 'uncertain',
        error: '发送超时或进程曾中断，请核实邮件服务记录后确认结果；系统不会自动重发。',
      })
    })
  }
  // Single-process SQLite deployment: old processing jobs belong to the previous
  // process. Release them only after sending mail has been made uncertain.
  const jobs = await payload.update({
    collection: 'payload-jobs',
    overrideAccess: true,
    depth: 0,
    where: {
      and: [
        { taskSlug: { equals: 'send-email' } },
        { processing: { equals: true } },
        { completedAt: { exists: false } },
        { hasError: { not_equals: true } },
        { error: { exists: false } },
        { updatedAt: { less_than: new Date(processStartedAt).toISOString() } },
      ],
    },
    data: { processing: false },
  })
  if (jobs.errors.length) throw new Error('无法恢复中断的发信任务。')
}

export async function resolveMailDelivery(
  req: PayloadRequest,
  id: number,
  outcome: unknown,
  note: unknown,
  deliveryToken: unknown,
): Promise<Mail> {
  if (!isAdminUser(req.user)) throw new APIError('无权确认发送结果。', 403)
  if (
    (outcome !== 'sent' && outcome !== 'failed') ||
    typeof note !== 'string' ||
    !note.trim() ||
    note.length > 2000
  ) {
    throw new APIError('请选择确认结果，并填写不超过 2000 字的核实说明。', 400)
  }
  return withMailTransaction(req, async () => {
    const mail = await req.payload.findByID({
      collection: 'mails',
      id,
      depth: 0,
      req,
      user: req.user,
      overrideAccess: false,
    })
    if (mail.sendStatus !== 'uncertain')
      throw new APIError('只有待核实邮件可以确认结果，请刷新后查看状态。', 409)
    if (deliveryToken !== (mail.deliveryToken ?? null))
      throw new APIError('发送计划已更新，请刷新后重新核实。', 409)
    const now = new Date().toISOString()
    const history = [...(mail.deliveryHistory ?? [])]
    const index = history.findIndex((entry) => entry.attemptId === mail.activeAttempt)
    const entry: Attempt = {
      ...(index >= 0
        ? history[index]
        : {
            attemptId: mail.activeAttempt || randomUUID(),
            startedAt: mail.sendStartedAt ?? mail.updatedAt,
            outcome: 'uncertain',
          }),
      resolution: outcome,
      resolvedAt: now,
      resolvedBy: String(req.user!.id),
      resolutionNote: note.trim(),
    }
    if (index >= 0) history[index] = entry
    else history.push(entry)
    // Authorized system transition: bypass the edit lock, never enqueue a send.
    return req.payload.update({
      collection: 'mails',
      id,
      req,
      context: { skipEmailQueue: true },
      data: {
        sendStatus: outcome,
        deliveryToken: randomUUID(),
        deliveryHistory: history,
        result: `${now}\n人工确认${outcome === 'sent' ? '已发送' : '未发送'}：${note.trim()}`,
      },
    })
  })
}
