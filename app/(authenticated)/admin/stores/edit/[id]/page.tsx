'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { StatusBadge } from '@/components/data-display/StatusBadge';

import {
  useGetStoresQuery,
  useUpdateStoreMutation,
} from '@/lib/features/admin/adminApi';
import { updateStoreSchema } from '@/lib/schemas/admin';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import type { UpdateStoreRequest } from '@/lib/api/types/admin';

type FormValues = {
  name: string;
  address: string;
  gpsLatitude: string;
  gpsLongitude: string;
  isActive: boolean;
};

export default function EditStorePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { data: stores, isLoading } = useGetStoresQuery();
  const [updateStore, { isLoading: updating }] = useUpdateStoreMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const store = stores?.find((s) => s.id === id);

  const form = useForm<FormValues>({
    resolver: zodResolver(updateStoreSchema),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (store) {
      form.reset({
        name: store.name,
        address: store.address ?? '',
        gpsLatitude: store.gpsLatitude ?? '',
        gpsLongitude: store.gpsLongitude ?? '',
        isActive: store.isActive,
      });
    }
  }, [store, form]);

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      await updateStore({ id, data: sanitized as unknown as UpdateStoreRequest }).unwrap();
      toast.success('Store updated');
      router.push('/admin/stores');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  if (isLoading) return <DetailPageSkeleton descriptionRows={4} />;

  if (!store) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Button variant="outline" size="sm" onClick={() => router.push('/admin/stores')}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
            Store Not Found
          </h1>
        </div>
        <p className="text-sm text-slate-500">The store could not be found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/stores')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Edit Store
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <Label className="text-slate-500">Store Code</Label>
            <p className="text-sm font-medium mt-1">{store.code}</p>
          </div>
          <div>
            <Label className="text-slate-500">Tier</Label>
            <div className="mt-1"><StatusBadge status={store.tier} /></div>
          </div>
          <div>
            <Label className="text-slate-500">Parent Store</Label>
            <p className="text-sm font-medium mt-1">{store.parentStoreName ?? '—'}</p>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Store Name</Label>
              <Input {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label>Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    {...form.register('isActive')}
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-700">
                    Active
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Textarea rows={2} {...form.register('address')} />
            {form.formState.errors.address && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>GPS Latitude</Label>
              <Input placeholder="e.g. 6.5244" {...form.register('gpsLatitude')} />
              {form.formState.errors.gpsLatitude && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.gpsLatitude.message}</p>
              )}
            </div>
            <div>
              <Label>GPS Longitude</Label>
              <Input placeholder="e.g. 3.3792" {...form.register('gpsLongitude')} />
              {form.formState.errors.gpsLongitude && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.gpsLongitude.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/admin/stores')}>
              Cancel
            </Button>
            <Button type="submit" disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {updating ? 'Saving...' : 'Update Store'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update Store?"
        description={`Are you sure you want to update "${store.name}"?`}
        confirmLabel="Update Store"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
