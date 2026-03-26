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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateConsumptionMutation } from '@/lib/features/consumption/consumptionApi';
import { useGetAllStoresQuery } from '@/lib/features/stores/storesApi';
import { createConsumptionSchema } from '@/lib/schemas/consumption';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { formatNumber } from '@/lib/utils/formatters';
import type { CreateConsumptionRequest } from '@/lib/api/types/consumption';

type FormValues = {
  storeId: string;
  treatmentSessionRef: string;
  volumeTreatedM3: string;
};

export default function CreateConsumptionPage() {
  const router = useRouter();
  const { data: stores } = useGetAllStoresQuery();
  const [createConsumption, { isLoading: creating }] = useCreateConsumptionMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // Only user stores (treatment plants) do consumption
  const userStores = stores?.filter((s) => s.tier === 'UserStore') ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(createConsumptionSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      storeId: '',
      treatmentSessionRef: '',
      volumeTreatedM3: '',
    },
  });

  const volumeValue = form.watch('volumeTreatedM3');
  const suggestedKg = volumeValue ? (Number(volumeValue) * 0.012).toFixed(2) : null;
  const suggestedBags = suggestedKg ? Math.ceil(Number(suggestedKg) / 50) : null;

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const req: CreateConsumptionRequest = {
        storeId: sanitized.storeId as string,
        treatmentSessionRef: sanitized.treatmentSessionRef as string,
        volumeTreatedM3: sanitized.volumeTreatedM3 as string,
      };
      const result = await createConsumption(req).unwrap();
      toast.success('Consumption entry created');
      router.push(`/consumption/${result.id}`);
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/consumption')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Record Consumption
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Treatment Plant (Store)</Label>
              <Controller control={form.control} name="storeId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                  <SelectContent>
                    {userStores.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.storeId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.storeId.message}</p>
              )}
            </div>
            <div>
              <Label>Treatment Session Reference</Label>
              <Input
                placeholder="e.g. TS-CWTP-2026-0301"
                {...form.register('treatmentSessionRef')}
              />
              {form.formState.errors.treatmentSessionRef && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.treatmentSessionRef.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Volume Treated (m³)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 5000"
                {...form.register('volumeTreatedM3')}
              />
              {form.formState.errors.volumeTreatedM3 && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.volumeTreatedM3.message}</p>
              )}
            </div>

            {/* Dosage estimate */}
            {suggestedKg && (
              <div className="flex items-end">
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 w-full">
                  <p className="text-xs text-blue-600 font-medium mb-1">Estimated Dosage (at 0.012 kg/m³)</p>
                  <p className="text-sm font-semibold text-blue-800">
                    {formatNumber(Number(suggestedKg))} kg — approx. {suggestedBags} bag{suggestedBags !== 1 ? 's' : ''} (50 kg)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
            After creating this entry, you can add consumed items (bags) from the detail page using manual item ID entry.
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/consumption')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Record Consumption?"
        description="Are you sure you want to create this consumption entry? You can add consumed items afterward."
        confirmLabel="Create Entry"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
