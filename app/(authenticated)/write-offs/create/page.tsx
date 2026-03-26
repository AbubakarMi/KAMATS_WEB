'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateWriteOffMutation } from '@/lib/features/loss/lossApi';
import { useGetAllStoresQuery } from '@/lib/features/stores/storesApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { createWriteOffSchema } from '@/lib/schemas';
import { WriteOffCategory } from '@/lib/api/types/enums';
import type { WriteOff } from '@/lib/api/types/loss';

const categoryOptions = Object.values(WriteOffCategory).map((c) => ({
  value: c, label: c.replace(/([A-Z])/g, ' $1').trim(),
}));

type FormValues = {
  storeId: string;
  category: string;
  bags: number;
  lotId?: string;
  description: string;
};

export default function CreateWriteOffPage() {
  const router = useRouter();
  const { data: stores } = useGetAllStoresQuery();
  const [createWriteOff, { isLoading: creating }] = useCreateWriteOffMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(createWriteOffSchema) as any,
    mode: 'onBlur',
    defaultValues: { storeId: '', category: '', bags: '' as unknown as number, lotId: '', description: '' },
  });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      await createWriteOff({
        storeId: sanitized.storeId as string,
        category: sanitized.category as WriteOff['category'],
        bagsCount: sanitized.bags as number,
        weightKg: String((sanitized.bags as number) * 50),
        description: sanitized.description as string,
        itemIds: [],
        lotId: (sanitized.lotId as string) || '',
      }).unwrap();
      toast.success('Write-off submitted');
      router.push('/write-offs');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/write-offs')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create Write-Off Request
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Store</Label>
              <Controller control={form.control} name="storeId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                  <SelectContent>
                    {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.storeId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.storeId.message}</p>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <Controller control={form.control} name="category" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.category && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Number of Bags</Label>
              <Input type="number" min={1} {...form.register('bags')} />
              {form.formState.errors.bags && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.bags.message}</p>
              )}
            </div>
            <div>
              <Label>Lot ID (optional)</Label>
              <Input placeholder="Lot ID" {...form.register('lotId')} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea rows={3} placeholder="Describe the reason for write-off..." {...form.register('description')} />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/write-offs')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create Write-Off'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Write-Off?"
        description="Are you sure you want to submit this write-off request?"
        confirmLabel="Create Write-Off"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
