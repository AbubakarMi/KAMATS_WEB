'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { useGetUsersQuery } from '@/lib/features/admin/adminApi';
import { formatDateTime } from '@/lib/utils/formatters';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data } = useGetUsersQuery({ page: 1, pageSize: 100 });
  const user = data?.data?.find((u) => u.id === id);

  if (!user) {
    return (
      <div>
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <div className="mt-4 rounded-[14px] border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">User not found or loading...</p>
        </div>
      </div>
    );
  }

  const statusBadge = !user.isActive
    ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>
    : user.lockoutEnd
      ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Locked</span>
      : <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>;

  const items = [
    { label: 'Username', value: user.username },
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.phoneNumber || '—' },
    { label: 'Status', value: statusBadge },
    { label: 'Primary Store', value: user.storeName || '—' },
    { label: 'Last Login', value: formatDateTime(user.lastLoginAt) },
    {
      label: 'Roles',
      value: (
        <div className="flex flex-wrap gap-1">
          {(user.roles ?? []).map((r) => (
            <span key={r.id} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{r.name}</span>
          ))}
        </div>
      ),
      span: 2 as const,
    },
    { label: 'Created', value: formatDateTime(user.createdAt) },
    { label: 'Login Failures', value: user.failedLoginAttempts },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/users')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6 mb-4">
        <DescriptionList items={items} columns={2} />
      </div>

      {user.storeAssignments?.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Store Assignments</h3>
          <div className="space-y-2">
            {user.storeAssignments.map((sa) => (
              <div key={sa.storeId} className="flex items-center justify-between py-1.5 border-b border-slate-50">
                <span className="text-sm font-medium">{sa.storeName}</span>
                <span className="text-xs text-slate-500">Assigned {formatDateTime(sa.assignedAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
