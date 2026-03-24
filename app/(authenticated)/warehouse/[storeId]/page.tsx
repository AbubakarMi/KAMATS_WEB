'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';

import { KpiCard } from '@/components/charts/KpiCard';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetWarehouseMapQuery, useGetLocationContentsQuery } from '@/lib/features/warehouse/warehouseApi';
import { useAuth } from '@/lib/hooks';
import { formatWeight, formatNumber } from '@/lib/utils/formatters';

function getUtilizationColor(pct: number): string {
  if (pct >= 90) return '#ef4444';
  if (pct >= 70) return '#f59e0b';
  if (pct >= 30) return '#22c55e';
  if (pct > 0) return '#3b82f6';
  return '#e2e8f0';
}

function getUtilizationClasses(pct: number): string {
  if (pct >= 90) return 'border-l-red-500';
  if (pct >= 70) return 'border-l-amber-500';
  if (pct >= 30) return 'border-l-emerald-500';
  if (pct > 0) return 'border-l-blue-500';
  return 'border-l-slate-200';
}

export default function WarehouseMapPage() {
  const { storeId: rawStoreId } = useParams<{ storeId: string }>();
  const router = useRouter();
  const { activeStoreId } = useAuth();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Resolve "default" to the user's active store
  const storeId = rawStoreId === 'default' && activeStoreId ? activeStoreId : rawStoreId;

  // If still "default" (no active store yet), redirect once auth loads
  if (storeId === 'default' && activeStoreId) {
    router.replace(`/warehouse/${activeStoreId}`);
  }

  const { data: warehouseMap, isLoading } = useGetWarehouseMapQuery(storeId);
  const { data: locationContents } = useGetLocationContentsQuery(selectedLocationId!, {
    skip: !selectedLocationId,
  });

  if (isLoading || !warehouseMap) return <DetailPageSkeleton hasKpiCards kpiCount={5} descriptionRows={4} />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        {warehouseMap.storeName} — Warehouse Map
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
        <KpiCard title="Total Locations" value={warehouseMap.totalLocations} />
        <KpiCard title="Occupied" value={warehouseMap.occupiedLocations} />
        <KpiCard title="Total Capacity" value={formatWeight(warehouseMap.totalCapacityKg)} />
        <KpiCard title="Current Weight" value={formatWeight(warehouseMap.currentWeightKg)} />
        <div className="rounded-[14px] border border-slate-200 bg-white p-4 flex items-center justify-center">
          <GaugeChart
            value={warehouseMap.utilizationPct}
            max={100}
            label="Utilization"
            color={getUtilizationColor(warehouseMap.utilizationPct)}
            size={120}
          />
        </div>
      </div>

      {warehouseMap.zones.map((zone) => (
        <div key={zone.zone} className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Zone {zone.zone}</h3>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
            {zone.locations.map((loc) => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={`border-l-4 ${getUtilizationClasses(loc.utilizationPct)} rounded-lg border border-slate-200 bg-white p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer`}
              >
                <p className="text-sm font-semibold text-slate-900">{loc.locationCode}</p>
                <p className="text-xs text-slate-500">{formatNumber(loc.currentBags)} bags</p>
                <span
                  className="inline-block text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${getUtilizationColor(loc.utilizationPct)}20`, color: getUtilizationColor(loc.utilizationPct) }}
                >
                  {loc.utilizationPct.toFixed(0)}%
                </span>
                {!loc.isActive && (
                  <span className="inline-block text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1">Inactive</span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Sheet open={!!selectedLocationId} onOpenChange={(open) => { if (!open) setSelectedLocationId(null); }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {locationContents ? `Location ${locationContents.locationCode}` : 'Location Details'}
            </SheetTitle>
          </SheetHeader>
          {locationContents && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-slate-500">Bags</p>
                  <p className="text-sm font-semibold">{formatNumber(locationContents.currentBags)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Weight</p>
                  <p className="text-sm font-semibold">{formatWeight(locationContents.currentWeightKg)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Utilization</p>
                  <p className="text-sm font-semibold">{locationContents.utilizationPct.toFixed(1)}%</p>
                </div>
              </div>

              {locationContents.lots.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-1.5 text-slate-500 font-medium">Lot</th>
                      <th className="text-right py-1.5 text-slate-500 font-medium">Bags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationContents.lots.map((l) => (
                      <tr key={l.lotId} className="border-b border-slate-50">
                        <td className="py-1.5">{l.lotNumber}</td>
                        <td className="text-right py-1.5">{l.bags}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
