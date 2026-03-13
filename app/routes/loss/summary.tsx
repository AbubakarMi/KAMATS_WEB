import {
  Typography, Card, Row, Col, Table, Tag,
} from 'antd';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import { KpiCard } from '~/shared/components/charts';
import { useGetLossSummaryQuery } from '~/features/loss/lossApi';
import { formatWeight, formatNumber } from '~/shared/utils/formatters';
import { writeOffCategoryColors } from '~/shared/utils/statusColors';
import type { LossCategoryBreakdown, StoreLossSummary } from '~/api/types/loss';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const PIE_COLORS = ['#ff4d4f', '#faad14', '#1890ff', '#722ed1', '#eb2f96'];

export default function LossSummaryPage() {
  const { data: summary, isLoading } = useGetLossSummaryQuery();

  if (isLoading || !summary) {
    return (
      <div>
        <Title level={3}>Loss Summary</Title>
        <Card loading><Text type="secondary">Loading...</Text></Card>
      </div>
    );
  }

  const categoryColumns: ColumnsType<LossCategoryBreakdown> = [
    {
      title: 'Category',
      dataIndex: 'category',
      render: (v: string) => <Tag color={writeOffCategoryColors[v]}>{v.replace(/([A-Z])/g, ' $1').trim()}</Tag>,
    },
    { title: 'Count', dataIndex: 'count', width: 70 },
    { title: 'Bags', dataIndex: 'totalBags', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'totalWeightKg', width: 100, render: (v: string) => formatWeight(v) },
  ];

  const storeColumns: ColumnsType<StoreLossSummary> = [
    { title: 'Store', dataIndex: 'storeName' },
    { title: 'Bags', dataIndex: 'totalBags', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'totalWeightKg', width: 100, render: (v: string) => formatWeight(v) },
    {
      title: 'Loss Rate',
      dataIndex: 'lossRatePct',
      width: 90,
      render: (v: string) => {
        const pct = parseFloat(v);
        const color = pct > 3 ? '#ff4d4f' : pct > 1.5 ? '#faad14' : '#52c41a';
        return <span style={{ color, fontWeight: 600 }}>{pct.toFixed(2)}%</span>;
      },
    },
  ];

  const pieData = summary.byCategory.map((c) => ({
    name: c.category.replace(/([A-Z])/g, ' $1').trim(),
    value: c.totalBags,
  }));

  return (
    <div>
      <Title level={3}>Loss Summary</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {summary.period.from} to {summary.period.to}
      </Text>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}><KpiCard title="Total Write-Offs" value={summary.totalWriteOffs} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Total Bags Lost" value={formatNumber(summary.totalBags)} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Total Weight Lost" value={formatWeight(summary.totalWeightKg)} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Loss Rate" value={`${summary.lossRatePct}%`} /></Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card title="By Category">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <Table<LossCategoryBreakdown>
              columns={categoryColumns}
              dataSource={summary.byCategory}
              rowKey="category"
              size="small"
              pagination={false}
            />
          </Card>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Monthly Trend">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={summary.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="bags" orientation="left" />
                <YAxis yAxisId="pct" orientation="right" />
                <Tooltip />
                <Legend />
                <Area yAxisId="bags" type="monotone" dataKey="totalBags" name="Bags Lost" stroke="#ff4d4f" fill="#ff4d4f" fillOpacity={0.15} />
                <Area yAxisId="pct" type="monotone" dataKey="lossRatePct" name="Loss Rate %" stroke="#faad14" fill="#faad14" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Card title="Loss by Store">
        <Table<StoreLossSummary>
          columns={storeColumns}
          dataSource={summary.byStore}
          rowKey="storeId"
          size="small"
          pagination={false}
        />
      </Card>
    </div>
  );
}
