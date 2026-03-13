import { http, HttpResponse } from 'msw';
import { mockAlerts, mockAlertRules } from '../data/alerts';

const API = '/api/v1';

export const alertHandlers = [
  // List alerts
  http.get(`${API}/alerts`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const severity = url.searchParams.get('severity');
    const storeId = url.searchParams.get('store_id');

    let filtered = [...mockAlerts];
    if (status) filtered = filtered.filter((a) => a.status === status);
    if (severity) filtered = filtered.filter((a) => a.severity === severity);
    if (storeId) filtered = filtered.filter((a) => a.storeId === storeId);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Acknowledge alert
  http.post(`${API}/alerts/:id/acknowledge`, ({ params }) => {
    const alert = mockAlerts.find((a) => a.id === params.id);
    if (!alert) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({
      data: { ...alert, status: 'Acknowledged', acknowledgedByName: 'Mock User', acknowledgedAt: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // List alert rules
  http.get(`${API}/alert-rules`, () => {
    return HttpResponse.json({
      data: mockAlertRules,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Create alert rule
  http.post(`${API}/alert-rules`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const rule = {
      id: crypto.randomUUID(),
      ...body,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_by_name: 'Mock User',
    };
    return HttpResponse.json({ data: rule, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Update alert rule
  http.patch(`${API}/alert-rules/:id`, async ({ params, request }) => {
    const rule = mockAlertRules.find((r) => r.id === params.id);
    if (!rule) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { ...rule, ...body, updatedByName: 'Mock User' },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
