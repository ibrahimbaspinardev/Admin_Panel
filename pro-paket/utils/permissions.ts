import type { AdminRole, SectionKey } from "@/types/admin";

const roleRank: Record<AdminRole, number> = {
  editor: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4,
};

const sectionAccess: Record<SectionKey, AdminRole[]> = {
  dashboard: ["super_admin", "admin", "moderator", "editor"],
  users: ["super_admin", "admin", "moderator"],
  data: ["super_admin", "admin", "editor"],
  uploads: ["super_admin", "admin", "editor"],
  activity: ["super_admin", "admin", "moderator"],
  notifications: ["super_admin", "admin", "moderator", "editor"],
  settings: ["super_admin", "admin"],
};

export function canAccessSection(role: AdminRole, section: SectionKey) {
  return sectionAccess[section].includes(role);
}

export function canManageUsers(role: AdminRole) {
  return roleRank[role] >= roleRank.admin || role === "moderator";
}

export function canChangeRole(role: AdminRole, targetRole: AdminRole) {
  return role === "super_admin" && targetRole !== "super_admin";
}

export function canManageData(role: AdminRole) {
  return role === "super_admin" || role === "admin" || role === "editor";
}

export function canManageSystem(role: AdminRole) {
  return role === "super_admin" || role === "admin";
}

export function formatRole(role: AdminRole) {
  const labels: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    moderator: "Moderator",
    editor: "Editor",
  };

  return labels[role];
}
