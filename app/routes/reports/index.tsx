import { Typography, Row, Col, Card } from 'antd';
import {
  BarChartOutlined, SwapOutlined, TeamOutlined, WarningOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router';

const { Title, Text } = Typography;

const reportCards = [
  {
    key: 'stock-summary',
    title: 'Stock Balance Summary',
    description: 'System-wide stock snapshot across all stores with reorder point status.',
    icon: <DatabaseOutlined style={{ fontSize: 28, color: '#1565C0' }} />,
  },
  {
    key: 'consumption-analytics',
    title: 'Consumption Analytics',
    description: 'Cross-store consumption rates, anomaly analysis, and dosage efficiency.',
    icon: <BarChartOutlined style={{ fontSize: 28, color: '#52c41a' }} />,
  },
  {
    key: 'transfer-reconciliation',
    title: 'Transfer Reconciliation',
    description: 'Dispatched vs received comparison for all transfers with shortage tracking.',
    icon: <SwapOutlined style={{ fontSize: 28, color: '#faad14' }} />,
  },
  {
    key: 'supplier-performance',
    title: 'Supplier Performance',
    description: 'Supplier KPIs: on-time rate, quantity accuracy, quality acceptance.',
    icon: <TeamOutlined style={{ fontSize: 28, color: '#722ed1' }} />,
  },
  {
    key: 'loss-summary',
    title: 'Loss Summary',
    description: 'Write-off analysis by category and store with monthly trends.',
    icon: <WarningOutlined style={{ fontSize: 28, color: '#ff4d4f' }} />,
  },
];

export default function ReportsIndexPage() {
  return (
    <div>
      <Title level={3}>Reports</Title>
      <Row gutter={[16, 16]}>
        {reportCards.map((r) => (
          <Col xs={24} sm={12} lg={8} key={r.key}>
            <Link to={`/reports/${r.key}`}>
              <Card hoverable style={{ height: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>{r.icon}</div>
                <Title level={5} style={{ textAlign: 'center', margin: 0 }}>{r.title}</Title>
                <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 8 }}>
                  {r.description}
                </Text>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
