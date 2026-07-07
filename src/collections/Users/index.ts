import type { Access, CollectionConfig, FieldAccess } from 'payload'

import { adminOnly, isAdminOrEditorUser, isAdminUser, type UserWithRoles } from '../../access/roles'

const isAdminField: FieldAccess = ({ req: { user } }) => {
  return isAdminUser(user as UserWithRoles | null | undefined)
}

const adminPanelAccess = ({ req: { user } }: { req: { user: unknown } }) => {
  return isAdminOrEditorUser(user as UserWithRoles | null | undefined)
}

const adminOrSelfRead: Access = (args) => {
  const {
    req: { user },
  } = args

  if (isAdminUser(user as UserWithRoles | null | undefined)) return true
  if (!user) return false

  return {
    id: {
      equals: user.id,
    },
  }
}

const adminOrSelfUpdate: Access = (args) => {
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
    admin: adminPanelAccess,
    create: adminOnly,
    delete: adminOnly,
    read: adminOrSelfRead,
    update: adminOrSelfUpdate,
  },
  admin: {
    defaultColumns: ['name', 'email', 'roles'],
    useAsTitle: 'name',
    group: 'System',
  },
  defaultSort: '-createdAt',
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
      defaultValue: ['editor'],
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
