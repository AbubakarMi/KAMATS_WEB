'use client';

import Link from 'next/link';
import { FileText } from 'lucide-react';

type DocumentType = 'PR' | 'PO' | 'DVR' | 'WT' | 'GRN' | 'Lot' | 'Item' | 'STO' | 'TDN' | 'GRD' | 'WriteOff';

const routeMap: Record<DocumentType, string> = {
  PR: '/purchase-requisitions',
  PO: '/purchase-orders',
  DVR: '/quality/dvr',
  WT: '/weighbridge',
  GRN: '/grn',
  Lot: '/lots',
  Item: '/items',
  STO: '/transfers',
  TDN: '/dispatch',
  GRD: '/receipt',
  WriteOff: '/write-offs',
};

interface DocumentLinkProps {
  type: DocumentType;
  id: string;
  number: string;
}

export function DocumentLink({ type, id, number }: DocumentLinkProps) {
  const basePath = routeMap[type];

  return (
    <Link
      href={`${basePath}/${id}`}
      className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
    >
      <FileText size={14} />
      {number}
    </Link>
  );
}
