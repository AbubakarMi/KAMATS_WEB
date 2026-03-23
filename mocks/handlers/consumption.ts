import { http, HttpResponse } from 'msw';
import { mockConsumptionEntries } from '../data/consumption';

const API = '/api/v1';

export const consumptionHandlers = [
  // Create consumption entry
  http.post(`${API}/consumption`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const store = mockConsumptionEntries.find((c) => c.storeId === body.storeId);
    return HttpResponse.json({
      data: {
        id: crypto.randomUUID(),
        consumptionNumber: `CON-2026-${String(mockConsumptionEntries.length + 1).padStart(4, '0')}`,
        storeId: body.storeId,
        storeName: store?.storeName ?? 'Unknown Store',
        operatorId: '55555555-5555-5555-5555-555555555555',
        operatorName: 'Abubakar Danjuma',
        treatmentSessionRef: body.treatmentSessionRef,
        volumeTreatedM3: body.volumeTreatedM3,
        standardDosageRate: '0.012',
        seasonalMultiplier: '1.0',
        suggestedQtyKg: String(Number(body.volumeTreatedM3) * 0.012),
        suggestedBags: Math.ceil((Number(body.volumeTreatedM3) * 0.012) / 50),
        actualQtyBags: null,
        actualQtyKg: null,
        deviationPct: null,
        efficiencyRatio: null,
        anomalyLevel: null,
        status: 'Submitted',
        items: [],
        supervisorAckBy: null,
        supervisorAckByName: null,
        supervisorAckAt: null,
        supervisorAckNotes: null,
        partiallyConsumedBagsAvailable: false,
        recordedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    }, { status: 201 });
  }),

  // List consumption entries
  http.get(`${API}/consumption`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const storeId = url.searchParams.get('store_id');
    const status = url.searchParams.get('status');
    const anomalyLevel = url.searchParams.get('anomaly_level');

    let filtered = [...mockConsumptionEntries];
    if (storeId) filtered = filtered.filter((c) => c.storeId === storeId);
    if (status) filtered = filtered.filter((c) => c.status === status);
    if (anomalyLevel) filtered = filtered.filter((c) => c.anomalyLevel === anomalyLevel);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Detail
  http.get(`${API}/consumption/:id`, ({ params }) => {
    const entry = mockConsumptionEntries.find((c) => c.id === params.id);
    if (!entry) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: entry, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Scan item
  http.post(`${API}/consumption/:id/scan-item`, ({ params }) => {
    return HttpResponse.json({
      data: {
        itemId: 'item-001',
        itemCode: 'ALUM-2026-0001-001',
        lotNumber: 'LOT-2026-0001',
        scanAccepted: true,
        isPartial: false,
        weightConsumedKg: '50.0000',
        remainingWeightKg: null,
        totalConsumedKg: '50.0000',
        bagsScanned: 1,
        scannedAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Submit consumption
  http.post(`${API}/consumption/:id/submit`, ({ params }) => {
    const entry = mockConsumptionEntries.find((c) => c.id === params.id);
    if (!entry) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...entry, status: 'Submitted' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Acknowledge anomaly
  http.post(`${API}/consumption/:id/acknowledge-anomaly`, ({ params }) => {
    const entry = mockConsumptionEntries.find((c) => c.id === params.id);
    if (!entry) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: {
        ...entry,
        status: 'Closed',
        supervisorAckBy: '44444444-4444-4444-4444-444444444444',
        supervisorAckByName: 'Amina Yusuf',
        supervisorAckAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
