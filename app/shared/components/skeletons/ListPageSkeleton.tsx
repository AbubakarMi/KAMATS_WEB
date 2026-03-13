import { Card, Skeleton, Space } from 'antd';

interface ListPageSkeletonProps {
  rows?: number;
}

export function ListPageSkeleton({ rows = 5 }: ListPageSkeletonProps) {
  return (
    <div>
      {/* Title + button bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Skeleton.Input active size="large" style={{ width: 200 }} />
        <Skeleton.Button active style={{ width: 120 }} />
      </div>

      {/* Search bar */}
      <Space style={{ marginBottom: 16 }}>
        <Skeleton.Input active style={{ width: 300 }} />
      </Space>

      {/* Table rows */}
      <Card>
        <Skeleton active paragraph={{ rows }} />
      </Card>
    </div>
  );
}
