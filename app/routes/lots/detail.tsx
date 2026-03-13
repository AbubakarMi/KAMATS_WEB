import {
  Typography, Card, Descriptions, Button, Space, Row, Col, Modal, message,
} from 'antd';
import { ArrowLeftOutlined, PrinterOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router';
import { StatusBadge } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { KpiCard } from '~/shared/components/charts';
import { DataTable } from '~/shared/components/tables';
import { useGetLotQuery, useGenerateLabelsMutation } from '~/features/inventory/lotsApi';
import { formatNumber, formatWeight, formatDate, formatDateTime } from '~/shared/utils/formatters';
import type { Item } from '~/api/types/inventory';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function LotDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: lot, isLoading, isError, error, refetch } = useGetLotQuery(id!);
  const [generateLabels, { isLoading: generating }] = useGenerateLabelsMutation();

  const handleGenerateLabels = async () => {
    try {
      const result = await generateLabels({ lotId: id! }).unwrap();
      message.success(`Generated ${result.totalLabels} labels`);
    } catch {
      message.error('Failed to generate labels');
    }
  };

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !lot) return <DetailPageSkeleton descriptionRows={6} hasTable />;

  const itemColumns: ColumnsType<Item> = [
    {
      title: 'Item Code',
      dataIndex: 'itemCode',
      render: (text: string, record: Item) => (
        <Link to={`/items/${record.id}`}>{text}</Link>
      ),
    },
    { title: 'QR Code', dataIndex: 'qrCode', width: 180 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 150,
      render: (status: string) => <StatusBadge status={status} />,
    },
    { title: 'Location', dataIndex: 'locationCode', width: 100, render: (v: string | null) => v || '—' },
    { title: 'Std Weight', dataIndex: 'standardWeightKg', width: 100, render: (v: string) => formatWeight(v) },
    { title: 'Remaining', dataIndex: 'remainingWeightKg', width: 100, render: (v: string) => formatWeight(v) },
  ];

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Space wrap>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/lots')}>Back</Button>
          <Title level={3} style={{ margin: 0 }}>{lot.lotNumber}</Title>
          <StatusBadge status={lot.status} />
        </Space>
        {lot.status === 'PendingLabelling' && (
          <Button type="primary" icon={<PrinterOutlined />} onClick={handleGenerateLabels} loading={generating}>
            Generate Labels
          </Button>
        )}
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}><KpiCard title="Total Bags" value={lot.totalBags} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="In Stock" value={lot.bagsInStock} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Consumed" value={lot.bagsConsumed} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Written Off" value={lot.bagsWrittenOff} /></Col>
      </Row>

      <Card>
        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Lot Number">{lot.lotNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={lot.status} /></Descriptions.Item>
          <Descriptions.Item label="GRN">{lot.grnNumber}</Descriptions.Item>
          <Descriptions.Item label="PO">{lot.poNumber}</Descriptions.Item>
          <Descriptions.Item label="Supplier">{lot.supplierName}</Descriptions.Item>
          <Descriptions.Item label="Store">{lot.storeName}</Descriptions.Item>
          <Descriptions.Item label="Receipt Date">{formatDate(lot.receiptDate)}</Descriptions.Item>
          <Descriptions.Item label="Standard Weight">{formatWeight(lot.standardWeightKg)}</Descriptions.Item>
          <Descriptions.Item label="FIFO Sequence">{lot.fifoSequence}</Descriptions.Item>
          <Descriptions.Item label="Bags Reserved">{formatNumber(lot.bagsReserved)}</Descriptions.Item>
          <Descriptions.Item label="Bags In Transit">{formatNumber(lot.bagsInTransit)}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(lot.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={`Items (${lot.items?.length ?? 0})`} style={{ marginTop: 16 }}>
        <DataTable<Item>
          columns={itemColumns}
          dataSource={lot.items ?? []}
          rowKey="id"
          showSearch={false}
          showExport={false}
        />
      </Card>
    </div>
  );
}
