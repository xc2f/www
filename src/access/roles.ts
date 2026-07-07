import type { Access, FieldAccess } from 'payload'

export type Role = 'admin' | 'editor'

export type UserWithRoles = {
  id?: number | string
  roles?: Role[] | null
}

const hasRole = (user: UserWithRoles | null | undefined, role: Role) => {
  if (!user) return false

  return Boolean(user.roles?.includes(role))
}

export const isAdminUser = (user: UserWithRoles | null | undefined) => hasRole(user, 'admin')

export const isEditorUser = (user: UserWithRoles | null | undefined) => hasRole(user, 'editor')

export const isAdminOrEditorUser = (user: UserWithRoles | null | undefined) => {
  return isAdminUser(user) || isEditorUser(user)
}

export const adminOnly: Access = ({ req: { user } }) => {
  return isAdminUser(user as UserWithRoles | null | undefined)
}

export const adminOrEditor: Access = ({ req: { user } }) => {
  return isAdminOrEditorUser(user as UserWithRoles | null | undefined)
}

export const adminFieldOnly: FieldAccess = ({ req: { user } }) => {
  return isAdminUser(user as UserWithRoles | null | undefined)
}

export const adminAccess = ({ req: { user } }: { req: { user: unknown } }) => {
  return isAdminUser(user as UserWithRoles | null | undefined)
}
