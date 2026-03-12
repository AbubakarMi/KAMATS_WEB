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
    <Tag color={getStatusColor(status)}>
      {label || formatLabel(status)}
    </Tag>
  );
}
