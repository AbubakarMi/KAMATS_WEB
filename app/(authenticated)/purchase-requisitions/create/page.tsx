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

import { useCreatePRMutation } from '@/lib/features/procurement/prApi';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { createPRSchema } from '@/lib/schemas';
import type { CreatePRRequest } from '@/lib/api/types/procurement';

type FormValues = {
  storeId: string;
  quantityBags: number;
  justification: string;
  requestedDeliveryDate: string;
};

export default function CreatePRPage() {
  const router = useRouter();
  const { data: stores } = useGetStoresQuery();
  const [createPR, { isLoading: creating }] = useCreatePRMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({ resolver: zodResolver(createPRSchema) as any, mode: 'onBlur' });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const req: CreatePRRequest = {
        storeId: sanitized.storeId as string,
        requestedQuantity: sanitized.quantityBags as number,
        requestedWeightKg: String((sanitized.quantityBags as number) * 50),
        justification: sanitized.justification as string,
        requestedDeliveryDate: sanitized.requestedDeliveryDate as string,
      };
      await createPR(req).unwrap();
      toast.success('Purchase Requisition created');
      router.push('/purchase-requisitions');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/purchase-requisitions')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create Purchase Requisition
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Destination Store</Label>
              <Controller
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                    <SelectContent>
                      {(stores ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.storeId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.storeId.message}</p>
              )}
            </div>
            <div>
              <Label>Quantity (bags)</Label>
              <Input type="number" min={1} {...form.register('quantityBags', { valueAsNumber: true })} />
              {form.formState.errors.quantityBags && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.quantityBags.message}</p>
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
            <Label>Requested Delivery Date</Label>
            <Input type="date" {...form.register('requestedDeliveryDate')} />
            {form.formState.errors.requestedDeliveryDate && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.requestedDeliveryDate.message}</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/purchase-requisitions')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create PR'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Purchase Requisition?"
        description="Are you sure you want to submit this purchase requisition?"
        confirmLabel="Create PR"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
