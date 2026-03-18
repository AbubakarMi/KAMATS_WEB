import { http, HttpResponse } from 'msw';
import { mockWeighbridgeTickets } from '../data/weighbridge';

const API = '/api/v1';

export const weighbridgeHandlers = [
  // List tickets
  http.get(`${API}/weighbridge-tickets`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');

    let filtered = [...mockWeighbridgeTickets];
    if (status) filtered = filtered.filter((t) => t.status === status);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Ticket detail
  http.get(`${API}/weighbridge-tickets/:id`, ({ params }) => {
    const ticket = mockWeighbridgeTickets.find((t) => t.id === params.id);
    if (!ticket) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Ticket not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: ticket, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create ticket
  http.post(`${API}/weighbridge-tickets`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: crypto.randomUUID(), ticket_number: 'WT-2026-NEW', ...body, status: 'InProgress', created_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),

  // Record gross weight
  http.patch(`${API}/weighbridge-tickets/:id/gross-weight`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, gross_weight_kg: body.gross_weight_kg, gross_weight_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Record tare weight
  http.patch(`${API}/weighbridge-tickets/:id/tare-weight`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, tare_weight_kg: body.tare_weight_kg, tare_weight_at: new Date().toISOString(), status: 'Pass' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Override
  http.patch(`${API}/weighbridge-tickets/:id/override`, async ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'OverrideApproved', override_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Reject
  http.patch(`${API}/weighbridge-tickets/:id/reject`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, status: 'Rejected', rejection_reason: body.rejection_reason },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
