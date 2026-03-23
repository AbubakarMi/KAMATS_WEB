'use client';

import Link from 'next/link';
import { Database, BarChart3, ArrowLeftRight, Users, AlertTriangle, GitBranch, Package, TrendingUp, ShieldAlert, ClipboardCheck, Workflow } from 'lucide-react';

const reportCards = [
  {
    key: 'stock-summary',
    title: 'Stock Balance Summary',
    description: 'System-wide stock snapshot across all stores with reorder point status.',
    icon: <Database className="h-7 w-7 text-blue-600" />,
  },
  {
    key: 'consumption-analytics',
    title: 'Consumption Analytics',
    description: 'Cross-store consumption rates, anomaly analysis, and dosage efficiency.',
    icon: <BarChart3 className="h-7 w-7 text-emerald-600" />,
  },
  {
    key: 'transfer-reconciliation',
    title: 'Transfer Reconciliation',
    description: 'Dispatched vs received comparison for all transfers with shortage tracking.',
    icon: <ArrowLeftRight className="h-7 w-7 text-amber-600" />,
  },
  {
    key: 'supplier-performance',
    title: 'Supplier Performance',
    description: 'Supplier KPIs: on-time rate, quantity accuracy, quality acceptance.',
    icon: <Users className="h-7 w-7 text-violet-600" />,
  },
  {
    key: 'loss-summary',
    title: 'Loss Summary',
    description: 'Write-off analysis by category and store with monthly trends.',
    icon: <AlertTriangle className="h-7 w-7 text-red-600" />,
  },
  {
    key: 'lot-lifecycle',
    title: 'Lot Lifecycle',
    description: 'End-to-end lifecycle of a lot from GRN receipt through distribution and consumption.',
    icon: <GitBranch className="h-7 w-7 text-teal-600" />,
  },
  {
    key: 'item-history',
    title: 'Item History',
    description: 'Full chain of custody for an individual item — every movement, transfer, and consumption.',
    icon: <Package className="h-7 w-7 text-cyan-600" />,
  },
  {
    key: 'stock-movement-summary',
    title: 'Stock Movement Summary',
    description: 'All stock movements with direction, type, and weight for a given period.',
    icon: <TrendingUp className="h-7 w-7 text-indigo-600" />,
  },
  {
    key: 'anomaly-history',
    title: 'Anomaly History',
    description: 'Consumption anomalies with deviation analysis and resolution tracking.',
    icon: <ShieldAlert className="h-7 w-7 text-orange-600" />,
  },
  {
    key: 'physical-count-results',
    title: 'Physical Count Results',
    description: 'Stock count results with variance analysis across stores and count types.',
    icon: <ClipboardCheck className="h-7 w-7 text-pink-600" />,
  },
  {
    key: 'procurement-pipeline',
    title: 'Procurement Pipeline',
    description: 'Open PRs, pending POs, and expected deliveries with aging analysis.',
    icon: <Workflow className="h-7 w-7 text-sky-600" />,
  },
];

export default function ReportsIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        Reports
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((r) => (
          <Link key={r.key} href={`/reports/${r.key}`}>
            <div className="rounded-[14px] border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-sm transition-all h-full">
              <div className="text-center mb-3">{r.icon}</div>
              <h3 className="text-base font-semibold text-slate-900 text-center">{r.title}</h3>
              <p className="text-sm text-slate-500 text-center mt-2">{r.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
