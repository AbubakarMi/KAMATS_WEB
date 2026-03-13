import { type RouteConfig, index, layout, route, prefix } from '@react-router/dev/routes';

export default [
  // Public route
  route('login', 'routes/login.tsx'),

  // All authenticated routes wrapped in layout
  layout('routes/_authenticated.tsx', [
    index('routes/dashboard.tsx'),

    // Admin
    ...prefix('admin', [
      layout('routes/admin/_guard.tsx', [
        route('users', 'routes/admin/users.tsx'),
        route('users/:id', 'routes/admin/user-detail.tsx'),
        route('stores', 'routes/admin/stores.tsx'),
        route('devices', 'routes/admin/devices.tsx'),
        route('configuration', 'routes/admin/configuration.tsx'),
      ]),
    ]),

    // M1 — Suppliers
    ...prefix('suppliers', [
      layout('routes/suppliers/_guard.tsx', [
        index('routes/suppliers/index.tsx'),
        route(':id', 'routes/suppliers/detail.tsx'),
      ]),
    ]),

    // M2 — Purchase Requisitions
    ...prefix('purchase-requisitions', [
      layout('routes/procurement/_pr-guard.tsx', [
        index('routes/procurement/pr-list.tsx'),
        route(':id', 'routes/procurement/pr-detail.tsx'),
      ]),
    ]),

    // M3 — Purchase Orders
    ...prefix('purchase-orders', [
      layout('routes/procurement/_po-guard.tsx', [
        index('routes/procurement/po-list.tsx'),
        route(':id', 'routes/procurement/po-detail.tsx'),
      ]),
    ]),

    // M4 — Quality (DVR + Inspections)
    ...prefix('quality', [
      layout('routes/quality/_guard.tsx', [
        route('dvr', 'routes/quality/dvr-list.tsx'),
        route('dvr/:id', 'routes/quality/dvr-detail.tsx'),
        route('inspections/:id', 'routes/quality/inspection-detail.tsx'),
      ]),
    ]),

    // M5 — Weighbridge
    ...prefix('weighbridge', [
      layout('routes/weighbridge/_guard.tsx', [
        index('routes/weighbridge/index.tsx'),
        route(':id', 'routes/weighbridge/detail.tsx'),
      ]),
    ]),

    // M6 — GRN
    ...prefix('grn', [
      layout('routes/grn/_guard.tsx', [
        index('routes/grn/index.tsx'),
        route(':id', 'routes/grn/detail.tsx'),
      ]),
    ]),

    // M7 — Lots & Items
    ...prefix('lots', [
      layout('routes/lots/_guard.tsx', [
        index('routes/lots/index.tsx'),
        route(':id', 'routes/lots/detail.tsx'),
      ]),
    ]),
    ...prefix('items', [
      layout('routes/items/_guard.tsx', [
        route(':id', 'routes/items/detail.tsx'),
      ]),
    ]),

    // M8 — Warehouse
    ...prefix('warehouse', [
      layout('routes/warehouse/_guard.tsx', [
        route(':storeId', 'routes/warehouse/map.tsx'),
      ]),
    ]),

    // M9 — Ledger
    ...prefix('ledger', [
      layout('routes/ledger/_guard.tsx', [
        route(':storeId', 'routes/ledger/index.tsx'),
      ]),
    ]),

    // M10 — Stock Count
    ...prefix('stock-counts', [
      layout('routes/stock-counts/_guard.tsx', [
        index('routes/stock-counts/index.tsx'),
        route(':id', 'routes/stock-counts/detail.tsx'),
      ]),
    ]),

    // M11 — STO
    ...prefix('transfers', [
      layout('routes/transfers/_guard.tsx', [
        index('routes/transfers/sto-list.tsx'),
        route(':id', 'routes/transfers/sto-detail.tsx'),
      ]),
    ]),

    // M12 — Dispatch
    ...prefix('dispatch', [
      layout('routes/dispatch/_guard.tsx', [
        route(':id', 'routes/dispatch/detail.tsx'),
      ]),
    ]),

    // M13 — Receipt
    ...prefix('receipt', [
      layout('routes/receipt/_guard.tsx', [
        route(':id', 'routes/receipt/detail.tsx'),
      ]),
    ]),

    // M14 — Consumption
    ...prefix('consumption', [
      layout('routes/consumption/_guard.tsx', [
        index('routes/consumption/index.tsx'),
        route(':id', 'routes/consumption/detail.tsx'),
      ]),
    ]),

    // M15 — Dosage
    ...prefix('dosage', [
      layout('routes/dosage/_guard.tsx', [
        index('routes/dosage/index.tsx'),
        route('analytics/:storeId', 'routes/dosage/analytics.tsx'),
      ]),
    ]),

    // M16 — Loss
    ...prefix('write-offs', [
      layout('routes/loss/_guard.tsx', [
        index('routes/loss/index.tsx'),
        route(':id', 'routes/loss/detail.tsx'),
        route('summary', 'routes/loss/summary.tsx'),
      ]),
    ]),

    // Alerts
    ...prefix('alerts', [
      layout('routes/alerts/_guard.tsx', [
        index('routes/alerts/index.tsx'),
        route('rules', 'routes/alerts/rules.tsx'),
      ]),
    ]),

    // Reports
    ...prefix('reports', [
      layout('routes/reports/_guard.tsx', [
        index('routes/reports/index.tsx'),
        route(':reportType', 'routes/reports/report.tsx'),
      ]),
    ]),

    // Audit
    ...prefix('audit', [
      layout('routes/audit/_guard.tsx', [
        index('routes/audit/index.tsx'),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
