import { Typography, Row, Col, Card, Table, Tag, Space, List } from 'antd';
import {
  WarningOutlined, AlertOutlined, DatabaseOutlined, SwapOutlined,
  ExclamationCircleFilled, CheckCircleFilled,
} from '@ant-design/icons';
import { Link } from 'react-router';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KpiCard } from '~/shared/components/charts/KpiCard';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DashboardSkeleton } from '~/shared/components/skeletons';
import { useGetStockSummaryQuery, useGetLossSummaryReportQuery, useGetTransferReconciliationQuery } from '~/features/reports/reportsApi';
import { useGetAlertsQuery } from '~/features/alerts/alertsApi';
import { formatNumber, formatWeight, formatDateTime } from '~/shared/utils/formatters';
import { alertSeverityColors } from '~/shared/utils/statusColors';
import type { ColumnsType } from 'antd/es/table';
import type { StoreStockSummary } from '~/api/types/reports';

const { Title, Text } = Typography;

const severityHex: Record<string, string> = {
  Info: '#1677ff',
  Warning: '#faad14',
  Significant: '#ff4d4f',
  Critical: '#eb2f96',
};

export default function Dashboard() {
  const { data: stock, isLoading: stockLoading, isError: stockError, error: stockErr, refetch: refetchStock } = useGetStockSummaryQuery();
  const { data: loss, isLoading: lossLoading, isError: lossError, error: lossErr, refetch: refetchLoss } = useGetLossSummaryReportQuery();
  const { data: alertsData, isLoading: alertsLoading, isError: alertsError, error: alertsErr, refetch: refetchAlerts } = useGetAlertsQuery({ page: 1, pageSize: 5, status: 'Open' });
  const { data: transfers, isLoading: transfersLoading, isError: transfersError, error: transfersErr, refetch: refetchTransfers } = useGetTransferReconciliationQuery();

  const allInitialLoading = stockLoading && lossLoading && alertsLoading && transfersLoading;

  if (allInitialLoading) return <DashboardSkeleton />;

  const openAlerts = alertsData?.data ?? [];
  const storesBelow = stock?.stores.filter((s) => s.belowReorderPoint) ?? [];
  const totalShortage = transfers?.transfers.reduce((sum, t) => sum + t.shortageBags, 0) ?? 0;

  const stockCols: ColumnsType<StoreStockSummary> = [
    { title: 'Store', dataIndex: 'storeName', ellipsis: true },
    { title: 'Bags', dataIndex: 'totalBags', width: 80, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'totalWeightKg', width: 100, render: (v: string) => formatWeight(v) },
    {
      title: 'Status',
      dataIndex: 'belowReorderPoint',
      width: 130,
      render: (v: boolean) => v ? <Tag color="red">Below Reorder</Tag> : <Tag color="green">OK</Tag>,
    },
  ];

  return (
    <div>
      <Title level={3}>Executive Dashboard</Title>

      {/* KPI Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="System Stock"
            value={stock?.systemTotalBags ?? 0}
            suffix="bags"
            loading={stockLoading}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="Open Alerts"
            value={openAlerts.length}
            loading={alertsLoading}
            trendColor={openAlerts.length > 0 ? '#ff4d4f' : '#52c41a'}
            trend={openAlerts.length > 0 ? 'up' : 'stable'}
            trendValue={openAlerts.length > 0 ? 'Action required' : 'All clear'}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="Loss Rate"
            value={loss?.lossRatePct ?? '0'}
            suffix="%"
            loading={lossLoading}
            trend={parseFloat(loss?.lossRatePct ?? '0') > 2 ? 'up' : 'stable'}
            trendValue={`${loss?.totalBags ?? 0} bags lost`}
            trendColor={parseFloat(loss?.lossRatePct ?? '0') > 2 ? '#ff4d4f' : '#52c41a'}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <KpiCard
            title="Transfer Shortages"
            value={totalShortage}
            suffix="bags"
            loading={transfersLoading}
            trend={totalShortage > 0 ? 'down' : 'stable'}
            trendValue={totalShortage > 0 ? 'Investigate' : 'No shortages'}
            trendColor={totalShortage > 0 ? '#faad14' : '#52c41a'}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Stock by Store */}
        <Col xs={24} lg={14}>
          <Card
            title={<><DatabaseOutlined /> Stock by Store</>}
            extra={<Link to="/reports/stock-summary"><Text type="secondary">View Full Report</Text></Link>}
            loading={stockLoading}
          >
            {stockError && <QueryErrorAlert error={stockErr} onRetry={refetchStock} />}
            {!stockError && (
              <Table<StoreStockSummary>
                columns={stockCols}
                dataSource={stock?.stores ?? []}
                rowKey="storeId"
                size="small"
                pagination={false}
              />
            )}
          </Card>
        </Col>

        {/* Open Alerts */}
        <Col xs={24} lg={10}>
          <Card
            title={<><AlertOutlined /> Recent Alerts</>}
            extra={<Link to="/alerts"><Text type="secondary">View All</Text></Link>}
            loading={alertsLoading}
          >
            {alertsError && <QueryErrorAlert error={alertsErr} onRetry={refetchAlerts} />}
            {!alertsError && openAlerts.length === 0 ? (
              <Space style={{ padding: 16 }}>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                <Text>No open alerts</Text>
              </Space>
            ) : !alertsError && (
              <List
                size="small"
                dataSource={openAlerts}
                renderItem={(alert) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ExclamationCircleFilled style={{ color: severityHex[alert.severity] ?? '#1677ff', fontSize: 18, marginTop: 4 }} />}
                      title={alert.title}
                      description={
                        <Space size={4}>
                          <Tag color={alertSeverityColors[alert.severity] ?? 'blue'}>{alert.severity}</Tag>
                          <Text type="secondary" style={{ fontSize: 12 }}>{formatDateTime(alert.createdAt)}</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Loss Trend */}
        <Col xs={24} lg={14}>
          <Card
            title={<><WarningOutlined /> Monthly Loss Trend</>}
            extra={<Link to="/loss/summary"><Text type="secondary">View Full Report</Text></Link>}
            loading={lossLoading}
          >
            {lossError && <QueryErrorAlert error={lossErr} onRetry={refetchLoss} />}
            {!lossError && loss?.monthlyTrend && loss.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={loss.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="bags" orientation="left" />
                  <YAxis yAxisId="pct" orientation="right" unit="%" />
                  <Tooltip />
                  <Area yAxisId="bags" type="monotone" dataKey="totalBags" stroke="#1565C0" fill="#1565C0" fillOpacity={0.2} name="Bags Lost" />
                  <Area yAxisId="pct" type="monotone" dataKey="lossRatePct" stroke="#ff4d4f" fill="#ff4d4f" fillOpacity={0.1} name="Loss Rate %" />
                </AreaChart>
              </ResponsiveContainer>
            ) : !lossError && (
              <Text type="secondary">No loss data available</Text>
            )}
          </Card>
        </Col>

        {/* Reorder Alerts */}
        <Col xs={24} lg={10}>
          <Card
            title={<><SwapOutlined /> Stores Below Reorder Point</>}
            loading={stockLoading}
          >
            {transfersError && <QueryErrorAlert error={transfersErr} onRetry={refetchTransfers} />}
            {!transfersError && storesBelow.length === 0 ? (
              <Space style={{ padding: 16 }}>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 20 }} />
                <Text>All stores above reorder point</Text>
              </Space>
            ) : !transfersError && (
              <List
                size="small"
                dataSource={storesBelow}
                renderItem={(store) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<WarningOutlined style={{ color: '#ff4d4f', fontSize: 18, marginTop: 4 }} />}
                      title={store.storeName}
                      description={`${formatNumber(store.totalBags)} bags / Reorder at ${store.reorderPoint}`}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
