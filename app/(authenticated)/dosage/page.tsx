'use client';

import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetDosageConfigsQuery } from '@/lib/features/dosage/dosageApi';

export default function DosageConfigPage() {
  const { data: configs, isLoading } = useGetDosageConfigsQuery();

  if (isLoading) return <DetailPageSkeleton descriptionRows={6} hasTable />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Dosage Configuration
        </h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/dosage/create">
            <Plus className="h-4 w-4 mr-1.5" />New Configuration
          </Link>
        </Button>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Store</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Standard Rate (kg/m³)</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Effective Rate</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Season</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Dry Mult.</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Wet Mult.</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Variance</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Analytics</th>
              <th className="py-2.5 px-4"></th>
            </tr>
          </thead>
          <tbody>
            {(configs ?? []).map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2.5 px-4">{c.storeName}</td>
                <td className="py-2.5 px-4">{c.standardRateKgM3}</td>
                <td className="py-2.5 px-4">{c.effectiveRate}</td>
                <td className="py-2.5 px-4"><StatusBadge status={c.currentSeason} /></td>
                <td className="py-2.5 px-4">{c.drySeasonMultiplier}</td>
                <td className="py-2.5 px-4">{c.wetSeasonMultiplier}</td>
                <td className="py-2.5 px-4">{c.acceptableVariancePct}%</td>
                <td className="py-2.5 px-4">
                  <Link href={`/dosage/analytics/${c.storeId}`} className="text-sm text-blue-600 hover:underline">View</Link>
                </td>
                <td className="py-2.5 px-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dosage/edit/${c.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
