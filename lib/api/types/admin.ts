import type { UUID, Timestamp, PaginationParams } from './common';
import type { StoreTier } from './enums';

// --- Users ---
export interface UserListParams extends PaginationParams {
  storeId?: UUID;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export interface UserRole {
  id: UUID;
  name: string;
}

export interface UserStoreAssignment {
  storeId: UUID;
  storeName: string;
  assignedAt: Timestamp;
}

export interface User {
  id: UUID;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  storeId: UUID | null;
  storeName: string | null;
  isActive: boolean;
  lastLoginAt: Timestamp | null;
  failedLoginAttempts: number;
  lockoutEnd: Timestamp | null;
  roles: UserRole[];
  storeAssignments: UserStoreAssignment[];
  createdAt: Timestamp;
  createdBy: UUID | null;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  storeId?: UUID;
  roleIds: string[];
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
  storeId?: UUID;
  roleIds?: string[];
}

export interface DeactivateUserResponse {
  id: UUID;
  username: string;
  isActive: false;
  deactivatedAt: Timestamp;
}

export interface UnlockUserResponse {
  id: UUID;
  username: string;
  failedLoginAttempts: 0;
  lockoutEnd: null;
  unlockedAt: Timestamp;
}

export interface AssignStoreRequest {
  storeId: UUID;
}

export interface StoreAssignmentResponse {
  id: UUID;
  userId: UUID;
  storeId: UUID;
  storeName: string;
  assignedAt: Timestamp;
  assignedBy: UUID;
}

// --- Stores ---
export interface Store {
  id: UUID;
  code: string;
  name: string;
  tier: StoreTier;
  parentStoreId: UUID | null;
  parentStoreName: string | null;
  address: string | null;
  gpsLatitude: string | null;
  gpsLongitude: string | null;
  isActive: boolean;
  createdAt: Timestamp;
  createdBy?: UUID;
}

export interface StoreListParams {
  tier?: StoreTier;
  parentStoreId?: UUID;
  isActive?: boolean;
}

export interface CreateStoreRequest {
  code: string;
  name: string;
  tier: StoreTier;
  parentStoreId?: UUID;
  address?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
}

export interface UpdateStoreRequest {
  name?: string;
  address?: string;
  gpsLatitude?: string;
  gpsLongitude?: string;
  isActive?: boolean;
}

// --- Configuration ---
export interface ConfigItem {
  id: UUID;
  configKey: string;
  configValue: unknown;
  description: string | null;
  updatedAt: Timestamp;
  updatedBy: UUID | null;
}

export interface UpdateConfigRequest {
  configValue: unknown;
}

// --- Devices ---
export interface Device {
  id: UUID;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  serialNumber: string;
  assignedStoreId: UUID | null;
  assignedStoreName: string | null;
  isActive: boolean;
  registeredAt: Timestamp;
  registeredBy: UUID;
}

export interface DeviceListParams {
  storeId?: UUID;
  isActive?: boolean;
}

export interface RegisterDeviceRequest {
  deviceName: string;
  deviceType: string;
  serialNumber: string;
  assignedStoreId?: UUID;
}

export interface DeregisterDeviceResponse {
  message: string;
  deviceId: string;
  sessionsRevoked: number;
}
