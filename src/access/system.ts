import type { PayloadRequest } from 'payload'
import { isAdminUser } from './roles'

export const systemAccess = ({ req }: { req: PayloadRequest }): boolean => {
  if (isAdminUser(req.user)) return true
  const secret = process.env.CRON_SECRET
  return Boolean(secret && req.headers.get('authorization') === `Bearer ${secret}`)
}
