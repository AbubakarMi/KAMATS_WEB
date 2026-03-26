'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';

import { useGetPRQuery, useUpdatePRMutation } from '@/lib/features/procurement/prApi';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import { updatePRSchema } from '@/lib/schemas';
import type { UpdatePRRequest } from '@/lib/api/types/procurement';

type FormValues = {
  quantityBags: number;
  justification: string;
  requestedDeliveryDate: string;
};

export default function EditPRPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: pr, isLoading, isError, error } = useGetPRQuery(id);
  const [updatePR, { isLoading: updating }] = useUpdatePRMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(updatePRSchema) as any,
    mode: 'onBlur',
    defaultValues: { quantityBags: '' as unknown as number, justification: '', requestedDeliveryDate: '' },
  });

  useEffect(() => {
    if (pr) {
      if (pr.status !== 'Draft') {
        toast.error('Only draft PRs can be edited');
        router.replace(`/purchase-requisitions/${id}`);
        return;
      }
      form.reset({
        quantityBags: pr.requestedQuantity,
        justification: pr.justification,
        requestedDeliveryDate: pr.requestedDeliveryDate?.split('T')[0] ?? '',
      });
    }
  }, [pr, id, router, form]);

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const req: UpdatePRRequest = {
        requestedQuantity: sanitized.quantityBags as number,
        requestedWeightKg: String((sanitized.quantityBags as number) * 50),
        justification: sanitized.justification as string,
        requestedDeliveryDate: sanitized.requestedDeliveryDate as string,
      };
      await updatePR({ id, data: req }).unwrap();
      toast.success('Purchase Requisition updated');
      router.push(`/purchase-requisitions/${id}`);
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !pr) return <DetailPageSkeleton descriptionRows={4} />;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push(`/purchase-requisitions/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Edit {pr.prNumber}
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <div className="mb-4 text-sm text-slate-500">
          Store: <span className="font-medium text-slate-700">{pr.storeName}</span>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Quantity (bags)</Label>
              <Input type="number" min={1} {...form.register('quantityBags')} />
              {form.formState.errors.quantityBags && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.quantityBags.message}</p>
              )}
            </div>
            <div>
              <Label>Requested Delivery Date</Label>
              <Input type="date" {...form.register('requestedDeliveryDate')} />
              {form.formState.errors.requestedDeliveryDate && (
                <p className="text-xs text-red-500 mt-1">{form.formState.errors.requestedDeliveryDate.message}</p>
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

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push(`/purchase-requisitions/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Update Purchase Requisition?"
        description="Are you sure you want to save these changes?"
        confirmLabel="Save Changes"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
