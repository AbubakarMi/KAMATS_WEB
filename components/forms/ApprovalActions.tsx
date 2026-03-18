'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { sanitizeString } from '@/lib/utils/sanitize';

interface ApprovalActionsProps {
  onApprove: (notes?: string) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  approveLabel?: string;
  rejectLabel?: string;
  requireApprovalNotes?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

export function ApprovalActions({
  onApprove,
  onReject,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
  requireApprovalNotes = false,
  loading = false,
  disabled = false,
}: ApprovalActionsProps) {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleApprove = async () => {
    if (requireApprovalNotes) {
      setApproveModalOpen(true);
      return;
    }
    setSubmitting(true);
    try {
      await onApprove();
    } finally {
      setSubmitting(false);
    }
  };

  const confirmApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove(notes ? sanitizeString(notes) : undefined);
      setApproveModalOpen(false);
      setNotes('');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmReject = async () => {
    if (!reason.trim()) return;
    setSubmitting(true);
    try {
      await onReject(sanitizeString(reason.trim()));
      setRejectModalOpen(false);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={handleApprove} disabled={disabled || busy}>
          <Check size={16} className="mr-1.5" />
          {approveLabel}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setRejectModalOpen(true)}
          disabled={disabled || busy}
        >
          <X size={16} className="mr-1.5" />
          {rejectLabel}
        </Button>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectModalOpen} onOpenChange={(open) => { if (!open) { setRejectModalOpen(false); setReason(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejection Reason</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejection. This will be recorded in the audit trail.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectModalOpen(false); setReason(''); }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!reason.trim() || submitting}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog (when notes required) */}
      <Dialog open={approveModalOpen} onOpenChange={(open) => { if (!open) { setApproveModalOpen(false); setNotes(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional approval notes..."
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setApproveModalOpen(false); setNotes(''); }}>
              Cancel
            </Button>
            <Button onClick={confirmApprove} disabled={submitting}>
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
