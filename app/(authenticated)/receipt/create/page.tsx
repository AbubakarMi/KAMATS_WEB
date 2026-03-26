'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';

import { useCreateReceiptMutation } from '@/lib/features/receipt/receiptApi';
import { createReceiptSchema } from '@/lib/schemas/distribution';
import { setApiFieldErrors } from '@/lib/utils/formErrors';
import { sanitizeFormValues } from '@/lib/utils/sanitize';
import type { CreateReceiptRequest } from '@/lib/api/types/distribution';

type FormValues = {
  consignmentQr: string;
};

export default function CreateReceiptPage() {
  const router = useRouter();
  const [createReceipt, { isLoading: creating }] = useCreateReceiptMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<FormValues>({
    resolver: zodResolver(createReceiptSchema) as any,
    mode: 'onBlur',
    defaultValues: { consignmentQr: '' },
  });

  const onSubmit = (values: FormValues) => {
    setPendingValues(values);
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingValues) return;
    try {
      const sanitized = sanitizeFormValues(pendingValues as unknown as Record<string, unknown>);
      const req: CreateReceiptRequest = {
        consignmentQr: sanitized.consignmentQr as string,
      };
      const result = await createReceipt(req).unwrap();
      toast.success(`Receipt session created — ${result.grdNumber}`);
      router.push(`/receipt/${result.id}`);
    } catch (err) {
      const fallback = setApiFieldErrors(form.setError, err);
      if (fallback) toast.error(fallback);
      throw err;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" size="sm" onClick={() => router.push('/receipt')}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          Initiate Receipt
        </h1>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>
              <QrCode className="h-4 w-4 inline mr-1.5" />
              Consignment QR Code
            </Label>
            <Input
              placeholder="Scan or enter the consignment QR code from the TDN"
              {...form.register('consignmentQr')}
              className="max-w-md"
            />
            {form.formState.errors.consignmentQr && (
              <p className="text-xs text-red-500 mt-1">{form.formState.errors.consignmentQr.message}</p>
            )}
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
            <p className="font-medium text-blue-800 mb-1">How it works</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-600">
              <li>The consignment QR code is printed on the Transport Document Number (TDN) that accompanies the shipment.</li>
              <li>On mobile, scan the QR with the camera. On web, enter the code manually.</li>
              <li>The system will look up the associated STO and create a receipt session for you to scan incoming items.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
            After creating the receipt session, you can scan received items, report damage, and complete the receipt from the detail page.
          </div>

          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => router.push('/receipt')}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {creating ? 'Creating...' : 'Initiate Receipt'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Initiate Receipt?"
        description="This will create a receipt session linked to the consignment. You can then scan received items and record their condition."
        confirmLabel="Initiate Receipt"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
