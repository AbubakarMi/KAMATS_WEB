import { Card, Skeleton, Space } from 'antd';

interface ListPageSkeletonProps {
  rows?: number;
}

export function ListPageSkeleton({ rows = 5 }: ListPageSkeletonProps) {
  return (
    <div>
      {/* Title + button bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <Skeleton.Input active size="large" style={{ width: 200, height: 28 }} />
        <Skeleton.Button active style={{ width: 120 }} />
      </div>

      {/* Toolbar skeleton */}
      <div
        style={{
          padding: '12px 16px',
          background: '#F8FAFC',
          borderRadius: 10,
          border: '1px solid #F1F5F9',
          marginBottom: 16,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <Skeleton.Input active style={{ width: 240 }} />
        <Skeleton.Button active />
      </div>

      {/* Table rows */}
      <Card style={{ borderRadius: 14, border: '1px solid #E2E8F0' }}>
        <Skeleton active paragraph={{ rows }} />
      </Card>
    </div>
  );
}
