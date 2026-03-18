import type { DosageConfiguration, ConsumptionAnalytics, ConsumptionTrends, OperatorPatterns } from '@/lib/api/types/consumption';

export const mockDosageConfigs: DosageConfiguration[] = [
  {
    id: 'dc-001',
    storeId: 's4',
    storeName: 'Challawa Treatment Plant',
    standardRateKgM3: '0.012',
    acceptableVariancePct: '15.00',
    normalLowPct: '-10.00',
    normalHighPct: '10.00',
    elevatedHighPct: '30.00',
    drySeasonMultiplier: '1.2',
    wetSeasonMultiplier: '0.9',
    drySeasonStart: '11-01',
    drySeasonEnd: '04-30',
    wetSeasonStart: '05-01',
    wetSeasonEnd: '10-31',
    currentSeason: 'Dry',
    effectiveRate: '0.0144',
    updatedAt: '2026-02-15T10:00:00Z',
    updatedBy: '11111111-1111-1111-1111-111111111111',
  },
  {
    id: 'dc-002',
    storeId: 's5',
    storeName: 'Tamburawa Treatment Plant',
    standardRateKgM3: '0.014',
    acceptableVariancePct: '15.00',
    normalLowPct: '-10.00',
    normalHighPct: '10.00',
    elevatedHighPct: '30.00',
    drySeasonMultiplier: '1.15',
    wetSeasonMultiplier: '0.85',
    drySeasonStart: '11-01',
    drySeasonEnd: '04-30',
    wetSeasonStart: '05-01',
    wetSeasonEnd: '10-31',
    currentSeason: 'Dry',
    effectiveRate: '0.0161',
    updatedAt: '2026-02-15T10:00:00Z',
    updatedBy: '11111111-1111-1111-1111-111111111111',
  },
];

export const mockAnalytics: Record<string, ConsumptionAnalytics> = {
  s4: {
    storeId: 's4',
    storeName: 'Challawa Treatment Plant',
    period: { from: '2026-02-13', to: '2026-03-13' },
    summary: {
      totalEntries: 28,
      totalVolumeM3: '132000',
      totalConsumedKg: '1680.0000',
      averageRateKgM3: '0.01273',
      configuredRateKgM3: '0.012',
      anomalyCount: 3,
      anomalyRatePct: '10.71',
    },
    anomalyBreakdown: { Normal: 23, LowConsumption: 1, Elevated: 1, HighAnomaly: 1, Unconfigured: 0 },
    dailyConsumption: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2026, 1, 13 + i);
      const dateStr = date.toISOString().slice(0, 10);
      const volume = 4000 + Math.round(Math.random() * 2000);
      const consumed = Math.round(volume * 0.012 * (0.85 + Math.random() * 0.3));
      return {
        date: dateStr,
        entries: 1,
        volumeM3: String(volume),
        consumedKg: `${consumed}.0000`,
        rateKgM3: (consumed / volume).toFixed(5),
        anomalyCount: Math.random() > 0.9 ? 1 : 0,
      };
    }),
  },
  s5: {
    storeId: 's5',
    storeName: 'Tamburawa Treatment Plant',
    period: { from: '2026-02-13', to: '2026-03-13' },
    summary: {
      totalEntries: 25,
      totalVolumeM3: '87500',
      totalConsumedKg: '1225.0000',
      averageRateKgM3: '0.01400',
      configuredRateKgM3: '0.014',
      anomalyCount: 1,
      anomalyRatePct: '4.00',
    },
    anomalyBreakdown: { Normal: 23, LowConsumption: 1, Elevated: 0, HighAnomaly: 0, Unconfigured: 0 },
    dailyConsumption: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(2026, 1, 13 + i);
      const dateStr = date.toISOString().slice(0, 10);
      const volume = 3000 + Math.round(Math.random() * 1000);
      const consumed = Math.round(volume * 0.014 * (0.9 + Math.random() * 0.2));
      return {
        date: dateStr,
        entries: 1,
        volumeM3: String(volume),
        consumedKg: `${consumed}.0000`,
        rateKgM3: (consumed / volume).toFixed(5),
        anomalyCount: Math.random() > 0.96 ? 1 : 0,
      };
    }),
  },
};

export const mockTrends: Record<string, ConsumptionTrends> = {
  s4: {
    rolling30DayRate: '0.01273',
    rolling30DayTrend: 'stable',
    lotConsumptionVelocity: [
      { lotNumber: 'LOT-2026-0001', bagsPerDay: 3.2 },
      { lotNumber: 'LOT-2025-0045', bagsPerDay: 1.8 },
    ],
    timeOfDayDistribution: [
      { hour: 6, avgConsumptionKg: '12.0000' },
      { hour: 7, avgConsumptionKg: '18.0000' },
      { hour: 8, avgConsumptionKg: '22.0000' },
      { hour: 9, avgConsumptionKg: '15.0000' },
      { hour: 10, avgConsumptionKg: '10.0000' },
      { hour: 14, avgConsumptionKg: '14.0000' },
      { hour: 15, avgConsumptionKg: '16.0000' },
      { hour: 16, avgConsumptionKg: '12.0000' },
    ],
    deliveryVsConsumption: [
      { month: '2026-01', receivedKg: '14900.0000', consumedKg: '1550.0000' },
      { month: '2026-02', receivedKg: '7500.0000', consumedKg: '1620.0000' },
      { month: '2026-03', receivedKg: '9600.0000', consumedKg: '1680.0000' },
    ],
  },
  s5: {
    rolling30DayRate: '0.01400',
    rolling30DayTrend: 'up',
    lotConsumptionVelocity: [
      { lotNumber: 'LOT-2026-0001', bagsPerDay: 2.0 },
    ],
    timeOfDayDistribution: [
      { hour: 7, avgConsumptionKg: '15.0000' },
      { hour: 8, avgConsumptionKg: '20.0000' },
      { hour: 9, avgConsumptionKg: '12.0000' },
      { hour: 14, avgConsumptionKg: '10.0000' },
      { hour: 15, avgConsumptionKg: '13.0000' },
    ],
    deliveryVsConsumption: [
      { month: '2026-01', receivedKg: '5000.0000', consumedKg: '1100.0000' },
      { month: '2026-02', receivedKg: '0.0000', consumedKg: '1180.0000' },
      { month: '2026-03', receivedKg: '0.0000', consumedKg: '1225.0000' },
    ],
  },
};

export const mockOperatorPatterns: Record<string, OperatorPatterns> = {
  s4: {
    operators: [
      { operatorId: '55555555-5555-5555-5555-555555555555', operatorName: 'Abubakar Danjuma', totalEntries: 28, avgRateKgM3: '0.01273', anomalyCount: 3, anomalyRatePct: '10.71' },
    ],
  },
  s5: {
    operators: [
      { operatorId: '66666666-6666-6666-6666-666666666666', operatorName: 'Hauwa Ibrahim', totalEntries: 25, avgRateKgM3: '0.01400', anomalyCount: 1, anomalyRatePct: '4.00' },
    ],
  },
};
