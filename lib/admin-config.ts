export type AdminRole = 'owner' | 'dev' | 'teammate'

// Hardcoded owners & initial team — auto-seeded on first Google login
export const SEEDED_ADMINS: Record<string, AdminRole> = {
  'design@thedomagency.com': 'owner',
  'admin@thedomagency.com': 'owner',
  'dev@thedomagency.com': 'dev',
}

export type AdminPermissions = {
  canGeneratePromos: boolean
  canAssignPlans: boolean
  canInviteAdmins: boolean
  canViewUsers: boolean
  canManageTeam: boolean
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  owner: {
    canGeneratePromos: true,
    canAssignPlans: true,
    canInviteAdmins: true,
    canViewUsers: true,
    canManageTeam: true,
  },
  dev: {
    canGeneratePromos: false,
    canAssignPlans: false,
    canInviteAdmins: false,
    canViewUsers: true,
    canManageTeam: false,
  },
  teammate: {
    canGeneratePromos: false,
    canAssignPlans: false,
    canInviteAdmins: false,
    canViewUsers: true,
    canManageTeam: false,
  },
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  owner: 'Owner',
  dev: 'Developer',
  teammate: 'Teammate',
}

export const ROLE_COLORS: Record<AdminRole, string> = {
  owner: 'bg-[#C49A2A]/10 text-[#C49A2A]',
  dev: 'bg-blue-50 text-blue-700',
  teammate: 'bg-purple-50 text-purple-700',
}
