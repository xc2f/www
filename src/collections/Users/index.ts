import type { Access, CollectionConfig, FieldAccess } from 'payload'

import { authenticated } from '../../access/authenticated'

type UserWithRoles = {
  roles?: ('admin' | 'editor')[] | null
}

const isAdminUser = (user: UserWithRoles | null | undefined) => {
  if (!user) return false

  // Legacy users created before roles existed can still administer users until
  // their roles are saved.
  if (!('roles' in user) || user.roles == null) return true

  return Boolean(user.roles?.includes('admin'))
}

const isAdmin: Access = ({ req: { user } }) => {
  return isAdminUser(user as UserWithRoles | null | undefined)
}

const isAdminField: FieldAccess = ({ req: { user } }) => {
  return isAdminUser(user as UserWithRoles | null | undefined)
}

const adminOrSelf: Access = (args) => {
  const {
    req: { user },
    id,
  } = args

  if (isAdminUser(user as UserWithRoles | null | undefined)) return true
  return user?.id === id
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: isAdmin,
    delete: isAdmin,
    read: adminOrSelf,
    update: adminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
    group: 'System',
  },
  auth: true,
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
      ],
      defaultValue: ['admin'],
      required: true,
      saveToJWT: true,
      access: {
        update: isAdminField,
      },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
  timestamps: true,
}
