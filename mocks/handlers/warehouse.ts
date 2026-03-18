import { http, HttpResponse } from 'msw';
import { mockLocations, mockWarehouseMap, mockLocationContents } from '../data/warehouse';

const API = '/api/v1';

export const warehouseHandlers = [
  // List locations
  http.get(`${API}/storage-locations`, ({ request }) => {
    const url = new URL(request.url);
    const storeId = url.searchParams.get('store_id');
    const zone = url.searchParams.get('zone');

    let filtered = [...mockLocations];
    if (storeId) filtered = filtered.filter((l) => l.storeId === storeId);
    if (zone) filtered = filtered.filter((l) => l.zone === zone);

    return HttpResponse.json({
      data: filtered,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Location detail
  http.get(`${API}/storage-locations/:id`, ({ params }) => {
    const loc = mockLocations.find((l) => l.id === params.id);
    if (!loc) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Location not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: loc, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Location contents
  http.get(`${API}/storage-locations/:id/contents`, ({ params }) => {
    const contents = mockLocationContents[params.id as string];
    if (!contents) {
      return HttpResponse.json({
        data: { locationId: params.id, locationCode: '?', zone: '?', maxCapacityKg: '0', currentBags: 0, currentWeightKg: '0', utilizationPct: 0, lots: [], items: [] },
        meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
      });
    }
    return HttpResponse.json({ data: contents, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Warehouse map
  http.get(`${API}/stores/:storeId/warehouse-map`, ({ params }) => {
    const map = mockWarehouseMap[params.storeId as string];
    if (!map) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Warehouse map not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: map, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Internal transfer
  http.post(`${API}/internal-transfers`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        id: crypto.randomUUID(),
        items_moved: (body.item_ids as string[])?.length ?? 0,
        from_location_code: 'A-01-01',
        to_location_code: 'A-02-01',
        reason: body.reason,
        moved_by: '33333333-3333-3333-3333-333333333333',
        moved_at: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),
];
