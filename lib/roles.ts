import type { Role } from '@/lib/supabase/types'

export const ALL_ROLES: Role[] = ['owner', 'manager', 'editor', 'designer', 'moderator']

// Roles that can be assigned to a new invite or an existing member. Owner is
// excluded here — ownership only ever moves via transfer_account_ownership,
// never a direct role edit.
export const ASSIGNABLE_ROLES: Role[] = ['manager', 'editor', 'designer', 'moderator']

export const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  manager: 'Manager',
  editor: 'Editor',
  designer: 'Designer',
  moderator: 'Moderator',
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: 'Full access to everything in this workspace.',
  manager: 'Deals and analytics — the brand-partnership side of the business.',
  editor: 'Ideas, drafts, and repurposing — the content-creation side.',
  designer: 'Repurposing and analytics — visual and creative work.',
  moderator: "No module is assigned to this role yet — CreatorFlow doesn't have community-facing features today.",
}

export type ModuleKey =
  | 'dashboard'
  | 'ideas'
  | 'drafts'
  | 'deals'
  | 'analytics'
  | 'repurpose'
  | 'automations'
  | 'team'
  | 'settings'

// The single source of truth for which roles can reach which module — mirrors
// the has_role_access() RLS policies in supabase/schema.sql exactly, so a
// role's nav/UI access never promises more than the database will actually
// return. Dashboard/Team/Settings are open to every role: Dashboard and
// Settings just render less for a role with no data to show, and Team is a
// read-only roster view for everyone (only the owner can mutate it, enforced
// separately by RLS on team_members/team_invites).
export const MODULE_ROLES: Record<ModuleKey, Role[]> = {
  dashboard: ALL_ROLES,
  ideas: ['owner', 'editor'],
  drafts: ['owner', 'editor'],
  deals: ['owner', 'manager'],
  analytics: ['owner', 'manager', 'editor', 'designer'],
  repurpose: ['owner', 'editor', 'designer'],
  automations: ['owner', 'manager'],
  team: ALL_ROLES,
  settings: ALL_ROLES,
}

export function canAccessModule(role: Role, module: ModuleKey): boolean {
  return MODULE_ROLES[module].includes(role)
}

export const MODULE_LABELS: Record<ModuleKey, string> = {
  dashboard: 'Dashboard',
  ideas: 'Ideas',
  drafts: 'Drafts',
  deals: 'Deals',
  analytics: 'Analytics',
  repurpose: 'Repurpose',
  automations: 'Automations',
  team: 'Team',
  settings: 'Settings',
}

// Every module a role can reach, in the app's canonical nav order.
const MODULE_ORDER: ModuleKey[] = [
  'dashboard',
  'ideas',
  'drafts',
  'deals',
  'analytics',
  'repurpose',
  'automations',
  'team',
  'settings',
]

export function modulesForRole(role: Role): ModuleKey[] {
  return MODULE_ORDER.filter((module) => canAccessModule(role, module))
}
