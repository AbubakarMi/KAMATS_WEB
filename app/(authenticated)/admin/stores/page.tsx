'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';

import { DescriptionList } from '@/components/data-display/DescriptionList';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import type { Store } from '@/lib/api/types/admin';

interface TreeNode {
  store: Store;
  children: TreeNode[];
}

function StoreTreeNode({ node, depth, onSelect }: { node: TreeNode; depth: number; onSelect: (store: Store) => void }) {
  return (
    <div>
      <button
        onClick={() => onSelect(node.store)}
        className="flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <Building2 className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm font-semibold text-slate-900">{node.store.code}</span>
        <span className="text-sm text-slate-600">{node.store.name}</span>
        <StatusBadge status={node.store.tier} />
        {!node.store.isActive && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Inactive</span>}
      </button>
      {node.children.map((child) => (
        <StoreTreeNode key={child.store.id} node={child} depth={depth + 1} onSelect={onSelect} />
      ))}
    </div>
  );
}

export default function StoresPage() {
  const { data: stores, isLoading } = useGetStoresQuery();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  const treeData = useMemo(() => {
    if (!stores) return [];
    const buildTree = (parentId: string | null): TreeNode[] =>
      stores
        .filter((s) => s.parentStoreId === parentId)
        .map((s) => ({ store: s, children: buildTree(s.id) }));
    return buildTree(null);
  }, [stores]);

  if (isLoading) return <DetailPageSkeleton descriptionRows={6} />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">Store Hierarchy</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/admin/stores/create">
            <Plus className="h-4 w-4 mr-1.5" />Add Store
          </Link>
        </Button>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-4">
        {treeData.length > 0 ? (
          treeData.map((node) => (
            <StoreTreeNode key={node.store.id} node={node} depth={0} onSelect={setSelectedStore} />
          ))
        ) : (
          <p className="text-sm text-slate-500 text-center py-8">No stores configured</p>
        )}
      </div>

      <Sheet open={!!selectedStore} onOpenChange={(open) => { if (!open) setSelectedStore(null); }}>
        <SheetContent>
          <SheetHeader><SheetTitle>{selectedStore?.name}</SheetTitle></SheetHeader>
          {selectedStore && (
            <div className="mt-4">
              <DescriptionList items={[
                { label: 'Code', value: selectedStore.code },
                { label: 'Tier', value: <StatusBadge status={selectedStore.tier} /> },
                { label: 'Parent', value: selectedStore.parentStoreName || '—' },
                { label: 'Address', value: selectedStore.address || '—' },
                {
                  label: 'GPS',
                  value: selectedStore.gpsLatitude && selectedStore.gpsLongitude
                    ? `${selectedStore.gpsLatitude}, ${selectedStore.gpsLongitude}`
                    : '—',
                },
                {
                  label: 'Status',
                  value: selectedStore.isActive
                    ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>
                    : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>,
                },
              ]} columns={1} />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
