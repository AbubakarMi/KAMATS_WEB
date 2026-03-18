import { http, HttpResponse } from 'msw';
import { mockDispatchSessions } from '../data/dispatch';

const API = '/api/v1';

export const dispatchHandlers = [
  // Create dispatch session
  http.post(`${API}/transfer-dispatch`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const session = {
      id: crypto.randomUUID(),
      ...body,
      expected_items: [],
      scanned_items: [],
      scanned_count: 0,
      expected_count: 0,
      dispatched_weight_kg: null,
      expected_weight_kg: null,
      weight_variance_pct: null,
      status: 'Scanning',
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: session, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Get dispatch detail
  http.get(`${API}/transfer-dispatch/:id`, ({ params }) => {
    const session = mockDispatchSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: session, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Scan item
  http.post(`${API}/transfer-dispatch/:id/scan-item`, ({ params }) => {
    const session = mockDispatchSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        itemId: 'item-001',
        itemCode: 'ALUM-2026-0001-001',
        scanAccepted: true,
        scannedCount: session.scannedCount + 1,
        expectedCount: session.expectedCount,
        remaining: session.expectedCount - session.scannedCount - 1,
        scannedAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Record weight
  http.post(`${API}/transfer-dispatch/:id/record-weight`, ({ params }) => {
    const session = mockDispatchSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...session, status: 'WeightRecorded' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Approve short shipment
  http.post(`${API}/transfer-dispatch/:id/approve-short`, ({ params }) => {
    const session = mockDispatchSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...session, status: 'ShortApproved' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Complete dispatch
  http.post(`${API}/transfer-dispatch/:id/complete`, ({ params }) => {
    const session = mockDispatchSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        dispatchId: session.id,
        tdnNumber: `TDN-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
        tdnId: crypto.randomUUID(),
        stoNumber: session.stoNumber,
        dispatchedBags: session.scannedCount,
        dispatchedWeightKg: session.dispatchedWeightKg ?? '0',
        consignmentQr: `QR-CON-${session.stoNumber}`,
        departureAt: new Date().toISOString(),
        expectedArrivalAt: new Date(Date.now() + 6 * 3600000).toISOString(),
        stoStatus: 'InTransit',
        itemsStatus: 'InTransit',
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
