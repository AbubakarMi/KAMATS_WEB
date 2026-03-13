import { useState } from 'react';
import {
  Typography, Card, Row, Col, Table, Space, Select, Alert, Segmented,
} from 'antd';
import { WarningOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { KpiCard } from '~/shared/components/charts';
import { StatusBadge } from '~/shared/components/data-display';
import { DataTable } from '~/shared/components/tables';
import { usePagination } from '~/shared/hooks';
import {
  useGetStockBalanceQuery,
  useGetLedgerEntriesQuery,
  useGetBalanceHistoryQuery,
} from '~/features/ledger/ledgerApi';
import { formatNumber, formatWeight, formatDate, formatDateTime } from '~/shared/utils/formatters';
import { LedgerEntryType } from '~/api/types/enums';
import { ledgerEntryTypeColors } from '~/shared/utils/statusColors';
import type { LedgerEntry, LotBalance } from '~/api/types/ledger';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const entryTypeOptions = Object.values(LedgerEntryType).map((t) => ({ value: t, label: t.replace(/([A-Z])/g, ' $1').trim() }));

export default function LedgerPage() {
  const { storeId } = useParams();
  const { params, setPage, setPageSize, setSort } = usePagination();
  const [entryTypeFilter, setEntryTypeFilter] = useState<string | undefined>();
  const [granularity, setGranularity] = useState<string>('daily');

  const { data: balance, isLoading: balanceLoading } = useGetStockBalanceQuery(storeId!);
  const { data: entriesData, isLoading: entriesLoading, refetch } = useGetLedgerEntriesQuery({
    storeId: storeId!,
    params: {
      ...params,
      entryType: entryTypeFilter as LedgerEntry['entryType'] | undefined,
    },
  });
  const { data: history } = useGetBalanceHistoryQuery({
    storeId: storeId!,
    params: { granularity: granularity as 'daily' | 'weekly' | 'monthly' },
  });

  const entries = entriesData?.data ?? [];
  const pagination = entriesData?.pagination;

  const lotColumns: ColumnsType<LotBalance> = [
    { title: 'Lot', dataIndex: 'lotNumber' },
    { title: 'Supplier', dataIndex: 'supplierName' },
    { title: 'Receipt', dataIndex: 'receiptDate', render: (v: string) => formatDate(v) },
    { title: 'Total', dataIndex: 'totalBags', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'In Stock', dataIndex: 'bagsInStock', width: 80, render: (v: number) => formatNumber(v) },
    { title: 'Reserved', dataIndex: 'bagsReserved', width: 80, render: (v: number) => formatNumber(v) },
    { title: 'In Transit', dataIndex: 'bagsInTransit', width: 80, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'weightKg', width: 100, render: (v: string) => formatWeight(v) },
  ];

  const entryColumns: ColumnsType<LedgerEntry> = [
    { title: 'Entry #', dataIndex: 'entryNumber', width: 90 },
    {
      title: 'Type',
      dataIndex: 'entryType',
      width: 140,
      render: (v: string) => <StatusBadge status={v} />,
    },
    { title: 'Lot', dataIndex: 'lotNumber', width: 130 },
    { title: 'Qty', dataIndex: 'quantityBags', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'Weight', dataIndex: 'weightKg', width: 100, render: (v: string) => formatWeight(v) },
    { title: 'Before', dataIndex: 'balanceBefore', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'After', dataIndex: 'balanceAfter', width: 70, render: (v: number) => formatNumber(v) },
    { title: 'Ref', dataIndex: 'referenceNumber', width: 130 },
    { title: 'Date', dataIndex: 'createdAt', width: 150, render: (v: string) => formatDateTime(v) },
  ];

  return (
    <div>
      <Title level={3} style={{ marginBottom: 16 }}>
        {balance?.storeName ?? 'Stock Ledger'}
      </Title>

      {balance?.belowReorderPoint && (
        <Alert
          message="Stock Below Reorder Point"
          description={`Current stock (${formatNumber(balance.totalBags)} bags) is below the reorder point (${formatNumber(balance.reorderPoint)} bags).`}
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}><KpiCard title="Total Bags" value={balance?.totalBags ?? 0} loading={balanceLoading} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Total Weight" value={formatWeight(balance?.totalWeightKg)} loading={balanceLoading} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Reorder Point" value={balance?.reorderPoint ?? 0} loading={balanceLoading} /></Col>
        <Col xs={24} sm={12} md={6}><KpiCard title="Max Stock" value={balance?.maxStockLevel ?? 0} loading={balanceLoading} /></Col>
      </Row>

      {balance && balance.balancesByLot.length > 0 && (
        <Card title="Lot Balances" style={{ marginBottom: 16 }}>
          <Table<LotBalance>
            columns={lotColumns}
            dataSource={balance.balancesByLot}
            rowKey="lotId"
            size="small"
            pagination={false}
          />
        </Card>
      )}

      {history && history.dataPoints.length > 0 && (
        <Card
          title="Balance History"
          extra={
            <Segmented
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              value={granularity}
              onChange={setGranularity}
            />
          }
          style={{ marginBottom: 16 }}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={history.dataPoints}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(v: string) => v.slice(5)} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="balanceBags" name="Balance" stroke="#1565C0" fill="#1565C0" fillOpacity={0.15} />
              <Area type="monotone" dataKey="receipts" name="Receipts" stroke="#52c41a" fill="#52c41a" fillOpacity={0.1} />
              <Area type="monotone" dataKey="consumption" name="Consumption" stroke="#faad14" fill="#faad14" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      <Card
        title="Ledger Entries"
        extra={
          <Select
            placeholder="Entry type"
            allowClear
            options={entryTypeOptions}
            onChange={setEntryTypeFilter}
            style={{ width: 160 }}
          />
        }
      >
        <DataTable<LedgerEntry>
          columns={entryColumns}
          dataSource={entries}
          rowKey="id"
          loading={entriesLoading}
          pagination={pagination}
          onPageChange={(page, pageSize) => { setPage(page); setPageSize(pageSize); }}
          onSortChange={setSort}
          onRefresh={refetch}
          showSearch={false}
          showExport={false}
        />
      </Card>
    </div>
  );
}
