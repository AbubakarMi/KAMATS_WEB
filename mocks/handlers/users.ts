import { http, HttpResponse } from 'msw';
import { mockUsers } from '../data/users';

const API = '/api/v1';

export const userHandlers = [
  // Public users list (all authenticated users)
  http.get(`${API}/users`, () => {
    return HttpResponse.json({
      data: mockUsers,
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
