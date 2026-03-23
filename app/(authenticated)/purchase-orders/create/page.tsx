'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
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

import { useGetPRsQuery, useGetPRQuery } from '@/lib/features/procurement/prApi';
import { useCreatePOMutation } from '@/lib/features/procurement/poApi';
import { useGetSuppliersQuery } from '@/lib/features/suppliers/suppliersApi';
import { useGetStoresQuery } from '@/lib/features/admin/adminApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { formatMoney, formatNumber } from '@/lib/utils/formatters';
import { createPOSchema } from '@/lib/schemas';
import type { CreatePORequest } from '@/lib/api/types/procurement';

type FormValues = {
  prId: string;
  supplierId: string;
  destinationStoreId: string;
  expectedDeliveryDate: string;
  currency: string;
  notes?: string;
  lines: {
    productSpecification: string;
    quantityBags: number;
    standardWeightKg: number;
    unitPrice: number;
  }[];
};

function CreatePOForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prIdFromUrl = searchParams.get('prId');

  const { data: prsData } = useGetPRsQuery({ status: 'Approved', page: 1, pageSize: 200 });
  const { data: selectedPR } = useGetPRQuery(prIdFromUrl!, { skip: !prIdFromUrl });
  const { data: suppliersData } = useGetSuppliersQuery({ page: 1, pageSize: 200 });
  const { data: stores } = useGetStoresQuery();
  const [createPO, { isLoading: creating }] = useCreatePOMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  const approvedPRs = (prsData?.data ?? []).filter((pr) => !pr.linkedPoId);
  const activeSuppliers = (suppliersData?.data ?? []).filter((s) => s.status === 'Active');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(createPOSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      prId: '',
      supplierId: '',
      destinationStoreId: '',
      expectedDeliveryDate: '',
      currency: 'NGN',
      notes: '',
      lines: [
        {
          productSpecification: 'Aluminium Sulphate — Grade A, 50kg bags',
          quantityBags: 0,
          standardWeightKg: 50,
          unitPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  // Auto-fill from PR when arriving via "Convert to PO"
  useEffect(() => {
    if (selectedPR && prIdFromUrl) {
      form.setValue('prId', selectedPR.id);
      form.setValue('destinationStoreId', selectedPR.storeId);
      form.setValue('expectedDeliveryDate', selectedPR.requestedDeliveryDate);
      form.setValue('lines.0.quantityBags', selectedPR.requestedQuantity);
    }
  }, [selectedPR, prIdFromUrl, form]);

  const handlePRChange = (prId: string) => {
    form.setValue('prId', prId);
    const pr = approvedPRs.find((p) => p.id === prId);
    if (pr) {
      form.setValue('destinationStoreId', pr.storeId);
      form.setValue('expectedDeliveryDate', pr.requestedDeliveryDate);
      form.setValue('lines.0.quantityBags', pr.requestedQuantity);
    }
  };

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const lines = (sanitized.lines as FormValues['lines']).map((line, idx) => ({
        lineNumber: idx + 1,
        productSpecification: line.productSpecification,
        quantityBags: line.quantityBags,
        standardWeightKg: String(line.standardWeightKg),
        unitPrice: String(line.unitPrice),
      }));
      const req: CreatePORequest = {
        prId: sanitized.prId as string,
        supplierId: sanitized.supplierId as string,
        destinationStoreId: sanitized.destinationStoreId as string,
        expectedDeliveryDate: sanitized.expectedDeliveryDate as string,
        currency: (sanitized.currency as string) || 'NGN',
        notes: sanitized.notes as string | undefined,
        lines,
      };
      await createPO(req).unwrap();
      toast.success('Purchase Order created');
      router.push('/purchase-orders');
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
    }
  };

  const watchedLines = form.watch('lines');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/purchase-orders')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Create Purchase Order
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Purchase Requisition */}
            <div>
              <Label>Purchase Requisition</Label>
              <Controller
                control={form.control}
                name="prId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={prIdFromUrl ? undefined : handlePRChange}
                    disabled={!!prIdFromUrl}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select approved PR" />
                    </SelectTrigger>
                    <SelectContent>
                      {approvedPRs.map((pr) => (
                        <SelectItem key={pr.id} value={pr.id}>
                          {pr.prNumber} — {pr.storeName} ({formatNumber(pr.requestedQuantity)} bags)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.prId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.prId.message}</p>
              )}
            </div>

            {/* Supplier */}
            <div>
              <Label>Supplier</Label>
              <Controller
                control={form.control}
                name="supplierId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeSuppliers.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.supplierId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.supplierId.message}</p>
              )}
            </div>

            {/* Destination Store */}
            <div>
              <Label>Destination Store</Label>
              <Controller
                control={form.control}
                name="destinationStoreId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select store" />
                    </SelectTrigger>
                    <SelectContent>
                      {(stores ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.destinationStoreId && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.destinationStoreId.message}</p>
              )}
            </div>

            {/* Expected Delivery Date */}
            <div>
              <Label>Expected Delivery Date</Label>
              <Input type="date" {...form.register('expectedDeliveryDate')} />
              {form.formState.errors.expectedDeliveryDate && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.expectedDeliveryDate.message}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <Label>Currency</Label>
              <Input {...form.register('currency')} />
              {form.formState.errors.currency && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.currency.message}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea rows={3} {...form.register('notes')} />
            {form.formState.errors.notes && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.notes.message}</p>
            )}
          </div>

          {/* PO Lines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">PO Lines</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    productSpecification: 'Aluminium Sulphate — Grade A, 50kg bags',
                    quantityBags: 0,
                    standardWeightKg: 50,
                    unitPrice: 0,
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />Add Line
              </Button>
            </div>

            {form.formState.errors.lines?.root && (
              <p className="text-xs text-red-500">{form.formState.errors.lines.root.message}</p>
            )}

            {fields.map((field, index) => {
              const qty = watchedLines?.[index]?.quantityBags ?? 0;
              const price = watchedLines?.[index]?.unitPrice ?? 0;
              const lineTotal = qty * price;

              return (
                <div
                  key={field.id}
                  className="rounded-lg border border-slate-200 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Line {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />Remove
                      </Button>
                    )}
                  </div>

                  <div>
                    <Label>Product Specification</Label>
                    <Input {...form.register(`lines.${index}.productSpecification`)} />
                    {form.formState.errors.lines?.[index]?.productSpecification && (
                      <p className="text-xs text-red-500 mt-1">
                        {form.formState.errors.lines[index].productSpecification.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Quantity (bags)</Label>
                      <Input
                        type="number"
                        min={1}
                        {...form.register(`lines.${index}.quantityBags`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.lines?.[index]?.quantityBags && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.lines[index].quantityBags.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Standard Weight (kg)</Label>
                      <Input
                        type="number"
                        min={1}
                        {...form.register(`lines.${index}.standardWeightKg`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.lines?.[index]?.standardWeightKg && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.lines[index].standardWeightKg.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Unit Price</Label>
                      <Input
                        type="number"
                        min={0.01}
                        step="0.01"
                        {...form.register(`lines.${index}.unitPrice`, { valueAsNumber: true })}
                      />
                      {form.formState.errors.lines?.[index]?.unitPrice && (
                        <p className="text-xs text-red-500 mt-1">
                          {form.formState.errors.lines[index].unitPrice.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right text-sm text-slate-600">
                    Line Total: <span className="font-medium">{formatMoney(String(lineTotal))}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => router.push('/purchase-orders')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {creating ? 'Creating...' : 'Create PO'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Create Purchase Order?"
        description="Are you sure you want to create this purchase order?"
        confirmLabel="Create PO"
        onConfirm={handleConfirm}
      />
    </div>
  );
}

export default function CreatePOPage() {
  return (
    <Suspense>
      <CreatePOForm />
    </Suspense>
  );
}
