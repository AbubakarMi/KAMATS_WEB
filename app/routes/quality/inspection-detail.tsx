import {
  Typography, Card, Descriptions, Button, Space, Image, Tag,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { useGetInspectionQuery } from '~/features/quality/qualityApi';
import { formatDateTime } from '~/shared/utils/formatters';
import { inspectionResultColors } from '~/shared/utils/statusColors';

const { Title, Text } = Typography;

export default function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: inspection, isLoading, isError, error, refetch } = useGetInspectionQuery(id!);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !inspection) return <DetailPageSkeleton descriptionRows={6} />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>{inspection.inspectionNumber}</Title>
        {inspection.result && (
          <Tag
            color={inspectionResultColors[inspection.result]}
            style={{ fontSize: 16, padding: '4px 16px' }}
          >
            {inspection.result}
          </Tag>
        )}
      </Space>

      <Card>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Inspection #">{inspection.inspectionNumber}</Descriptions.Item>
          <Descriptions.Item label="Result">
            {inspection.result ? (
              <Tag color={inspectionResultColors[inspection.result]}>{inspection.result}</Tag>
            ) : <Text type="secondary">Pending</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="DVR">
            <DocumentLink type="DVR" id={inspection.dvrId} number={inspection.dvrNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="PO">
            <DocumentLink type="PO" id={inspection.poId} number={inspection.poNumber} />
          </Descriptions.Item>
          <Descriptions.Item label="Bags Sampled">{inspection.bagsSampled}</Descriptions.Item>
          <Descriptions.Item label="Inspector">{inspection.inspectorName}</Descriptions.Item>
          <Descriptions.Item label="Visual Check" span={2}>{inspection.visualCheckNotes}</Descriptions.Item>
          <Descriptions.Item label="Physical State" span={2}>{inspection.physicalStateNotes}</Descriptions.Item>
          <Descriptions.Item label="Purity Test Result" span={2}>{inspection.purityTestResult}</Descriptions.Item>
          {inspection.rejectionReason && (
            <Descriptions.Item label="Rejection Reason" span={2}>
              <Text type="danger">{inspection.rejectionReason}</Text>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="Inspected At">{formatDateTime(inspection.inspectedAt)}</Descriptions.Item>
          <Descriptions.Item label="Completed At">{formatDateTime(inspection.completedAt)}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(inspection.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {inspection.photoUrls.length > 0 && (
        <Card title="Inspection Photos" style={{ marginTop: 16 }}>
          <Image.PreviewGroup>
            <Space wrap>
              {inspection.photoUrls.map((url, i) => (
                <Image
                  key={i}
                  width={120}
                  height={120}
                  src={url}
                  fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjYmZiZmJmIiBmb250LXNpemU9IjEyIj5QaG90bzwvdGV4dD48L3N2Zz4="
                  style={{ objectFit: 'cover' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}
    </div>
  );
}
