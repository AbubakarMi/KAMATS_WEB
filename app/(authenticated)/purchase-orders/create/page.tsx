'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Info } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function CreatePOPage() {
  const router = useRouter();

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
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              PO creation wizard — select an approved PR, choose a supplier, define PO lines, and submit.
              For now, navigate to an Approved PR and use &quot;Convert to PO&quot;.
            </p>
            <Button asChild variant="outline">
              <Link href="/purchase-requisitions">
                Go to Purchase Requisitions
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
