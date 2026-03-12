import type { UUID, Timestamp, Weight, Percentage, PaginationParams, DateRangeParams } from './common';
import type { ConsumptionStatus, AnomalyLevel, SeasonType } from './enums';

// ========================
// M14 — Consumption
// ========================

export interface ConsumptionItem {
  itemId: UUID;
  itemCode: string;
  lotNumber: string;
  isPartial: boolean;
  weightConsumedKg: Weight;
  remainingWeightKg: Weight | null;
  scannedAt: Timestamp;
}

export interface ConsumptionEntry {
  id: UUID;
  consumptionNumber: string;
  storeId: UUID;
  storeName: string;
  operatorId: UUID;
  operatorName: string;
  treatmentSessionRef: string;
  volumeTreatedM3: string;
  standardDosageRate: string;
  seasonalMultiplier: string;
  suggestedQtyKg: Weight;
  suggestedBags: number;
  actualQtyBags: number | null;
  actualQtyKg: Weight | null;
  deviationPct: Percentage | null;
  efficiencyRatio: string | null;
  anomalyLevel: AnomalyLevel | null;
  status: ConsumptionStatus;
  items: ConsumptionItem[];
  supervisorAckBy: UUID | null;
  supervisorAckByName: string | null;
  supervisorAckAt: Timestamp | null;
  supervisorAckNotes: string | null;
  partiallyConsumedBagsAvailable: boolean;
  recordedAt: Timestamp;
  createdAt: Timestamp;
}

export interface ConsumptionListParams extends PaginationParams, DateRangeParams {
  storeId?: UUID;
  status?: ConsumptionStatus;
  anomalyLevel?: AnomalyLevel;
  operatorId?: UUID;
}

export interface CreateConsumptionRequest {
  storeId: UUID;
  treatmentSessionRef: string;
  volumeTreatedM3: string;
}

export interface ScanConsumptionItemRequest {
  itemId?: UUID;
  qrCode?: string;
  isPartial: boolean;
  weightConsumedKg: string;
  remainingWeightKg?: string;
}

export interface ScanConsumptionItemResponse {
  itemId: UUID;
  itemCode: string;
  lotNumber: string;
  scanAccepted: boolean;
  isPartial: boolean;
  weightConsumedKg: Weight;
  remainingWeightKg: Weight | null;
  totalConsumedKg: Weight;
  bagsScanned: number;
  scannedAt: Timestamp;
}

export interface AcknowledgeAnomalyRequest {
  acknowledgmentNotes: string;
  actionTaken?: string;
}

// ========================
// M15 — Dosage Configuration
// ========================

export interface DosageConfiguration {
  id: UUID;
  storeId: UUID;
  storeName: string;
  standardRateKgM3: string;
  acceptableVariancePct: Percentage;
  normalLowPct: Percentage;
  normalHighPct: Percentage;
  elevatedHighPct: Percentage;
  drySeasonMultiplier: string;
  wetSeasonMultiplier: string;
  drySeasonStart: string;
  drySeasonEnd: string;
  wetSeasonStart: string;
  wetSeasonEnd: string;
  currentSeason: SeasonType;
  effectiveRate: string;
  updatedAt: Timestamp;
  updatedBy: UUID | null;
}

export interface CreateDosageConfigRequest {
  storeId: UUID;
  standardRateKgM3: string;
  acceptableVariancePct: string;
  normalLowPct: string;
  normalHighPct: string;
  elevatedHighPct: string;
  drySeasonMultiplier: string;
  wetSeasonMultiplier: string;
  drySeasonStart: string;
  drySeasonEnd: string;
  wetSeasonStart: string;
  wetSeasonEnd: string;
}

export type UpdateDosageConfigRequest = Partial<CreateDosageConfigRequest>;

// ========================
// M15 — Consumption Analytics
// ========================

export interface ConsumptionAnalyticsSummary {
  totalEntries: number;
  totalVolumeM3: string;
  totalConsumedKg: Weight;
  averageRateKgM3: string;
  configuredRateKgM3: string;
  anomalyCount: number;
  anomalyRatePct: Percentage;
}

export interface DailyConsumption {
  date: string;
  entries: number;
  volumeM3: string;
  consumedKg: Weight;
  rateKgM3: string;
  anomalyCount: number;
}

export interface ConsumptionAnalytics {
  storeId: UUID;
  storeName: string;
  period: { from: string; to: string };
  summary: ConsumptionAnalyticsSummary;
  anomalyBreakdown: Record<AnomalyLevel, number>;
  dailyConsumption: DailyConsumption[];
}

export interface ConsumptionTrends {
  rolling30DayRate: string;
  rolling30DayTrend: 'up' | 'down' | 'stable';
  lotConsumptionVelocity: { lotNumber: string; bagsPerDay: number }[];
  timeOfDayDistribution: { hour: number; avgConsumptionKg: string }[];
  deliveryVsConsumption: { month: string; receivedKg: Weight; consumedKg: Weight }[];
}

export interface OperatorPattern {
  operatorId: UUID;
  operatorName: string;
  totalEntries: number;
  avgRateKgM3: string;
  anomalyCount: number;
  anomalyRatePct: Percentage;
}

export interface OperatorPatterns {
  operators: OperatorPattern[];
}
