import { APIError, type Endpoint } from 'payload'

import { isAdminUser } from '../access/roles'

export const cancelJobEndpoint: Endpoint = {
  path: '/:id/cancel',
  method: 'post',
  handler: async (req) => {
    if (!isAdminUser(req.user)) {
      throw new APIError('无权取消任务。', 403)
    }
    const id = Number(req.routeParams?.id)
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new APIError('任务编号无效。', 400)
    }
    await req.payload.jobs.cancelByID({
      id,
      req,
      overrideAccess: false,
    })
    return Response.json({ message: '已取消任务。' })
  },
}
