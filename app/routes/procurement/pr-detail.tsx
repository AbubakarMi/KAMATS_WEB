import { useCallback } from 'react';
import {
  Typography, Card, Descriptions, Button, Space, message,
} from 'antd';
import { ArrowLeftOutlined, SendOutlined, SwapOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { ApprovalActions } from '~/shared/components/forms';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetPRQuery,
  useSubmitPRMutation,
  useApprovePRMutation,
  useRejectPRMutation,
} from '~/features/procurement/prApi';
import { formatDate, formatDateTime, formatWeight, formatNumber } from '~/shared/utils/formatters';

const { Title, Text } = Typography;

export default function PRDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: pr, isLoading, isError, error, refetch } = useGetPRQuery(id!);
  const [submitPR] = useSubmitPRMutation();
  const [approvePR] = useApprovePRMutation();
  const [rejectPR] = useRejectPRMutation();

  const { canPerform: canSubmit } = useCanPerformAction(P.PR_CREATE, null, false);
  const { canPerform: canApprove } = useCanPerformAction(P.PR_APPROVE, pr?.raisedBy);
  const { canPerform: canConvertToPO } = useCanPerformAction(P.PO_CREATE, null, false);

  const handleSubmit = useCallback(async () => {
    try {
      await submitPR(id!).unwrap();
      message.success('PR submitted for approval');
    } catch { message.error('Failed to submit PR'); }
  }, [submitPR, id]);

  const handleApprove = useCallback(async (notes?: string) => {
    try {
      await approvePR({ id: id!, data: { notes } }).unwrap();
      message.success('PR approved');
    } catch { message.error('Failed to approve PR'); }
  }, [approvePR, id]);

  const handleReject = useCallback(async (reason: string) => {
    try {
      await rejectPR({ id: id!, data: { rejectionReason: reason } }).unwrap();
      message.success('PR rejected');
    } catch { message.error('Failed to reject PR'); }
  }, [rejectPR, id]);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !pr) return <DetailPageSkeleton descriptionRows={10} />;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/purchase-requisitions')}>Back</Button>
          <Title level={3} style={{ margin: 0 }}>{pr.prNumber}</Title>
          <StatusBadge status={pr.status} />
        </Space>
        <Space wrap>
          {pr.status === 'Draft' && canSubmit && (
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>Submit</Button>
          )}
          {pr.status === 'Submitted' && canApprove && (
            <ApprovalActions onApprove={handleApprove} onReject={handleReject} />
          )}
          {pr.status === 'Approved' && !pr.linkedPoId && canConvertToPO && (
            <Button type="primary" icon={<SwapOutlined />} onClick={() => navigate('/purchase-orders')}>
              Convert to PO
            </Button>
          )}
        </Space>
      </div>

      <Card>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="PR Number">{pr.prNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={pr.status} /></Descriptions.Item>
          <Descriptions.Item label="Trigger Type">{pr.triggerType === 'AutoReorderPoint' ? 'Auto (Reorder Point)' : 'Manual'}</Descriptions.Item>
          <Descriptions.Item label="Store">{pr.storeName}</Descriptions.Item>
          <Descriptions.Item label="Requested Quantity">{formatNumber(pr.requestedQuantity)} bags</Descriptions.Item>
          <Descriptions.Item label="Requested Weight">{formatWeight(pr.requestedWeightKg)}</Descriptions.Item>
          <Descriptions.Item label="Stock Balance at PR">{formatNumber(pr.stockBalanceAtPr)} bags</Descriptions.Item>
          <Descriptions.Item label="Delivery Date">{formatDate(pr.requestedDeliveryDate)}</Descriptions.Item>
          <Descriptions.Item label="Justification" span={2}>{pr.justification}</Descriptions.Item>
          <Descriptions.Item label="Raised By">{pr.raisedByName}</Descriptions.Item>
          <Descriptions.Item label="Raised At">{formatDateTime(pr.raisedAt)}</Descriptions.Item>
          {pr.approvedByName && (
            <>
              <Descriptions.Item label="Approved By">{pr.approvedByName}</Descriptions.Item>
              <Descriptions.Item label="Approved At">{formatDateTime(pr.approvedAt)}</Descriptions.Item>
            </>
          )}
          {pr.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              <Text type="danger">{pr.rejectionReason}</Text>
            </Descriptions.Item>
          )}
          {pr.expiresAt && (
            <Descriptions.Item label="Expires At">{formatDateTime(pr.expiresAt)}</Descriptions.Item>
          )}
          {pr.linkedPoId && (
            <Descriptions.Item label="Linked PO">
              <DocumentLink type="PO" id={pr.linkedPoId} number={pr.linkedPoNumber!} />
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Created">{formatDateTime(pr.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}
