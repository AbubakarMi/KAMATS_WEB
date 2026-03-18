import type { UUID, Timestamp, PaginationParams, DateRangeParams } from './common';
import type { AlertSeverity, AlertStatus, NotificationChannel } from './enums';

export interface Alert {
  id: UUID;
  alertType: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  entityType: string;
  entityId: UUID;
  storeId: UUID;
  storeName: string;
  status: AlertStatus;
  acknowledgedBy: UUID | null;
  acknowledgedByName: string | null;
  acknowledgedAt: Timestamp | null;
  acknowledgmentNotes: string | null;
  createdAt: Timestamp;
}

export interface AlertListParams extends PaginationParams, DateRangeParams {
  status?: AlertStatus;
  severity?: AlertSeverity;
  storeId?: UUID;
  alertType?: string;
}

export interface AcknowledgeAlertRequest {
  acknowledgmentNotes?: string;
}

// --- Alert Rules ---
export interface AlertRule {
  id: UUID;
  ruleName: string;
  module: string;
  conditionType: string;
  thresholdValue: string;
  severity: AlertSeverity;
  notifyRoles: string[];
  channels: NotificationChannel[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedByName: string | null;
}

export interface CreateAlertRuleRequest {
  ruleName: string;
  module: string;
  conditionType: string;
  thresholdValue: string;
  severity: AlertSeverity;
  notifyRoles: string[];
  channels: NotificationChannel[];
}

export interface UpdateAlertRuleRequest extends Partial<CreateAlertRuleRequest> {
  isActive?: boolean;
}
