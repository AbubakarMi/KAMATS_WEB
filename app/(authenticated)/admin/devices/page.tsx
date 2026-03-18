'use client';

import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';

import { DataTable } from '@/components/tables/DataTable';
import {
  useGetDevicesQuery, useDeregisterDeviceMutation,
} from '@/lib/features/admin/adminApi';
import { formatDateTime } from '@/lib/utils/formatters';
import type { Device } from '@/lib/api/types/admin';

export default function DevicesPage() {
  const { data: devices, isLoading, refetch } = useGetDevicesQuery();
  const [deregisterDevice] = useDeregisterDeviceMutation();

  const handleDeregister = async (id: string) => {
    try {
      await deregisterDevice(id).unwrap();
      toast.success('Device deregistered');
    } catch {
      toast.error('Failed to deregister device');
    }
  };

  const columns: ColumnDef<Device, unknown>[] = [
    { accessorKey: 'deviceName', header: 'Device Name' },
    { accessorKey: 'deviceType', header: 'Type' },
    { accessorKey: 'serialNumber', header: 'Serial Number' },
    {
      accessorKey: 'assignedStoreName',
      header: 'Store',
      cell: ({ getValue }) => (getValue() as string | null) || '—',
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ getValue }) => {
        const active = getValue() as boolean;
        return active
          ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">Active</span>
          : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">Inactive</span>;
      },
    },
    {
      accessorKey: 'registeredAt',
      header: 'Registered',
      cell: ({ getValue }) => formatDateTime(getValue() as string),
    },
    {
      id: 'actions',
      size: 60,
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDeregister(row.original.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">Device Management</h1>
        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Link href="/admin/devices/create">
            <Plus className="h-4 w-4 mr-1.5" />Register Device
          </Link>
        </Button>
      </div>

      <DataTable<Device>
        columns={columns}
        data={devices ?? []}
        rowKey="id"
        loading={isLoading}
        onRefresh={refetch}
        showSearch={false}
        showExport={false}
      />
    </div>
  );
}
