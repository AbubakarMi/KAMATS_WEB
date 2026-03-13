import {
  Typography, Card, Row, Col, Table, Tag,
} from 'antd';
import { useParams } from 'react-router';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { KpiCard } from '~/shared/components/charts';
import {
  useGetConsumptionAnalyticsQuery,
  useGetConsumptionTrendsQuery,
  useGetOperatorPatternsQuery,
} from '~/features/dosage/dosageApi';
import { formatWeight, formatNumber } from '~/shared/utils/formatters';
import { anomalyLevelColors } from '~/shared/utils/statusColors';
import type { OperatorPattern } from '~/api/types/consumption';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function DosageAnalyticsPage() {
  const { storeId } = useParams();
  const { data: analytics, isLoading: analyticsLoading } = useGetConsumptionAnalyticsQuery(storeId!);
  const { data: trends } = useGetConsumptionTrendsQuery(storeId!);
  const { data: operatorData } = useGetOperatorPatternsQuery(storeId!);

  const operatorColumns: ColumnsType<OperatorPattern> = [
    { title: 'Operator', dataIndex: 'operatorName' },
    { title: 'Entries', dataIndex: 'totalEntries', width: 80 },
    { title: 'Avg Rate (kg/m\u00B3)', dataIndex: 'avgRateKgM3', width: 130 },
    { title: 'Anomalies', dataIndex: 'anomalyCount', width: 90 },
    {
      title: 'Anomaly Rate',
      dataIndex: 'anomalyRatePct',
      width: 100,
      render: (v: string) => {
        const pct = parseFloat(v);
        const color = pct > 10 ? '#ff4d4f' : pct > 5 ? '#faad14' : '#52c41a';
        return <span style={{ color }}>{pct.toFixed(1)}%</span>;
      },
    },
  ];

  if (analyticsLoading || !analytics) {
    return (
      <div>
        <Title level={3}>Consumption Analytics</Title>
        <Card loading><Text type="secondary">Loading analytics...</Text></Card>
      </div>
    );
  }

  const { summary } = analytics;
  const trendArrow = trends?.rolling30DayTrend === 'up' ? '\u2191' : trends?.rolling30DayTrend === 'down' ? '\u2193' : '\u2194';

  return (
    <div>
      <Title level={3}>{analytics.storeName} — Consumption Analytics</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {analytics.period.from} to {analytics.period.to}
      </Text>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={4}><KpiCard title="Entries" value={summary.totalEntries} /></Col>
        <Col xs={12} sm={8} md={4}><KpiCard title="Volume (m\u00B3)" value={formatNumber(Number(summary.totalVolumeM3))} /></Col>
        <Col xs={12} sm={8} md={4}><KpiCard title="Consumed" value={formatWeight(summary.totalConsumedKg)} /></Col>
        <Col xs={12} sm={8} md={4}><KpiCard title="Avg Rate" value={`${summary.averageRateKgM3} kg/m\u00B3`} /></Col>
        <Col xs={12} sm={8} md={4}><KpiCard title="Anomaly Rate" value={`${summary.anomalyRatePct}%`} /></Col>
        <Col xs={12} sm={8} md={4}>
          <KpiCard
            title="30-Day Trend"
            value={`${trends?.rolling30DayRate ?? '—'} ${trendArrow}`}
          />
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" title="Anomaly Breakdown">
            {Object.entries(analytics.anomalyBreakdown).map(([level, count]) => (
              <div key={level} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <Tag color={anomalyLevelColors[level]}>{level.replace(/([A-Z])/g, ' $1').trim()}</Tag>
                <Text strong>{count as number}</Text>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={18}>
          <Card title="Daily Consumption">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={analytics.dailyConsumption}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="consumedKg" name="Consumed (kg)" stroke="#1565C0" fill="#1565C0" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {trends && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Card title="Delivery vs Consumption">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={trends.deliveryVsConsumption}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receivedKg" name="Received (kg)" fill="#52c41a" />
                  <Bar dataKey="consumedKg" name="Consumed (kg)" fill="#faad14" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Lot Consumption Velocity">
              <Table
                size="small"
                columns={[
                  { title: 'Lot', dataIndex: 'lotNumber' },
                  { title: 'Bags/Day', dataIndex: 'bagsPerDay', render: (v: number) => v.toFixed(1) },
                ]}
                dataSource={trends.lotConsumptionVelocity}
                rowKey="lotNumber"
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      )}

      {operatorData && operatorData.operators.length > 0 && (
        <Card title="Operator Patterns">
          <Table<OperatorPattern>
            columns={operatorColumns}
            dataSource={operatorData.operators}
            rowKey="operatorId"
            size="small"
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}
