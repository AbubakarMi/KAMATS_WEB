import { http, HttpResponse } from 'msw';
import { mockStockCounts } from '../data/stockCounts';

const API = '/api/v1';

export const stockCountHandlers = [
  // List stock counts (paginated + filtered)
  http.get(`${API}/stock-counts`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const storeId = url.searchParams.get('store_id');
    const countType = url.searchParams.get('count_type');

    let filtered = [...mockStockCounts];
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (storeId) filtered = filtered.filter((c) => c.storeId === storeId);
    if (countType) filtered = filtered.filter((c) => c.countType === countType);

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

  // Detail
  http.get(`${API}/stock-counts/:id`, ({ params }) => {
    const count = mockStockCounts.find((c) => c.id === params.id);
    if (!count) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: count, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create
  http.post(`${API}/stock-counts`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newCount = {
      id: crypto.randomUUID(),
      count_number: `SC-2026-${String(mockStockCounts.length + 1).padStart(4, '0')}`,
      ...body,
      status: 'Open',
      frozen_balance: 0,
      total_variance_bags: null,
      variance_severity: null,
      lines: [],
      recount_assigned_to: null,
      recount_assigned_to_name: null,
      approved_by: null,
      approved_at: null,
      approval_notes: null,
      rejection_reason: null,
      created_by: 'mock',
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newCount, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Submit count result
  http.post(`${API}/stock-counts/:id/submit-result`, ({ params }) => {
    const count = mockStockCounts.find((c) => c.id === params.id);
    if (!count) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...count, status: 'PendingApproval' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Order recount
  http.post(`${API}/stock-counts/:id/recount`, ({ params }) => {
    const count = mockStockCounts.find((c) => c.id === params.id);
    if (!count) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...count, status: 'PendingRecount' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Approve variance
  http.post(`${API}/stock-counts/:id/approve-variance`, ({ params }) => {
    const count = mockStockCounts.find((c) => c.id === params.id);
    if (!count) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        id: count.id,
        countNumber: count.countNumber,
        status: 'Closed',
        approvedBy: '11111111-1111-1111-1111-111111111111',
        approvedAt: new Date().toISOString(),
        ledgerAdjustments: [],
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Reject variance
  http.post(`${API}/stock-counts/:id/reject-variance`, ({ params }) => {
    const count = mockStockCounts.find((c) => c.id === params.id);
    if (!count) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...count, status: 'PendingRecount' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
