import { useEffect, useRef, useCallback } from 'react';
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from '@microsoft/signalr';
import { getAccessToken } from '@/lib/api/client';

const SIGNALR_BASE_URL = process.env.NEXT_PUBLIC_SIGNALR_BASE_URL || '';

const RETRY_DELAYS = [0, 2000, 5000, 10000, 30000];

export function useSignalR(
  hubPath: string,
  handlers: Record<string, (...args: unknown[]) => void>,
  enabled = true
) {
  const connectionRef = useRef<HubConnection | null>(null);

  const connect = useCallback(async () => {
    if (!enabled || !hubPath) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${SIGNALR_BASE_URL}${hubPath}`, {
        accessTokenFactory: () => getAccessToken() || '',
      })
      .withAutomaticReconnect(RETRY_DELAYS)
      .configureLogging(LogLevel.Warning)
      .build();

    // Register handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      connection.on(event, handler);
    });

    connectionRef.current = connection;

    try {
      await connection.start();
    } catch (err) {
      console.error(`SignalR: Failed to connect to ${hubPath}`, err);
    }
  }, [hubPath, handlers, enabled]);

  useEffect(() => {
    connect();

    return () => {
      const conn = connectionRef.current;
      if (conn && conn.state !== HubConnectionState.Disconnected) {
        conn.stop();
      }
    };
  }, [connect]);

  const invoke = useCallback(
    async (method: string, ...args: unknown[]) => {
      const conn = connectionRef.current;
      if (conn && conn.state === HubConnectionState.Connected) {
        return conn.invoke(method, ...args);
      }
    },
    []
  );

  return { invoke, connection: connectionRef };
}

// Hub paths as constants
export const SignalRHubs = {
  STOCK_DASHBOARD: '/hubs/stock-dashboard',
  ALERTS: '/hubs/alerts',
  TRANSFERS: '/hubs/transfers',
  WEIGHBRIDGE: '/hubs/weighbridge',
} as const;
