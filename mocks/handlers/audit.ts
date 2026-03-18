import { http, HttpResponse } from 'msw';
import { mockAuditEvents, mockChainVerification } from '../data/audit';

const API = '/api/v1';

export const auditHandlers = [
  // List audit events
  http.get(`${API}/audit/events`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const entityType = url.searchParams.get('entity_type');
    const eventType = url.searchParams.get('event_type');
    const storeId = url.searchParams.get('store_id');

    let filtered = [...mockAuditEvents];
    if (entityType) filtered = filtered.filter((e) => e.entityType === entityType);
    if (eventType) filtered = filtered.filter((e) => e.eventType === eventType);
    if (storeId) filtered = filtered.filter((e) => e.storeId === storeId);

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Verify chain (all stores)
  http.get(`${API}/audit/verify-chain`, () => {
    return HttpResponse.json({
      data: mockChainVerification,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Verify chain (single store)
  http.get(`${API}/audit/verify-chain/:storeId`, ({ params }) => {
    const result = mockChainVerification.results.find((r) => r.storeId === params.storeId);
    if (!result) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...mockChainVerification, results: [result] },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Export (returns success — actual file download would be handled differently)
  http.get(`${API}/audit/export`, () => {
    return HttpResponse.json({
      data: { downloadUrl: '/mock/audit-export.csv', expiresAt: new Date(Date.now() + 3600000).toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
