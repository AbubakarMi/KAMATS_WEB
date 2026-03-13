import { Card, Row, Col, Skeleton, Space } from 'antd';

interface DetailPageSkeletonProps {
  hasKpiCards?: boolean;
  kpiCount?: number;
  descriptionRows?: number;
  hasTable?: boolean;
}

export function DetailPageSkeleton({
  hasKpiCards = false,
  kpiCount = 4,
  descriptionRows = 8,
  hasTable = false,
}: DetailPageSkeletonProps) {
  return (
    <div>
      {/* Back button + Title row */}
      <Space style={{ marginBottom: 16 }}>
        <Skeleton.Button active size="small" style={{ width: 80 }} />
      </Space>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Skeleton.Input active size="large" style={{ width: 240 }} />
        <Skeleton.Button active style={{ width: 100 }} />
      </div>

      {/* Optional KPI cards */}
      {hasKpiCards && (
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          {Array.from({ length: kpiCount }).map((_, i) => (
            <Col key={i} xs={24} sm={12} md={24 / kpiCount}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Description card */}
      <Card style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: descriptionRows }} />
      </Card>

      {/* Optional table */}
      {hasTable && (
        <Card>
          <Skeleton active paragraph={{ rows: 5 }} />
        </Card>
      )}
    </div>
  );
}
