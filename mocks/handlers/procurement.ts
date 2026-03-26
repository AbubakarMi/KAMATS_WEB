import { http, HttpResponse } from 'msw';
import { mockPRs, mockPOs } from '../data/procurement';

const API = '/api/v1';

export const procurementHandlers = [
  // === PR Handlers ===

  // List PRs
  http.get(`${API}/purchase-requisitions`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const triggerType = url.searchParams.get('trigger_type');
    const storeId = url.searchParams.get('store_id');

    let filtered = [...mockPRs];
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (triggerType) filtered = filtered.filter((p) => p.triggerType === triggerType);
    if (storeId) filtered = filtered.filter((p) => p.storeId === storeId);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // PR detail
  http.get(`${API}/purchase-requisitions/:id`, ({ params }) => {
    const pr = mockPRs.find((p) => p.id === params.id);
    if (!pr) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'PR not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: pr, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create PR
  http.post(`${API}/purchase-requisitions`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPR = {
      id: crypto.randomUUID(),
      pr_number: `PR-2026-${String(mockPRs.length + 1).padStart(4, '0')}`,
      ...body,
      status: 'Draft',
      raised_by: '22222222-2222-2222-2222-222222222222',
      raised_by_name: 'Amina Yusuf',
      raised_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newPR, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Update PR
  http.put(`${API}/purchase-requisitions/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const pr = mockPRs.find((p) => p.id === params.id);
    if (!pr) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'PR not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({
      data: { ...pr, ...body },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Submit PR
  http.patch(`${API}/purchase-requisitions/:id/submit`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'Submitted', submitted_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Finance approve PR
  http.patch(`${API}/purchase-requisitions/:id/approve-finance`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'FinanceApproved', finance_approved_by: '33333333-3333-3333-3333-333333333333', finance_approved_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Finance reject PR
  http.patch(`${API}/purchase-requisitions/:id/reject-finance`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, status: 'FinanceRejected', finance_rejection_reason: body.rejection_reason },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Director approve PR
  http.patch(`${API}/purchase-requisitions/:id/approve-director`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'Approved', director_approved_by: '11111111-1111-1111-1111-111111111111', director_approved_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Director reject PR
  http.patch(`${API}/purchase-requisitions/:id/reject-director`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, status: 'Rejected', director_rejection_reason: body.rejection_reason },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // === PO Handlers ===

  // List POs
  http.get(`${API}/purchase-orders`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const supplierId = url.searchParams.get('supplier_id');

    let filtered = [...mockPOs];
    if (status) filtered = filtered.filter((p) => p.status === status);
    if (supplierId) filtered = filtered.filter((p) => p.supplierId === supplierId);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // PO detail
  http.get(`${API}/purchase-orders/:id`, ({ params }) => {
    const po = mockPOs.find((p) => p.id === params.id);
    if (!po) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'PO not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: po, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create PO
  http.post(`${API}/purchase-orders`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newPO = {
      id: crypto.randomUUID(),
      po_number: `PO-2026-${String(mockPOs.length + 1).padStart(4, '0')}`,
      ...body,
      status: 'Draft',
      requested_by: '22222222-2222-2222-2222-222222222222',
      requested_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: newPO, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Update PO
  http.put(`${API}/purchase-orders/:id`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const po = mockPOs.find((p) => p.id === params.id);
    if (!po) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'PO not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({
      data: { ...po, ...body },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Submit PO
  http.patch(`${API}/purchase-orders/:id/submit`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'Submitted' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Finance approve PO
  http.patch(`${API}/purchase-orders/:id/approve-finance`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'FinanceApproved', finance_approved_by: '33333333-3333-3333-3333-333333333333', finance_approved_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Finance reject PO
  http.patch(`${API}/purchase-orders/:id/reject-finance`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, status: 'FinanceRejected', finance_rejection_reason: body.rejection_reason },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Director approve PO (issues)
  http.patch(`${API}/purchase-orders/:id/approve-director`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'Issued', director_approved_by: '11111111-1111-1111-1111-111111111111', director_approved_at: new Date().toISOString(), issued_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Director reject PO
  http.patch(`${API}/purchase-orders/:id/reject-director`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, status: 'DirectorRejected', director_rejection_reason: body.rejection_reason },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create amendment
  http.post(`${API}/purchase-orders/:id/amendments`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: crypto.randomUUID(), po_id: params.id, amendment_version: 1, ...body, status: 'PendingFinanceApproval', requested_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),

  // Approve amendment (finance)
  http.patch(`${API}/purchase-orders/:id/amendments/:aId/approve-finance`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.aId, status: 'PendingDirectorApproval', finance_approved_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Approve amendment (director)
  http.patch(`${API}/purchase-orders/:id/amendments/:aId/approve-director`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.aId, status: 'Applied', director_approved_at: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
