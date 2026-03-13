import { http, HttpResponse } from 'msw';
import { mockWriteOffs, mockReturnOrders, mockLossSummary } from '../data/loss';

const API = '/api/v1';

export const lossHandlers = [
  // List write-offs
  http.get(`${API}/write-offs`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const category = url.searchParams.get('category');
    const storeId = url.searchParams.get('store_id');

    let filtered = [...mockWriteOffs];
    if (status) filtered = filtered.filter((w) => w.status === status);
    if (category) filtered = filtered.filter((w) => w.category === category);
    if (storeId) filtered = filtered.filter((w) => w.storeId === storeId);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Write-off detail
  http.get(`${API}/write-offs/:id`, ({ params }) => {
    const wo = mockWriteOffs.find((w) => w.id === params.id);
    if (!wo) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: wo, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create write-off
  http.post(`${API}/write-offs`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const wo = {
      id: crypto.randomUUID(),
      request_number: `WO-2026-${String(mockWriteOffs.length + 1).padStart(4, '0')}`,
      ...body,
      status: 'Pending',
      approval_route: 'StoreManager',
      raised_by: 'mock',
      raised_by_name: 'Mock User',
      raised_at: new Date().toISOString(),
      approved_by: null,
      approved_at: null,
      approval_notes: null,
      rejection_reason: null,
      investigation_report_id: null,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: wo, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Approve write-off
  http.post(`${API}/write-offs/:id/approve`, ({ params }) => {
    const wo = mockWriteOffs.find((w) => w.id === params.id);
    if (!wo) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        id: wo.id,
        requestNumber: wo.requestNumber,
        status: 'Approved',
        approvedBy: '11111111-1111-1111-1111-111111111111',
        approvedAt: new Date().toISOString(),
        ledgerEntries: [],
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Reject write-off
  http.post(`${API}/write-offs/:id/reject`, ({ params }) => {
    const wo = mockWriteOffs.find((w) => w.id === params.id);
    if (!wo) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...wo, status: 'Rejected' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Loss summary
  http.get(`${API}/write-offs/loss-summary`, () => {
    return HttpResponse.json({
      data: mockLossSummary,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create return order
  http.post(`${API}/return-orders`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const ro = {
      id: crypto.randomUUID(),
      return_number: `RO-2026-${String(mockReturnOrders.length + 1).padStart(4, '0')}`,
      ...body,
      status: 'Draft',
      shipped_at: null,
      credit_amount: null,
      credit_reference: null,
      credit_received_at: null,
      created_by: 'mock',
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: ro, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Ship return order
  http.post(`${API}/return-orders/:id/ship`, ({ params }) => {
    const ro = mockReturnOrders.find((r) => r.id === params.id);
    if (!ro) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...ro, status: 'Shipped', shippedAt: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Confirm credit
  http.post(`${API}/return-orders/:id/confirm-credit`, ({ params }) => {
    const ro = mockReturnOrders.find((r) => r.id === params.id);
    if (!ro) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...ro, status: 'CreditReceived', creditReceivedAt: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
