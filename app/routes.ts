import { type RouteConfig, index, layout, route, prefix } from '@react-router/dev/routes';

export default [
  // Public route
  route('login', 'routes/login.tsx'),

  // All authenticated routes wrapped in layout
  layout('routes/_authenticated.tsx', [
    index('routes/dashboard.tsx'),

    // Admin
    ...prefix('admin', [
      route('users', 'routes/admin/users.tsx'),
      route('users/:id', 'routes/admin/user-detail.tsx'),
      route('stores', 'routes/admin/stores.tsx'),
      route('devices', 'routes/admin/devices.tsx'),
      route('configuration', 'routes/admin/configuration.tsx'),
    ]),

    // M1 — Suppliers
    ...prefix('suppliers', [
      index('routes/suppliers/index.tsx'),
      route(':id', 'routes/suppliers/detail.tsx'),
    ]),

    // M2 — Purchase Requisitions
    ...prefix('purchase-requisitions', [
      index('routes/procurement/pr-list.tsx'),
      route(':id', 'routes/procurement/pr-detail.tsx'),
    ]),

    // M3 — Purchase Orders
    ...prefix('purchase-orders', [
      index('routes/procurement/po-list.tsx'),
      route(':id', 'routes/procurement/po-detail.tsx'),
    ]),

    // M4 — Quality (DVR + Inspections)
    ...prefix('quality', [
      route('dvr', 'routes/quality/dvr-list.tsx'),
      route('dvr/:id', 'routes/quality/dvr-detail.tsx'),
      route('inspections/:id', 'routes/quality/inspection-detail.tsx'),
    ]),

    // M5 — Weighbridge
    ...prefix('weighbridge', [
      index('routes/weighbridge/index.tsx'),
      route(':id', 'routes/weighbridge/detail.tsx'),
    ]),

    // M6 — GRN
    ...prefix('grn', [
      index('routes/grn/index.tsx'),
      route(':id', 'routes/grn/detail.tsx'),
    ]),

    // M7 — Lots & Items
    ...prefix('lots', [
      index('routes/lots/index.tsx'),
      route(':id', 'routes/lots/detail.tsx'),
    ]),
    ...prefix('items', [
      route(':id', 'routes/items/detail.tsx'),
    ]),

    // M8 — Warehouse
    ...prefix('warehouse', [
      route(':storeId', 'routes/warehouse/map.tsx'),
    ]),

    // M9 — Ledger
    ...prefix('ledger', [
      route(':storeId', 'routes/ledger/index.tsx'),
    ]),

    // M10 — Stock Count
    ...prefix('stock-counts', [
      index('routes/stock-counts/index.tsx'),
      route(':id', 'routes/stock-counts/detail.tsx'),
    ]),

    // M11 — STO
    ...prefix('transfers', [
      index('routes/transfers/sto-list.tsx'),
      route(':id', 'routes/transfers/sto-detail.tsx'),
    ]),

    // M12 — Dispatch
    ...prefix('dispatch', [
      route(':id', 'routes/dispatch/detail.tsx'),
    ]),

    // M13 — Receipt
    ...prefix('receipt', [
      route(':id', 'routes/receipt/detail.tsx'),
    ]),

    // M14 — Consumption
    ...prefix('consumption', [
      index('routes/consumption/index.tsx'),
      route(':id', 'routes/consumption/detail.tsx'),
    ]),

    // M15 — Dosage
    ...prefix('dosage', [
      index('routes/dosage/index.tsx'),
      route('analytics/:storeId', 'routes/dosage/analytics.tsx'),
    ]),

    // M16 — Loss
    ...prefix('write-offs', [
      index('routes/loss/index.tsx'),
      route(':id', 'routes/loss/detail.tsx'),
      route('summary', 'routes/loss/summary.tsx'),
    ]),

    // Alerts
    ...prefix('alerts', [
      index('routes/alerts/index.tsx'),
      route('rules', 'routes/alerts/rules.tsx'),
    ]),

    // Reports
    ...prefix('reports', [
      index('routes/reports/index.tsx'),
      route(':reportType', 'routes/reports/report.tsx'),
    ]),

    // Audit
    ...prefix('audit', [
      index('routes/audit/index.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
