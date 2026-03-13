import { useState } from 'react';
import {
  Typography, Card, Descriptions, Table, Button, Space, Tag, message,
} from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { ApprovalActions } from '~/shared/components/forms';
import { KpiCard } from '~/shared/components/charts';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetStockCountQuery,
  useApproveVarianceMutation,
  useRejectVarianceMutation,
  useOrderRecountMutation,
} from '~/features/stockCount/stockCountApi';
import { formatNumber, formatDate, formatDateTime } from '~/shared/utils/formatters';
import { varianceSeverityColors } from '~/shared/utils/statusColors';
import type { CountLine } from '~/api/types/stockCount';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function StockCountDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: count, isLoading, isError, error, refetch } = useGetStockCountQuery(id!);
  const [approveVariance] = useApproveVarianceMutation();
  const [rejectVariance] = useRejectVarianceMutation();
  const [orderRecount] = useOrderRecountMutation();

  const { canPerform: canApproveVariance } = useCanPerformAction(P.STOCKCOUNT_APPROVE, count?.assignedTo);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !count) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const lineColumns: ColumnsType<CountLine> = [
    { title: 'Location', dataIndex: 'locationCode', width: 100 },
    { title: 'Lot', dataIndex: 'lotNumber', width: 140 },
    { title: 'System Qty', dataIndex: 'systemQty', width: 90, render: (v: number) => formatNumber(v) },
    { title: 'Counted', dataIndex: 'countedQty', width: 90, render: (v: number | null) => v != null ? formatNumber(v) : '—' },
    {
      title: 'Variance',
      dataIndex: 'variance',
      width: 80,
      render: (v: number | null) => {
        if (v == null) return '—';
        const color = v < 0 ? '#ff4d4f' : v > 0 ? '#52c41a' : undefined;
        return <Text style={{ color }}>{v > 0 ? '+' : ''}{formatNumber(v)}</Text>;
      },
    },
    {
      title: 'Variance %',
      dataIndex: 'variancePct',
      width: 90,
      render: (v: number | null) => {
        if (v == null) return '—';
        const color = Math.abs(v) >= 5 ? '#ff4d4f' : Math.abs(v) >= 2 ? '#faad14' : undefined;
        return <Text style={{ color }}>{v.toFixed(1)}%</Text>;
      },
    },
  ];

  const handleApprove = async (notes?: string) => {
    try {
      await approveVariance({ id: id!, body: { approvalNotes: notes ?? '' } }).unwrap();
      message.success('Variance approved — ledger adjusted');
    } catch {
      message.error('Failed to approve variance');
    }
  };

  const handleReject = async (reason: string) => {
    try {
      await rejectVariance({ id: id!, body: { rejectionReason: reason } }).unwrap();
      message.success('Variance rejected — recount ordered');
    } catch {
      message.error('Failed to reject variance');
    }
  };

  const handleRecount = async () => {
    try {
      await orderRecount({ id: id!, body: { recountAssignedTo: count.assignedTo } }).unwrap();
      message.success('Recount ordered');
    } catch {
      message.error('Failed to order recount');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/stock-counts')}>Back</Button>
      </Space>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{count.countNumber}</Title>
        <Space wrap>
          {count.status === 'PendingApproval' && canApproveVariance && (
            <>
              <Button icon={<ReloadOutlined />} onClick={handleRecount}>Order Recount</Button>
              <ApprovalActions
                onApprove={handleApprove}
                onReject={handleReject}
                approveLabel="Approve Variance"
                rejectLabel="Reject"
                requireApprovalNotes
              />
            </>
          )}
        </Space>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Count Type">{count.countType.replace(/([A-Z])/g, ' $1').trim()}</Descriptions.Item>
          <Descriptions.Item label="Store">{count.storeName}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={count.status} /></Descriptions.Item>
          <Descriptions.Item label="Frozen Balance">{formatNumber(count.frozenBalance)} bags</Descriptions.Item>
          <Descriptions.Item label="Total Variance">
            {count.totalVarianceBags != null ? (
              <Text style={{ color: count.totalVarianceBags < 0 ? '#ff4d4f' : undefined }}>
                {count.totalVarianceBags > 0 ? '+' : ''}{formatNumber(count.totalVarianceBags)} bags
              </Text>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Severity">
            {count.varianceSeverity ? (
              <Tag color={varianceSeverityColors[count.varianceSeverity]}>{count.varianceSeverity}</Tag>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Assigned To">{count.assignedToName}</Descriptions.Item>
          <Descriptions.Item label="Scheduled">{formatDate(count.scheduledDate)}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(count.createdAt)}</Descriptions.Item>
          {count.recountAssignedToName && (
            <Descriptions.Item label="Recount Assigned To">{count.recountAssignedToName}</Descriptions.Item>
          )}
          {count.approvedAt && (
            <>
              <Descriptions.Item label="Approved At">{formatDateTime(count.approvedAt)}</Descriptions.Item>
              <Descriptions.Item label="Approval Notes">{count.approvalNotes}</Descriptions.Item>
            </>
          )}
          {count.rejectionReason && (
            <Descriptions.Item label="Rejection Reason">{count.rejectionReason}</Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="Count Lines">
        <Table<CountLine>
          columns={lineColumns}
          dataSource={count.lines}
          rowKey={(r) => `${r.lotId}-${r.locationId}`}
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );
}
