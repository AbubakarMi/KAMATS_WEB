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

import { useRegisterDeviceMutation, useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';

type FormValues = {
  deviceName: string;
  deviceType: string;
  serialNumber: string;
  assignedStoreId?: string;
};

const deviceTypeOptions = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'scanner', label: 'Scanner' },
];

export default function RegisterDevicePage() {
  const router = useRouter();
  const { data: stores } = useGetStoresQuery();
  const [registerDevice, { isLoading: registering }] = useRegisterDeviceMutation();
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
      await registerDevice(sanitized as unknown as FormValues).unwrap();
      toast.success('Device registered');
      router.push('/admin/devices');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/devices')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Register Device
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Device Name</Label>
              <Input {...form.register('deviceName', { required: true })} />
              {form.formState.errors.deviceName && (
                <p className="text-xs text-red-500 mt-1">Device name is required</p>
              )}
            </div>
            <div>
              <Label>Device Type</Label>
              <Controller control={form.control} name="deviceType" rules={{ required: true }} render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {deviceTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
              {form.formState.errors.deviceType && (
                <p className="text-xs text-red-500 mt-1">Device type is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Serial Number</Label>
              <Input {...form.register('serialNumber', { required: true })} />
              {form.formState.errors.serialNumber && (
                <p className="text-xs text-red-500 mt-1">Serial number is required</p>
              )}
            </div>
            <div>
              <Label>Assigned Store</Label>
              <Controller control={form.control} name="assignedStoreId" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue placeholder="Select store (optional)" /></SelectTrigger>
                  <SelectContent>
                    {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              )} />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/admin/devices')}>
              Cancel
            </Button>
            <Button type="submit" disabled={registering} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {registering ? 'Registering...' : 'Register Device'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Register Device?"
        description="Are you sure you want to register this device?"
        confirmLabel="Register Device"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
