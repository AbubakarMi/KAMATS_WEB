import { http, HttpResponse } from 'msw';
import { mockStockBalances, mockLedgerEntries, mockBalanceHistory } from '../data/ledger';

const API = '/api/v1';

export const ledgerHandlers = [
  // Stock balance
  http.get(`${API}/stock-ledger/:storeId`, ({ params }) => {
    const balance = mockStockBalances[params.storeId as string];
    if (!balance) return HttpResponse.json({ status: 404, code: 'NOT_FOUND', message: 'Balance not found', traceId: 'mock' }, { status: 404 });
    return HttpResponse.json({ data: balance, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),

  // Ledger entries (paginated)
  http.get(`${API}/stock-ledger/:storeId/entries`, ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const pageSize = Number(url.searchParams.get('page_size')) || 20;
    const entryType = url.searchParams.get('entry_type');

    let entries = mockLedgerEntries[params.storeId as string] ?? [];
    if (entryType) entries = entries.filter((e) => e.entryType === entryType);

    const start = (page - 1) * pageSize;
    const paged = entries.slice(start, start + pageSize);

    return HttpResponse.json({
      data: paged,
      pagination: { page, page_size: pageSize, total_items: entries.length, total_pages: Math.ceil(entries.length / pageSize) },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),

  // Balance history
  http.get(`${API}/stock-ledger/:storeId/balance-history`, ({ params }) => {
    const history = mockBalanceHistory[params.storeId as string];
    if (!history) {
      return HttpResponse.json({
        data: { storeId: params.storeId, storeName: 'Unknown', dataPoints: [] },
        meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
      });
    }
    return HttpResponse.json({ data: history, meta: { timestamp: new Date().toISOString(), request_id: 'mock' } });
  }),
];
