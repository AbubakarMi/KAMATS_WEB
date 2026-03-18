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

import { useCreateSTOMutation } from '@/lib/features/transfers/stoApi';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { createSTOSchema } from '@/lib/schemas';

type FormValues = {
  sourceStoreId: string;
  destinationStoreId: string;
  requestedBags: number;
  requestedDelivery: string;
  justification: string;
  notes?: string;
};

export default function CreateSTOPage() {
  const router = useRouter();
  const { data: stores } = useGetStoresQuery();
  const [createSTO, { isLoading: creating }] = useCreateSTOMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({ resolver: zodResolver(createSTOSchema) as any, mode: 'onBlur' });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      await createSTO({
        sourceStoreId: sanitized.sourceStoreId as string,
        destinationStoreId: sanitized.destinationStoreId as string,
        requestedBags: sanitized.requestedBags as number,
        requestedDelivery: sanitized.requestedDelivery as string,
        justification: sanitized.justification as string,
        notes: (sanitized.notes as string) || undefined,
      }).unwrap();
      toast.success('Stock Transfer created');
      router.push('/transfers');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/transfers')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create Stock Transfer Order
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Source Store</Label>
              <Controller control={form.control} name="sourceStoreId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                  <SelectContent>
                    {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.sourceStoreId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.sourceStoreId.message}</p>
              )}
            </div>
            <div>
              <Label>Destination Store</Label>
              <Controller control={form.control} name="destinationStoreId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>
                    {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.destinationStoreId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.destinationStoreId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Requested Bags</Label>
              <Input type="number" min={1} {...form.register('requestedBags', { valueAsNumber: true })} />
              {form.formState.errors.requestedBags && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.requestedBags.message}</p>
              )}
            </div>
            <div>
              <Label>Requested Delivery Date</Label>
              <Input type="date" {...form.register('requestedDelivery')} />
              {form.formState.errors.requestedDelivery && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.requestedDelivery.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Justification</Label>
            <Textarea rows={3} {...form.register('justification')} />
            {form.formState.errors.justification && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.justification.message}</p>
            )}
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea rows={2} {...form.register('notes')} />
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/transfers')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create STO'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Stock Transfer?"
        description="Are you sure you want to create this stock transfer order?"
        confirmLabel="Create STO"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
