import { http, HttpResponse } from 'msw';
import { mockSTOs } from '../data/transfers';

const API = '/api/v1';

export const transferHandlers = [
  // List STOs
  http.get(`${API}/stock-transfer-orders`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const sourceStoreId = url.searchParams.get('source_store_id');
    const destinationStoreId = url.searchParams.get('destination_store_id');

    let filtered = [...mockSTOs];
    if (status) filtered = filtered.filter((s) => s.status === status);
    if (sourceStoreId) filtered = filtered.filter((s) => s.sourceStoreId === sourceStoreId);
    if (destinationStoreId) filtered = filtered.filter((s) => s.destinationStoreId === destinationStoreId);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Detail
  http.get(`${API}/stock-transfer-orders/:id`, ({ params }) => {
    const sto = mockSTOs.find((s) => s.id === params.id);
    if (!sto) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: sto, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create
  http.post(`${API}/stock-transfer-orders`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newSTO = {
      id: crypto.randomUUID(),
      sto_number: `STO-2026-${String(mockSTOs.length + 1).padStart(4, '0')}`,
      ...body,
      status: 'Draft',
      authorised_bags: null,
      pre_selected_items: [],
      requested_by: 'mock',
      requested_by_name: 'Mock User',
      requested_at: new Date().toISOString(),
      authorised_by: null,
      authorised_by_name: null,
      authorised_at: null,
      rejection_reason: null,
      source_balance_at_auth: null,
      tdn_id: null,
      tdn_number: null,
      grd_id: null,
      grd_number: null,
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newSTO, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Submit
  http.post(`${API}/stock-transfer-orders/:id/submit`, ({ params }) => {
    const sto = mockSTOs.find((s) => s.id === params.id);
    if (!sto) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: { ...sto, status: 'Submitted' }, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Authorise
  http.post(`${API}/stock-transfer-orders/:id/authorise`, ({ params }) => {
    const sto = mockSTOs.find((s) => s.id === params.id);
    if (!sto) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...sto, status: 'Authorised', authorised_bags: sto.requestedBags, authorised_by_name: 'Admin User', authorised_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Reject
  http.post(`${API}/stock-transfer-orders/:id/reject`, ({ params }) => {
    const sto = mockSTOs.find((s) => s.id === params.id);
    if (!sto) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: { ...sto, status: 'Rejected' }, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Cancel
  http.post(`${API}/stock-transfer-orders/:id/cancel`, ({ params }) => {
    const sto = mockSTOs.find((s) => s.id === params.id);
    if (!sto) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: { ...sto, status: 'Cancelled' }, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),
];
