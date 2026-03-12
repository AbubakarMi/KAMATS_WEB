import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/users';

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

    // All permissions for admin mock
    const allPermissions = [
      'suppliers:create', 'suppliers:read', 'suppliers:approve',
      'pr:create', 'pr:read', 'pr:approve',
      'po:create', 'po:read', 'po:approve:manager', 'po:approve:finance',
      'dvr:create', 'dvr:read', 'inspection:submit', 'inspection:read',
      'weighbridge:record', 'weighbridge:read', 'weighbridge:override',
      'grn:create', 'grn:read', 'lots:read', 'labels:print',
      'items:read', 'items:label', 'items:putaway',
      'locations:read', 'locations:manage', 'ledger:read',
      'stockcount:create', 'stockcount:read', 'stockcount:execute', 'stockcount:approve',
      'sto:create', 'sto:read', 'sto:approve:central_unit', 'sto:approve:unit_user',
      'transfer:dispatch', 'transfer:receive', 'transfer:read',
      'consumption:record', 'consumption:read', 'consumption:acknowledge',
      'dosage:read', 'dosage:configure',
      'writeoff:raise', 'writeoff:read', 'writeoff:approve:minor', 'writeoff:approve:significant', 'writeoff:approve:critical',
      'reports:view', 'audit:view', 'audit:verify', 'audit:export',
      'alerts:read', 'alerts:acknowledge', 'alerts:configure',
      'users:manage', 'system:configure', 'devices:manage',
    ];

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
          roles: user.roles.map((r) => r.name),
          permissions: allPermissions,
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
];
