import type { User, UserRole } from '@/types/user';
import type { UserCreateValues } from '@/schemas/userSchema';
import { mockUsers } from '@/mock/users.mock';

function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export interface UpdateUserInput {
  name: string;
  email: string;
  contact: string;
  password?: string;
}

let usersStore: User[] = [...mockUsers];

export const userService = {
  async getUsers(): Promise<User[]> {
    return simulateDelay(usersStore);
  },

  async getUserById(id: string): Promise<User | undefined> {
    return simulateDelay(usersStore.find((u) => u.id === id));
  },

  async createUser(data: UserCreateValues): Promise<User> {
    const newUser: User = {
      id: `u${Date.now()}`,
      name: data.name,
      email: data.email,
      contact: data.contact,
      role: 'Unassigned',
      status: 'active',
    };
    usersStore = [...usersStore, newUser];
    return simulateDelay(newUser);
  },

  async updateUser(id: string, data: UpdateUserInput): Promise<User | undefined> {
    usersStore = usersStore.map((u) =>
      u.id === id
        ? { ...u, name: data.name, email: data.email, contact: data.contact }
        : u
    );
    return simulateDelay(usersStore.find((u) => u.id === id));
  },

  async assignRole(id: string, role: UserRole): Promise<User | undefined> {
    usersStore = usersStore.map((u) => (u.id === id ? { ...u, role } : u));
    return simulateDelay(usersStore.find((u) => u.id === id));
  },

  async deleteUser(id: string): Promise<void> {
    usersStore = usersStore.filter((u) => u.id !== id);
    return simulateDelay(undefined);
  },
};