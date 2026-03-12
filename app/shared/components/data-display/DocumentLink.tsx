import { Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { Link } from 'react-router';

const { Text } = Typography;

type DocumentType = 'PR' | 'PO' | 'DVR' | 'WT' | 'GRN' | 'Lot' | 'Item' | 'STO' | 'TDN' | 'GRD' | 'WriteOff';

const routeMap: Record<DocumentType, string> = {
  PR: '/purchase-requisitions',
  PO: '/purchase-orders',
  DVR: '/quality/dvr',
  WT: '/weighbridge',
  GRN: '/grn',
  Lot: '/lots',
  Item: '/items',
  STO: '/transfers',
  TDN: '/dispatch',
  GRD: '/receipt',
  WriteOff: '/write-offs',
};

interface DocumentLinkProps {
  type: DocumentType;
  id: string;
  number: string;
}

export function DocumentLink({ type, id, number }: DocumentLinkProps) {
  const basePath = routeMap[type];

  return (
    <Link to={`${basePath}/${id}`}>
      <Text style={{ color: '#1565C0' }}>
        <FileTextOutlined style={{ marginRight: 4 }} />
        {number}
      </Text>
    </Link>
  );
}
