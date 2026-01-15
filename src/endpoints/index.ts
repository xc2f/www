import type { Endpoint } from 'payload'

import { backupDatabaseTask } from '../tasks/backupDatabase'

export const endpoints: Endpoint[] = [
  {
    path: '/backup/database',
    method: 'get',
    handler: async () => {
      const result = await backupDatabaseTask()
      return Response.json(result)
    },
  },
]
