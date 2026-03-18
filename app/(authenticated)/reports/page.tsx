'use client';

import Link from 'next/link';
import { Database, BarChart3, ArrowLeftRight, Users, AlertTriangle } from 'lucide-react';

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
