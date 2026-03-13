import { http, HttpResponse } from 'msw';
import { mockDVRs, mockInspections } from '../data/quality';

const API = '/api/v1';

export const qualityHandlers = [
  // List DVRs
  http.get(`${API}/driver-visit-records`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');

    let filtered = [...mockDVRs];
    if (status) filtered = filtered.filter((d) => d.status === status);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // DVR detail
  http.get(`${API}/driver-visit-records/:id`, ({ params }) => {
    const dvr = mockDVRs.find((d) => d.id === params.id);
    if (!dvr) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'DVR not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: dvr, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create DVR
  http.post(`${API}/driver-visit-records`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: crypto.randomUUID(), dvr_number: `DVR-2026-${String(mockDVRs.length + 1).padStart(4, '0')}`, ...body, status: 'PendingPOMatch', created_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),

  // Link PO to DVR
  http.patch(`${API}/driver-visit-records/:id/link-po`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, po_id: body.po_id, status: 'Active' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create inspection
  http.post(`${API}/quality-inspections`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: crypto.randomUUID(), inspection_number: `QI-2026-${String(mockInspections.length + 1).padStart(4, '0')}`, ...body, result: null, created_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),

  // Inspection detail
  http.get(`${API}/quality-inspections/:id`, ({ params }) => {
    const insp = mockInspections.find((i) => i.id === params.id);
    if (!insp) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Inspection not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: insp, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Submit inspection result
  http.patch(`${API}/quality-inspections/:id/submit-result`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, result: body.result, completed_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
