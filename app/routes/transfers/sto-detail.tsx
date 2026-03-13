import {
  Typography, Card, Descriptions, Table, Button, Space, Tag, message,
} from 'antd';
import { ArrowLeftOutlined, SendOutlined, StopOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { ApprovalActions } from '~/shared/components/forms';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetSTOQuery,
  useSubmitSTOMutation,
  useAuthoriseSTOMutation,
  useRejectSTOMutation,
  useCancelSTOMutation,
} from '~/features/transfers/stoApi';
import { formatNumber, formatDate, formatDateTime } from '~/shared/utils/formatters';
import type { STOItem } from '~/api/types/distribution';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function STODetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: sto, isLoading, isError, error, refetch } = useGetSTOQuery(id!);
  const [submitSTO] = useSubmitSTOMutation();
  const [authoriseSTO] = useAuthoriseSTOMutation();
  const [rejectSTO] = useRejectSTOMutation();
  const [cancelSTO] = useCancelSTOMutation();

  const { canPerform: canSubmit } = useCanPerformAction(P.STO_CREATE, null, false);
  const { canPerform: canAuthorise } = useCanPerformAction(
    [P.STO_APPROVE_CENTRAL_UNIT, P.STO_APPROVE_UNIT_USER],
    sto?.requestedBy,
  );

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !sto) return <DetailPageSkeleton descriptionRows={10} hasTable />;

  const itemColumns: ColumnsType<STOItem> = [
    { title: 'Item Code', dataIndex: 'itemCode' },
    { title: 'Lot', dataIndex: 'lotNumber' },
    { title: 'Status', dataIndex: 'status', render: (v: string) => <StatusBadge status={v} /> },
  ];

  const handleSubmit = async () => {
    try {
      await submitSTO(id!).unwrap();
      message.success('STO submitted for authorisation');
    } catch {
      message.error('Failed to submit STO');
    }
  };

  const handleAuthorise = async () => {
    try {
      await authoriseSTO({ id: id! }).unwrap();
      message.success('STO authorised');
    } catch {
      message.error('Failed to authorise STO');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectSTO({ id: id!, body: { rejectionReason: reason } }).unwrap();
      message.success('STO rejected');
    } catch {
      message.error('Failed to reject STO');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelSTO({ id: id!, body: { reason: 'Cancelled by user' } }).unwrap();
      message.success('STO cancelled');
    } catch {
      message.error('Failed to cancel STO');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/transfers')}>Back</Button>
      </Space>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{sto.stoNumber}</Title>
        <Space wrap>
          {sto.status === 'Draft' && canSubmit && (
            <>
              <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>Submit</Button>
              <Button danger icon={<StopOutlined />} onClick={handleCancel}>Cancel</Button>
            </>
          )}
          {sto.status === 'Submitted' && canAuthorise && (
            <ApprovalActions
              onApprove={handleAuthorise}
              onReject={handleReject}
              approveLabel="Authorise"
            />
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={3} bordered size="small">
          <Descriptions.Item label="STO Number">{sto.stoNumber}</Descriptions.Item>
          <Descriptions.Item label="Trigger">{sto.triggerType.replace(/([A-Z])/g, ' $1').trim()}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={sto.status} /></Descriptions.Item>
          <Descriptions.Item label="Source Store">{sto.sourceStoreName}</Descriptions.Item>
          <Descriptions.Item label="Destination Store">{sto.destinationStoreName}</Descriptions.Item>
          <Descriptions.Item label="Requested Delivery">{formatDate(sto.requestedDelivery)}</Descriptions.Item>
          <Descriptions.Item label="Requested Bags">{formatNumber(sto.requestedBags)}</Descriptions.Item>
          <Descriptions.Item label="Authorised Bags">{sto.authorisedBags != null ? formatNumber(sto.authorisedBags) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Source Balance at Auth">{sto.sourceBalanceAtAuth != null ? formatNumber(sto.sourceBalanceAtAuth) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Requested By">{sto.requestedByName}</Descriptions.Item>
          <Descriptions.Item label="Requested At">{formatDateTime(sto.requestedAt)}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(sto.createdAt)}</Descriptions.Item>
          {sto.authorisedByName && (
            <>
              <Descriptions.Item label="Authorised By">{sto.authorisedByName}</Descriptions.Item>
              <Descriptions.Item label="Authorised At">{sto.authorisedAt ? formatDateTime(sto.authorisedAt) : '—'}</Descriptions.Item>
            </>
          )}
          {sto.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={3}>
              <Text type="danger">{sto.rejectionReason}</Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Justification" span={3}>{sto.justification}</Descriptions.Item>
          {sto.notes && <Descriptions.Item label="Notes" span={3}>{sto.notes}</Descriptions.Item>}
        </Descriptions>
      </Card>

      {sto.tdnNumber && sto.tdnId && (
        <Card size="small" style={{ marginBottom: 16 }}>
          <Space>
            <Text strong>TDN:</Text> <DocumentLink type="TDN" id={sto.tdnId} number={sto.tdnNumber} />
            {sto.grdNumber && sto.grdId && (
              <>
                <Text strong style={{ marginLeft: 16 }}>GRD:</Text> <DocumentLink type="GRD" id={sto.grdId} number={sto.grdNumber} />
              </>
            )}
          </Space>
        </Card>
      )}

      {sto.preSelectedItems.length > 0 && (
        <Card title="Pre-Selected Items">
          <Table<STOItem>
            columns={itemColumns}
            dataSource={sto.preSelectedItems}
            rowKey="itemId"
            size="small"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
