import { useState } from 'react';
import { Space, Button, Modal, Input, Typography } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { TextArea } = Input;

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
      await onApprove(notes || undefined);
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
      await onReject(reason.trim());
      setRejectModalOpen(false);
      setReason('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Space>
        <Button
          type="primary"
          icon={<CheckOutlined />}
          onClick={handleApprove}
          loading={loading || submitting}
          disabled={disabled}
        >
          {approveLabel}
        </Button>
        <Button
          danger
          icon={<CloseOutlined />}
          onClick={() => setRejectModalOpen(true)}
          loading={loading || submitting}
          disabled={disabled}
        >
          {rejectLabel}
        </Button>
      </Space>

      {/* Reject Modal */}
      <Modal
        title="Rejection Reason"
        open={rejectModalOpen}
        onOk={confirmReject}
        onCancel={() => { setRejectModalOpen(false); setReason(''); }}
        okText="Confirm Rejection"
        okButtonProps={{ danger: true, disabled: !reason.trim() }}
        confirmLoading={submitting}
      >
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          Please provide a reason for rejection. This will be recorded in the audit trail.
        </Typography.Text>
        <TextArea
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          autoFocus
        />
      </Modal>

      {/* Approve Modal (when notes required) */}
      <Modal
        title="Approval Notes"
        open={approveModalOpen}
        onOk={confirmApprove}
        onCancel={() => { setApproveModalOpen(false); setNotes(''); }}
        okText="Confirm Approval"
        confirmLoading={submitting}
      >
        <TextArea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional approval notes..."
          autoFocus
        />
      </Modal>
    </>
  );
}
