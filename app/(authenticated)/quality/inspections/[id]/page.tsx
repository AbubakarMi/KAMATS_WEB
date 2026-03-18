'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DocumentLink } from '@/components/data-display/DocumentLink';
import { DescriptionList } from '@/components/data-display/DescriptionList';
import { QueryErrorAlert } from '@/components/errors/QueryErrorAlert';
import { DetailPageSkeleton } from '@/components/skeletons/DetailPageSkeleton';
import { useGetInspectionQuery } from '@/lib/features/quality/qualityApi';
import { formatDateTime } from '@/lib/utils/formatters';
import { inspectionResultColors } from '@/lib/utils/statusColors';

const resultColorMap: Record<string, string> = {
  green: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  orange: 'bg-amber-100 text-amber-700',
};

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: inspection, isLoading, isError, error, refetch } = useGetInspectionQuery(id);

  if (isError) return <QueryErrorAlert error={error} />;
  if (isLoading || !inspection) return <DetailPageSkeleton descriptionRows={6} />;

  const resultColor = inspection.result ? inspectionResultColors[inspection.result] : undefined;
  const resultClasses = resultColor ? (resultColorMap[resultColor] ?? 'bg-slate-100 text-slate-600') : '';

  const items = [
    { label: 'Inspection #', value: inspection.inspectionNumber },
    {
      label: 'Result',
      value: inspection.result ? (
        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${resultClasses}`}>
          {inspection.result}
        </span>
      ) : <span className="text-slate-400">Pending</span>,
    },
    { label: 'DVR', value: <DocumentLink type="DVR" id={inspection.dvrId} number={inspection.dvrNumber} /> },
    { label: 'PO', value: <DocumentLink type="PO" id={inspection.poId} number={inspection.poNumber} /> },
    { label: 'Bags Sampled', value: inspection.bagsSampled },
    { label: 'Inspector', value: inspection.inspectorName },
    { label: 'Visual Check', value: inspection.visualCheckNotes, span: 2 },
    { label: 'Physical State', value: inspection.physicalStateNotes, span: 2 },
    { label: 'Purity Test Result', value: inspection.purityTestResult, span: 2 },
    ...(inspection.rejectionReason ? [
      { label: 'Rejection Reason', value: <span className="text-red-600">{inspection.rejectionReason}</span>, span: 2 },
    ] : []),
    { label: 'Inspected At', value: formatDateTime(inspection.inspectedAt) },
    { label: 'Completed At', value: formatDateTime(inspection.completedAt) },
    { label: 'Created', value: formatDateTime(inspection.createdAt) },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />Back
        </Button>
        <h1 className="text-2xl font-bold font-[family-name:var(--font-display)] text-slate-900">
          {inspection.inspectionNumber}
        </h1>
        {inspection.result && (
          <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${resultClasses}`}>
            {inspection.result}
          </span>
        )}
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white p-6">
        <DescriptionList items={items} columns={2} />
      </div>

      {inspection.photoUrls.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white p-6 mt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Inspection Photos</h3>
          <div className="flex flex-wrap gap-3">
            {inspection.photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Inspection photo ${i + 1}`}
                className="w-[120px] h-[120px] rounded-lg object-cover border border-slate-200"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
