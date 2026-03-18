import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/users';
import { mockStores } from '../data/stores';

const API = '/api/v1';

export const adminHandlers = [
  // List users
  http.get(`${API}/admin/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const search = url.searchParams.get('search')?.toLowerCase();

    let filtered = [...mockUsers];
    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.firstName.toLowerCase().includes(search) ||
          u.lastName.toLowerCase().includes(search)
      );
    }

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: {
        page,
        page_size: pageSize,
        total_items: filtered.length,
        total_pages: Math.ceil(filtered.length / pageSize),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create user
  http.post(`${API}/admin/users`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newUser = {
      id: crypto.randomUUID(),
      ...body,
      is_active: true,
      roles: [{ id: 'r1', name: 'System Administrator' }],
      store_assignments: [],
      created_at: new Date().toISOString(),
      created_by: 'mock',
    };
    return HttpResponse.json(
      { data: newUser, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } },
      { status: 201 }
    );
  }),

  // List stores
  http.get(`${API}/admin/stores`, () => {
    return HttpResponse.json({
      data: mockStores,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create store
  http.post(`${API}/admin/stores`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newStore = {
      id: crypto.randomUUID(),
      ...body,
      is_active: true,
      created_at: new Date().toISOString(),
      created_by: 'mock',
    };
    return HttpResponse.json(
      { data: newStore, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } },
      { status: 201 }
    );
  }),

  // List configuration
  http.get(`${API}/admin/configuration`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'c1',
          config_key: 'weighbridge.variance_tolerance_pct',
          config_value: 2.0,
          description: 'Weighbridge weight variance tolerance percentage',
          updated_at: '2026-03-01T00:00:00Z',
          updated_by: null,
        },
        {
          id: 'c2',
          config_key: 'inventory.reorder_point_default',
          config_value: 50,
          description: 'Default reorder point (bags) for new stores',
          updated_at: '2026-03-01T00:00:00Z',
          updated_by: null,
        },
        {
          id: 'c3',
          config_key: 'pr.auto_expiry_days',
          config_value: 30,
          description: 'Days before an approved PR expires if not converted to PO',
          updated_at: '2026-03-01T00:00:00Z',
          updated_by: null,
        },
      ],
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // List devices
  http.get(`${API}/admin/devices`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 'd1',
          device_id: 'DEV-001',
          device_name: 'Central Store Scanner',
          device_type: 'scanner',
          serial_number: 'SN-CS-001',
          assigned_store_id: 's1',
          assigned_store_name: 'Central Store — Main',
          is_active: true,
          registered_at: '2026-02-01T00:00:00Z',
          registered_by: '11111111-1111-1111-1111-111111111111',
        },
      ],
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Deactivate user
  http.patch(`${API}/admin/users/:id/deactivate`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        username: 'user',
        is_active: false,
        deactivated_at: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Unlock user
  http.patch(`${API}/admin/users/:id/unlock`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        username: 'user',
        failed_login_attempts: 0,
        lockout_end: null,
        unlocked_at: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
