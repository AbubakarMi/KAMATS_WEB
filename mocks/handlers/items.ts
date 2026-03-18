import { http, HttpResponse } from 'msw';
import { mockItems, mockItemLifecycle } from '../data/items';

const API = '/api/v1';

export const itemHandlers = [
  // Item detail
  http.get(`${API}/items/:id`, ({ params }) => {
    const item = mockItems.find((i) => i.id === params.id);
    if (!item) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Item not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: item, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Scan label
  http.patch(`${API}/items/:id/scan-label`, ({ params }) => {
    return HttpResponse.json({
      data: { id: params.id, item_code: 'ALUM-XXXX', status: 'InStock', labelled_at: new Date().toISOString(), labelled_by: '33333333-3333-3333-3333-333333333333', lot_id: 'lot-001', lot_bags_labelled: 1, lot_total_bags: 298 },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Item lifecycle
  http.get(`${API}/items/:id/lifecycle`, ({ params }) => {
    // Return the detailed lifecycle for item-003, else a minimal one
    if (params.id === 'item-003') {
      return HttpResponse.json({ data: mockItemLifecycle, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
    }
    const item = mockItems.find((i) => i.id === params.id);
    return HttpResponse.json({
      data: {
        item_id: params.id,
        item_code: item?.itemCode ?? 'UNKNOWN',
        lot_number: item?.lotNumber ?? '',
        po_number: item?.poNumber ?? '',
        supplier_name: item?.supplierName ?? '',
        events: [
          { event_type: 'GRN_RECEIVED', timestamp: item?.createdAt ?? new Date().toISOString(), actor_name: 'System', store_name: item?.currentStoreName ?? '', reference_number: '', details: 'Item created from GRN' },
        ],
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Put away
  http.patch(`${API}/items/:id/put-away`, async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { id: params.id, item_code: 'ALUM-XXXX', location_id: body.location_id, location_code: 'A-01-01', put_away_at: new Date().toISOString(), put_away_by: '33333333-3333-3333-3333-333333333333', was_override: false },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
