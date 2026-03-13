import {
  Typography, Card, Descriptions, Table, Tag, Button, Space, Progress,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { useGetDispatchQuery } from '~/features/dispatch/dispatchApi';
import { formatWeight, formatNumber, formatDateTime } from '~/shared/utils/formatters';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ScannedItem {
  itemId: string;
  itemCode: string;
  scannedAt: string;
}

export default function DispatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: dispatch, isLoading, isError, error, refetch } = useGetDispatchQuery(id!);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !dispatch) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const scanProgress = dispatch.expectedCount > 0
    ? Math.round((dispatch.scannedCount / dispatch.expectedCount) * 100)
    : 0;

  const scannedColumns: ColumnsType<ScannedItem> = [
    { title: 'Item Code', dataIndex: 'itemCode' },
    { title: 'Scanned At', dataIndex: 'scannedAt', render: (v: string) => formatDateTime(v) },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
      </Space>

      <Title level={3} style={{ marginBottom: 16 }}>
        Dispatch — {dispatch.stoNumber}
      </Title>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="STO">
            <DocumentLink type="STO" id={dispatch.stoId} number={dispatch.stoNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={dispatch.status === 'Completed' ? 'green' : dispatch.status === 'InTransit' ? 'geekblue' : 'blue'}>
              {dispatch.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(dispatch.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Vehicle Reg">{dispatch.vehicleReg}</Descriptions.Item>
          <Descriptions.Item label="Driver">{dispatch.driverName}</Descriptions.Item>
          <Descriptions.Item label="Driver Phone">{dispatch.driverPhone}</Descriptions.Item>
          <Descriptions.Item label="Expected Weight">{dispatch.expectedWeightKg ? formatWeight(dispatch.expectedWeightKg) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Dispatched Weight">{dispatch.dispatchedWeightKg ? formatWeight(dispatch.dispatchedWeightKg) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Weight Variance">{dispatch.weightVariancePct ? `${dispatch.weightVariancePct}%` : '—'}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Scan Progress" style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress
            percent={scanProgress}
            status={scanProgress >= 100 ? 'success' : 'active'}
            format={() => `${formatNumber(dispatch.scannedCount)} / ${formatNumber(dispatch.expectedCount)} bags`}
          />
          <Text type="secondary">
            {dispatch.expectedCount - dispatch.scannedCount} bags remaining
          </Text>
        </Space>
      </Card>

      {dispatch.scannedItems.length > 0 && (
        <Card title="Scanned Items">
          <Table<ScannedItem>
            columns={scannedColumns}
            dataSource={dispatch.scannedItems}
            rowKey="itemId"
            size="small"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
