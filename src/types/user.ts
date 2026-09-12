export type UserRole = 'Admin' | 'Factory Manager' | 'Depot Attendant' | 'Boss';

export type UserAccountRole = UserRole | 'Unassigned';

export type Permission =
  | 'manage_users'
  | 'manage_depots'
  | 'manage_products'
  | 'view_reports';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  role: UserAccountRole;
  status: UserStatus;
}