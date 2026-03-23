import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/users';
import { getPermissionsForRoles } from '../data/rolePermissions';

const API = '/api/v1';

export const authHandlers = [
  // Login
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string };

    const user = mockUsers.find((u) => u.username === body.username);
    if (!user || body.password.length < 8) {
      return HttpResponse.json(
        { status: 401, code: 'UNAUTHORIZED', message: 'Invalid username or password', trace_id: 'mock' },
        { status: 401 }
      );
    }

    // Role-based permissions from mock mapping
    const roleNames = user.roles.map((r) => r.name);
    const permissions = getPermissionsForRoles(roleNames);

    return HttpResponse.json({
      data: {
        access_token: 'mock-access-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 28800,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone_number: user.phoneNumber,
          store_id: user.storeId,
          store_name: user.storeName,
          roles: roleNames,
          permissions,
          store_assignments: user.storeAssignments.map((s) => ({
            store_id: s.storeId,
            store_name: s.storeName,
            store_tier: 'CentralStore',
          })),
        },
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Refresh
  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({
      data: {
        access_token: 'mock-refreshed-token-' + Date.now(),
        refresh_token: 'mock-refresh-token-' + Date.now(),
        token_type: 'Bearer',
        expires_in: 28800,
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Logout
  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({
      data: { message: 'Logged out successfully' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // PIN Setup
  http.post(`${API}/auth/pin/setup`, async ({ request }) => {
    const body = (await request.json()) as { currentPin?: string; newPin: string };
    if (!body.newPin || !/^\d{4,6}$/.test(body.newPin)) {
      return HttpResponse.json(
        { status: 400, code: 'VALIDATION_ERROR', message: 'PIN must be 4-6 digits', trace_id: 'mock' },
        { status: 400 }
      );
    }
    return HttpResponse.json({
      data: { success: true, updatedAt: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // PIN Verify
  http.post(`${API}/auth/pin/verify`, async ({ request }) => {
    const body = (await request.json()) as { userId: string; pin: string };
    const verified = /^\d{4,6}$/.test(body.pin);
    return HttpResponse.json({
      data: {
        verified,
        userId: body.userId,
        verificationToken: verified ? 'mock-pin-token-' + Date.now() : '',
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
