import { Card, Skeleton, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface KpiCardProps {
  title: string;
  value: string | number;
  suffix?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  trendColor?: string;
  onClick?: () => void;
  loading?: boolean;
}

export function KpiCard({
  title,
  value,
  suffix,
  trend,
  trendValue,
  trendColor,
  onClick,
  loading,
}: KpiCardProps) {
  const trendIcon =
    trend === 'up' ? <ArrowUpOutlined style={{ fontSize: 11 }} /> :
    trend === 'down' ? <ArrowDownOutlined style={{ fontSize: 11 }} /> :
    trend === 'stable' ? <MinusOutlined style={{ fontSize: 11 }} /> :
    null;

  const resolvedTrendColor =
    trendColor ||
    (trend === 'up' ? '#059669' :
    trend === 'down' ? '#DC2626' :
    '#94A3B8');

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{
        height: '100%',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        cursor: onClick ? 'pointer' : 'default',
      }}
      styles={{
        body: { padding: '20px 22px' },
      }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '50%' }} />
      ) : (
        <>
          <Text
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#64748B',
              display: 'block',
              marginBottom: 8,
            }}
          >
            {title}
          </Text>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span
              style={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: '"Outfit", sans-serif',
                color: '#0F172A',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {value}
            </span>
            {suffix && (
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#94A3B8',
                }}
              >
                {suffix}
              </span>
            )}
          </div>
          {trend && trendValue && (
            <div
              style={{
                marginTop: 10,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '3px 8px',
                borderRadius: 6,
                background: `${resolvedTrendColor}0D`,
                color: resolvedTrendColor,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {trendIcon}
              <span>{trendValue}</span>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
