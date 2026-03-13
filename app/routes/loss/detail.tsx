import {
  Typography, Card, Descriptions, Button, Space, Tag, Image, message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { ApprovalActions } from '~/shared/components/forms';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetWriteOffQuery,
  useApproveWriteOffMutation,
  useRejectWriteOffMutation,
} from '~/features/loss/lossApi';
import { formatWeight, formatNumber, formatDateTime } from '~/shared/utils/formatters';
import { writeOffCategoryColors } from '~/shared/utils/statusColors';

const { Title, Text } = Typography;

export default function WriteOffDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: wo, isLoading, isError, error, refetch } = useGetWriteOffQuery(id!);
  const [approveWriteOff] = useApproveWriteOffMutation();
  const [rejectWriteOff] = useRejectWriteOffMutation();

  // Tiered write-off approval: permission depends on approval route
  const approvalPermission = wo?.approvalRoute === 'Critical'
    ? P.WRITEOFF_APPROVE_CRITICAL
    : wo?.approvalRoute === 'Significant'
      ? P.WRITEOFF_APPROVE_SIGNIFICANT
      : P.WRITEOFF_APPROVE_MINOR;
  const { canPerform: canApprove } = useCanPerformAction(approvalPermission, wo?.raisedBy);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !wo) return <DetailPageSkeleton descriptionRows={8} />;

  const handleApprove = async (notes?: string) => {
    try {
      await approveWriteOff({ id: id!, body: { approvalNotes: notes ?? '' } }).unwrap();
      message.success('Write-off approved — ledger adjusted');
    } catch {
      message.error('Failed to approve write-off');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectWriteOff({ id: id!, body: { rejectionReason: reason } }).unwrap();
      message.success('Write-off rejected');
    } catch {
      message.error('Failed to reject write-off');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/write-offs')}>Back</Button>
      </Space>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{wo.requestNumber}</Title>
        <Space wrap>
          {wo.status === 'Pending' && canApprove && (
            <ApprovalActions
              onApprove={handleApprove}
              onReject={handleReject}
              requireApprovalNotes
            />
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Request Number">{wo.requestNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={wo.status} /></Descriptions.Item>
          <Descriptions.Item label="Category">
            <Tag color={writeOffCategoryColors[wo.category]}>{wo.category.replace(/([A-Z])/g, ' $1').trim()}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Store">{wo.storeName}</Descriptions.Item>
          <Descriptions.Item label="Bags">{formatNumber(wo.bagsCount)}</Descriptions.Item>
          <Descriptions.Item label="Weight">{formatWeight(wo.weightKg)}</Descriptions.Item>
          <Descriptions.Item label="Approval Route">{wo.approvalRoute}</Descriptions.Item>
          <Descriptions.Item label="Raised By">{wo.raisedByName}</Descriptions.Item>
          <Descriptions.Item label="Raised At">{formatDateTime(wo.raisedAt)}</Descriptions.Item>
          <Descriptions.Item label="Description" span={3}>{wo.description}</Descriptions.Item>
          {wo.approvedByName && (
            <>
              <Descriptions.Item label="Approved By">{wo.approvedByName}</Descriptions.Item>
              <Descriptions.Item label="Approved At">{wo.approvedAt ? formatDateTime(wo.approvedAt) : '—'}</Descriptions.Item>
              <Descriptions.Item label="Approval Notes">{wo.approvalNotes}</Descriptions.Item>
            </>
          )}
          {wo.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={3}>
              <Text type="danger">{wo.rejectionReason}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {wo.photoUrls.length > 0 && (
        <Card title="Photos" style={{ marginBottom: 16 }}>
          <Image.PreviewGroup>
            <Space>
              {wo.photoUrls.map((url, i) => (
                <Image key={i} width={120} src={url} fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}
    </div>
  );
}
