import { http, HttpResponse } from 'msw';
import { mockStores } from '../data/stores';

const API = '/api/v1';

export const storeHandlers = [
  // Public stores list (all authenticated users)
  http.get(`${API}/stores`, () => {
    return HttpResponse.json({
      data: mockStores,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
