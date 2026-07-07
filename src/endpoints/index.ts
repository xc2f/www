import type { Endpoint } from 'payload'

import { backupDatabaseTask } from '../tasks/backupDatabase'

export const endpoints: Endpoint[] = [
  {
    path: '/backup/database',
    method: 'get',
    handler: async (req) => {
      const authHeader = req.headers.get('authorization')
      const hasCronAccess = authHeader === `Bearer ${process.env.CRON_SECRET}`
      const isAdmin = Boolean(req.user?.roles?.includes('admin'))

      if (!isAdmin && !hasCronAccess) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const result = await backupDatabaseTask()
      return Response.json(result)
    },
  },
]
