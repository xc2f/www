import type { Endpoint } from 'payload'

import { backupDatabaseTask } from '../tasks/backupDatabase'
import { systemAccess } from '../access/system'
import { evaluateBackupStatus, readBackupStatus } from '../utilities/backupStatus'

export const endpoints: Endpoint[] = [
  {
    path: '/health',
    method: 'get',
    handler: async (req) => {
      try {
        // Exercise the initialized Payload database without exposing user data.
        await req.payload.count({ collection: 'users', overrideAccess: true, req })
        return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
      } catch {
        return Response.json(
          { status: 'unavailable' },
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        )
      }
    },
  },
  {
    path: '/backup/status',
    method: 'get',
    handler: async (req) => {
      if (!(await systemAccess({ req }))) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 })
      }
      try {
        const status = evaluateBackupStatus(await readBackupStatus())
        return Response.json(status, {
          status: status.healthy ? 200 : 503,
          headers: { 'Cache-Control': 'no-store' },
        })
      } catch (error) {
        req.payload.logger.error({ err: error }, 'Failed to read backup status')
        return Response.json(
          { healthy: false, message: 'Backup status unavailable' },
          { status: 503, headers: { 'Cache-Control': 'no-store' } },
        )
      }
    },
  },
  {
    path: '/backup/database',
    method: 'get',
    handler: async (req) => {
      if (!(await systemAccess({ req }))) {
        return Response.json({ message: 'Unauthorized' }, { status: 401 })
      }

      const result = await backupDatabaseTask()
      return Response.json(result)
    },
  },
]
