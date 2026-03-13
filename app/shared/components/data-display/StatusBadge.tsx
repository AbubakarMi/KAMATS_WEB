import { Tag } from 'antd';
import { getStatusColor } from '~/shared/utils/statusColors';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

// Converts PascalCase/camelCase to space-separated readable label
function formatLabel(status: string): string {
  return status.replace(/([A-Z])/g, ' $1').trim();
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Tag
      color={getStatusColor(status)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          flexShrink: 0,
        }}
      />
      {label || formatLabel(status)}
    </Tag>
  );
}
