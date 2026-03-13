import { http, HttpResponse } from 'msw';
import { mockLots } from '../data/lots';
import { mockItems } from '../data/items';

const API = '/api/v1';

export const lotHandlers = [
  // List lots
  http.get(`${API}/lots`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const status = url.searchParams.get('status');
    const storeId = url.searchParams.get('store_id');

    let filtered = [...mockLots];
    if (status) filtered = filtered.filter((l) => l.status === status);
    if (storeId) filtered = filtered.filter((l) => l.storeId === storeId);

    const start = (page - 1) * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: filtered.length, total_pages: Math.ceil(filtered.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Lot detail (with items)
  http.get(`${API}/lots/:id`, ({ params }) => {
    const lot = mockLots.find((l) => l.id === params.id);
    if (!lot) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Lot not found', traceId: 'mock' }, { status: 404 });
    const items = mockItems.filter((i) => i.lotId === lot.id);
    return HttpResponse.json({ data: { ...lot, items }, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Generate labels
  http.post(`${API}/lots/:id/generate-labels`, ({ params }) => {
    return HttpResponse.json({
      data: {
        lot_id: params.id,
        lot_number: 'LOT-2026-0003',
        total_labels: 192,
        print_job_id: crypto.randomUUID(),
        label_file_url: '/mock/labels/lot-003.pdf',
        generated_at: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
