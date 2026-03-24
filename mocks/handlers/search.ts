import { http, HttpResponse } from 'msw';
import type { SearchResult } from '@/lib/api/types/common';

// Import all mock data to search across
import { mockSTOs } from '../data/transfers';
import { mockDispatchSessions } from '../data/dispatch';
import { mockReceiptSessions } from '../data/receipt';

// Inline mini-datasets for entities that don't need the full mock import
const mockPOs = [
  { id: 'po-001', number: 'PO-2026-0001', supplier: 'Kem-Chem Industries Ltd', status: 'Issued' },
  { id: 'po-002', number: 'PO-2026-0002', supplier: 'Al-Mumin Chemicals', status: 'AwaitingDelivery' },
];
const mockPRs = [
  { id: 'pr-001', number: 'PR-2026-0001', description: 'Aluminium Sulphate — Central Store', status: 'ConvertedToPO' },
  { id: 'pr-002', number: 'PR-2026-0002', description: 'Chlorine Gas — Challawa WTP', status: 'Approved' },
  { id: 'pr-003', number: 'PR-2026-0003', description: 'Aluminium Sulphate — Tamburawa', status: 'Submitted' },
];
const mockSuppliers = [
  { id: 'sup-001', name: 'Kem-Chem Industries Ltd', status: 'Active' },
  { id: 'sup-002', name: 'Al-Mumin Chemicals', status: 'Active' },
  { id: 'sup-003', name: 'Northern Chemical Supplies', status: 'PendingApproval' },
];
const mockLots = [
  { id: 'lot-001', number: 'LOT-2026-0001', chemical: 'Aluminium Sulphate', status: 'Active' },
  { id: 'lot-002', number: 'LOT-2026-0002', chemical: 'Chlorine Gas', status: 'PendingLabelling' },
];
const mockItems = [
  { id: 'item-001', code: 'ALUM-2026-0001-001', lot: 'LOT-2026-0001', status: 'InStock' },
  { id: 'item-002', code: 'ALUM-2026-0001-002', lot: 'LOT-2026-0001', status: 'InStock' },
  { id: 'item-005', code: 'ALUM-2026-0001-005', lot: 'LOT-2026-0001', status: 'InTransit' },
];
const mockGRNs = [
  { id: 'grn-001', number: 'GRN-2026-0001', supplier: 'Kem-Chem Industries Ltd', status: 'Accepted' },
  { id: 'grn-002', number: 'GRN-2026-0002', supplier: 'Al-Mumin Chemicals', status: 'Draft' },
];
const mockDVRs = [
  { id: 'dvr-001', number: 'DVR-2026-0001', driver: 'Mohammed Bello', status: 'QualityCleared' },
  { id: 'dvr-002', number: 'DVR-2026-0002', driver: 'Sani Abdullahi', status: 'Active' },
];
const mockWeighbridge = [
  { id: 'wt-001', number: 'WT-2026-0001', vehicle: 'KN-123-ABC', status: 'Pass' },
  { id: 'wt-002', number: 'WT-2026-0002', vehicle: 'KN-456-DEF', status: 'InProgress' },
];

const API = '/api/v1';

export const searchHandlers = [
  http.get(`${API}/search`, ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase().trim();

    if (!q) {
      return HttpResponse.json({
        data: { results: [], total: 0 },
        meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
      });
    }

    const results: SearchResult[] = [];

    // POs
    for (const po of mockPOs) {
      if (po.number.toLowerCase().includes(q) || po.supplier.toLowerCase().includes(q)) {
        results.push({ id: po.id, type: 'po', title: po.number, subtitle: po.supplier, status: po.status, url: `/purchase-orders/${po.id}` });
      }
    }

    // PRs
    for (const pr of mockPRs) {
      if (pr.number.toLowerCase().includes(q) || pr.description.toLowerCase().includes(q)) {
        results.push({ id: pr.id, type: 'pr', title: pr.number, subtitle: pr.description, status: pr.status, url: `/purchase-requisitions/${pr.id}` });
      }
    }

    // Suppliers
    for (const sup of mockSuppliers) {
      if (sup.name.toLowerCase().includes(q)) {
        results.push({ id: sup.id, type: 'supplier', title: sup.name, subtitle: 'Supplier', status: sup.status, url: `/suppliers/${sup.id}` });
      }
    }

    // STOs
    for (const sto of mockSTOs) {
      if (sto.stoNumber.toLowerCase().includes(q) || sto.sourceStoreName.toLowerCase().includes(q) || sto.destinationStoreName.toLowerCase().includes(q)) {
        results.push({ id: sto.id, type: 'sto', title: sto.stoNumber, subtitle: `${sto.sourceStoreName} → ${sto.destinationStoreName}`, status: sto.status, url: `/transfers/${sto.id}` });
      }
    }

    // Lots
    for (const lot of mockLots) {
      if (lot.number.toLowerCase().includes(q) || lot.chemical.toLowerCase().includes(q)) {
        results.push({ id: lot.id, type: 'lot', title: lot.number, subtitle: lot.chemical, status: lot.status, url: `/lots/${lot.id}` });
      }
    }

    // Items
    for (const item of mockItems) {
      if (item.code.toLowerCase().includes(q) || item.lot.toLowerCase().includes(q)) {
        results.push({ id: item.id, type: 'item', title: item.code, subtitle: `Lot: ${item.lot}`, status: item.status, url: `/items/${item.id}` });
      }
    }

    // GRNs
    for (const grn of mockGRNs) {
      if (grn.number.toLowerCase().includes(q) || grn.supplier.toLowerCase().includes(q)) {
        results.push({ id: grn.id, type: 'grn', title: grn.number, subtitle: grn.supplier, status: grn.status, url: `/grn/${grn.id}` });
      }
    }

    // DVRs
    for (const dvr of mockDVRs) {
      if (dvr.number.toLowerCase().includes(q) || dvr.driver.toLowerCase().includes(q)) {
        results.push({ id: dvr.id, type: 'dvr', title: dvr.number, subtitle: `Driver: ${dvr.driver}`, status: dvr.status, url: `/quality/dvr/${dvr.id}` });
      }
    }

    // Weighbridge tickets
    for (const wt of mockWeighbridge) {
      if (wt.number.toLowerCase().includes(q) || wt.vehicle.toLowerCase().includes(q)) {
        results.push({ id: wt.id, type: 'weighbridge', title: wt.number, subtitle: `Vehicle: ${wt.vehicle}`, status: wt.status, url: `/weighbridge/${wt.id}` });
      }
    }

    // Dispatch sessions
    for (const d of mockDispatchSessions) {
      if (d.stoNumber.toLowerCase().includes(q) || d.vehicleReg.toLowerCase().includes(q) || d.driverName.toLowerCase().includes(q)) {
        results.push({ id: d.id, type: 'dispatch', title: `TDN — ${d.stoNumber}`, subtitle: `${d.vehicleReg} / ${d.driverName}`, status: d.status, url: `/dispatch/${d.id}` });
      }
    }

    // Receipt sessions
    for (const r of mockReceiptSessions) {
      if (r.grdNumber.toLowerCase().includes(q) || r.tdnNumber.toLowerCase().includes(q) || r.stoNumber.toLowerCase().includes(q)) {
        results.push({ id: r.id, type: 'receipt', title: r.grdNumber, subtitle: `TDN: ${r.tdnNumber}`, status: r.status, url: `/receipt/${r.id}` });
      }
    }

    return HttpResponse.json({
      data: { results: results.slice(0, 20), total: results.length },
      meta: { timestamp: new Date().toISOString(), request_id: 'mock' },
    });
  }),
];
