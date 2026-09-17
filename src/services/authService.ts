/**
 * Auth Module (docs/api/auth.md). Endpoints implemented here:
 *   POST /auth/login
 *   GET  /auth/me
 *
 * Unlike Factory/Depot, this always calls the real backend — there's no meaningful way to mock
 * a password check, and the doc provides a real bootstrap account for local development
 * (admin@pepsidepo.com / Admin123) specifically so the frontend can build against the live API
 * from the start. No apiConfig.useMockApi branch here.
 */
import { apiRequest } from '@/lib/apiClient';
import type { LoginRequestDto, LoginResponseDto, AuthUserDto, AuthUser, AuthSession } from '@/types/auth';

function toAuthUser(dto: AuthUserDto): AuthUser {
  return {
    id: dto.id,
    username: dto.username,
    personnelId: dto.personnel_id,
    personnelName: dto.personnel_name,
    roleId: dto.role_id,
    roleName: dto.role_name,
    permissions: dto.permissions,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const body: LoginRequestDto = { email, password };
    const dto = await apiRequest<LoginResponseDto>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return { accessToken: dto.access_token, user: toAuthUser(dto.user) };
  },

  async me(): Promise<AuthUser> {
    const dto = await apiRequest<AuthUserDto>('/auth/me');
    return toAuthUser(dto);
  },
};
