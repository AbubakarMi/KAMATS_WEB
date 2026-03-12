import { Timeline, Typography } from 'antd';
import { formatDateTime } from '~/shared/utils/formatters';

const { Text } = Typography;

export interface TimelineEvent {
  timestamp: string;
  title: string;
  description?: string;
  actor?: string;
  color?: string;
}

interface TimelineViewProps {
  events: TimelineEvent[];
}

export function TimelineView({ events }: TimelineViewProps) {
  return (
    <Timeline
      items={events.map((event) => ({
        color: event.color || 'blue',
        children: (
          <div>
            <Text strong>{event.title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDateTime(event.timestamp)}
              {event.actor && ` — ${event.actor}`}
            </Text>
            {event.description && (
              <>
                <br />
                <Text style={{ fontSize: 13 }}>{event.description}</Text>
              </>
            )}
          </div>
        ),
      }))}
    />
  );
}
