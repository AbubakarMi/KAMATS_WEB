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

import { useCreateDispatchMutation } from '@/lib/features/dispatch/dispatchApi';
import { useGetSTOsQuery } from '@/lib/features/transfers/stoApi';
import { createDispatchSchema } from '@/lib/schemas/distribution';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { formatNumber } from '@/lib/utils/formatters';
import type { CreateDispatchRequest } from '@/lib/api/types/distribution';

type FormValues = {
  stoId: string;
  vehicleReg: string;
  driverName: string;
  driverPhone: string;
};

export default function CreateDispatchPage() {
  const router = useRouter();
  const { data: stoData } = useGetSTOsQuery({ pageSize: 100 });
  const [createDispatch, { isLoading: creating }] = useCreateDispatchMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(createDispatchSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      stoId: '',
      vehicleReg: '',
      driverName: '',
      driverPhone: '',
    },
  });

  // Only show Authorised STOs that don't already have a TDN
  const availableSTOs = (stoData?.data ?? []).filter(
    (sto) => sto.status === 'Authorised' && !sto.tdnId,
  );

  const stoIdValue = form.watch('stoId');
  const selectedSTO = availableSTOs.find((s) => s.id === stoIdValue);

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const req: CreateDispatchRequest = {
        stoId: sanitized.stoId as string,
        vehicleReg: sanitized.vehicleReg as string,
        driverName: sanitized.driverName as string,
        driverPhone: sanitized.driverPhone as string,
      };
      const result = await createDispatch(req).unwrap();
      toast.success('Dispatch session created');
      router.push(`/dispatch/${result.id}`);
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/dispatch')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Initiate Dispatch
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* STO Selection */}
          <div>
            <Label>Stock Transfer Order</Label>
            <Controller control={form.control} name="stoId" render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger><SelectValue placeholder="Select an authorised STO" /></SelectTrigger>
                <SelectContent>
                  {availableSTOs.length === 0 && (
                    <SelectItem value="__none" disabled>No authorised STOs available</SelectItem>
                  )}
                  {availableSTOs.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.stoNumber} — {s.sourceStoreName} → {s.destinationStoreName} ({formatNumber(s.authorisedBags ?? s.requestedBags)} bags)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )} />
            {form.formState.errors.stoId && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.stoId.message}</p>
            )}
          </div>

          {/* STO Details hint */}
          {selectedSTO && (
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Transfer Details</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-blue-800">
                <div><span className="font-medium">From:</span> {selectedSTO.sourceStoreName}</div>
                <div><span className="font-medium">To:</span> {selectedSTO.destinationStoreName}</div>
                <div><span className="font-medium">Bags:</span> {formatNumber(selectedSTO.authorisedBags ?? selectedSTO.requestedBags)}</div>
                <div><span className="font-medium">Delivery:</span> {selectedSTO.requestedDelivery}</div>
              </div>
            </div>
          )}

          {/* Vehicle & Driver */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Vehicle Registration</Label>
              <Input
                placeholder="e.g. KN-123-ABC"
                {...form.register('vehicleReg')}
              />
              {form.formState.errors.vehicleReg && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.vehicleReg.message}</p>
              )}
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input
                placeholder="e.g. Mohammed Bello"
                {...form.register('driverName')}
              />
              {form.formState.errors.driverName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.driverName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Driver Phone</Label>
              <Input
                placeholder="e.g. +234-800-111-2222"
                {...form.register('driverPhone')}
              />
              {form.formState.errors.driverPhone && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.driverPhone.message}</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
            After creating the dispatch session, you can scan items (via item ID), record dispatched weight, and complete the dispatch from the detail page.
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/dispatch')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating || availableSTOs.length === 0} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Initiate Dispatch'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Initiate Dispatch?"
        description={`This will create a dispatch session for ${selectedSTO?.stoNumber ?? 'the selected STO'}. The session will be in 'Scanning' status, ready for items to be scanned.`}
        confirmLabel="Initiate Dispatch"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
