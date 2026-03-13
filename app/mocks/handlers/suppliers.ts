import { http, HttpResponse } from 'msw';
import { mockSuppliers, mockScorecards } from '../data/suppliers';

const API = '/api/v1';

export const supplierHandlers = [
  // List suppliers (paginated + filtered)
  http.get(`${API}/suppliers`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const search = url.searchParams.get('search')?.toLowerCase();
    const status = url.searchParams.get('status');

    let filtered = [...mockSuppliers];
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.registrationNumber.toLowerCase().includes(search) ||
          s.contactPerson.toLowerCase().includes(search),
      );
    }
    if (status) {
      filtered = filtered.filter((s) => s.status === status);
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

  // Get supplier detail
  http.get(`${API}/suppliers/:id`, ({ params }) => {
    const supplier = mockSuppliers.find((s) => s.id === params.id);
    if (!supplier) {
      return HttpResponse.json(
        { status: 404, code: 'NOT_FOUND', message: 'Supplier not found', traceId: 'mock' },
        { status: 404 },
      );
    }
    return HttpResponse.json({
      data: supplier,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create supplier
  http.post(`${API}/suppliers`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newSupplier = {
      id: crypto.randomUUID(),
      ...body,
      status: 'PendingApproval',
      delivery_count: 0,
      on_time_delivery_rate: '0.00',
      quantity_accuracy_rate: '0.00',
      quality_acceptance_rate: '0.00',
      created_at: new Date().toISOString(),
      created_by: '11111111-1111-1111-1111-111111111111',
    };
    return HttpResponse.json(
      { data: newSupplier, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } },
      { status: 201 },
    );
  }),

  // Approve supplier
  http.patch(`${API}/suppliers/:id/approve`, ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        name: 'Supplier',
        status: 'Active',
        approved_by: '11111111-1111-1111-1111-111111111111',
        approved_at: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Reject supplier
  http.patch(`${API}/suppliers/:id/reject`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        id: params.id,
        status: 'Rejected',
        rejection_reason: body.rejection_reason,
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Suspend supplier
  http.patch(`${API}/suppliers/:id/suspend`, async ({ params }) => {
    return HttpResponse.json({
      data: {
        id: params.id,
        status: 'Suspended',
        pending_po_count: 2,
        pending_pos_flagged: true,
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Deactivate supplier
  http.patch(`${API}/suppliers/:id/deactivate`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'Deactivated' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Reactivate supplier
  http.patch(`${API}/suppliers/:id/reactivate`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, status: 'Active' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Supplier scorecard
  http.get(`${API}/suppliers/:id/scorecard`, ({ params }) => {
    const scorecard = mockScorecards[params.id as string];
    if (!scorecard) {
      return HttpResponse.json({
        data: { overall: { totalDeliveries: 0, onTimeDeliveryRate: '0', quantityAccuracyRate: '0', qualityAcceptanceRate: '0' }, deliveries: [] },
        meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
      });
    }
    return HttpResponse.json({
      data: scorecard,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
