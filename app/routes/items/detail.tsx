import {
  Typography, Card, Descriptions, Button, Space, Tooltip,
} from 'antd';
import { ArrowLeftOutlined, CopyOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink, TimelineView } from '~/shared/components/data-display';
import type { TimelineEvent } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { GaugeChart } from '~/shared/components/charts';
import { useGetItemQuery, useGetItemLifecycleQuery } from '~/features/inventory/itemsApi';
import { formatWeight, formatDate, formatDateTime } from '~/shared/utils/formatters';

const { Title, Text } = Typography;

const eventColors: Record<string, string> = {
  GRN_RECEIVED: 'green',
  LABEL_GENERATED: 'blue',
  PUT_AWAY: 'cyan',
  TRANSFER_DISPATCH: 'orange',
  TRANSFER_RECEIPT: 'geekblue',
  CONSUMPTION: 'purple',
  WRITE_OFF: 'red',
};

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: item, isLoading, isError, error, refetch } = useGetItemQuery(id!);
  const { data: lifecycle } = useGetItemLifecycleQuery(id!);

  const handleCopyQR = () => {
    if (item?.qrCode) {
      navigator.clipboard.writeText(item.qrCode);
    }
  };

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !item) return <DetailPageSkeleton descriptionRows={8} />;

  const stdWeight = parseFloat(item.standardWeightKg);
  const remaining = parseFloat(item.remainingWeightKg);
  const gaugeColor = remaining / stdWeight > 0.5 ? '#52c41a' : remaining / stdWeight > 0.2 ? '#faad14' : '#ff4d4f';

  const timelineEvents: TimelineEvent[] = lifecycle?.events.map((e) => ({
    timestamp: e.timestamp,
    title: e.eventType.replace(/_/g, ' '),
    description: e.details,
    actor: e.actorName,
    color: eventColors[e.eventType] || 'blue',
  })) ?? [];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>{item.itemCode}</Title>
        <StatusBadge status={item.status} />
      </Space>

      <div style={{ display: 'flex', gap: 16 }}>
        <Card style={{ flex: 1 }}>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Item Code">{item.itemCode}</Descriptions.Item>
            <Descriptions.Item label="Status"><StatusBadge status={item.status} /></Descriptions.Item>
            <Descriptions.Item label="QR Code">
              {item.qrCode}
              <Tooltip title="Copy QR Code">
                <Button type="text" size="small" icon={<CopyOutlined />} onClick={handleCopyQR} style={{ marginLeft: 8 }} />
              </Tooltip>
            </Descriptions.Item>
            <Descriptions.Item label="Lot">
              <DocumentLink type="Lot" id={item.lotId} number={item.lotNumber} />
            </Descriptions.Item>
            <Descriptions.Item label="Store">{item.currentStoreName}</Descriptions.Item>
            <Descriptions.Item label="Location">{item.locationCode || '—'}</Descriptions.Item>
            <Descriptions.Item label="Std Weight">{formatWeight(item.standardWeightKg)}</Descriptions.Item>
            <Descriptions.Item label="Remaining">{formatWeight(item.remainingWeightKg)}</Descriptions.Item>
            <Descriptions.Item label="PO">{item.poNumber}</Descriptions.Item>
            <Descriptions.Item label="Supplier">{item.supplierName}</Descriptions.Item>
            <Descriptions.Item label="Receipt Date">{formatDate(item.receiptDate)}</Descriptions.Item>
            <Descriptions.Item label="Labelled">{formatDateTime(item.labelledAt)}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card style={{ width: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <GaugeChart
            value={remaining}
            max={stdWeight}
            label={`of ${formatWeight(item.standardWeightKg)}`}
            color={gaugeColor}
          />
        </Card>
      </div>

      {timelineEvents.length > 0 && (
        <Card title="Item Lifecycle" style={{ marginTop: 16 }}>
          <TimelineView events={timelineEvents} />
        </Card>
      )}
    </div>
  );
}
