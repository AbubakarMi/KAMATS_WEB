// All 153 API endpoint path constants organized by module.
// Usage: endpoints.auth.login → '/auth/login'

export const endpoints = {
  // === Auth (6) ===
  auth: {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    biometricEnroll: '/auth/biometric/enroll',
    biometricVerify: '/auth/biometric/verify',
    changePassword: '/auth/change-password',
    pinSetup: '/auth/pin/setup',
    pinVerify: '/auth/pin/verify',
  },

  // === Admin (15) ===
  admin: {
    users: '/admin/users',
    user: (id: string) => `/admin/users/${id}`,
    deactivateUser: (id: string) => `/admin/users/${id}/deactivate`,
    unlockUser: (id: string) => `/admin/users/${id}/unlock`,
    userStoreAssignments: (id: string) => `/admin/users/${id}/store-assignments`,
    removeStoreAssignment: (id: string, storeId: string) =>
      `/admin/users/${id}/store-assignments/${storeId}`,
    stores: '/admin/stores',
    store: (id: string) => `/admin/stores/${id}`,
    configuration: '/admin/configuration',
    configKey: (key: string) => `/admin/configuration/${key}`,
    devices: '/admin/devices',
    device: (id: string) => `/admin/devices/${id}`,
  },

  // === M1 Suppliers (9) ===
  suppliers: {
    list: '/suppliers',
    detail: (id: string) => `/suppliers/${id}`,
    approve: (id: string) => `/suppliers/${id}/approve`,
    reject: (id: string) => `/suppliers/${id}/reject`,
    suspend: (id: string) => `/suppliers/${id}/suspend`,
    deactivate: (id: string) => `/suppliers/${id}/deactivate`,
    reactivate: (id: string) => `/suppliers/${id}/reactivate`,
    scorecard: (id: string) => `/suppliers/${id}/scorecard`,
  },

  // === M2 Purchase Requisitions (6) ===
  pr: {
    list: '/purchase-requisitions',
    detail: (id: string) => `/purchase-requisitions/${id}`,
    submit: (id: string) => `/purchase-requisitions/${id}/submit`,
    approve: (id: string) => `/purchase-requisitions/${id}/approve`,
    reject: (id: string) => `/purchase-requisitions/${id}/reject`,
  },

  // === M3 Purchase Orders (11) ===
  po: {
    list: '/purchase-orders',
    detail: (id: string) => `/purchase-orders/${id}`,
    submit: (id: string) => `/purchase-orders/${id}/submit`,
    approveManager: (id: string) => `/purchase-orders/${id}/approve-manager`,
    rejectManager: (id: string) => `/purchase-orders/${id}/reject-manager`,
    approveFinance: (id: string) => `/purchase-orders/${id}/approve-finance`,
    rejectFinance: (id: string) => `/purchase-orders/${id}/reject-finance`,
    amendments: (id: string) => `/purchase-orders/${id}/amendments`,
    approveAmendmentManager: (id: string, aId: string) =>
      `/purchase-orders/${id}/amendments/${aId}/approve-manager`,
    approveAmendmentFinance: (id: string, aId: string) =>
      `/purchase-orders/${id}/amendments/${aId}/approve-finance`,
  },

  // === M4 Quality (7) ===
  dvr: {
    list: '/driver-visit-records',
    detail: (id: string) => `/driver-visit-records/${id}`,
    linkPo: (id: string) => `/driver-visit-records/${id}/link-po`,
  },
  inspection: {
    create: '/quality-inspections',
    detail: (id: string) => `/quality-inspections/${id}`,
    submitResult: (id: string) => `/quality-inspections/${id}/submit-result`,
  },

  // === M5 Weighbridge (7) ===
  weighbridge: {
    list: '/weighbridge-tickets',
    detail: (id: string) => `/weighbridge-tickets/${id}`,
    grossWeight: (id: string) => `/weighbridge-tickets/${id}/gross-weight`,
    tareWeight: (id: string) => `/weighbridge-tickets/${id}/tare-weight`,
    override: (id: string) => `/weighbridge-tickets/${id}/override`,
    reject: (id: string) => `/weighbridge-tickets/${id}/reject`,
  },

  // === M6 GRN (5) ===
  grn: {
    list: '/goods-received-notes',
    detail: (id: string) => `/goods-received-notes/${id}`,
    recordCount: (id: string) => `/goods-received-notes/${id}/record-count`,
    submit: (id: string) => `/goods-received-notes/${id}/submit`,
  },

  // === M7 Lots & Items (7) ===
  lots: {
    list: '/lots',
    detail: (id: string) => `/lots/${id}`,
    generateLabels: (id: string) => `/lots/${id}/generate-labels`,
  },
  items: {
    scanLabel: (id: string) => `/items/${id}/scan-label`,
    byQrCode: (qrCode: string) => `/items/${qrCode}`,
    detail: (id: string) => `/items/${id}`,
    lifecycle: (id: string) => `/items/${id}/lifecycle`,
    putAway: (id: string) => `/items/${id}/put-away`,
  },

  // === M8 Warehouse (5) ===
  locations: {
    list: '/storage-locations',
    detail: (id: string) => `/storage-locations/${id}`,
    contents: (id: string) => `/storage-locations/${id}/contents`,
    warehouseMap: (storeId: string) => `/stores/${storeId}/warehouse-map`,
  },
  internalTransfers: '/internal-transfers',

  // === M9 Ledger (3) ===
  ledger: {
    balance: (storeId: string) => `/stock-ledger/${storeId}`,
    entries: (storeId: string) => `/stock-ledger/${storeId}/entries`,
    balanceHistory: (storeId: string) => `/stock-ledger/${storeId}/balance-history`,
  },

  // === M10 Stock Count (7) ===
  stockCount: {
    list: '/stock-counts',
    detail: (id: string) => `/stock-counts/${id}`,
    submitResult: (id: string) => `/stock-counts/${id}/submit-result`,
    recount: (id: string) => `/stock-counts/${id}/recount`,
    approveVariance: (id: string) => `/stock-counts/${id}/approve-variance`,
    rejectVariance: (id: string) => `/stock-counts/${id}/reject-variance`,
  },

  // === M11 STO (7) ===
  sto: {
    list: '/stock-transfer-orders',
    detail: (id: string) => `/stock-transfer-orders/${id}`,
    submit: (id: string) => `/stock-transfer-orders/${id}/submit`,
    authorise: (id: string) => `/stock-transfer-orders/${id}/authorise`,
    reject: (id: string) => `/stock-transfer-orders/${id}/reject`,
    cancel: (id: string) => `/stock-transfer-orders/${id}/cancel`,
  },

  // === M12 Dispatch (6) ===
  dispatch: {
    list: '/transfer-dispatch',
    create: '/transfer-dispatch',
    detail: (id: string) => `/transfer-dispatch/${id}`,
    scanItem: (id: string) => `/transfer-dispatch/${id}/scan-item`,
    recordWeight: (id: string) => `/transfer-dispatch/${id}/record-weight`,
    approveShort: (id: string) => `/transfer-dispatch/${id}/approve-short`,
    complete: (id: string) => `/transfer-dispatch/${id}/complete`,
  },

  // === M13 Receipt (6) ===
  receipt: {
    create: '/transfer-receipt',
    detail: (id: string) => `/transfer-receipt/${id}`,
    scanItem: (id: string) => `/transfer-receipt/${id}/scan-item`,
    reportDamage: (id: string) => `/transfer-receipt/${id}/report-damage`,
    complete: (id: string) => `/transfer-receipt/${id}/complete`,
    shortageReport: (id: string) => `/transfer-receipt/${id}/shortage-report`,
  },

  // === M14 Consumption (6) ===
  consumption: {
    list: '/consumption',
    detail: (id: string) => `/consumption/${id}`,
    scanItem: (id: string) => `/consumption/${id}/scan-item`,
    submit: (id: string) => `/consumption/${id}/submit`,
    acknowledgeAnomaly: (id: string) => `/consumption/${id}/acknowledge-anomaly`,
  },

  // === M15 Dosage (7) ===
  dosage: {
    list: '/dosage-configurations',
    byStore: (storeId: string) => `/dosage-configurations/${storeId}`,
    create: '/dosage-configurations',
    update: (id: string) => `/dosage-configurations/${id}`,
    analytics: (storeId: string) => `/consumption-analytics/${storeId}`,
    trends: (storeId: string) => `/consumption-analytics/${storeId}/trends`,
    operatorPatterns: (storeId: string) => `/consumption-analytics/${storeId}/operator-patterns`,
  },

  // === M16 Loss (9) ===
  writeOff: {
    list: '/write-offs',
    detail: (id: string) => `/write-offs/${id}`,
    approve: (id: string) => `/write-offs/${id}/approve`,
    reject: (id: string) => `/write-offs/${id}/reject`,
    lossSummary: '/write-offs/loss-summary',
  },
  returnOrder: {
    create: '/return-orders',
    ship: (id: string) => `/return-orders/${id}/ship`,
    confirmCredit: (id: string) => `/return-orders/${id}/confirm-credit`,
  },

  // === Cross-Cutting: Alerts (5) ===
  alerts: {
    list: '/alerts',
    acknowledge: (id: string) => `/alerts/${id}/acknowledge`,
    rules: '/alert-rules',
    rule: (id: string) => `/alert-rules/${id}`,
  },

  // === Cross-Cutting: Reports (11) ===
  reports: {
    stockSummary: '/reports/stock-summary',
    lotLifecycle: (lotId: string) => `/reports/lot-lifecycle/${lotId}`,
    itemHistory: (itemId: string) => `/reports/item-history/${itemId}`,
    consumptionAnalytics: '/reports/consumption-analytics',
    transferReconciliation: '/reports/transfer-reconciliation',
    supplierPerformance: '/reports/supplier-performance',
    lossSummary: '/reports/loss-summary',
    stockMovementSummary: '/reports/stock-movement-summary',
    anomalyHistory: '/reports/anomaly-history',
    physicalCountResults: '/reports/physical-count-results',
    procurementPipeline: '/reports/procurement-pipeline',
  },

  // === Cross-Cutting: Audit (4) ===
  audit: {
    events: '/audit/events',
    verifyChain: '/audit/verify-chain',
    verifyChainStore: (storeId: string) => `/audit/verify-chain/${storeId}`,
    export: '/audit/export',
  },

  // === Cross-Cutting: Sync (5) ===
  sync: {
    health: '/sync/health',
    push: '/sync/push',
    pull: '/sync/pull',
    status: '/sync/status',
    resolveConflict: (conflictId: string) => `/sync/conflicts/${conflictId}/resolve`,
    forceFull: '/sync/force-full',
  },
} as const;
