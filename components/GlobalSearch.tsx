'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, ShoppingCart, FileText, ArrowLeftRight, Store,
  LayoutGrid, Tag, Inbox, FlaskConical, Gauge, Truck, PackageCheck,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/data-display/StatusBadge';
import { useLazyGlobalSearchQuery } from '@/lib/features/search/searchApi';
import type { SearchResult, SearchEntityType } from '@/lib/api/types/common';

const typeLabels: Record<SearchEntityType, string> = {
  po: 'Purchase Orders',
  pr: 'Requisitions',
  sto: 'Transfers',
  supplier: 'Suppliers',
  lot: 'Lots',
  item: 'Items',
  grn: 'GRN',
  dvr: 'DVR',
  weighbridge: 'Weighbridge',
  dispatch: 'Dispatch',
  receipt: 'Receipt',
};

const typeIcons: Record<SearchEntityType, React.ReactNode> = {
  po: <ShoppingCart size={14} />,
  pr: <FileText size={14} />,
  sto: <ArrowLeftRight size={14} />,
  supplier: <Store size={14} />,
  lot: <LayoutGrid size={14} />,
  item: <Tag size={14} />,
  grn: <Inbox size={14} />,
  dvr: <FlaskConical size={14} />,
  weighbridge: <Gauge size={14} />,
  dispatch: <Truck size={14} />,
  receipt: <PackageCheck size={14} />,
};

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [trigger, { data, isFetching }] = useLazyGlobalSearchQuery();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) return;
    const timeout = setTimeout(() => {
      trigger(query.trim());
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, trigger]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = data?.results ?? [];

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  // Flat list for keyboard nav
  const flatResults = Object.values(grouped).flat();

  const navigate = useCallback((result: SearchResult) => {
    onOpenChange(false);
    router.push(result.url);
  }, [onOpenChange, router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      navigate(flatResults[selectedIndex]);
    }
  };

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [data]);

  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-slate-200 px-4">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search POs, STOs, items, suppliers..."
            className="flex-1 h-12 px-3 text-sm bg-transparent outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-slate-200 bg-slate-50 px-1.5 text-[10px] font-medium text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto">
          {!query.trim() && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              Type to search across all modules
            </div>
          )}

          {query.trim() && !isFetching && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              No results found for &ldquo;{query}&rdquo;
            </div>
          )}

          {isFetching && query.trim() && (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              Searching...
            </div>
          )}

          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                {typeLabels[type as SearchEntityType] ?? type}
              </div>
              {items.map((result) => {
                flatIndex++;
                const idx = flatIndex;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={result.id}
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      isSelected ? 'bg-indigo-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span className={`shrink-0 ${isSelected ? 'text-indigo-500' : 'text-slate-400'}`}>
                      {typeIcons[result.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{result.title}</div>
                      <div className="text-xs text-slate-400 truncate">{result.subtitle}</div>
                    </div>
                    <StatusBadge status={result.status} />
                  </button>
                );
              })}
            </div>
          ))}

          {data && data.total > 20 && (
            <div className="px-4 py-2 text-center text-xs text-slate-400 border-t border-slate-100">
              Showing 20 of {data.total} results — refine your search
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 text-[11px] text-slate-400">
            <span><kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px]">&uarr;&darr;</kbd> Navigate</span>
            <span><kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px]">Enter</kbd> Open</span>
            <span><kbd className="px-1 py-0.5 rounded border border-slate-200 bg-slate-50 text-[10px]">Esc</kbd> Close</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
