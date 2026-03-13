import { useCallback } from 'react';
import {
  Typography, Card, Descriptions, Button, Space, Table, Collapse, message,
} from 'antd';
import { ArrowLeftOutlined, SendOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { ApprovalActions } from '~/shared/components/forms';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetPOQuery,
  useSubmitPOMutation,
  useApproveManagerPOMutation,
  useRejectManagerPOMutation,
  useApproveFinancePOMutation,
  useRejectFinancePOMutation,
} from '~/features/procurement/poApi';
import { formatDate, formatDateTime, formatMoney, formatWeight } from '~/shared/utils/formatters';
import type { POLine, POAmendment } from '~/api/types/procurement';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function PODetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: po, isLoading, isError, error, refetch } = useGetPOQuery(id!);
  const [submitPO] = useSubmitPOMutation();
  const [approveManager] = useApproveManagerPOMutation();
  const [rejectManager] = useRejectManagerPOMutation();
  const [approveFinance] = useApproveFinancePOMutation();
  const [rejectFinance] = useRejectFinancePOMutation();

  const { canPerform: canSubmit } = useCanPerformAction(P.PO_CREATE, null, false);
  const { canPerform: canManagerApprove } = useCanPerformAction(P.PO_APPROVE_MANAGER, po?.requestedBy);
  const { canPerform: canFinanceApprove } = useCanPerformAction(P.PO_APPROVE_FINANCE, po?.managerApprovedBy);

  const handleSubmit = useCallback(async () => {
    try {
      await submitPO(id!).unwrap();
      message.success('PO submitted for approval');
    } catch { message.error('Failed to submit PO'); }
  }, [submitPO, id]);

  const handleManagerApprove = useCallback(async (notes?: string) => {
    try {
      await approveManager({ id: id!, data: { notes } }).unwrap();
      message.success('PO approved by manager');
    } catch { message.error('Failed to approve PO'); }
  }, [approveManager, id]);

  const handleManagerReject = useCallback(async (reason: string) => {
    try {
      await rejectManager({ id: id!, data: { rejectionReason: reason } }).unwrap();
      message.success('PO rejected by manager');
    } catch { message.error('Failed to reject PO'); }
  }, [rejectManager, id]);

  const handleFinanceApprove = useCallback(async (notes?: string) => {
    try {
      await approveFinance({ id: id!, data: { notes } }).unwrap();
      message.success('PO approved by finance — issued');
    } catch { message.error('Failed to approve PO'); }
  }, [approveFinance, id]);

  const handleFinanceReject = useCallback(async (reason: string) => {
    try {
      await rejectFinance({ id: id!, data: { rejectionReason: reason } }).unwrap();
      message.success('PO rejected by finance');
    } catch { message.error('Failed to reject PO'); }
  }, [rejectFinance, id]);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !po) return <DetailPageSkeleton descriptionRows={12} hasTable />;

  const lineColumns: ColumnsType<POLine> = [
    { title: '#', dataIndex: 'lineNumber', width: 50 },
    { title: 'Product Specification', dataIndex: 'productSpecification' },
    { title: 'Qty (bags)', dataIndex: 'quantityBags', width: 100 },
    { title: 'Std Weight', dataIndex: 'standardWeightKg', width: 100, render: (v: string) => formatWeight(v) },
    { title: 'Unit Price', dataIndex: 'unitPrice', width: 120, render: (v: string) => formatMoney(v, po.currency) },
    { title: 'Line Total', dataIndex: 'lineTotal', width: 140, render: (v: string) => formatMoney(v, po.currency) },
  ];

  const amendmentColumns: ColumnsType<POAmendment> = [
    { title: 'Version', dataIndex: 'amendmentVersion', width: 80 },
    { title: 'Justification', dataIndex: 'justification' },
    { title: 'Status', dataIndex: 'status', width: 180, render: (s: string) => <StatusBadge status={s} /> },
    { title: 'Requested', dataIndex: 'requestedAt', width: 150, render: (v: string) => formatDateTime(v) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/purchase-orders')}>Back</Button>
          <Title level={3} style={{ margin: 0 }}>{po.poNumber}</Title>
          <StatusBadge status={po.status} />
        </Space>
        <Space wrap>
          {po.status === 'Draft' && canSubmit && (
            <Button type="primary" icon={<SendOutlined />} onClick={handleSubmit}>Submit</Button>
          )}
          {po.status === 'Submitted' && canManagerApprove && (
            <ApprovalActions
              onApprove={handleManagerApprove}
              onReject={handleManagerReject}
              approveLabel="Manager Approve"
              rejectLabel="Manager Reject"
            />
          )}
          {po.status === 'ManagerApproved' && canFinanceApprove && (
            <ApprovalActions
              onApprove={handleFinanceApprove}
              onReject={handleFinanceReject}
              approveLabel="Finance Approve"
              rejectLabel="Finance Reject"
            />
          )}
        </Space>
      </div>

      <Card>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="PO Number">{po.poNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={po.status} /></Descriptions.Item>
          <Descriptions.Item label="Linked PR">
            <DocumentLink type="PR" id={po.prId} number={po.prNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">{po.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Destination Store">{po.destinationStoreName}</Descriptions.Item>
          <Descriptions.Item label="Currency">{po.currency}</Descriptions.Item>
          <Descriptions.Item label="Total Amount">{formatMoney(po.totalAmount, po.currency)}</Descriptions.Item>
          <Descriptions.Item label="Expected Delivery">{formatDate(po.expectedDeliveryDate)}</Descriptions.Item>
          <Descriptions.Item label="Requested By">{po.requestedByName}</Descriptions.Item>
          <Descriptions.Item label="Requested At">{formatDateTime(po.requestedAt)}</Descriptions.Item>
          {po.managerApprovedByName && (
            <>
              <Descriptions.Item label="Manager Approved By">{po.managerApprovedByName}</Descriptions.Item>
              <Descriptions.Item label="Manager Approved At">{formatDateTime(po.managerApprovedAt)}</Descriptions.Item>
            </>
          )}
          {po.managerRejectionReason && (
            <Descriptions.Item label="Manager Rejection" span={2}>
              <Text type="danger">{po.managerRejectionReason}</Text>
            </Descriptions.Item>
          )}
          {po.financeApprovedByName && (
            <>
              <Descriptions.Item label="Finance Approved By">{po.financeApprovedByName}</Descriptions.Item>
              <Descriptions.Item label="Finance Approved At">{formatDateTime(po.financeApprovedAt)}</Descriptions.Item>
            </>
          )}
          {po.financeRejectionReason && (
            <Descriptions.Item label="Finance Rejection" span={2}>
              <Text type="danger">{po.financeRejectionReason}</Text>
            </Descriptions.Item>
          )}
          {po.issuedAt && (
            <Descriptions.Item label="Issued At">{formatDateTime(po.issuedAt)}</Descriptions.Item>
          )}
          <Descriptions.Item label="Created">{formatDateTime(po.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="PO Lines" style={{ marginTop: 16 }}>
        <Table<POLine>
          columns={lineColumns}
          dataSource={po.lines}
          rowKey="lineNumber"
          size="small"
          pagination={false}
        />
      </Card>

      {po.amendments.length > 0 && (
        <Collapse
          style={{ marginTop: 16 }}
          items={[{
            key: 'amendments',
            label: `Amendments (${po.amendments.length})`,
            children: (
              <Table<POAmendment>
                columns={amendmentColumns}
                dataSource={po.amendments}
                rowKey="id"
                size="small"
                pagination={false}
              />
            ),
          }]}
        />
      )}
    </div>
  );
}
