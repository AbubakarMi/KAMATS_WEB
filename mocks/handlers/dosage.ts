import { http, HttpResponse } from 'msw';
import { mockDosageConfigs, mockAnalytics, mockTrends, mockOperatorPatterns } from '../data/dosage';

const API = '/api/v1';

export const dosageHandlers = [
  // List dosage configurations
  http.get(`${API}/dosage-configurations`, () => {
    return HttpResponse.json({
      data: mockDosageConfigs,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Get by store
  http.get(`${API}/dosage-configurations/:storeId`, ({ params }) => {
    const config = mockDosageConfigs.find((c) => c.storeId === params.storeId);
    if (!config) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: config, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Create
  http.post(`${API}/dosage-configurations`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newConfig = {
      id: crypto.randomUUID(),
      ...body,
      current_season: 'Dry',
      effective_rate: body.standard_rate_kg_m3,
      updated_at: new Date().toISOString(),
      updated_by: 'mock',
    };
    return HttpResponse.json({ data: newConfig, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } }, { status: 201 });
  }),

  // Update
  http.patch(`${API}/dosage-configurations/:id`, async ({ params, request }) => {
    const config = mockDosageConfigs.find((c) => c.id === params.id);
    if (!config) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: { ...config, ...body, updatedAt: new Date().toISOString() },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Analytics
  http.get(`${API}/consumption-analytics/:storeId`, ({ params }) => {
    const analytics = mockAnalytics[params.storeId as string];
    if (!analytics) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: analytics, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Trends
  http.get(`${API}/consumption-analytics/:storeId/trends`, ({ params }) => {
    const trends = mockTrends[params.storeId as string];
    if (!trends) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: trends, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Operator patterns
  http.get(`${API}/consumption-analytics/:storeId/operator-patterns`, ({ params }) => {
    const patterns = mockOperatorPatterns[params.storeId as string];
    if (!patterns) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    return HttpResponse.json({ data: patterns, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),
];
