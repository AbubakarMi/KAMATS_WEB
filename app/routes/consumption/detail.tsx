import { useState } from 'react';
import {
  Typography, Card, Descriptions, Table, Button, Space, Tag, Modal, Input, message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { KpiCard } from '~/shared/components/charts';
import { useCanPerformAction } from '~/shared/hooks';
import { Permissions as P } from '~/shared/utils/permissions';
import {
  useGetConsumptionEntryQuery,
  useAcknowledgeAnomalyMutation,
} from '~/features/consumption/consumptionApi';
import { formatWeight, formatNumber, formatDateTime, formatPercentage } from '~/shared/utils/formatters';
import { sanitizeString } from '~/shared/utils';
import { anomalyLevelColors } from '~/shared/utils/statusColors';
import type { ConsumptionItem } from '~/api/types/consumption';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ConsumptionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: entry, isLoading, isError, error, refetch } = useGetConsumptionEntryQuery(id!);
  const [acknowledgeAnomaly] = useAcknowledgeAnomalyMutation();
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [ackNotes, setAckNotes] = useState('');

  const { canPerform: canAcknowledge } = useCanPerformAction(P.CONSUMPTION_ACKNOWLEDGE, entry?.operatorId);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !entry) return <DetailPageSkeleton hasKpiCards kpiCount={4} descriptionRows={10} hasTable />;

  const itemColumns: ColumnsType<ConsumptionItem> = [
    { title: 'Item Code', dataIndex: 'itemCode' },
    { title: 'Lot', dataIndex: 'lotNumber' },
    { title: 'Partial', dataIndex: 'isPartial', render: (v: boolean) => v ? <Tag color="blue">Partial</Tag> : <Tag>Full</Tag> },
    { title: 'Consumed', dataIndex: 'weightConsumedKg', render: (v: string) => formatWeight(v) },
    { title: 'Remaining', dataIndex: 'remainingWeightKg', render: (v: string | null) => v ? formatWeight(v) : '—' },
    { title: 'Scanned', dataIndex: 'scannedAt', render: (v: string) => formatDateTime(v) },
  ];

  const handleAcknowledge = async () => {
    try {
      await acknowledgeAnomaly({ id: id!, body: { acknowledgmentNotes: sanitizeString(ackNotes) } }).unwrap();
      message.success('Anomaly acknowledged');
      setAckModalOpen(false);
      setAckNotes('');
    } catch {
      message.error('Failed to acknowledge anomaly');
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/consumption')}>Back</Button>
      </Space>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{entry.consumptionNumber}</Title>
        <Space wrap>
          {entry.status === 'PendingAcknowledgment' && canAcknowledge && (
            <Button type="primary" onClick={() => setAckModalOpen(true)}>
              Acknowledge Anomaly
            </Button>
          )}
        </Space>
      </div>

      <Space wrap style={{ marginBottom: 16, width: '100%' }}>
        <KpiCard title="Volume Treated" value={`${formatNumber(Number(entry.volumeTreatedM3))} m\u00B3`} />
        <KpiCard title="Suggested" value={formatWeight(entry.suggestedQtyKg)} />
        <KpiCard title="Actual" value={entry.actualQtyKg ? formatWeight(entry.actualQtyKg) : '—'} />
        <KpiCard title="Bags Used" value={entry.actualQtyBags ?? 0} />
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Store">{entry.storeName}</Descriptions.Item>
          <Descriptions.Item label="Operator">{entry.operatorName}</Descriptions.Item>
          <Descriptions.Item label="Session Ref">{entry.treatmentSessionRef}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={entry.status} /></Descriptions.Item>
          <Descriptions.Item label="Standard Rate">{entry.standardDosageRate} kg/m\u00B3</Descriptions.Item>
          <Descriptions.Item label="Seasonal Multiplier">{entry.seasonalMultiplier}</Descriptions.Item>
          <Descriptions.Item label="Deviation">
            {entry.deviationPct != null ? (
              <Text style={{ color: Math.abs(parseFloat(entry.deviationPct)) > 30 ? '#ff4d4f' : Math.abs(parseFloat(entry.deviationPct)) > 15 ? '#faad14' : undefined }}>
                {parseFloat(entry.deviationPct) > 0 ? '+' : ''}{parseFloat(entry.deviationPct).toFixed(1)}%
              </Text>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Efficiency Ratio">{entry.efficiencyRatio ?? '—'}</Descriptions.Item>
          <Descriptions.Item label="Anomaly Level">
            {entry.anomalyLevel ? (
              <Tag color={anomalyLevelColors[entry.anomalyLevel]}>
                {entry.anomalyLevel.replace(/([A-Z])/g, ' $1').trim()}
              </Tag>
            ) : '—'}
          </Descriptions.Item>
          <Descriptions.Item label="Recorded">{formatDateTime(entry.recordedAt)}</Descriptions.Item>
          {entry.supervisorAckByName && (
            <>
              <Descriptions.Item label="Acknowledged By">{entry.supervisorAckByName}</Descriptions.Item>
              <Descriptions.Item label="Acknowledged At">{entry.supervisorAckAt ? formatDateTime(entry.supervisorAckAt) : '—'}</Descriptions.Item>
              {entry.supervisorAckNotes && (
                <Descriptions.Item label="Acknowledgment Notes" span={3}>{entry.supervisorAckNotes}</Descriptions.Item>
              )}
            </>
          )}
        </Descriptions>
      </Card>

      {entry.items.length > 0 && (
        <Card title="Consumed Items">
          <Table<ConsumptionItem>
            columns={itemColumns}
            dataSource={entry.items}
            rowKey="itemId"
            size="small"
            pagination={false}
          />
        </Card>
      )}

      <Modal
        title="Acknowledge Anomaly"
        open={ackModalOpen}
        onOk={handleAcknowledge}
        onCancel={() => { setAckModalOpen(false); setAckNotes(''); }}
        okText="Acknowledge"
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
          This consumption entry has a {entry.anomalyLevel?.replace(/([A-Z])/g, ' $1').trim()} anomaly.
          Please provide notes explaining the deviation.
        </Text>
        <TextArea
          rows={4}
          value={ackNotes}
          onChange={(e) => setAckNotes(e.target.value)}
          placeholder="Enter acknowledgment notes..."
        />
      </Modal>
    </div>
  );
}
