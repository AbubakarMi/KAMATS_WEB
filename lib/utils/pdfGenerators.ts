import {
  createPdf,
  addFieldSection,
  addTable,
  downloadPdf,
  type PdfField,
} from './pdfExport';
import { formatDate, formatDateTime, formatWeight, formatNumber, formatPercentage } from './formatters';

/** PDF-safe money formatter — avoids currency symbols (₦) that jsPDF can't render */
function formatMoneyPdf(amount: string | null | undefined, currency = 'NGN'): string {
  if (!amount) return '—';
  const num = parseFloat(amount);
  if (isNaN(num)) return '—';
  return `${currency} ${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
import type { PO } from '@/lib/api/types/procurement';
import type { WeighbridgeTicket } from '@/lib/api/types/weighbridge';
import type { GRN } from '@/lib/api/types/grn';
import type { STO, DispatchSession } from '@/lib/api/types/distribution';
import type { WriteOff } from '@/lib/api/types/loss';

/* ── 1. Purchase Order ──────────────────────────────────────────── */
export function generatePOPdf(po: PO): void {
  const doc = createPdf(`Purchase Order: ${po.poNumber}`, `Supplier: ${po.supplierName}`);

  const fields: PdfField[] = [
    { label: 'PO Number', value: po.poNumber },
    { label: 'Status', value: po.status.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Linked PR', value: po.prNumber },
    { label: 'Supplier', value: po.supplierName },
    { label: 'Destination Store', value: po.destinationStoreName },
    { label: 'Currency', value: po.currency },
    { label: 'Total Amount', value: formatMoneyPdf(po.totalAmount, po.currency) },
    { label: 'Expected Delivery', value: formatDate(po.expectedDeliveryDate) },
    { label: 'Requested By', value: po.requestedByName },
    { label: 'Requested At', value: formatDateTime(po.requestedAt) },
    ...(po.managerApprovedByName
      ? [
          { label: 'Manager Approved By', value: po.managerApprovedByName },
          { label: 'Manager Approved At', value: formatDateTime(po.managerApprovedAt) },
        ]
      : []),
    ...(po.financeApprovedByName
      ? [
          { label: 'Finance Approved By', value: po.financeApprovedByName },
          { label: 'Finance Approved At', value: formatDateTime(po.financeApprovedAt) },
        ]
      : []),
    ...(po.issuedAt ? [{ label: 'Issued At', value: formatDateTime(po.issuedAt) }] : []),
    { label: 'Created', value: formatDateTime(po.createdAt) },
  ];

  let y = addFieldSection(doc, 110, 'Order Details', fields);

  if (po.lines.length > 0) {
    y = addTable(doc, y + 4, {
      title: 'PO Lines',
      columns: [
        { header: '#', dataKey: 'lineNumber' },
        { header: 'Product', dataKey: 'product' },
        { header: 'Qty (bags)', dataKey: 'qty' },
        { header: 'Std Weight', dataKey: 'weight' },
        { header: 'Unit Price', dataKey: 'price' },
        { header: 'Line Total', dataKey: 'total' },
      ],
      rows: po.lines.map((l) => ({
        lineNumber: l.lineNumber,
        product: l.productSpecification,
        qty: l.quantityBags,
        weight: formatWeight(l.standardWeightKg),
        price: formatMoneyPdf(l.unitPrice, po.currency),
        total: formatMoneyPdf(l.lineTotal, po.currency),
      })),
    });
  }

  if (po.amendments.length > 0) {
    addTable(doc, y + 4, {
      title: 'Amendments',
      columns: [
        { header: 'Version', dataKey: 'version' },
        { header: 'Justification', dataKey: 'justification' },
        { header: 'Status', dataKey: 'status' },
        { header: 'Requested', dataKey: 'requested' },
      ],
      rows: po.amendments.map((a) => ({
        version: a.amendmentVersion,
        justification: a.justification,
        status: a.status.replace(/([A-Z])/g, ' $1').trim(),
        requested: formatDateTime(a.requestedAt),
      })),
    });
  }

  downloadPdf(doc, `${po.poNumber}.pdf`);
}

/* ── 2. Weighbridge Ticket ──────────────────────────────────────── */
export function generateWeighbridgePdf(ticket: WeighbridgeTicket): void {
  const doc = createPdf(`Weighbridge Ticket: ${ticket.ticketNumber}`, `Supplier: ${ticket.supplierName}`);

  const fields: PdfField[] = [
    { label: 'Ticket Number', value: ticket.ticketNumber },
    { label: 'Status', value: ticket.status.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'PO', value: ticket.poNumber },
    { label: 'DVR', value: ticket.dvrNumber },
    { label: 'Supplier', value: ticket.supplierName },
    { label: 'Driver', value: `${ticket.driverName} (${ticket.driverIdNumber})` },
    { label: 'Vehicle', value: ticket.vehicleReg },
    { label: 'Operator', value: ticket.operatorName },
    { label: 'PO Quantity', value: formatWeight(ticket.poQuantityKg) },
    { label: 'Created', value: formatDateTime(ticket.createdAt) },
  ];

  let y = addFieldSection(doc, 110, 'Ticket Details', fields);

  const weightFields: PdfField[] = [
    { label: 'Gross Weight', value: `${formatWeight(ticket.grossWeightKg)}${ticket.grossManual ? ' (Manual)' : ''}` },
    { label: 'Gross Recorded At', value: formatDateTime(ticket.grossWeightAt) },
    { label: 'Tare Weight', value: `${formatWeight(ticket.tareWeightKg)}${ticket.tareManual ? ' (Manual)' : ''}` },
    { label: 'Tare Recorded At', value: formatDateTime(ticket.tareWeightAt) },
    { label: 'Net Weight', value: formatWeight(ticket.netWeightKg) },
    { label: 'Variance', value: ticket.variancePct ? formatPercentage(ticket.variancePct) : '—' },
  ];

  y = addFieldSection(doc, y + 4, 'Weight Progression', weightFields);

  if (ticket.overrideReason) {
    addFieldSection(doc, y + 4, 'Override Details', [
      { label: 'Override Reason', value: ticket.overrideReason },
      { label: 'Override At', value: formatDateTime(ticket.overrideAt) },
    ]);
  }

  downloadPdf(doc, `${ticket.ticketNumber}.pdf`);
}

/* ── 3. GRN ─────────────────────────────────────────────────────── */
export function generateGRNPdf(grn: GRN): void {
  const doc = createPdf(`Goods Received Note: ${grn.grnNumber}`, `Store: ${grn.storeName}`);

  const fields: PdfField[] = [
    { label: 'GRN Number', value: grn.grnNumber },
    { label: 'Status', value: grn.status.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'PO', value: grn.poNumber },
    { label: 'Weighbridge Ticket', value: grn.ticketNumber },
    { label: 'Store', value: grn.storeName },
    { label: 'Net Weight', value: formatWeight(grn.netWeightKg) },
    { label: 'Received By', value: grn.receivedByName },
    { label: 'Witness', value: grn.witnessName },
    { label: 'Received At', value: formatDateTime(grn.receivedAt) },
    { label: 'Submitted At', value: formatDateTime(grn.submittedAt) },
  ];

  let y = addFieldSection(doc, 110, 'GRN Details', fields);

  const bagFields: PdfField[] = [
    { label: 'Bags on Truck', value: grn.bagsOnTruck != null ? formatNumber(grn.bagsOnTruck) : '—' },
    { label: 'Bags Damaged', value: grn.bagsDamaged != null ? formatNumber(grn.bagsDamaged) : '—' },
    { label: 'Bags Accepted', value: grn.bagsAccepted != null ? formatNumber(grn.bagsAccepted) : '—' },
    { label: 'Condition Notes', value: grn.conditionNotes ?? '—' },
  ];

  y = addFieldSection(doc, y + 4, 'Bag Count', bagFields);

  if (grn.lotCreated) {
    addFieldSection(doc, y + 4, 'Linked Lot', [
      { label: 'Lot Number', value: grn.lotCreated.lotNumber },
      { label: 'Total Bags', value: formatNumber(grn.lotCreated.totalBags) },
    ]);
  }

  downloadPdf(doc, `${grn.grnNumber}.pdf`);
}

/* ── 4. Stock Transfer Order ────────────────────────────────────── */
export function generateSTOPdf(sto: STO): void {
  const doc = createPdf(`Stock Transfer Order: ${sto.stoNumber}`, `${sto.sourceStoreName} → ${sto.destinationStoreName}`);

  const fields: PdfField[] = [
    { label: 'STO Number', value: sto.stoNumber },
    { label: 'Trigger', value: sto.triggerType.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Status', value: sto.status.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Source Store', value: sto.sourceStoreName },
    { label: 'Destination Store', value: sto.destinationStoreName },
    { label: 'Requested Delivery', value: formatDate(sto.requestedDelivery) },
    { label: 'Requested Bags', value: formatNumber(sto.requestedBags) },
    { label: 'Authorised Bags', value: sto.authorisedBags != null ? formatNumber(sto.authorisedBags) : '—' },
    { label: 'Requested By', value: sto.requestedByName },
    { label: 'Requested At', value: formatDateTime(sto.requestedAt) },
    ...(sto.authorisedByName
      ? [
          { label: 'Authorised By', value: sto.authorisedByName },
          { label: 'Authorised At', value: formatDateTime(sto.authorisedAt) },
        ]
      : []),
    ...(sto.justification ? [{ label: 'Justification', value: sto.justification }] : []),
    ...(sto.notes ? [{ label: 'Notes', value: sto.notes }] : []),
    ...(sto.tdnNumber ? [{ label: 'TDN', value: sto.tdnNumber }] : []),
    ...(sto.grdNumber ? [{ label: 'GRD', value: sto.grdNumber }] : []),
    { label: 'Created', value: formatDateTime(sto.createdAt) },
  ];

  let y = addFieldSection(doc, 110, 'Transfer Details', fields);

  if (sto.preSelectedItems.length > 0) {
    addTable(doc, y + 4, {
      title: 'Pre-Selected Items',
      columns: [
        { header: 'Item Code', dataKey: 'itemCode' },
        { header: 'Lot', dataKey: 'lotNumber' },
        { header: 'Status', dataKey: 'status' },
      ],
      rows: sto.preSelectedItems.map((i) => ({
        itemCode: i.itemCode,
        lotNumber: i.lotNumber,
        status: i.status,
      })),
    });
  }

  downloadPdf(doc, `${sto.stoNumber}.pdf`);
}

/* ── 5. Dispatch Session (TDN) ──────────────────────────────────── */
export function generateDispatchPdf(dispatch: DispatchSession): void {
  const doc = createPdf(`Dispatch: ${dispatch.stoNumber}`, `Vehicle: ${dispatch.vehicleReg} — Driver: ${dispatch.driverName}`);

  const fields: PdfField[] = [
    { label: 'STO', value: dispatch.stoNumber },
    { label: 'Status', value: dispatch.status.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Vehicle Reg', value: dispatch.vehicleReg },
    { label: 'Driver', value: dispatch.driverName },
    { label: 'Driver Phone', value: dispatch.driverPhone },
    { label: 'Expected Weight', value: dispatch.expectedWeightKg ? formatWeight(dispatch.expectedWeightKg) : '—' },
    { label: 'Dispatched Weight', value: dispatch.dispatchedWeightKg ? formatWeight(dispatch.dispatchedWeightKg) : '—' },
    { label: 'Weight Variance', value: dispatch.weightVariancePct ? `${dispatch.weightVariancePct}%` : '—' },
    { label: 'Scanned / Expected', value: `${formatNumber(dispatch.scannedCount)} / ${formatNumber(dispatch.expectedCount)}` },
    { label: 'Created', value: formatDateTime(dispatch.createdAt) },
  ];

  let y = addFieldSection(doc, 110, 'Dispatch Details', fields);

  if (dispatch.scannedItems.length > 0) {
    addTable(doc, y + 4, {
      title: 'Scanned Items',
      columns: [
        { header: 'Item Code', dataKey: 'itemCode' },
        { header: 'Scanned At', dataKey: 'scannedAt' },
      ],
      rows: dispatch.scannedItems.map((i) => ({
        itemCode: i.itemCode,
        scannedAt: formatDateTime(i.scannedAt),
      })),
    });
  }

  downloadPdf(doc, `TDN-${dispatch.stoNumber}.pdf`);
}

/* ── 6. Write-Off ───────────────────────────────────────────────── */
export function generateWriteOffPdf(wo: WriteOff): void {
  const doc = createPdf(`Write-Off: ${wo.requestNumber}`, `Store: ${wo.storeName}`);

  const fields: PdfField[] = [
    { label: 'Request Number', value: wo.requestNumber },
    { label: 'Status', value: wo.status.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Category', value: wo.category.replace(/([A-Z])/g, ' $1').trim() },
    { label: 'Store', value: wo.storeName },
    { label: 'Bags', value: formatNumber(wo.bagsCount) },
    { label: 'Weight', value: formatWeight(wo.weightKg) },
    { label: 'Approval Route', value: wo.approvalRoute },
    { label: 'Raised By', value: wo.raisedByName },
    { label: 'Raised At', value: formatDateTime(wo.raisedAt) },
    { label: 'Description', value: wo.description },
    ...(wo.approvedByName
      ? [
          { label: 'Approved By', value: wo.approvedByName },
          { label: 'Approved At', value: formatDateTime(wo.approvedAt) },
          { label: 'Approval Notes', value: wo.approvalNotes ?? '—' },
        ]
      : []),
    ...(wo.rejectionReason
      ? [{ label: 'Rejection Reason', value: wo.rejectionReason }]
      : []),
    { label: 'Created', value: formatDateTime(wo.createdAt) },
  ];

  addFieldSection(doc, 110, 'Write-Off Details', fields);

  downloadPdf(doc, `${wo.requestNumber}.pdf`);
}
