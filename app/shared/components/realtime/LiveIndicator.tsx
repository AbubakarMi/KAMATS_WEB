import { Badge, Typography } from 'antd';

interface LiveIndicatorProps {
  connected: boolean;
  label?: string;
}

export function LiveIndicator({ connected, label = 'Live' }: LiveIndicatorProps) {
  return (
    <Badge
      status={connected ? 'processing' : 'default'}
      text={
        <Typography.Text type={connected ? undefined : 'secondary'} style={{ fontSize: 12 }}>
          {connected ? label : 'Disconnected'}
        </Typography.Text>
      }
    />
  );
}
