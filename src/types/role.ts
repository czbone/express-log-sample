export const UserRole = {
  USER: 'user',
  ADMIN: 'admin'
} as const

export const userRoles = () => {
  const allRoles = {
    user: [],
    admin: ['manageUsers']
  }

  const roles = Object.keys(allRoles)
  const roleRights = new Map(Object.entries(allRoles))

  return {
    roles,
    roleRights
  }
}
