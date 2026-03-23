import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { HubConnectionState } from '@microsoft/signalr';
import { toast } from 'sonner';
import { useSignalR, SignalRHubs } from './useSignalR';
import { baseApi } from '@/lib/store';

// ---------------------------------------------------------------------------
// Shared helper: track connection state from the ref returned by useSignalR
// ---------------------------------------------------------------------------

function useConnectedState(connectionRef: ReturnType<typeof useSignalR>['connection']) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const conn = connectionRef.current;
      setConnected(conn?.state === HubConnectionState.Connected);
    }, 3000);
    return () => clearInterval(id);
  }, [connectionRef]);

  return connected;
}

// ---------------------------------------------------------------------------
// Stock Dashboard Hub
// ---------------------------------------------------------------------------

export function useStockDashboardHub(enabled = true) {
  const dispatch = useDispatch();

  const handlers = useMemo(
    () => ({
      StockUpdated: () => {
        dispatch(baseApi.util.invalidateTags(['Lot', 'Item', 'Ledger']));
      },
      ReorderPointBreached: (storeName: unknown) => {
        dispatch(baseApi.util.invalidateTags(['Lot', 'Item', 'Ledger', 'Alert']));
        toast.warning(`Stock below reorder point at ${storeName}`);
      },
    }),
    [dispatch],
  );

  const { connection } = useSignalR(SignalRHubs.STOCK_DASHBOARD, handlers, enabled);
  const connected = useConnectedState(connection);

  return { connected };
}

// ---------------------------------------------------------------------------
// Alerts Hub
// ---------------------------------------------------------------------------

export function useAlertsHub(enabled = true) {
  const dispatch = useDispatch();

  const handlers = useMemo(
    () => ({
      AlertCreated: (title: unknown, severity: unknown) => {
        dispatch(baseApi.util.invalidateTags(['Alert']));
        const sev = String(severity);
        if (sev === 'Critical' || sev === 'Significant') {
          toast.error(`New ${sev} Alert: ${title}`);
        } else {
          toast.info(`New Alert: ${title}`);
        }
      },
      AlertAcknowledged: () => {
        dispatch(baseApi.util.invalidateTags(['Alert']));
      },
    }),
    [dispatch],
  );

  const { connection } = useSignalR(SignalRHubs.ALERTS, handlers, enabled);
  const connected = useConnectedState(connection);

  return { connected };
}

// ---------------------------------------------------------------------------
// Transfers Hub
// ---------------------------------------------------------------------------

export function useTransfersHub(enabled = true) {
  const dispatch = useDispatch();

  const handlers = useMemo(
    () => ({
      TransferStatusChanged: (stoNumber: unknown, newStatus: unknown) => {
        dispatch(baseApi.util.invalidateTags(['STO', 'Dispatch', 'Receipt']));
        toast.info(`${stoNumber} → ${String(newStatus).replace(/([A-Z])/g, ' $1').trim()}`);
      },
      DispatchCreated: () => {
        dispatch(baseApi.util.invalidateTags(['STO', 'Dispatch', 'Item', 'Lot']));
      },
      ReceiptCompleted: () => {
        dispatch(baseApi.util.invalidateTags(['STO', 'Receipt', 'Item', 'Lot']));
      },
    }),
    [dispatch],
  );

  const { connection } = useSignalR(SignalRHubs.TRANSFERS, handlers, enabled);
  const connected = useConnectedState(connection);

  return { connected };
}

// ---------------------------------------------------------------------------
// Weighbridge Hub
// ---------------------------------------------------------------------------

export function useWeighbridgeHub(enabled = true) {
  const dispatch = useDispatch();

  const handlers = useMemo(
    () => ({
      TicketUpdated: (ticketNumber: unknown) => {
        dispatch(baseApi.util.invalidateTags(['WeighbridgeTicket']));
        toast.info(`Weighbridge ticket ${ticketNumber} updated`);
      },
      WeighingCompleted: (ticketNumber: unknown) => {
        dispatch(baseApi.util.invalidateTags(['WeighbridgeTicket', 'DVR', 'GRN']));
        toast.success(`Weighing completed: ${ticketNumber}`);
      },
    }),
    [dispatch],
  );

  const { connection } = useSignalR(SignalRHubs.WEIGHBRIDGE, handlers, enabled);
  const connected = useConnectedState(connection);

  return { connected };
}
