import {
  Typography, Card, Descriptions, Table, Tag, Button, Space, Progress, Alert,
} from 'antd';
import { ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { useGetReceiptQuery, useGetShortageReportQuery } from '~/features/receipt/receiptApi';
import { formatNumber, formatDateTime } from '~/shared/utils/formatters';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface ReceivedItem {
  itemId: string;
  itemCode: string;
  condition: string;
  scannedAt: string;
  damageNotes: string | null;
}

interface MissingItem {
  itemId: string;
  itemCode: string;
}

export default function ReceiptDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: receipt, isLoading, isError, error, refetch } = useGetReceiptQuery(id!);
  const { data: shortageReport } = useGetShortageReportQuery(id!, {
    skip: !receipt || receipt.missingItems.length === 0,
  });

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !receipt) return <DetailPageSkeleton descriptionRows={8} hasTable />;

  const scanProgress = receipt.expectedBags > 0
    ? Math.round((receipt.scannedCount / receipt.expectedBags) * 100)
    : 0;

  const receivedColumns: ColumnsType<ReceivedItem> = [
    { title: 'Item Code', dataIndex: 'itemCode' },
    {
      title: 'Condition',
      dataIndex: 'condition',
      render: (v: string) => <Tag color={v === 'Good' ? 'green' : 'red'}>{v}</Tag>,
    },
    { title: 'Scanned At', dataIndex: 'scannedAt', render: (v: string) => formatDateTime(v) },
    { title: 'Damage Notes', dataIndex: 'damageNotes', render: (v: string | null) => v ?? '—' },
  ];

  const missingColumns: ColumnsType<MissingItem> = [
    { title: 'Item Code', dataIndex: 'itemCode' },
    { title: 'Item ID', dataIndex: 'itemId' },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
      </Space>

      <Title level={3} style={{ marginBottom: 16 }}>
        Receipt — {receipt.grdNumber}
      </Title>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="GRD Number">{receipt.grdNumber}</Descriptions.Item>
          <Descriptions.Item label="TDN">
            <DocumentLink type="TDN" id={receipt.tdnId} number={receipt.tdnNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="STO">
            <DocumentLink type="STO" id={receipt.stoId} number={receipt.stoNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Source Store">{receipt.sourceStoreName}</Descriptions.Item>
          <Descriptions.Item label="Expected Bags">{formatNumber(receipt.expectedBags)}</Descriptions.Item>
          <Descriptions.Item label="Scanned">{formatNumber(receipt.scannedCount)}</Descriptions.Item>
          <Descriptions.Item label="Arrival">{formatDateTime(receipt.arrivalAt)}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(receipt.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Scan Progress" style={{ marginBottom: 16 }}>
        <Progress
          percent={scanProgress}
          status={scanProgress >= 100 ? 'success' : 'active'}
          format={() => `${formatNumber(receipt.scannedCount)} / ${formatNumber(receipt.expectedBags)} bags`}
        />
      </Card>

      {receipt.missingItems.length > 0 && (
        <Alert
          message="Missing Items Detected"
          description={`${receipt.missingItems.length} items were not scanned during receipt.`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      {receipt.receivedItems.length > 0 && (
        <Card title="Received Items" style={{ marginBottom: 16 }}>
          <Table<ReceivedItem>
            columns={receivedColumns}
            dataSource={receipt.receivedItems}
            rowKey="itemId"
            size="small"
            pagination={false}
          />
        </Card>
      )}

      {receipt.missingItems.length > 0 && (
        <Card title="Missing Items" style={{ marginBottom: 16 }}>
          <Table<MissingItem>
            columns={missingColumns}
            dataSource={receipt.missingItems}
            rowKey="itemId"
            size="small"
            pagination={false}
          />
        </Card>
      )}

      {shortageReport && (
        <Card title="Shortage Report">
          <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
            <Descriptions.Item label="Dispatched">{formatNumber(shortageReport.dispatchedBags)} bags</Descriptions.Item>
            <Descriptions.Item label="Received">{formatNumber(shortageReport.receivedBags)} bags</Descriptions.Item>
            <Descriptions.Item label="Shortage">{formatNumber(shortageReport.shortageBags)} bags</Descriptions.Item>
            <Descriptions.Item label="Investigation Status">
              <Tag color={shortageReport.investigationStatus === 'Open' ? 'red' : 'blue'}>
                {shortageReport.investigationStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Source">{shortageReport.sourceStoreName}</Descriptions.Item>
            <Descriptions.Item label="Destination">{shortageReport.destinationStoreName}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}
    </div>
  );
}
