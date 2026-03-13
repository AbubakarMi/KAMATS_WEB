import { useState } from 'react';
import {
  Typography, Card, Row, Col, Drawer, Table, Select, Tag,
} from 'antd';
import { useParams } from 'react-router';
import { KpiCard, GaugeChart } from '~/shared/components/charts';
import { useGetWarehouseMapQuery, useGetLocationContentsQuery } from '~/features/warehouse/warehouseApi';
import { useGetStoresQuery } from '~/features/admin/adminApi';
import { formatWeight, formatNumber } from '~/shared/utils/formatters';
import type { StorageLocation } from '~/api/types/inventory';

const { Title, Text } = Typography;

function getUtilizationColor(pct: number): string {
  if (pct >= 90) return '#ff4d4f';
  if (pct >= 70) return '#faad14';
  if (pct >= 30) return '#52c41a';
  if (pct > 0) return '#1890ff';
  return '#f0f0f0';
}

export default function WarehouseMapPage() {
  const { storeId } = useParams();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const { data: stores } = useGetStoresQuery();
  const { data: warehouseMap, isLoading } = useGetWarehouseMapQuery(storeId!);
  const { data: locationContents } = useGetLocationContentsQuery(selectedLocationId!, {
    skip: !selectedLocationId,
  });

  if (isLoading || !warehouseMap) {
    return (
      <div>
        <Title level={3}>Warehouse Map</Title>
        <Card loading={isLoading}><Text type="secondary">Loading warehouse map...</Text></Card>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>{warehouseMap.storeName} — Warehouse Map</Title>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={8} md={5}><KpiCard title="Total Locations" value={warehouseMap.totalLocations} /></Col>
        <Col xs={12} sm={8} md={5}><KpiCard title="Occupied" value={warehouseMap.occupiedLocations} /></Col>
        <Col xs={12} sm={8} md={5}><KpiCard title="Total Capacity" value={formatWeight(warehouseMap.totalCapacityKg)} /></Col>
        <Col xs={12} sm={8} md={5}><KpiCard title="Current Weight" value={formatWeight(warehouseMap.currentWeightKg)} /></Col>
        <Col xs={12} sm={8} md={4}>
          <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <GaugeChart
              value={warehouseMap.utilizationPct}
              max={100}
              label="Utilization"
              color={getUtilizationColor(warehouseMap.utilizationPct)}
              size={120}
            />
          </Card>
        </Col>
      </Row>

      {warehouseMap.zones.map((zone) => (
        <Card key={zone.zone} title={`Zone ${zone.zone}`} style={{ marginBottom: 16 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 8,
          }}>
            {zone.locations.map((loc) => (
              <Card
                key={loc.id}
                size="small"
                hoverable
                onClick={() => setSelectedLocationId(loc.id)}
                style={{
                  borderLeft: `4px solid ${getUtilizationColor(loc.utilizationPct)}`,
                  cursor: 'pointer',
                }}
              >
                <Text strong style={{ fontSize: 13 }}>{loc.locationCode}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {formatNumber(loc.currentBags)} bags
                </Text>
                <br />
                <Tag
                  color={getUtilizationColor(loc.utilizationPct)}
                  style={{ fontSize: 10, marginTop: 4 }}
                >
                  {loc.utilizationPct.toFixed(0)}%
                </Tag>
                {!loc.isActive && <Tag color="default" style={{ fontSize: 10 }}>Inactive</Tag>}
              </Card>
            ))}
          </div>
        </Card>
      ))}

      <Drawer
        title={locationContents ? `Location ${locationContents.locationCode}` : 'Location Details'}
        open={!!selectedLocationId}
        onClose={() => setSelectedLocationId(null)}
        width={500}
      >
        {locationContents && (
          <>
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col xs={24} sm={12} lg={8}>
                  <Text type="secondary">Bags</Text>
                  <div><Text strong>{formatNumber(locationContents.currentBags)}</Text></div>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Text type="secondary">Weight</Text>
                  <div><Text strong>{formatWeight(locationContents.currentWeightKg)}</Text></div>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Text type="secondary">Utilization</Text>
                  <div><Text strong>{locationContents.utilizationPct.toFixed(1)}%</Text></div>
                </Col>
              </Row>
            </Card>

            {locationContents.lots.length > 0 && (
              <Table
                size="small"
                columns={[
                  { title: 'Lot', dataIndex: 'lotNumber' },
                  { title: 'Bags', dataIndex: 'bags' },
                ]}
                dataSource={locationContents.lots}
                rowKey="lotId"
                pagination={false}
              />
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
