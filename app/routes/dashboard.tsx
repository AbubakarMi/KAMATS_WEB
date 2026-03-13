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
import { useAuth } from '~/shared/hooks';
import type { ColumnsType } from 'antd/es/table';
import type { StoreStockSummary } from '~/api/types/reports';

const { Text } = Typography;

const severityHex: Record<string, string> = {
  Info: '#2563EB',
  Warning: '#D97706',
  Significant: '#DC2626',
  Critical: '#BE185D',
};

export default function Dashboard() {
  const { user } = useAuth();
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
      render: (v: boolean) => v
        ? <Tag color="red" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
            Below Reorder
          </Tag>
        : <Tag color="green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
            OK
          </Tag>,
    },
  ];

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div>
      {/* Welcome section */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            fontFamily: '"Outfit", sans-serif',
            color: '#0F172A',
            margin: '0 0 4px',
            letterSpacing: '-0.01em',
          }}
        >
          {greeting}, {user?.firstName ?? 'there'}
        </h2>
        <Text style={{ color: '#94A3B8', fontSize: 14 }}>
          Here's what's happening across your facilities today.
        </Text>
      </div>

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
            trendColor={openAlerts.length > 0 ? '#DC2626' : '#059669'}
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
            trendColor={parseFloat(loss?.lossRatePct ?? '0') > 2 ? '#DC2626' : '#059669'}
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
            trendColor={totalShortage > 0 ? '#D97706' : '#059669'}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Stock by Store */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <DatabaseOutlined style={{ color: '#2563EB', fontSize: 14 }} />
                </div>
                <span>Stock by Store</span>
              </div>
            }
            extra={<Link to="/reports/stock-summary"><Text style={{ color: '#2563EB', fontSize: 13, fontWeight: 500 }}>View Report</Text></Link>}
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
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AlertOutlined style={{ color: '#DC2626', fontSize: 14 }} />
                </div>
                <span>Recent Alerts</span>
              </div>
            }
            extra={<Link to="/alerts"><Text style={{ color: '#2563EB', fontSize: 13, fontWeight: 500 }}>View All</Text></Link>}
            loading={alertsLoading}
          >
            {alertsError && <QueryErrorAlert error={alertsErr} onRetry={refetchAlerts} />}
            {!alertsError && openAlerts.length === 0 ? (
              <Space style={{ padding: 16 }}>
                <CheckCircleFilled style={{ color: '#059669', fontSize: 20 }} />
                <Text>No open alerts</Text>
              </Space>
            ) : !alertsError && (
              <List
                size="small"
                dataSource={openAlerts}
                renderItem={(alert) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<ExclamationCircleFilled style={{ color: severityHex[alert.severity] ?? '#2563EB', fontSize: 18, marginTop: 4 }} />}
                      title={<span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{alert.title}</span>}
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
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#FFFBEB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <WarningOutlined style={{ color: '#D97706', fontSize: 14 }} />
                </div>
                <span>Monthly Loss Trend</span>
              </div>
            }
            extra={<Link to="/loss/summary"><Text style={{ color: '#2563EB', fontSize: 13, fontWeight: 500 }}>View Report</Text></Link>}
            loading={lossLoading}
          >
            {lossError && <QueryErrorAlert error={lossErr} onRetry={refetchLoss} />}
            {!lossError && loss?.monthlyTrend && loss.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={loss.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis yAxisId="bags" orientation="left" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <YAxis yAxisId="pct" orientation="right" unit="%" tick={{ fontSize: 12, fill: '#94A3B8' }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: 13,
                    }}
                  />
                  <Area yAxisId="bags" type="monotone" dataKey="totalBags" stroke="#2563EB" fill="#2563EB" fillOpacity={0.1} strokeWidth={2} name="Bags Lost" />
                  <Area yAxisId="pct" type="monotone" dataKey="lossRatePct" stroke="#DC2626" fill="#DC2626" fillOpacity={0.05} strokeWidth={2} name="Loss Rate %" />
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
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: '#F0FDFA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <SwapOutlined style={{ color: '#0D9488', fontSize: 14 }} />
                </div>
                <span>Stores Below Reorder Point</span>
              </div>
            }
            loading={stockLoading}
          >
            {transfersError && <QueryErrorAlert error={transfersErr} onRetry={refetchTransfers} />}
            {!transfersError && storesBelow.length === 0 ? (
              <Space style={{ padding: 16 }}>
                <CheckCircleFilled style={{ color: '#059669', fontSize: 20 }} />
                <Text>All stores above reorder point</Text>
              </Space>
            ) : !transfersError && (
              <List
                size="small"
                dataSource={storesBelow}
                renderItem={(store) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<WarningOutlined style={{ color: '#DC2626', fontSize: 18, marginTop: 4 }} />}
                      title={<span style={{ fontWeight: 600, fontSize: 13, color: '#1E293B' }}>{store.storeName}</span>}
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
