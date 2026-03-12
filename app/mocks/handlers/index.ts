import { authHandlers } from './auth';
import { adminHandlers } from './admin';

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
];
