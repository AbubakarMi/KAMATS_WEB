'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateStoreMutation, useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { StoreTier } from '@/lib/api/types/enums';
import type { CreateStoreRequest } from '@/lib/api/types/admin';

type FormValues = {
  code: string;
  name: string;
  tier: string;
  parentStoreId?: string;
  address?: string;
};

export default function CreateStorePage() {
  const router = useRouter();
  const { data: stores } = useGetStoresQuery();
  const [createStore, { isLoading: creating }] = useCreateStoreMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({ mode: 'onBlur' });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      await createStore(sanitized as unknown as CreateStoreRequest).unwrap();
      toast.success('Store created');
      router.push('/admin/stores');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/stores')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Add Store
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Store Code</Label>
              <Input placeholder="e.g. CS-MAIN, US-CWTP" {...form.register('code', { required: true })} />
              {form.formState.errors.code && (
                <p className="text-xs text-red-500 mt-1">Store code is required</p>
              )}
            </div>
            <div>
              <Label>Store Name</Label>
              <Input {...form.register('name', { required: true })} />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500 mt-1">Store name is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tier</Label>
              <Controller control={form.control} name="tier" rules={{ required: true }} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                  <SelectContent>
                    {Object.values(StoreTier).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.tier && (
                <p className="text-xs text-red-500 mt-1">Tier is required</p>
              )}
            </div>
            <div>
              <Label>Parent Store</Label>
              <Controller control={form.control} name="parentStoreId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select parent (optional)" /></SelectTrigger>
                  <SelectContent>
                    {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Textarea rows={2} {...form.register('address')} />
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/admin/stores')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create Store'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Add Store?"
        description="Are you sure you want to create this store?"
        confirmLabel="Create Store"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
