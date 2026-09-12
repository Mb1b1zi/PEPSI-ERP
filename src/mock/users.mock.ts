import type { User } from '@/types/user';

export const mockUsers: User[] = [
  { id: 'u1', name: 'Sarah Nakato', email: 'sarah.nakato@pepsicolor.com', contact: '+256 700 111 222', role: 'Admin', status: 'active' },
  { id: 'u2', name: 'James Okello', email: 'james.okello@pepsicolor.com', contact: '+256 700 222 333', role: 'Factory Manager', status: 'active' },
  { id: 'u3', name: 'Grace Auma', email: 'grace.auma@pepsicolor.com', contact: '+256 700 333 444', role: 'Depot Attendant', status: 'active' },
  { id: 'u4', name: 'Peter Ssekandi', email: 'peter.ssekandi@pepsicolor.com', contact: '+256 700 444 555', role: 'Depot Attendant', status: 'inactive' },
  { id: 'u5', name: 'Esther Nabirye', email: 'esther.nabirye@pepsicolor.com', contact: '+256 700 555 666', role: 'Boss', status: 'active' },
];