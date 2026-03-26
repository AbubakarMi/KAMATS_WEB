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

import { useCreateStockCountMutation } from '@/lib/features/stockCount/stockCountApi';
import { useGetAllStoresQuery } from '@/lib/features/stores/storesApi';
import { useGetAllUsersQuery } from '@/lib/features/users/usersApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { createStockCountSchema } from '@/lib/schemas';
import { CountType } from '@/lib/api/types/enums';

const typeOptions = Object.values(CountType).map((t) => ({
  value: t, label: t.replace(/([A-Z])/g, ' $1').trim(),
}));

type FormValues = {
  countType: string;
  storeId: string;
  assignedTo: string;
  scheduledDate: string;
};

export default function CreateStockCountPage() {
  const router = useRouter();
  const { data: stores } = useGetAllStoresQuery();
  const { data: users } = useGetAllUsersQuery({ isActive: true });
  const [createCount, { isLoading: creating }] = useCreateStockCountMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(createStockCountSchema) as any,
    mode: 'onBlur',
    defaultValues: { countType: '', storeId: '', assignedTo: '', scheduledDate: '' },
  });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      await createCount({
        countType: sanitized.countType as CountType,
        storeId: sanitized.storeId as string,
        locationIds: [],
        assignedTo: sanitized.assignedTo as string,
        scheduledDate: sanitized.scheduledDate as string,
      }).unwrap();
      toast.success('Stock count created');
      router.push('/stock-counts');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/stock-counts')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create Stock Count
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Count Type</Label>
              <Controller
                control={form.control}
                name="countType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.countType && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.countType.message}</p>
              )}
            </div>
            <div>
              <Label>Store</Label>
              <Controller
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                    <SelectContent>
                      {(stores ?? []).map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.storeId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.storeId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Assigned To</Label>
              <Controller
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Select user" /></SelectTrigger>
                    <SelectContent>
                      {(users ?? []).map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.firstName} {u.lastName} — {u.roles.map((r) => r.name).join(', ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.assignedTo && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.assignedTo.message}</p>
              )}
            </div>
            <div>
              <Label>Scheduled Date</Label>
              <Input type="date" {...form.register('scheduledDate')} />
              {form.formState.errors.scheduledDate && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.scheduledDate.message}</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/stock-counts')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create Count'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Stock Count?"
        description="Are you sure you want to create this stock count?"
        confirmLabel="Create Count"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
