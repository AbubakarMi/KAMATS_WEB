'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateSupplierMutation } from '@/lib/features/suppliers/suppliersApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { createSupplierSchema } from '@/lib/schemas';
import type { CreateSupplierRequest } from '@/lib/api/types/suppliers';

type FormValues = {
  companyName: string;
  registrationNumber: string;
  address: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  taxId: string;
};

export default function CreateSupplierPage() {
  const router = useRouter();
  const [createSupplier, { isLoading: creating }] = useCreateSupplierMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(createSupplierSchema),
    mode: 'onBlur',
  });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>) as unknown as CreateSupplierRequest;
      await createSupplier(sanitized).unwrap();
      toast.success('Supplier created — pending approval');
      router.push('/suppliers');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/suppliers')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create Supplier
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Company Name</Label>
              <Input {...form.register('companyName')} />
              {form.formState.errors.companyName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.companyName.message}</p>
              )}
            </div>
            <div>
              <Label>Registration Number</Label>
              <Input {...form.register('registrationNumber')} />
              {form.formState.errors.registrationNumber && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.registrationNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Contact Person</Label>
              <Input {...form.register('contactPerson')} />
              {form.formState.errors.contactPerson && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.contactPerson.message}</p>
              )}
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input {...form.register('contactPhone')} />
              {form.formState.errors.contactPhone && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.contactPhone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Contact Email</Label>
            <Input {...form.register('contactEmail')} />
            {form.formState.errors.contactEmail && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.contactEmail.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Bank Name</Label>
              <Input {...form.register('bankName')} />
              {form.formState.errors.bankName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.bankName.message}</p>
              )}
            </div>
            <div>
              <Label>Account Number</Label>
              <Input {...form.register('bankAccountNumber')} />
              {form.formState.errors.bankAccountNumber && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.bankAccountNumber.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Account Name</Label>
              <Input {...form.register('bankAccountName')} />
              {form.formState.errors.bankAccountName && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.bankAccountName.message}</p>
              )}
            </div>
            <div>
              <Label>Tax ID</Label>
              <Input {...form.register('taxId')} />
              {form.formState.errors.taxId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.taxId.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <Textarea rows={2} {...form.register('address')} />
            {form.formState.errors.address && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/suppliers')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Create Supplier'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Supplier?"
        description="Are you sure you want to create this supplier? The record will be submitted for approval."
        confirmLabel="Create Supplier"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
