export type UserRole = "super_admin" | "editor" | "reviewer" | "viewer";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  /** Assigned government agencies/ministries this user can fill data for */
  agencyIds: string[];
  /** Only used when creating/updating locally; never returned from API */
  password?: string;
};

export type AuthSession = {
  token: string;
  user: AdminUser;
};

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "مدیر کل",
  editor: "ویرایشگر",
  reviewer: "بازبین",
  viewer: "مشاهده‌گر",
};

export const ROLE_PERMISSIONS: Record<
  UserRole,
  {
    manageUsers: boolean;
    manageSettings: boolean;
    manageAgencies: boolean;
    manageContent: boolean;
    publish: boolean;
    viewDashboard: boolean;
  }
> = {
  super_admin: {
    manageUsers: true,
    manageSettings: true,
    manageAgencies: true,
    manageContent: true,
    publish: true,
    viewDashboard: true,
  },
  editor: {
    manageUsers: false,
    manageSettings: false,
    manageAgencies: false,
    manageContent: true,
    publish: true,
    viewDashboard: true,
  },
  reviewer: {
    manageUsers: false,
    manageSettings: false,
    manageAgencies: false,
    manageContent: false,
    publish: false,
    viewDashboard: true,
  },
  viewer: {
    manageUsers: false,
    manageSettings: false,
    manageAgencies: false,
    manageContent: false,
    publish: false,
    viewDashboard: true,
  },
};
