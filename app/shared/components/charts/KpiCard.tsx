import { Card, Skeleton, Statistic, Typography } from 'antd';
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
    trend === 'up' ? <ArrowUpOutlined /> :
    trend === 'down' ? <ArrowDownOutlined /> :
    trend === 'stable' ? <MinusOutlined /> :
    null;

  const defaultTrendColor =
    trend === 'up' ? '#52c41a' :
    trend === 'down' ? '#ff4d4f' :
    '#8c8c8c';

  return (
    <Card
      hoverable={!!onClick}
      onClick={onClick}
      style={{ height: '100%' }}
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
      ) : (
        <>
          <Statistic
            title={title}
            value={value}
            suffix={suffix}
          />
          {trend && trendValue && (
            <Text style={{ color: trendColor || defaultTrendColor, fontSize: 13 }}>
              {trendIcon} {trendValue}
            </Text>
          )}
        </>
      )}
    </Card>
  );
}
