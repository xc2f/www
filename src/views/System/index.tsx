import type { AdminViewServerProps } from 'payload'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Backup from './Backup'

const System = async ({ initPageResult, params, searchParams }: AdminViewServerProps) => {
  const {
    req: { user },
  } = initPageResult

  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={initPageResult.req.payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={initPageResult.req.user || undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <Gutter>
        <Backup />
      </Gutter>
    </DefaultTemplate>
  )
}

export default System
