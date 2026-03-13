import { useCallback } from 'react';
import {
  Typography, Card, Descriptions, Button, Space, Row, Col, Table, Tag, message,
} from 'antd';
import { ArrowLeftOutlined, StopOutlined, PoweroffOutlined, RedoOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { KpiCard } from '~/shared/components/charts';
import { ApprovalActions } from '~/shared/components/forms';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetSupplierQuery,
  useGetSupplierScorecardQuery,
  useApproveSupplierMutation,
  useRejectSupplierMutation,
  useSuspendSupplierMutation,
  useDeactivateSupplierMutation,
  useReactivateSupplierMutation,
} from '~/features/suppliers/suppliersApi';
import { formatDate, formatPercentage, formatDateTime } from '~/shared/utils/formatters';
import type { DeliveryScorecard } from '~/api/types/suppliers';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function SupplierDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: supplier, isLoading, isError, error, refetch } = useGetSupplierQuery(id!);
  const { data: scorecard } = useGetSupplierScorecardQuery({ id: id! });

  const [approveSupplier] = useApproveSupplierMutation();
  const [rejectSupplier] = useRejectSupplierMutation();
  const [suspendSupplier] = useSuspendSupplierMutation();
  const [deactivateSupplier] = useDeactivateSupplierMutation();
  const [reactivateSupplier] = useReactivateSupplierMutation();

  const { canPerform: canApprove } = useCanPerformAction(P.SUPPLIERS_APPROVE, supplier?.createdBy);

  const handleApprove = useCallback(async () => {
    try {
      await approveSupplier(id!).unwrap();
      message.success('Supplier approved');
    } catch { message.error('Failed to approve supplier'); }
  }, [approveSupplier, id]);

  const handleReject = useCallback(async (reason: string) => {
    try {
      await rejectSupplier({ id: id!, data: { rejectionReason: reason } }).unwrap();
      message.success('Supplier rejected');
    } catch { message.error('Failed to reject supplier'); }
  }, [rejectSupplier, id]);

  const handleSuspend = useCallback(async () => {
    try {
      await suspendSupplier({ id: id!, data: { reason: 'Performance issues' } }).unwrap();
      message.success('Supplier suspended');
    } catch { message.error('Failed to suspend supplier'); }
  }, [suspendSupplier, id]);

  const handleDeactivate = useCallback(async () => {
    try {
      await deactivateSupplier({ id: id!, data: { reason: 'No longer needed' } }).unwrap();
      message.success('Supplier deactivated');
    } catch { message.error('Failed to deactivate supplier'); }
  }, [deactivateSupplier, id]);

  const handleReactivate = useCallback(async () => {
    try {
      await reactivateSupplier({ id: id!, data: {} }).unwrap();
      message.success('Supplier reactivated');
    } catch { message.error('Failed to reactivate supplier'); }
  }, [reactivateSupplier, id]);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !supplier) return <DetailPageSkeleton hasKpiCards kpiCount={3} descriptionRows={10} hasTable />;

  const deliveryColumns: ColumnsType<DeliveryScorecard> = [
    { title: 'PO Number', dataIndex: 'poNumber' },
    { title: 'Delivery Date', dataIndex: 'deliveryDate', render: (v: string) => formatDate(v) },
    { title: 'On Time', dataIndex: 'onTime', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag> },
    { title: 'Qty Variance', dataIndex: 'quantityVariancePct', render: (v: string) => formatPercentage(v) },
    { title: 'Quality', dataIndex: 'qualityPassed', render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Pass' : 'Fail'}</Tag> },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/suppliers')}>Back</Button>
          <Title level={3} style={{ margin: 0 }}>{supplier.name}</Title>
          <StatusBadge status={supplier.status} />
        </Space>
        <Space wrap>
          {supplier.status === 'PendingApproval' && canApprove && (
            <ApprovalActions onApprove={handleApprove} onReject={handleReject} />
          )}
          {supplier.status === 'Active' && canApprove && (
            <>
              <Button icon={<StopOutlined />} danger onClick={handleSuspend}>Suspend</Button>
              <Button icon={<PoweroffOutlined />} onClick={handleDeactivate}>Deactivate</Button>
            </>
          )}
          {(supplier.status === 'Suspended' || supplier.status === 'Deactivated') && canApprove && (
            <Button type="primary" icon={<RedoOutlined />} onClick={handleReactivate}>Reactivate</Button>
          )}
        </Space>
      </div>

      <Card>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Registration #">{supplier.registrationNumber}</Descriptions.Item>
          <Descriptions.Item label="Tax ID">{supplier.taxId}</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>{supplier.address}</Descriptions.Item>
          <Descriptions.Item label="Contact Person">{supplier.contactPerson}</Descriptions.Item>
          <Descriptions.Item label="Phone">{supplier.contactPhone}</Descriptions.Item>
          <Descriptions.Item label="Email">{supplier.contactEmail}</Descriptions.Item>
          <Descriptions.Item label="Bank">{supplier.bankName}</Descriptions.Item>
          <Descriptions.Item label="Account #">{supplier.bankAccountNumber}</Descriptions.Item>
          <Descriptions.Item label="Account Name">{supplier.bankAccountName}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(supplier.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Approved">{formatDateTime(supplier.approvedAt)}</Descriptions.Item>
          {supplier.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              <Text type="danger">{supplier.rejectionReason}</Text>
            </Descriptions.Item>
          )}
          {supplier.suspensionReason && (
            <Descriptions.Item label="Suspension Reason" span={2}>
              <Text type="warning">{supplier.suspensionReason}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {scorecard && (
        <>
          <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>Scorecard</Title>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={12} lg={8}>
              <KpiCard
                title="On-Time Delivery Rate"
                value={formatPercentage(scorecard.overall.onTimeDeliveryRate)}
                suffix=""
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <KpiCard
                title="Quantity Accuracy Rate"
                value={formatPercentage(scorecard.overall.quantityAccuracyRate)}
                suffix=""
              />
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <KpiCard
                title="Quality Acceptance Rate"
                value={formatPercentage(scorecard.overall.qualityAcceptanceRate)}
                suffix=""
              />
            </Col>
          </Row>

          <Card title={`Delivery History (${scorecard.overall.totalDeliveries} total)`}>
            <Table<DeliveryScorecard>
              columns={deliveryColumns}
              dataSource={scorecard.deliveries}
              rowKey="deliveryId"
              size="small"
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
}
