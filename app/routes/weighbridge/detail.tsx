import {
  Typography, Card, Descriptions, Button, Space, Tag,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { useGetWeighbridgeTicketQuery } from '~/features/weighbridge/weighbridgeApi';
import { formatWeight, formatPercentage, formatDateTime } from '~/shared/utils/formatters';

const { Title, Text } = Typography;

export default function WeighbridgeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ticket, isLoading, isError, error, refetch } = useGetWeighbridgeTicketQuery(id!);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !ticket) return <DetailPageSkeleton hasKpiCards kpiCount={3} descriptionRows={6} />;

  const varianceNum = ticket.variancePct ? Math.abs(parseFloat(ticket.variancePct)) : 0;
  const varianceColor = varianceNum <= 2 ? 'green' : varianceNum <= 5 ? 'orange' : 'red';

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/weighbridge')}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>{ticket.ticketNumber}</Title>
        <StatusBadge status={ticket.status} />
      </Space>

      <Card>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Ticket #">{ticket.ticketNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={ticket.status} /></Descriptions.Item>
          <Descriptions.Item label="PO">
            <DocumentLink type="PO" id={ticket.poId} number={ticket.poNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="DVR">
            <DocumentLink type="DVR" id={ticket.dvrId} number={ticket.dvrNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Supplier">{ticket.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Driver">{ticket.driverName} ({ticket.driverIdNumber})</Descriptions.Item>
          <Descriptions.Item label="Vehicle">{ticket.vehicleReg}</Descriptions.Item>
          <Descriptions.Item label="PO Qty (kg)">{formatWeight(ticket.poQuantityKg)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Weight Progression" style={{ marginTop: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Gross Weight">
            {formatWeight(ticket.grossWeightKg)}
            {ticket.grossManual && <Tag color="orange" style={{ marginLeft: 8 }}>Manual</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Gross Recorded">{formatDateTime(ticket.grossWeightAt)}</Descriptions.Item>
          <Descriptions.Item label="Tare Weight">
            {formatWeight(ticket.tareWeightKg)}
            {ticket.tareManual && <Tag color="orange" style={{ marginLeft: 8 }}>Manual</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="Tare Recorded">{formatDateTime(ticket.tareWeightAt)}</Descriptions.Item>
          <Descriptions.Item label="Net Weight">{formatWeight(ticket.netWeightKg)}</Descriptions.Item>
          <Descriptions.Item label="Variance">
            {ticket.variancePct ? <Tag color={varianceColor}>{formatPercentage(ticket.variancePct)}</Tag> : '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {ticket.overrideReason && (
        <Card title="Override Details" style={{ marginTop: 16 }}>
          <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
            <Descriptions.Item label="Override Reason" span={2}>{ticket.overrideReason}</Descriptions.Item>
            <Descriptions.Item label="Override At">{formatDateTime(ticket.overrideAt)}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {ticket.rejectionReason && (
        <Card title="Rejection" style={{ marginTop: 16 }}>
          <Text type="danger">{ticket.rejectionReason}</Text>
        </Card>
      )}

      <Card title="Cross References" style={{ marginTop: 16 }}>
        <Space size="large">
          <DocumentLink type="PO" id={ticket.poId} number={ticket.poNumber} />
          <DocumentLink type="DVR" id={ticket.dvrId} number={ticket.dvrNumber} />
        </Space>
      </Card>
    </div>
  );
}
