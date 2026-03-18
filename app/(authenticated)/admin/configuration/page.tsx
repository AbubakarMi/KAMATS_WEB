'use client';

import Link from 'next/link';
import { Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetConfigurationQuery } from '@/lib/features/admin/adminApi';
import { formatDateTime } from '@/lib/utils/formatters';

export default function ConfigurationPage() {
  const { data: configs, isLoading } = useGetConfigurationQuery();

  if (isLoading) return <DetailPageSkeleton descriptionRows={8} />;

  return (
    <div>
      <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900 mb-4">
        System Configuration
      </h1>

      <div className="rounded-[14px] border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium w-[250px]">Key</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Value</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium">Description</th>
              <th className="text-left py-2.5 px-4 text-slate-500 font-medium w-[180px]">Updated</th>
              <th className="py-2.5 px-4 w-[60px]"></th>
            </tr>
          </thead>
          <tbody>
            {(configs ?? []).map((c) => (
              <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="py-2.5 px-4 font-mono text-xs">{c.configKey}</td>
                <td className="py-2.5 px-4">
                  <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                    {JSON.stringify(c.configValue, null, 0)?.substring(0, 100)}
                  </code>
                </td>
                <td className="py-2.5 px-4 text-slate-500">{c.description || '—'}</td>
                <td className="py-2.5 px-4">{formatDateTime(c.updatedAt)}</td>
                <td className="py-2.5 px-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/configuration/edit/${encodeURIComponent(c.configKey)}`}>
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
