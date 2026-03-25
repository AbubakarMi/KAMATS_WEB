import { authHandlers } from './auth';
import { adminHandlers } from './admin';
import { supplierHandlers } from './suppliers';
import { procurementHandlers } from './procurement';
import { qualityHandlers } from './quality';
import { weighbridgeHandlers } from './weighbridge';
import { grnHandlers } from './grn';
import { lotHandlers } from './lots';
import { itemHandlers } from './items';
import { warehouseHandlers } from './warehouse';
import { ledgerHandlers } from './ledger';
import { stockCountHandlers } from './stockCounts';
import { transferHandlers } from './transfers';
import { dispatchHandlers } from './dispatch';
import { receiptHandlers } from './receipt';
import { consumptionHandlers } from './consumption';
import { dosageHandlers } from './dosage';
import { lossHandlers } from './loss';
import { alertHandlers } from './alerts';
import { reportHandlers } from './reports';
import { auditHandlers } from './audit';
import { searchHandlers } from './search';
import { storeHandlers } from './stores';
import { userHandlers } from './users';

export const handlers = [
  ...authHandlers,
  ...adminHandlers,
  ...storeHandlers,
  ...userHandlers,
  ...supplierHandlers,
  ...procurementHandlers,
  ...qualityHandlers,
  ...weighbridgeHandlers,
  ...grnHandlers,
  ...lotHandlers,
  ...itemHandlers,
  ...warehouseHandlers,
  ...ledgerHandlers,
  ...stockCountHandlers,
  ...transferHandlers,
  ...dispatchHandlers,
  ...receiptHandlers,
  ...consumptionHandlers,
  ...dosageHandlers,
  ...lossHandlers,
  ...alertHandlers,
  ...reportHandlers,
  ...auditHandlers,
  ...searchHandlers,
];
