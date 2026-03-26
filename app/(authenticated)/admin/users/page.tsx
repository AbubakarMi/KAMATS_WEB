'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Ban, Unlock, Pencil, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { DataTable } from '@/components/tables/DataTable';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { usePagination } from '@/lib/hooks';
import {
  useGetUsersQuery,
  useDeactivateUserMutation,
  useUnlockUserMutation,
  useUpdateUserMutation,
} from '@/lib/features/admin/adminApi';
import { formatDateTime } from '@/lib/utils/formatters';
import type { User } from '@/lib/api/types/admin';

type PendingAction = { type: 'deactivate' | 'reactivate'; userId: string; username: string };

export default function UsersPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const { data, isLoading, isError, error: queryError, refetch } = useGetUsersQuery(params);
  const [deactivateUser] = useDeactivateUserMutation();
  const [unlockUser] = useUnlockUserMutation();
  const [updateUser] = useUpdateUserMutation();

  const handleConfirm = useCallback(async () => {
    if (!pendingAction) return;
    try {
      if (pendingAction.type === 'deactivate') {
        await deactivateUser(pendingAction.userId).unwrap();
        toast.success('User deactivated');
      } else {
        await updateUser({ id: pendingAction.userId, data: { isActive: true } }).unwrap();
        toast.success('User reactivated');
      }
    } catch {
      toast.error(`Failed to ${pendingAction.type} user`);
      throw new Error();
    }
  }, [pendingAction, deactivateUser, updateUser]);

  const handleUnlock = useCallback(async (id: string) => {
    try {
      await unlockUser(id).unwrap();
      toast.success('User unlocked');
    } catch {
      toast.error('Failed to unlock user');
    }
  }, [unlockUser]);

  const columns: ColumnDef<User, unknown>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
      enableSorting: true,
      cell: ({ row }) => (
        <Link href={`/admin/users/${row.original.id}`} className="text-blue-600 hover:underline">
          {row.original.username}
        </Link>
      ),
    },
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => `${row.original.firstName} ${row.original.lastName}`,
    },
    { accessorKey: 'email', header: 'Email', enableSorting: true },
    {
      accessorKey: 'storeName',
      header: 'Store',
      cell: ({ getValue }) => (getValue() as string | null) || '—',
    },
    {
      id: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.roles.map((r) => (
            <span key={r.id} className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{r.name}</span>
          ))}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        if (!row.original.isActive) return <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>;
        if (row.original.lockoutEnd) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Locked</span>;
        return <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>;
      },
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'Last Login',
      enableSorting: true,
      cell: ({ getValue }) => formatDateTime(getValue() as string | null),
    },
    {
      id: 'actions',
      size: 120,
      cell: ({ row }) => (
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/users/edit/${row.original.id}`}>
              <Pencil className="h-3.5 w-3.5" />
            </Link>
          </Button>
          {row.original.isActive ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600"
              onClick={() => setPendingAction({ type: 'deactivate', userId: row.original.id, username: row.original.username })}
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-emerald-600"
              onClick={() => setPendingAction({ type: 'reactivate', userId: row.original.id, username: row.original.username })}
            >
              <UserCheck className="h-3.5 w-3.5" />
            </Button>
          )}
          {row.original.lockoutEnd && (
            <Button variant="ghost" size="sm" onClick={() => handleUnlock(row.original.id)}>
              <Unlock className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">User Management</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/admin/users/create">
            <Plus className="h-4 w-4 mr-1.5" />Create User
          </Link>
        </Button>
      </div>

      {isError && <QueryErrorAlert error={queryError} />}

      <DataTable<User>
        columns={columns}
        data={data?.data ?? []}
        rowKey="id"
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
        onSortChange={setSort}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
      />

      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => { if (!open) setPendingAction(null); }}
        title={pendingAction?.type === 'deactivate' ? 'Deactivate User?' : 'Reactivate User?'}
        description={
          pendingAction?.type === 'deactivate'
            ? `Are you sure you want to deactivate "${pendingAction.username}"? They will be logged out and unable to sign in.`
            : `Are you sure you want to reactivate "${pendingAction?.username}"? They will be able to sign in again.`
        }
        confirmLabel={pendingAction?.type === 'deactivate' ? 'Deactivate' : 'Reactivate'}
        variant={pendingAction?.type === 'deactivate' ? 'destructive' : 'default'}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
