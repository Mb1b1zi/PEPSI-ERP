import type { User } from '@/types/user';

/** roleId reuses src/mock/roles.mock.ts's ids; depotId reuses src/mock/catalog.mock.ts's ids. */
export const mockUsers: User[] = [
  { id: 1, name: 'Sarah Nakato', email: 'sarah.nakato@pepsicolor.com', gender: 'Female', contact: '+256 700 111 222', salary: 1200000, roleId: 1, depotId: null, createdAt: '2026-01-10T08:00:00Z' },
  { id: 2, name: 'James Okello', email: 'james.okello@pepsicolor.com', gender: 'Male', contact: '+256 700 222 333', salary: 950000, roleId: 2, depotId: null, createdAt: '2026-01-15T08:00:00Z' },
  { id: 3, name: 'Grace Auma', email: 'grace.auma@pepsicolor.com', gender: 'Female', contact: '+256 700 333 444', salary: 600000, roleId: 3, depotId: 3, createdAt: '2026-02-01T08:00:00Z' },
  { id: 4, name: 'Peter Ssekandi', email: null, gender: 'Male', contact: '+256 700 444 555', salary: 600000, roleId: 3, depotId: 1, createdAt: '2026-02-10T08:00:00Z' },
  { id: 5, name: 'Esther Nabirye', email: 'esther.nabirye@pepsicolor.com', gender: 'Female', contact: '+256 700 555 666', salary: 2000000, roleId: 4, depotId: null, createdAt: '2026-01-05T08:00:00Z' },
];
