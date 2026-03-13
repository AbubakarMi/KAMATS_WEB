import { Row, Col, Card, Skeleton } from 'antd';

export function DashboardSkeleton() {
  return (
    <div>
      <Skeleton.Input active size="large" style={{ width: 220, marginBottom: 24 }} />

      {/* KPI row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col key={i} xs={24} sm={12} md={6}>
            <Card>
              <Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Two-column cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={14}>
          <Card>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card>
            <Skeleton active paragraph={{ rows: 5 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
