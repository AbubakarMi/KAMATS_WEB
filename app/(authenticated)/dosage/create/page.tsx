'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateDosageConfigMutation } from '@/lib/features/dosage/dosageApi';
import { useGetAllStoresQuery } from '@/lib/features/stores/storesApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import type { CreateDosageConfigRequest } from '@/lib/api/types/consumption';

type FormValues = CreateDosageConfigRequest;

export default function CreateDosageConfigPage() {
  const router = useRouter();
  const { data: stores } = useGetAllStoresQuery();
  const [createConfig, { isLoading: creating }] = useCreateDosageConfigMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const userStores = stores?.filter((s) => s.tier === 'UserStore') ?? [];

  const form = useForm<FormValues>({ mode: 'onBlur' });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>) as unknown as FormValues;
      await createConfig(sanitized).unwrap();
      toast.success('Configuration created');
      router.push('/dosage');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/dosage')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          New Dosage Configuration
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Store</Label>
            <Controller control={form.control} name="storeId" rules={{ required: 'Select a store' }} render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select treatment plant" /></SelectTrigger>
                <SelectContent>
                  {userStores.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )} />
            {form.formState.errors.storeId && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.storeId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Standard Rate (kg/m³)</Label>
              <Input placeholder="e.g. 0.012" {...form.register('standardRateKgM3')} />
            </div>
            <div>
              <Label>Acceptable Variance (%)</Label>
              <Input placeholder="e.g. 15" {...form.register('acceptableVariancePct')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Normal Low (%)</Label>
              <Input placeholder="e.g. -10" {...form.register('normalLowPct')} />
            </div>
            <div>
              <Label>Normal High (%)</Label>
              <Input placeholder="e.g. 10" {...form.register('normalHighPct')} />
            </div>
          </div>

          <div>
            <Label>Elevated High (%)</Label>
            <Input placeholder="e.g. 30" {...form.register('elevatedHighPct')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Dry Season Multiplier</Label>
              <Input placeholder="e.g. 1.2" {...form.register('drySeasonMultiplier')} />
            </div>
            <div>
              <Label>Wet Season Multiplier</Label>
              <Input placeholder="e.g. 0.9" {...form.register('wetSeasonMultiplier')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Dry Season Start (MM-DD)</Label>
              <Input placeholder="e.g. 11-01" {...form.register('drySeasonStart')} />
            </div>
            <div>
              <Label>Dry Season End (MM-DD)</Label>
              <Input placeholder="e.g. 04-30" {...form.register('drySeasonEnd')} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Wet Season Start (MM-DD)</Label>
              <Input placeholder="e.g. 05-01" {...form.register('wetSeasonStart')} />
            </div>
            <div>
              <Label>Wet Season End (MM-DD)</Label>
              <Input placeholder="e.g. 10-31" {...form.register('wetSeasonEnd')} />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/dosage')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create Configuration'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Configuration?"
        description="Are you sure you want to create this dosage configuration?"
        confirmLabel="Create Configuration"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
