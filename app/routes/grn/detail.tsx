import {
  Typography, Card, Descriptions, Button, Space, Image,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { useGetGRNQuery } from '~/features/grn/grnApi';
import { formatNumber, formatWeight, formatDateTime } from '~/shared/utils/formatters';

const { Title, Text } = Typography;

export default function GRNDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: grn, isLoading, isError, error, refetch } = useGetGRNQuery(id!);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !grn) return <DetailPageSkeleton descriptionRows={10} hasTable />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/grn')}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>{grn.grnNumber}</Title>
        <StatusBadge status={grn.status} />
      </Space>

      <Card>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="GRN #">{grn.grnNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={grn.status} /></Descriptions.Item>
          <Descriptions.Item label="PO">
            <DocumentLink type="PO" id={grn.poId} number={grn.poNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Weighbridge Ticket">
            <DocumentLink type="WT" id={grn.weighbridgeTicketId} number={grn.ticketNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Store">{grn.storeName}</Descriptions.Item>
          <Descriptions.Item label="Net Weight">{formatWeight(grn.netWeightKg)}</Descriptions.Item>
          <Descriptions.Item label="Received By">{grn.receivedByName}</Descriptions.Item>
          <Descriptions.Item label="Witness">{grn.witnessName}</Descriptions.Item>
          <Descriptions.Item label="Received At">{formatDateTime(grn.receivedAt)}</Descriptions.Item>
          <Descriptions.Item label="Submitted At">{formatDateTime(grn.submittedAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Bag Count" style={{ marginTop: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }} size="small">
          <Descriptions.Item label="Bags on Truck">{grn.bagsOnTruck !== null ? formatNumber(grn.bagsOnTruck) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Bags Damaged">{grn.bagsDamaged !== null ? formatNumber(grn.bagsDamaged) : '—'}</Descriptions.Item>
          <Descriptions.Item label="Bags Accepted">{grn.bagsAccepted !== null ? formatNumber(grn.bagsAccepted) : '—'}</Descriptions.Item>
        </Descriptions>
        {grn.conditionNotes && (
          <div style={{ marginTop: 12 }}>
            <Text strong>Condition Notes: </Text>
            <Text>{grn.conditionNotes}</Text>
          </div>
        )}
        {grn.crossReferenceWarning && (
          <div style={{ marginTop: 8 }}>
            <Text type="warning">{grn.crossReferenceWarning}</Text>
          </div>
        )}
      </Card>

      {grn.photoUrls.length > 0 && (
        <Card title="Condition Photos" style={{ marginTop: 16 }}>
          <Image.PreviewGroup>
            <Space wrap>
              {grn.photoUrls.map((url, i) => (
                <Image
                  key={i}
                  width={120}
                  height={120}
                  src={url}
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYmZiZmJmIiBmb250LXNpemU9IjEyIj5QaG90bzwvdGV4dD48L3N2Zz4="
                  style={{ objectFit: 'cover' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}

      {grn.lotCreated && (
        <Card title="Linked Lot" style={{ marginTop: 16 }}>
          <DocumentLink type="Lot" id={grn.lotCreated.lotId} number={grn.lotCreated.lotNumber} />
          <Text style={{ marginLeft: 12 }}>{formatNumber(grn.lotCreated.totalBags)} bags</Text>
        </Card>
      )}
    </div>
  );
}
