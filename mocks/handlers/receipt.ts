import { http, HttpResponse } from 'msw';
import { mockReceiptSessions, mockShortageReport } from '../data/receipt';

const API = '/api/v1';

export const receiptHandlers = [
  // List receipt sessions
  http.get(`${API}/transfer-receipt`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const page = parseInt(url.searchParams.get('page') ?? '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '20');

    let filtered = [...mockReceiptSessions];
    if (status) filtered = filtered.filter((s) => s.status === status);

    const totalItems = filtered.length;
    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create receipt session
  http.post(`${API}/transfer-receipt`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const session = {
      id: crypto.randomUUID(),
      grd_number: `GRD-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      tdn_id: 'tdn-002',
      tdn_number: 'TDN-2026-0002',
      sto_id: 'sto-002',
      sto_number: 'STO-2026-0002',
      source_store_name: 'Central Store — Main',
      consignment_qr: body.consignmentQr ?? body.consignment_qr,
      expected_bags: 30,
      expected_items: [],
      received_items: [],
      missing_items: [],
      scanned_count: 0,
      status: 'Receiving',
      arrival_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };
    return HttpResponse.json({ data: session, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Get receipt detail
  http.get(`${API}/transfer-receipt/:id`, ({ params }) => {
    const session = mockReceiptSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: session, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Scan item
  http.post(`${API}/transfer-receipt/:id/scan-item`, ({ params }) => {
    const session = mockReceiptSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        itemId: 'item-001',
        itemCode: 'ALUM-2026-0001-001',
        scanAccepted: true,
        condition: 'Good',
        scannedCount: session.scannedCount + 1,
        expectedCount: session.expectedBags,
        remaining: session.expectedBags - session.scannedCount - 1,
        scannedAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Report damage
  http.post(`${API}/transfer-receipt/:id/report-damage`, () => {
    return HttpResponse.json({
      data: { success: true },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Complete receipt
  http.post(`${API}/transfer-receipt/:id/complete`, ({ params }) => {
    const session = mockReceiptSessions.find((s) => s.id === params.id);
    if (!session) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        id: session.id,
        grdNumber: session.grdNumber,
        tdnNumber: session.tdnNumber,
        stoNumber: session.stoNumber,
        receivedBags: session.scannedCount,
        receivedWeightKg: String(session.scannedCount * 50),
        shortageBags: session.expectedBags - session.scannedCount,
        excessBags: 0,
        damagedBags: 0,
        stoStatus: 'FullyReceived',
        tdnStatus: 'Completed',
        shortageReportGenerated: false,
        receivingOfficer: 'Mock User',
        arrivalAt: session.arrivalAt,
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Shortage report
  http.get(`${API}/transfer-receipt/:id/shortage-report`, () => {
    return HttpResponse.json({
      data: mockShortageReport,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
