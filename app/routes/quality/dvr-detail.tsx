import {
  Typography, Card, Descriptions, Button, Space,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router';
import { StatusBadge, DocumentLink } from '~/shared/components/data-display';
import { QueryErrorAlert } from '~/shared/components/errors';
import { DetailPageSkeleton } from '~/shared/components/skeletons';
import { useGetDVRQuery } from '~/features/quality/qualityApi';
import { formatDateTime } from '~/shared/utils/formatters';

const { Title, Text } = Typography;

export default function DVRDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: dvr, isLoading, isError, error, refetch } = useGetDVRQuery(id!);

  if (isError) return <QueryErrorAlert error={error} onRetry={refetch} />;

  if (isLoading || !dvr) return <DetailPageSkeleton descriptionRows={8} />;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/quality/dvr')}>Back</Button>
        <Title level={3} style={{ margin: 0 }}>{dvr.dvrNumber}</Title>
        <StatusBadge status={dvr.status} />
      </Space>

      <Card>
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="DVR Number">{dvr.dvrNumber}</Descriptions.Item>
          <Descriptions.Item label="Status"><StatusBadge status={dvr.status} /></Descriptions.Item>
          <Descriptions.Item label="Driver Name">{dvr.driverName}</Descriptions.Item>
          <Descriptions.Item label="Driver ID">{dvr.driverIdNumber}</Descriptions.Item>
          <Descriptions.Item label="Phone">{dvr.driverPhone}</Descriptions.Item>
          <Descriptions.Item label="Vehicle Reg">{dvr.vehicleReg}</Descriptions.Item>
          <Descriptions.Item label="Supplier">{dvr.supplierName}</Descriptions.Item>
          <Descriptions.Item label="PO">
            {dvr.poId ? <DocumentLink type="PO" id={dvr.poId} number={dvr.poNumber!} /> : <Text type="secondary">Not linked</Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Gate Officer">{dvr.gateOfficerName}</Descriptions.Item>
          <Descriptions.Item label="Created">{formatDateTime(dvr.createdAt)}</Descriptions.Item>
        </Descriptions>
      </Card>

      {dvr.status === 'PendingPOMatch' && (
        <Card style={{ marginTop: 16 }}>
          <Text type="warning">This DVR is pending PO linkage. Link a PO to proceed with quality inspection.</Text>
        </Card>
      )}
    </div>
  );
}
