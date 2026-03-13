import {
  Typography, Card, Skeleton, Table, Tag, Button, Space, Alert,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import {
  useGetStockSummaryQuery,
  useGetConsumptionAnalyticsReportQuery,
  useGetTransferReconciliationQuery,
  useGetSupplierPerformanceQuery,
  useGetLossSummaryReportQuery,
} from '~/features/reports/reportsApi';
import { formatWeight, formatNumber } from '~/shared/utils/formatters';
import type { StoreStockSummary } from '~/api/types/reports';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

function StockSummaryView() {
  const { data, isLoading } = useGetStockSummaryQuery();
  if (isLoading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  const cols: ColumnsType<StoreStockSummary> = [
    { title: 'Store', dataIndex: 'storeName' },
    { title: 'Tier', dataIndex: 'tier', width: 110 },
    { title: 'Bags', dataIndex: 'totalBags', width: 80, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'totalWeightKg', width: 100, render: (v: string) => formatWeight(v) },
    { title: 'Reorder Pt', dataIndex: 'reorderPoint', width: 90 },
    {
      title: 'Status',
      dataIndex: 'belowReorderPoint',
      width: 130,
      render: (v: boolean) => v ? <Tag color="red">Below Reorder</Tag> : <Tag color="green">OK</Tag>,
    },
  ];

  return (
    <>
      <Card size="small" style={{ marginBottom: 16 }}>
        <Space size="large">
          <Text strong>System Total: {formatNumber(data.systemTotalBags)} bags</Text>
          <Text strong>Total Weight: {formatWeight(data.systemTotalWeightKg)}</Text>
        </Space>
      </Card>
      <Table columns={cols} dataSource={data.stores} rowKey="storeId" size="small" pagination={false} />
    </>
  );
}

function ConsumptionAnalyticsView() {
  const { data, isLoading } = useGetConsumptionAnalyticsReportQuery();
  if (isLoading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <Text type="secondary">{data.period.from} to {data.period.to}</Text>
      <Table
        style={{ marginTop: 12 }}
        size="small"
        pagination={false}
        dataSource={data.stores}
        rowKey="storeId"
        columns={[
          { title: 'Store', dataIndex: 'storeName' },
          { title: 'Volume (m\u00B3)', dataIndex: 'totalVolumeM3', render: (v: string) => formatNumber(Number(v)) },
          { title: 'Consumed', dataIndex: 'totalConsumedKg', render: (v: string) => formatWeight(v) },
          { title: 'Avg Rate', dataIndex: 'avgRateKgM3' },
          { title: 'Configured', dataIndex: 'configuredRate' },
          { title: 'Anomalies', dataIndex: 'anomalyCount', width: 90 },
          {
            title: 'Anomaly %',
            dataIndex: 'anomalyRatePct',
            width: 100,
            render: (v: string) => {
              const pct = parseFloat(v);
              return <span style={{ color: pct > 10 ? '#ff4d4f' : pct > 5 ? '#faad14' : '#52c41a' }}>{pct.toFixed(1)}%</span>;
            },
          },
        ]}
      />
    </>
  );
}

function TransferReconciliationView() {
  const { data, isLoading } = useGetTransferReconciliationQuery();
  if (isLoading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <Text type="secondary">{data.period.from} to {data.period.to}</Text>
      <Table
        style={{ marginTop: 12 }}
        size="small"
        pagination={false}
        dataSource={data.transfers}
        rowKey="stoNumber"
        columns={[
          { title: 'STO', dataIndex: 'stoNumber' },
          { title: 'Source', dataIndex: 'sourceStore' },
          { title: 'Destination', dataIndex: 'destinationStore' },
          { title: 'Dispatched', dataIndex: 'dispatchedBags', width: 90 },
          { title: 'Received', dataIndex: 'receivedBags', width: 80 },
          { title: 'Shortage', dataIndex: 'shortageBags', width: 80, render: (v: number) => v > 0 ? <Text type="danger">{v}</Text> : '0' },
          { title: 'Damaged', dataIndex: 'damagedBags', width: 80 },
          { title: 'TDN Status', dataIndex: 'tdnStatus', render: (v: string) => <Tag>{v}</Tag> },
          { title: 'Investigation', dataIndex: 'investigationStatus', render: (v: string | null) => v ? <Tag color="red">{v}</Tag> : '—' },
        ]}
      />
    </>
  );
}

function SupplierPerformanceView() {
  const { data, isLoading } = useGetSupplierPerformanceQuery();
  if (isLoading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <Text type="secondary">{data.period.from} to {data.period.to}</Text>
      <Table
        style={{ marginTop: 12 }}
        size="small"
        pagination={false}
        dataSource={data.suppliers}
        rowKey="supplierId"
        columns={[
          { title: 'Supplier', dataIndex: 'supplierName' },
          { title: 'Deliveries', dataIndex: 'totalDeliveries', width: 90 },
          { title: 'On-Time %', dataIndex: 'onTimeRate', width: 90, render: (v: string) => `${v}%` },
          { title: 'Qty Accuracy %', dataIndex: 'quantityAccuracy', width: 120, render: (v: string) => `${v}%` },
          { title: 'Quality Accept %', dataIndex: 'qualityAcceptance', width: 130, render: (v: string) => `${v}%` },
          {
            title: 'Avg Score',
            dataIndex: 'avgScore',
            width: 100,
            render: (v: string) => {
              const score = parseFloat(v);
              const color = score >= 90 ? '#52c41a' : score >= 75 ? '#faad14' : '#ff4d4f';
              return <span style={{ color, fontWeight: 600 }}>{score.toFixed(1)}%</span>;
            },
          },
        ]}
      />
    </>
  );
}

function LossSummaryView() {
  const { data, isLoading } = useGetLossSummaryReportQuery();
  if (isLoading || !data) return <Skeleton active paragraph={{ rows: 6 }} />;

  return (
    <>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Space size="large">
          <Text strong>Total Write-Offs: {data.totalWriteOffs}</Text>
          <Text strong>Total Bags: {formatNumber(data.totalBags)}</Text>
          <Text strong>Loss Rate: {data.lossRatePct}%</Text>
        </Space>
      </Card>
      <Table
        size="small"
        pagination={false}
        dataSource={data.byCategory}
        rowKey="category"
        columns={[
          { title: 'Category', dataIndex: 'category', render: (v: string) => v.replace(/([A-Z])/g, ' $1').trim() },
          { title: 'Count', dataIndex: 'count', width: 70 },
          { title: 'Bags', dataIndex: 'totalBags', width: 70 },
          { title: 'Weight', dataIndex: 'totalWeightKg', width: 100, render: (v: string) => formatWeight(v) },
        ]}
      />
    </>
  );
}

const reportComponents: Record<string, { title: string; component: React.FC }> = {
  'stock-summary': { title: 'Stock Balance Summary', component: StockSummaryView },
  'consumption-analytics': { title: 'Consumption Analytics', component: ConsumptionAnalyticsView },
  'transfer-reconciliation': { title: 'Transfer Reconciliation', component: TransferReconciliationView },
  'supplier-performance': { title: 'Supplier Performance', component: SupplierPerformanceView },
  'loss-summary': { title: 'Loss Summary', component: LossSummaryView },
};

export default function ReportViewerPage() {
  const { reportType } = useParams();
  const navigate = useNavigate();

  const report = reportComponents[reportType!];

  if (!report) {
    return (
      <div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports')}>Back to Reports</Button>
        <Alert message="Unknown report type" type="error" style={{ marginTop: 16 }} />
      </div>
    );
  }

  const ReportComponent = report.component;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/reports')}>Back</Button>
      </Space>
      <Title level={3}>{report.title}</Title>
      <Card>
        <ReportComponent />
      </Card>
    </div>
  );
}
