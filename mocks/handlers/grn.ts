import { http, HttpResponse } from 'msw';
import { mockGRNs } from '../data/grn';

const API = '/api/v1';

export const grnHandlers = [
  // List GRNs
  http.get(`${API}/goods-received-notes`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');

    let filtered = [...mockGRNs];
    if (status) filtered = filtered.filter((g) => g.status === status);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // GRN detail
  http.get(`${API}/goods-received-notes/:id`, ({ params }) => {
    const grn = mockGRNs.find((g) => g.id === params.id);
    if (!grn) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'GRN not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: grn, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create GRN
  http.post(`${API}/goods-received-notes`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: crypto.randomUUID(), grn_number: 'GRN-2026-NEW', ...body, status: 'Draft', created_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),

  // Record count
  http.patch(`${API}/goods-received-notes/:id/record-count`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, ...body },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Submit GRN
  http.patch(`${API}/goods-received-notes/:id/submit`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        status: 'Accepted',
        submitted_at: new Date().toISOString(),
        lot_created: { lot_id: crypto.randomUUID(), lot_number: 'LOT-2026-NEW', total_bags: 100 },
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
