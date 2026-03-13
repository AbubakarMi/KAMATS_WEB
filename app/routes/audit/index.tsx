import { useState } from 'react';
import {
  Typography, Card, Space, Select, Table, Tag, Button, Modal, message,
} from 'antd';
import { SafetyCertificateOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { DataTable } from '~/shared/components/tables';
import { usePagination } from '~/shared/hooks';
import { useGetAuditEventsQuery, useLazyVerifyChainQuery } from '~/features/audit/auditApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatDateTime, formatNumber } from '~/shared/utils/formatters';
import type { AuditEvent } from '~/api/types/audit';
import type { StoreChainResult } from '~/api/types/audit';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function AuditPage() {
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [entityTypeFilter, setEntityTypeFilter] = useState<string | undefined>();
  const [storeFilter, setStoreFilter] = useState<string | undefined>();
  const [chainModalOpen, setChainModalOpen] = useState(false);

  const { data, isLoading, refetch } = useGetAuditEventsQuery({
    ...params,
    entityType: entityTypeFilter,
    storeId: storeFilter,
  });
  const { data: stores } = useGetStoresQuery();
  const [triggerVerify, { data: chainResult, isLoading: verifying }] = useLazyVerifyChainQuery();

  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const entityTypeOptions = [
    'GRN', 'Lot', 'LedgerEntry', 'STO', 'Dispatch', 'Receipt', 'ConsumptionEntry', 'WriteOff', 'StockCount',
  ].map((t) => ({ value: t, label: t }));

  const columns: ColumnsType<AuditEvent> = [
    { title: 'Event Type', dataIndex: 'eventType', width: 170, render: (v: string) => <Tag>{v}</Tag> },
    { title: 'Entity', dataIndex: 'entityType', width: 120 },
    { title: 'Actor', dataIndex: 'actorName', width: 130 },
    { title: 'Role', dataIndex: 'actorRole', width: 110 },
    { title: 'Store', render: (_: unknown, r: AuditEvent) => stores?.find((s) => s.id === r.storeId)?.name ?? r.storeId ?? '—', ellipsis: true },
    { title: 'IP', dataIndex: 'ipAddress', width: 110 },
    { title: 'Seq #', dataIndex: 'storeSequence', width: 70 },
    { title: 'Timestamp', dataIndex: 'timestamp', width: 160, render: (v: string) => formatDateTime(v) },
  ];

  const chainColumns: ColumnsType<StoreChainResult> = [
    { title: 'Store', dataIndex: 'storeName' },
    { title: 'Chain Length', dataIndex: 'chainLength', width: 100, render: (v: number) => formatNumber(v) },
    {
      title: 'Valid',
      dataIndex: 'isValid',
      width: 70,
      render: (v: boolean) => v
        ? <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />
        : <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 18 }} />,
    },
    { title: 'Last Sequence', dataIndex: 'lastSequence', width: 110 },
    { title: 'Duration (ms)', dataIndex: 'verificationDurationMs', width: 110 },
    {
      title: 'Broken At',
      dataIndex: 'brokenAtSequence',
      width: 90,
      render: (v: number | null) => v != null ? <Text type="danger">#{v}</Text> : '—',
    },
  ];

  const handleVerifyChain = async () => {
    try {
      await triggerVerify().unwrap();
      setChainModalOpen(true);
    } catch {
      message.error('Failed to verify chain');
    }
  };

  return (
    <div>
      <Title level={3}>Audit Trail</Title>
      <Card
        extra={
          <Button
            type="primary"
            icon={<SafetyCertificateOutlined />}
            onClick={handleVerifyChain}
            loading={verifying}
          >
            Verify Hash Chain
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Select
            placeholder="Entity Type"
            allowClear
            options={entityTypeOptions}
            onChange={setEntityTypeFilter}
            style={{ width: 170 }}
          />
          <Select
            placeholder="Store"
            allowClear
            options={stores?.map((s) => ({ value: s.id, label: s.name })) ?? []}
            onChange={setStoreFilter}
            style={{ width: 200 }}
          />
        </Space>
        <DataTable<AuditEvent>
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={isLoading}
          pagination={pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          showSearch={false}
          showExport={false}
        />
      </Card>

      <Modal
        title="Hash Chain Verification"
        open={chainModalOpen}
        onCancel={() => setChainModalOpen(false)}
        footer={<Button onClick={() => setChainModalOpen(false)}>Close</Button>}
        width={700}
      >
        {chainResult && (
          <>
            <Card size="small" style={{ marginBottom: 16, textAlign: 'center' }}>
              {chainResult.overallValid ? (
                <Space>
                  <CheckCircleFilled style={{ color: '#52c41a', fontSize: 24 }} />
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>All Chains Valid</Text>
                </Space>
              ) : (
                <Space>
                  <CloseCircleFilled style={{ color: '#ff4d4f', fontSize: 24 }} />
                  <Text strong style={{ color: '#ff4d4f', fontSize: 16 }}>Chain Integrity Broken</Text>
                </Space>
              )}
            </Card>
            <Table<StoreChainResult>
              columns={chainColumns}
              dataSource={chainResult.results}
              rowKey="storeId"
              size="small"
              pagination={false}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
